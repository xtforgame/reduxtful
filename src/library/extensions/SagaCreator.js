import ActionTypesCreator from './ActionTypesCreator';
import ActionsCreator from './ActionsCreator';
import axiosPromise from '../core/axiosPromise';
import UrlInfo from '../core/UrlInfo';
import defaultGetId from '../core/defaultGetId';
import {
  toNull,
  getRespondActionCreators,
} from '../core/helper-functions';

export default class SagaCreator {
  static $name = 'sagas';

  create({
    ns, names, url, getShared, methodConfigs,
  }, { getId = defaultGetId }, extensionConfig) {
    const shared = {};
    const exposed = {};

    const {
      axios,
      effects: {
        takeEvery, call, put, race, take, select,
      } = {},
      getHeaders = () => ({}),
      middlewares = {},
    } = extensionConfig;

    if (!axios) {
      return { shared, exposed };
    }

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

      if (!methodConfig.getSagaName || !methodConfig.getUrlTemplate) {
        return;
      }

      const sagaName = methodConfig.getSagaName(arg);
      const urlInfo = new UrlInfo(methodConfig.getUrlTemplate({ url, names }));

      const {
        respondCreator,
        respondErrorCreator,
      } = getRespondActionCreators(methodConfig);

      shared[methodConfig.name] = function* requestSaga() {
        yield takeEvery(actionTypes.start, function* foo(action) {
          const compiledUrl = urlInfo.compile(action.entry);
          const { query } = action.options;
          const source = axios.CancelToken.source();
          const state = yield select(s => s);

          try {
            const { response, cancelSagas } = yield race({
              response: call(axiosPromise, axios, {
                method: methodConfig.method,
                url: compiledUrl,
                headers: getHeaders(),
                data: action.data,
                params: query,
              }, {
                startAction: action,
                state,
                actionTypes,
                actions,
                middlewares,
                axiosCancelTokenSource: source,
              }),
              cancelSagas: take((cancelAction) => {
                if (cancelAction.type !== actionTypes.cancel) {
                  return false;
                }
                return urlInfo.include(cancelAction.entry, action.entry);
              }),
            });

            if (cancelSagas) {
              source.cancel('Operation canceled by the user.');
              yield put(toNull());
            } else {
              yield put(respondCreator(actions, action, getId)(response));
            }
          } catch (error) {
            yield put(respondErrorCreator(actions, action)(error));
          }
        });
      };
      exposed[sagaName] = shared[methodConfig.name];
    });
    return { shared, exposed };
  }
}
