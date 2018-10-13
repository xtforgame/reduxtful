import ActionTypesCreator from './ActionTypesCreator';
import ActionsCreator from './ActionsCreator';
import AxiosObservable from '../core/AxiosObservable';
import UrlInfo from '../core/UrlInfo';
import {
  getRespondActionCreators,
} from '../core/helper-functions';

export default class EpicCreator {
  static $name = 'epics';

  create({
    ns, names, url, getShared, methodConfigs,
  }, { getId = (data => data.id) }, extensionConfig) {
    const shared = {};
    const exposed = {};

    const {
      axios,
      Observable,
      getHeaders = () => ({}),
      middlewares = {},
    } = extensionConfig;

    if (!axios) {
      return { shared, exposed };
    }

    const axiosObservable = AxiosObservable(axios, Observable);

    methodConfigs.forEach((methodConfig) => {
      if (methodConfig.supportedActions.length <= 1) {
        return;
      }
      const actionTypes = getShared(ActionTypesCreator.$name)[methodConfig.name];
      const actions = getShared(ActionsCreator.$name)[methodConfig.name];
      // console.log('actionTypes :', actionTypes);
      // console.log('actions :', actions);

      const arg = {
        methodName: methodConfig.name,
        names,
      };

      if (!methodConfig.getEpicName || !methodConfig.getUrlTemplate) {
        return;
      }

      const epicName = methodConfig.getEpicName(arg);
      const urlInfo = new UrlInfo(methodConfig.getUrlTemplate({ url, names }));

      const {
        respondCreator,
        respondErrorCreator,
      } = getRespondActionCreators(methodConfig);

      shared[methodConfig.name] = (action$, store) => action$.ofType(actionTypes.start)
          .mergeMap((action) => {
            const compiledUrl = urlInfo.compile(action.entry);
            const { query } = action.options;
            const source = axios.CancelToken.source();

            return axiosObservable({
              method: methodConfig.method,
              url: compiledUrl,
              headers: getHeaders(),
              data: action.data,
              params: query,
            }, {
              success: respondCreator(actions, action, getId),
              error: respondErrorCreator(actions, action),
              // cancel: actions.clearError,
            }, {
              startAction: action,
              state: store.getState(),
              actionTypes,
              actions,
              middlewares,
              axiosCancelTokenSource: source,
              cancelStream$: action$.filter((cancelAction) => {
                if (cancelAction.type !== actionTypes.cancel) {
                  return false;
                }
                return urlInfo.include(cancelAction.entry, action.entry);
              }),
            });
          });
      exposed[epicName] = shared[methodConfig.name];
    });
    return { shared, exposed };
  }
}
