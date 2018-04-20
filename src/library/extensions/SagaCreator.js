import ActionTypesCreator from './ActionTypesCreator';
import ActionsCreator from './ActionsCreator';
import axiosPromise from '../core/axiosPromise';
import UrlInfo from '../core/UrlInfo';
import {
  toNull,
  getRespondActionCreators,
} from '../core/helper-functions';

export default class SagaCreator {
  static $name = 'sagas';

  create({ ns, names, url, getShared, methodConfigs }, { getId = (action => action.data.id) }, extensionConfig){
    let shared = {};
    let exposed = {};

    const {
      axios,
      effects: { takeEvery, call, put, race, take },
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

      if(!methodConfig.getSagaName || !methodConfig.getUrlTemplate){
        return { shared, exposed };
      }

      const sagaName = methodConfig.getSagaName(arg);
      const urlInfo = new UrlInfo(methodConfig.getUrlTemplate({url, names}));

      const {
        respondCreator,
        respondErrorCreator,
      } = getRespondActionCreators(methodConfig);

      shared[methodConfig.name] = function* requestSaga(){
        yield takeEvery(actionTypes.start, function* foo(action) {
          const url = urlInfo.compile(action.entry);
          const query = action.options.query;
          const source = axios.CancelToken.source();

          try {
            const { response, cancelSagas } = yield race({
              response: call(axiosPromise, axios, {
                method: methodConfig.method,
                url,
                headers: getHeaders(),
                data: action.data,
                params: query,
              }, {
                responseMiddleware,
                errorMiddleware,
                axiosCancelTokenSource: source,
              }),
              cancelSagas: take(cancelAction => {
                if(cancelAction.type !== actionTypes.cancel){
                  return false;
                }
                return urlInfo.include(cancelAction.entry, action.entry);
              }),
            });

            if(response){
              yield put(respondCreator(actions, action, getId)(response));
            }else{
              source.cancel('Operation canceled by the user.');
              yield put(toNull());
            }
          } catch (error) {
            yield put(respondErrorCreator(actions, action)(error));
          }
        });
      }
      exposed[sagaName] = shared[methodConfig.name];
    });
    return { shared, exposed };
  }
}
