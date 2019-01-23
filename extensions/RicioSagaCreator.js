'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

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

var RicioSagaCreator = (_temp = _class = function () {
  function RicioSagaCreator() {
    (0, _classCallCheck3.default)(this, RicioSagaCreator);
  }

  (0, _createClass3.default)(RicioSagaCreator, [{
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
          effects = extensionConfig.effects,
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


      if (!effects || !wsProtocol) {
        return { shared: shared, exposed: exposed };
      }

      var takeEvery = effects.takeEvery,
          call = effects.call,
          put = effects.put,
          race = effects.race,
          take = effects.take;


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

        if (!methodConfig.getSagaName || !methodConfig.getUrlTemplate) {
          return;
        }

        var sagaName = methodConfig.getSagaName(arg);
        var urlInfo = new _UrlInfo2.default(methodConfig.getUrlTemplate({ url: url, names: names }));

        var _getRespondActionCrea = (0, _helperFunctions.getRespondActionCreators)(methodConfig),
            respondCreator = _getRespondActionCrea.respondCreator,
            respondErrorCreator = _getRespondActionCrea.respondErrorCreator;

        shared[methodConfig.name] = _regenerator2.default.mark(function requestSaga() {
          return _regenerator2.default.wrap(function requestSaga$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  _context2.next = 2;
                  return takeEvery(actionTypes.start, _regenerator2.default.mark(function foo(action) {
                    var path, query, headers, cancelToken, request, next, _ref4, response, cancelSagas, nextHandler, p, result, errNextHandler, _result;

                    return _regenerator2.default.wrap(function foo$(_context) {
                      while (1) {
                        switch (_context.prev = _context.next) {
                          case 0:
                            path = urlInfo.compile(action.entry);
                            query = action.options.query;
                            headers = {};

                            if (query) {
                              headers.query = qs.stringify(query);
                            }
                            cancelToken = CancelToken && new CancelToken();

                            if (!cancelToken) {
                              cancelToken = {
                                cancel: function cancel() {}
                              };
                            }
                            request = {
                              method: methodConfig.method,
                              path: path,
                              headers: headers,
                              body: action.data
                            };
                            next = (0, _getMiddlewaresHandler2.default)([].concat((0, _toConsumableArray3.default)(requestMiddlewares), [function (req, _ref3) {
                              var c = _ref3.options.cancelToken;
                              return wsProtocol.open().then(function () {
                                return wsProtocol.request(req, { cancelToken: c });
                              });
                            }]), [request, { options: { cancelToken: cancelToken } }]);
                            _context.prev = 8;
                            _context.next = 11;
                            return race({
                              response: call(next),
                              cancelSagas: take(function (cancelAction) {
                                if (cancelAction.type !== actionTypes.cancel) {
                                  return false;
                                }
                                return urlInfo.include(cancelAction.entry, action.entry);
                              })
                            });

                          case 11:
                            _ref4 = _context.sent;
                            response = _ref4.response;
                            cancelSagas = _ref4.cancelSagas;

                            if (!cancelSagas) {
                              _context.next = 20;
                              break;
                            }

                            cancelToken.cancel('Operation canceled by the user.');
                            _context.next = 18;
                            return put((0, _helperFunctions.toNull)());

                          case 18:
                            _context.next = 42;
                            break;

                          case 20:
                            nextHandler = (0, _getMiddlewaresHandler2.default)([].concat((0, _toConsumableArray3.default)(responseMiddlewares), [function (res) {
                              return Promise.resolve(res);
                            }]), [response, { request: request, options: extensionConfig }]);

                            p = function p() {
                              return Promise.resolve().then(nextHandler).then(function (res) {
                                return res || Promise.reject(new ErrorFromMiddleware('Malformed Response: ' + res + ', please check you response middlewares'));
                              }).catch(function (error) {
                                return Promise.reject(new ErrorFromMiddleware(error));
                              });
                            };

                            _context.prev = 22;
                            _context.next = 25;
                            return call(p);

                          case 25:
                            result = _context.sent;
                            _context.next = 28;
                            return put(respondCreator(actions, action, getId)(result));

                          case 28:
                            _context.next = 42;
                            break;

                          case 30:
                            _context.prev = 30;
                            _context.t0 = _context['catch'](22);

                            if (!(_context.t0 instanceof ErrorFromMiddleware)) {
                              _context.next = 36;
                              break;
                            }

                            throw _context.t0;

                          case 36:
                            errNextHandler = (0, _getMiddlewaresHandler2.default)([].concat((0, _toConsumableArray3.default)(errorMiddlewares), [function (err) {
                              return Promise.reject(err);
                            }]), [_context.t0, { request: request, options: extensionConfig }]);
                            _context.next = 39;
                            return call(function () {
                              return Promise.resolve().then(errNextHandler);
                            });

                          case 39:
                            _result = _context.sent;
                            _context.next = 42;
                            return put(respondErrorCreator(actions, action)(_result));

                          case 42:
                            _context.next = 48;
                            break;

                          case 44:
                            _context.prev = 44;
                            _context.t1 = _context['catch'](8);
                            _context.next = 48;
                            return put(respondErrorCreator(actions, action)(_context.t1));

                          case 48:
                          case 'end':
                            return _context.stop();
                        }
                      }
                    }, foo, this, [[8, 44], [22, 30]]);
                  }));

                case 2:
                case 'end':
                  return _context2.stop();
              }
            }
          }, requestSaga, this);
        });
        exposed[sagaName] = shared[methodConfig.name];
      });
      return { shared: shared, exposed: exposed };
    }
  }]);
  return RicioSagaCreator;
}(), _class.$name = 'wsSagas', _temp);
exports.default = RicioSagaCreator;