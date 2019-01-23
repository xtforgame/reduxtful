import ActionTypesCreator from './ActionTypesCreator';
import ActionsCreator from './ActionsCreator';
import UrlInfo from '../core/UrlInfo';
import defaultGetId from '../core/defaultGetId';
import {
  toNull,
  getRespondActionCreators,
} from '../core/helper-functions';
import getMiddlewaresHandler from '../core/getMiddlewaresHandler';


class ErrorFromMiddleware {
  constructor(error) {
    this.error = error;
  }
}

export default class RicioEpicCreator {
  static $name = 'wsEpics';

  create({
    ns, names, url, getShared, methodConfigs,
  }, { getId = defaultGetId }, extensionConfig) {
    const shared = {};
    const exposed = {};

    const {
      qs,
      Observable,
      wsProtocol,
      CancelToken,
      middlewares: {
        request: requestMiddlewares = [],
        response: responseMiddlewares = [],
        error: errorMiddlewares = [],
      } = {},
    } = extensionConfig;

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
            const path = urlInfo.compile(action.entry);
            const { query } = action.options;
            const headers = {};
            if (query) {
              headers.query = qs.stringify(query);
            }
            let cancelToken = CancelToken && new CancelToken();
            if (!cancelToken) {
              cancelToken = {
                cancel: () => {},
              };
            }
            const request = {
              method: methodConfig.method,
              path,
              headers,
              body: action.data,
            };
            return Observable.fromPromise(
              // promiseWait(1000)
              Promise.resolve()
              .then(() => {
                const next = getMiddlewaresHandler([
                  ...requestMiddlewares,
                  (req, { options: { cancelToken: c } }) => wsProtocol.open()
                  .then(() => wsProtocol.request(req, { cancelToken: c })),
                ],
                [request, { options: { cancelToken } }]);
                return next();
              })
              .then((response) => {
                const next = getMiddlewaresHandler([
                  ...responseMiddlewares,
                  res => Promise.resolve(res),
                ],
                [response, { request, options: extensionConfig }]);
                return Promise.resolve()
                .then(next)
                .then(res => res || Promise.reject(new ErrorFromMiddleware(`Malformed Response: ${res}, please check you response middlewares`)))
                .catch(error => Promise.reject(new ErrorFromMiddleware(error)));
              })
              .catch((error) => {
                if (error instanceof ErrorFromMiddleware) {
                  return Promise.reject(error.error);
                }
                const next = getMiddlewaresHandler([
                  ...errorMiddlewares,
                  err => Promise.reject(err),
                ],
                [error, { request, options: extensionConfig }]);
                return Promise.resolve()
                .then(next);
              })
            )
            .map(respondCreator(actions, action, getId))
            .catch(error => Observable.of(respondErrorCreator(actions, action)(error)))
            .race(
              action$.filter((cancelAction) => {
                if (cancelAction.type !== actionTypes.cancel) {
                  return false;
                }
                return urlInfo.include(cancelAction.entry, action.entry);
              })
                .map((cancelAction) => {
                  cancelToken.cancel('Operation canceled by the user.');
                  return toNull();
                })
                .take(1)
            );
          });
      exposed[epicName] = shared[methodConfig.name];
    });
    return { shared, exposed };
  }
}
