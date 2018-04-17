import ActionTypesCreator from './ActionTypesCreator';
import ActionsCreator from './ActionsCreator';
import AxiosObservable from '../core/AxiosObservable';
import UrlInfo from '../core/UrlInfo';

const toNull = () => { type: 'TO_NULL' };

const createRespondActionCreatorForCollection = (actions, startAction) => (response) => actions.respond(
  response.data,
  startAction.entry,
  {
    timestamp: new Date().getTime(),
    transferables: startAction.options.transferables,
  },
);

const createRespondActionCreatorForPostCollection = (actions, startAction, getId) => (response) => actions.respond(
  getId(response.data),
  response.data,
  startAction.entry,
  {
    timestamp: new Date().getTime(),
    transferables: startAction.options.transferables,
  },
);

const createRespondActionCreatorForMember = (actions, startAction, getId) => (response) => actions.respond(
  startAction.entry.id,
  response.data,
  startAction.entry,
  {
    timestamp: new Date().getTime(),
    transferables: startAction.options.transferables,
  },
);

const createRespondErrorActionCreatorForCollection = (actions, startAction) => (error) => {
  // console.log('error :', error);
  return actions.respondError(
    { error },
    {},
    {
      timestamp: new Date().getTime(),
      transferables: startAction.options.transferables,
    }
  );
}

const createRespondErrorActionCreatorForMember = (actions, startAction) => (error) => {
  // console.log('error :', error);
  return actions.respondError(
    startAction.entry.id,
    { error },
    {},
    {
      timestamp: new Date().getTime(),
      transferables: startAction.options.transferables,
    }
  );
}

export default class EpicCreator {
  static $name = 'epics';

  create({ ns, names, url, getShared, methodConfigs }, { getId = (action => action.data.id) }, extensionConfig){
    let shared = {};
    let exposed = {};

    const {
      axios,
      Observable,
      getHeaders = () => ({}),
      responseMiddleware,
      errorMiddleware,
    } = extensionConfig;

    const axiosObservable = AxiosObservable(axios, Observable);

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
        createRespondErrorActionCreatorForCollection : createRespondErrorActionCreatorForMember;

      shared[methodConfig.name] = (action$, store) => {
        return action$.ofType(actionTypes.start)
          .mergeMap(action => {
            const url = urlInfo.compile(action.entry);
            const query = action.options.query;
            const source = axios.CancelToken.source();

            return axiosObservable({
              method: methodConfig.method,
              url,
              headers: getHeaders(),
              data: action.data,
              params: query,
            }, {
              success: getRespondActionCreator(actions, action, getId),
              error: getRespondErrorActionCreator(actions, action),
              // cancel: actions.clearError,
            }, {
              responseMiddleware,
              errorMiddleware,
              axiosCancelTokenSource: source,
              cancelStream$: action$.filter(cancelAction => {
                if(cancelAction.type !== actionTypes.cancel){
                  return false;
                }
                return urlInfo.include(cancelAction.entry, action.entry);
              }),
            });
          });
      };
      exposed[epicName] = shared[methodConfig.name];
    });
    return { shared, exposed };
  }
}
