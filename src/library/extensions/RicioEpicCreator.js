import ActionTypesCreator from './ActionTypesCreator';
import ActionsCreator from './ActionsCreator';
import RicioObservable from '../core/RicioObservable';
import UrlInfo from '../core/UrlInfo';
import defaultGetId from '../core/defaultGetId';
import {
  getRespondActionCreators,
} from '../core/helper-functions';

export default class RicioEpicCreator {
  static $name = 'wsEpics';

  create({
    ns, names, url, getShared, methodConfigs,
  }, { getId = defaultGetId }, extensionConfig) {
    const shared = {};
    const exposed = {};

    const {
      qs,
      wsProtocol,
      CancelToken,
      operators,
      rxjs,
      getHeaders = () => ({}),
      middlewares = {},
    } = extensionConfig;

    if (!wsProtocol || !CancelToken || !operators || !rxjs) {
      return { shared, exposed };
    }

    const {
      filter,
      mergeMap,
    } = operators;

    // const {
    //   from, of, race, Observable,
    // } = rxjs;

    const ricioObservable = RicioObservable(wsProtocol, operators, rxjs);

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

      shared[methodConfig.name] = (action$, state$) => action$.ofType(actionTypes.start)
        .pipe(
          mergeMap((action) => {
            const compiledUrl = urlInfo.compile(action.entry);
            const { query } = action.options;
            const headers = {
              ...getHeaders(),
            };
            if (query) {
              headers.query = qs.stringify(query);
            }
            let cancelToken = CancelToken && new CancelToken();
            if (!cancelToken) {
              cancelToken = {
                setHandled: () => {},
                setCancelFunc: () => {},
                cancel: () => {},
              };
            }

            return ricioObservable({
              method: methodConfig.method,
              path: compiledUrl,
              headers,
              body: action.data,
            }, {
              success: respondCreator(actions, action, getId),
              error: respondErrorCreator(actions, action),
              // cancel: actions.clearError,
            }, {
              startAction: action,
              state: state$.value,
              actionTypes,
              actions,
              middlewares,
              ricioCancelToken: cancelToken,
              cancelStream$: action$.pipe(
                filter((cancelAction) => {
                  if (cancelAction.type !== actionTypes.cancel) {
                    return false;
                  }
                  return urlInfo.include(cancelAction.entry, action.entry);
                })
              ),
            });
          })
        );
      exposed[epicName] = shared[methodConfig.name];
    });
    return { shared, exposed };
  }
}
