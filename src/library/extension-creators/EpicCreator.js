import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import ActionTypesCreator from './ActionTypesCreator';
import ActionsCreator from './ActionsCreator';
import AxiosObservable from '../utils/AxiosObservable';
import UrlInfo from '../UrlInfo';

export default class EpicCreator {
  static $name = 'epics';

  create({ ns, names, url, getShared, methodConfigs }, config){
    let shared = {};
    let exposed = {};

    const {
      getHeaders = () => ({}),
      responseMiddleware,
      errorMiddleware,
    } = config;

    methodConfigs.forEach(methodConfig => {
      if(methodConfig.name === 'clear'){
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
              success: (response) => actions.success(
                response.data,
                action.urlParams,
                { timestamp: new Date().getTime() },
              ),
              error: (error) => {
                console.log('error :', error);
                return actions.error({ error });
              },
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
