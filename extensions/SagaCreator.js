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

var _defaultGetId = require('../core/defaultGetId');

var _defaultGetId2 = _interopRequireDefault(_defaultGetId);

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
          getId = _ref2$getId === undefined ? _defaultGetId2.default : _ref2$getId;

      var shared = {};
      var exposed = {};

      var axios = extensionConfig.axios,
          _extensionConfig$effe = extensionConfig.effects;
      _extensionConfig$effe = _extensionConfig$effe === undefined ? {} : _extensionConfig$effe;
      var takeEvery = _extensionConfig$effe.takeEvery,
          call = _extensionConfig$effe.call,
          put = _extensionConfig$effe.put,
          race = _extensionConfig$effe.race,
          take = _extensionConfig$effe.take,
          select = _extensionConfig$effe.select,
          _extensionConfig$getH = extensionConfig.getHeaders,
          getHeaders = _extensionConfig$getH === undefined ? function () {
        return {};
      } : _extensionConfig$getH,
          _extensionConfig$midd = extensionConfig.middlewares,
          middlewares = _extensionConfig$midd === undefined ? {} : _extensionConfig$midd;


      if (!axios) {
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
                    var compiledUrl, query, source, state, _ref3, response, cancelSagas;

                    return _regenerator2.default.wrap(function foo$(_context) {
                      while (1) {
                        switch (_context.prev = _context.next) {
                          case 0:
                            compiledUrl = urlInfo.compile(action.entry);
                            query = action.options.query;
                            source = axios.CancelToken.source();
                            _context.next = 5;
                            return select(function (s) {
                              return s;
                            });

                          case 5:
                            state = _context.sent;
                            _context.prev = 6;
                            _context.next = 9;
                            return race({
                              response: call(_axiosPromise2.default, axios, {
                                method: methodConfig.method,
                                url: compiledUrl,
                                headers: getHeaders(),
                                data: action.data,
                                params: query
                              }, {
                                startAction: action,
                                state: state,
                                actionTypes: actionTypes,
                                actions: actions,
                                middlewares: middlewares,
                                axiosCancelTokenSource: source
                              }),
                              cancelSagas: take(function (cancelAction) {
                                if (cancelAction.type !== actionTypes.cancel) {
                                  return false;
                                }
                                return urlInfo.include(cancelAction.entry, action.entry);
                              })
                            });

                          case 9:
                            _ref3 = _context.sent;
                            response = _ref3.response;
                            cancelSagas = _ref3.cancelSagas;

                            if (!cancelSagas) {
                              _context.next = 18;
                              break;
                            }

                            source.cancel('Operation canceled by the user.');
                            _context.next = 16;
                            return put((0, _helperFunctions.toNull)());

                          case 16:
                            _context.next = 20;
                            break;

                          case 18:
                            _context.next = 20;
                            return put(respondCreator(actions, action, getId)(response));

                          case 20:
                            _context.next = 26;
                            break;

                          case 22:
                            _context.prev = 22;
                            _context.t0 = _context['catch'](6);
                            _context.next = 26;
                            return put(respondErrorCreator(actions, action)(_context.t0));

                          case 26:
                          case 'end':
                            return _context.stop();
                        }
                      }
                    }, foo, this, [[6, 22]]);
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