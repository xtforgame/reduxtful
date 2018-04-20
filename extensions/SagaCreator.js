'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _class, _temp;

var _ActionTypesCreator = require('./ActionTypesCreator');

var _ActionTypesCreator2 = _interopRequireDefault(_ActionTypesCreator);

var _ActionsCreator = require('./ActionsCreator');

var _ActionsCreator2 = _interopRequireDefault(_ActionsCreator);

var _axiosPromise = require('../core/axiosPromise');

var _axiosPromise2 = _interopRequireDefault(_axiosPromise);

var _UrlInfo = require('../core/UrlInfo');

var _UrlInfo2 = _interopRequireDefault(_UrlInfo);

var _helperFunctions = require('../core/helper-functions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SagaCreator = (_temp = _class = function () {
  function SagaCreator() {
    (0, _classCallCheck3.default)(this, SagaCreator);
  }

  (0, _createClass3.default)(SagaCreator, [{
    key: 'create',
    value: function create(_ref, _ref2, extensionConfig) {
      var ns = _ref.ns,
          names = _ref.names,
          url = _ref.url,
          getShared = _ref.getShared,
          methodConfigs = _ref.methodConfigs;
      var _ref2$getId = _ref2.getId,
          getId = _ref2$getId === undefined ? function (action) {
        return action.data.id;
      } : _ref2$getId;

      var shared = {};
      var exposed = {};

      var axios = extensionConfig.axios,
          _extensionConfig$effe = extensionConfig.effects,
          takeEvery = _extensionConfig$effe.takeEvery,
          call = _extensionConfig$effe.call,
          put = _extensionConfig$effe.put,
          race = _extensionConfig$effe.race,
          take = _extensionConfig$effe.take,
          _extensionConfig$getH = extensionConfig.getHeaders,
          getHeaders = _extensionConfig$getH === undefined ? function () {
        return {};
      } : _extensionConfig$getH,
          responseMiddleware = extensionConfig.responseMiddleware,
          errorMiddleware = extensionConfig.errorMiddleware;


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
          return { shared: shared, exposed: exposed };
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
                    var url, query, source, _ref3, response, cancelSagas;

                    return _regenerator2.default.wrap(function foo$(_context) {
                      while (1) {
                        switch (_context.prev = _context.next) {
                          case 0:
                            url = urlInfo.compile(action.entry);
                            query = action.options.query;
                            source = axios.CancelToken.source();
                            _context.prev = 3;
                            _context.next = 6;
                            return race({
                              response: call(_axiosPromise2.default, axios, {
                                method: methodConfig.method,
                                url: url,
                                headers: getHeaders(),
                                data: action.data,
                                params: query
                              }, {
                                responseMiddleware: responseMiddleware,
                                errorMiddleware: errorMiddleware,
                                axiosCancelTokenSource: source
                              }),
                              cancelSagas: take(function (cancelAction) {
                                if (cancelAction.type !== actionTypes.cancel) {
                                  return false;
                                }
                                return urlInfo.include(cancelAction.entry, action.entry);
                              })
                            });

                          case 6:
                            _ref3 = _context.sent;
                            response = _ref3.response;
                            cancelSagas = _ref3.cancelSagas;

                            if (!response) {
                              _context.next = 14;
                              break;
                            }

                            _context.next = 12;
                            return put(respondCreator(actions, action, getId)(response));

                          case 12:
                            _context.next = 17;
                            break;

                          case 14:
                            source.cancel('Operation canceled by the user.');
                            _context.next = 17;
                            return put((0, _helperFunctions.toNull)());

                          case 17:
                            _context.next = 23;
                            break;

                          case 19:
                            _context.prev = 19;
                            _context.t0 = _context['catch'](3);
                            _context.next = 23;
                            return put(respondErrorCreator(actions, action)(_context.t0));

                          case 23:
                          case 'end':
                            return _context.stop();
                        }
                      }
                    }, foo, this, [[3, 19]]);
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
  return SagaCreator;
}(), _class.$name = 'sagas', _temp);
exports.default = SagaCreator;