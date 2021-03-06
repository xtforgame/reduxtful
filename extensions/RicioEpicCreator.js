'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _class, _temp;

var _ActionTypesCreator = require('./ActionTypesCreator');

var _ActionTypesCreator2 = _interopRequireDefault(_ActionTypesCreator);

var _ActionsCreator = require('./ActionsCreator');

var _ActionsCreator2 = _interopRequireDefault(_ActionsCreator);

var _RicioObservable = require('../core/RicioObservable');

var _RicioObservable2 = _interopRequireDefault(_RicioObservable);

var _UrlInfo = require('../core/UrlInfo');

var _UrlInfo2 = _interopRequireDefault(_UrlInfo);

var _defaultGetId = require('../core/defaultGetId');

var _defaultGetId2 = _interopRequireDefault(_defaultGetId);

var _helperFunctions = require('../core/helper-functions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var RicioEpicCreator = (_temp = _class = function () {
  function RicioEpicCreator() {
    (0, _classCallCheck3.default)(this, RicioEpicCreator);
  }

  (0, _createClass3.default)(RicioEpicCreator, [{
    key: 'create',
    value: function create(_ref, _ref2, extensionConfig) {
      var ns = _ref.ns,
          names = _ref.names,
          url = _ref.url,
          getShared = _ref.getShared,
          methodConfigs = _ref.methodConfigs;
      var _ref2$getId = _ref2.getId,
          getId = _ref2$getId === undefined ? _defaultGetId2.default : _ref2$getId;

      var shared = {};
      var exposed = {};

      var qs = extensionConfig.qs,
          wsProtocol = extensionConfig.wsProtocol,
          CancelToken = extensionConfig.CancelToken,
          operators = extensionConfig.operators,
          rxjs = extensionConfig.rxjs,
          _extensionConfig$getH = extensionConfig.getHeaders,
          getHeaders = _extensionConfig$getH === undefined ? function () {
        return {};
      } : _extensionConfig$getH,
          _extensionConfig$midd = extensionConfig.middlewares,
          middlewares = _extensionConfig$midd === undefined ? {} : _extensionConfig$midd;


      if (!wsProtocol || !CancelToken || !operators || !rxjs) {
        return { shared: shared, exposed: exposed };
      }

      var filter = operators.filter,
          mergeMap = operators.mergeMap;


      var ricioObservable = (0, _RicioObservable2.default)(wsProtocol, operators, rxjs);

      methodConfigs.forEach(function (methodConfig) {
        if (methodConfig.supportedActions.length <= 1) {
          return;
        }
        var actionTypes = getShared(_ActionTypesCreator2.default.$name)[methodConfig.name];
        var actions = getShared(_ActionsCreator2.default.$name)[methodConfig.name];


        var arg = {
          methodName: methodConfig.name,
          names: names
        };

        if (!methodConfig.getEpicName || !methodConfig.getUrlTemplate) {
          return;
        }

        var epicName = methodConfig.getEpicName(arg);
        var urlInfo = new _UrlInfo2.default(methodConfig.getUrlTemplate({ url: url, names: names }));

        var _getRespondActionCrea = (0, _helperFunctions.getRespondActionCreators)(methodConfig),
            respondCreator = _getRespondActionCrea.respondCreator,
            respondErrorCreator = _getRespondActionCrea.respondErrorCreator;

        shared[methodConfig.name] = function (action$, state$) {
          return action$.ofType(actionTypes.start).pipe(mergeMap(function (action) {
            var compiledUrl = urlInfo.compile(action.entry);
            var query = action.options.query;

            var headers = (0, _extends3.default)({}, getHeaders());
            if (query) {
              headers.query = qs.stringify(query);
            }
            var cancelToken = CancelToken && new CancelToken();
            if (!cancelToken) {
              cancelToken = {
                setHandled: function setHandled() {},
                setCancelFunc: function setCancelFunc() {},
                cancel: function cancel() {}
              };
            }

            return ricioObservable({
              method: methodConfig.method,
              path: compiledUrl,
              headers: headers,
              body: action.data
            }, {
              success: respondCreator(actions, action, getId),
              error: respondErrorCreator(actions, action)
            }, {
              startAction: action,
              state: state$.value,
              actionTypes: actionTypes,
              actions: actions,
              middlewares: middlewares,
              ricioCancelToken: cancelToken,
              cancelStream$: action$.pipe(filter(function (cancelAction) {
                if (cancelAction.type !== actionTypes.cancel) {
                  return false;
                }
                return urlInfo.include(cancelAction.entry, action.entry);
              }))
            });
          }));
        };
        exposed[epicName] = shared[methodConfig.name];
      });
      return { shared: shared, exposed: exposed };
    }
  }]);
  return RicioEpicCreator;
}(), _class.$name = 'wsEpics', _temp);
exports.default = RicioEpicCreator;