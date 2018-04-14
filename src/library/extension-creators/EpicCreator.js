import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import ActionTypesCreator from './ActionTypesCreator';
import ActionsCreator from './ActionsCreator';
import AxiosObservable from '../utils/AxiosObservable';
import UrlInfo from '../UrlInfo';

const createRespondActionCreatorForCollection = (actions, startAction) => (response) => actions.respond(
  response.data,
  startAction.urlParams,
  { timestamp: new Date().getTime() },
);

const createRespondActionCreatorForPostCollection = (actions, startAction, getId) => (response) => actions.respond(
  getId(response.data),
  response.data,
  startAction.urlParams,
  { timestamp: new Date().getTime() },
);

const createRespondActionCreatorForMember = (actions, startAction, getId) => (response) => actions.respond(
  startAction.urlParams.id,
  response.data,
  startAction.urlParams,
  { timestamp: new Date().getTime() },
);

const createRespondErrorActionCreatorForCollection = (actions, startAction) => (error) => {
  // console.log('error :', error);
  return actions.respondError({ error });
}

const createRespondErrorActionCreatorForMember = (actions, startAction) => (error) => {
  // console.log('error :', error);
  return actions.respondError(startAction.urlParams.id, { error });
}

export default class EpicCreator {
  static $name = 'epics';

  create({ ns, names, url, getShared, methodConfigs }, { getId = (action => action.data.id) }, extensionConfig){
    let shared = {};
    let exposed = {};

    const {
      getHeaders = () => ({}),
      responseMiddleware,
      errorMiddleware,
    } = extensionConfig;

    methodConfigs.forEach(methodConfig => {
      if(methodConfig.supportedActions.length <= 1){
        return ;
      }
      let actionTypes = getShared(ActionTypesCreator.$name)[methodConfig.name];
      let actions = getShared(ActionsCreator.$name)[methodConfig.name];
      // console.log('actionTypes :', actionTypes);
      // console.log('actions :', actions);

      let arg = {
        methodName: methodConfig.name,
        names,
      };

      if(!methodConfig.getEpicName || !methodConfig.getUrlTemplate){
        return { shared, exposed };
      }

      const epicName = methodConfig.getEpicName(arg);
      const urlInfo = new UrlInfo(methodConfig.getUrlTemplate({url, names}));

      // special case for posting a collection
      let getRespondActionCreator = createRespondActionCreatorForCollection;
      if(methodConfig.isForCollection !== true){
        getRespondActionCreator = createRespondActionCreatorForMember;
      }else if(methodConfig.method === 'post'){
        getRespondActionCreator = createRespondActionCreatorForPostCollection;
      }

      const getRespondErrorActionCreator = (methodConfig.isForCollection === true) ?
        createRespondErrorActionCreatorForCollection
        : createRespondErrorActionCreatorForMember;

      shared[methodConfig.name] = (action$, store) => {
        return action$.ofType(actionTypes.start)
          .mergeMap(action => {
            const url = urlInfo.compile(action.urlParams);
            const query = action.urlParams.query;
            const source = axios.CancelToken.source();

            return AxiosObservable({
              method: methodConfig.method,
              url,
              headers: getHeaders(),
              data: action.data,
              params: query,
            }, {
              success: getRespondActionCreator(actions, action, getId),
              error: getRespondErrorActionCreator(actions, action),
              cancel: actions.clearError,
            }, {
              responseMiddleware,
              errorMiddleware,
              axiosCancelTokenSource: source,
              cancelStream$: action$.filter(action => {
                // TODO checking more conditions for avoiding canceling all action with the same action type
                return action.type === actionTypes.cancel;
              }),
            });
          });
      };
      exposed[epicName] = shared[methodConfig.name];
    });
    return { shared, exposed };
  }
}
