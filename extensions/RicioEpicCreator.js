'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _class, _temp;

var _ActionTypesCreator = require('./ActionTypesCreator');

var _ActionTypesCreator2 = _interopRequireDefault(_ActionTypesCreator);

var _ActionsCreator = require('./ActionsCreator');

var _ActionsCreator2 = _interopRequireDefault(_ActionsCreator);

var _UrlInfo = require('../core/UrlInfo');

var _UrlInfo2 = _interopRequireDefault(_UrlInfo);

var _defaultGetId = require('../core/defaultGetId');

var _defaultGetId2 = _interopRequireDefault(_defaultGetId);

var _helperFunctions = require('../core/helper-functions');

var _getMiddlewaresHandler = require('../core/getMiddlewaresHandler');

var _getMiddlewaresHandler2 = _interopRequireDefault(_getMiddlewaresHandler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ErrorFromMiddleware = function ErrorFromMiddleware(error) {
  (0, _classCallCheck3.default)(this, ErrorFromMiddleware);

  this.error = error;
};

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
          Observable = extensionConfig.Observable,
          wsProtocol = extensionConfig.wsProtocol,
          CancelToken = extensionConfig.CancelToken,
          _extensionConfig$midd = extensionConfig.middlewares;
      _extensionConfig$midd = _extensionConfig$midd === undefined ? {} : _extensionConfig$midd;
      var _extensionConfig$midd2 = _extensionConfig$midd.request,
          requestMiddlewares = _extensionConfig$midd2 === undefined ? [] : _extensionConfig$midd2,
          _extensionConfig$midd3 = _extensionConfig$midd.response,
          responseMiddlewares = _extensionConfig$midd3 === undefined ? [] : _extensionConfig$midd3,
          _extensionConfig$midd4 = _extensionConfig$midd.error,
          errorMiddlewares = _extensionConfig$midd4 === undefined ? [] : _extensionConfig$midd4;


      if (!Observable || !wsProtocol) {
        return { shared: shared, exposed: exposed };
      }

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

        shared[methodConfig.name] = function (action$, store) {
          return action$.ofType(actionTypes.start).mergeMap(function (action) {
            var path = urlInfo.compile(action.entry);
            var query = action.options.query;

            var headers = {};
            if (query) {
              headers.query = qs.stringify(query);
            }
            var cancelToken = CancelToken && new CancelToken();
            if (!cancelToken) {
              cancelToken = {
                cancel: function cancel() {}
              };
            }
            var request = {
              method: methodConfig.method,
              path: path,
              headers: headers,
              body: action.data
            };
            return Observable.fromPromise(Promise.resolve().then(function () {
              var next = (0, _getMiddlewaresHandler2.default)([].concat((0, _toConsumableArray3.default)(requestMiddlewares), [function (req, _ref3) {
                var c = _ref3.options.cancelToken;
                return wsProtocol.open().then(function () {
                  return wsProtocol.request(req, { cancelToken: c });
                });
              }]), [request, { options: { cancelToken: cancelToken } }]);
              return next();
            }).then(function (response) {
              var next = (0, _getMiddlewaresHandler2.default)([].concat((0, _toConsumableArray3.default)(responseMiddlewares), [function (res) {
                return Promise.resolve(res);
              }]), [response, { request: request, options: extensionConfig }]);
              return Promise.resolve().then(next).then(function (res) {
                return res || Promise.reject(new ErrorFromMiddleware('Malformed Response: ' + res + ', please check you response middlewares'));
              }).catch(function (error) {
                return Promise.reject(new ErrorFromMiddleware(error));
              });
            }).catch(function (error) {
              if (error instanceof ErrorFromMiddleware) {
                return Promise.reject(error.error);
              }
              var next = (0, _getMiddlewaresHandler2.default)([].concat((0, _toConsumableArray3.default)(errorMiddlewares), [function (err) {
                return Promise.reject(err);
              }]), [error, { request: request, options: extensionConfig }]);
              return Promise.resolve().then(next);
            })).map(respondCreator(actions, action, getId)).catch(function (error) {
              return Observable.of(respondErrorCreator(actions, action)(error));
            }).race(action$.filter(function (cancelAction) {
              if (cancelAction.type !== actionTypes.cancel) {
                return false;
              }
              return urlInfo.include(cancelAction.entry, action.entry);
            }).map(function (cancelAction) {
              cancelToken.cancel('Operation canceled by the user.');
              return (0, _helperFunctions.toNull)();
            }).take(1));
          });
        };
        exposed[epicName] = shared[methodConfig.name];
      });
      return { shared: shared, exposed: exposed };
    }
  }]);
  return RicioEpicCreator;
}(), _class.$name = 'wsEpics', _temp);
exports.default = RicioEpicCreator;