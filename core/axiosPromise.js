'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _commonFunctions = require('../core/common-functions');

var _getMiddlewaresHandler = require('../core/getMiddlewaresHandler');

var _getMiddlewaresHandler2 = _interopRequireDefault(_getMiddlewaresHandler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ErrorFromMiddleware = function ErrorFromMiddleware(error) {
  (0, _classCallCheck3.default)(this, ErrorFromMiddleware);

  this.error = error;
};

exports.default = function (axios, request) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var _options$middlewares = options.middlewares,
      _options$middlewares$ = _options$middlewares.request,
      requestMiddlewares = _options$middlewares$ === undefined ? [] : _options$middlewares$,
      _options$middlewares$2 = _options$middlewares.response,
      responseMiddlewares = _options$middlewares$2 === undefined ? [] : _options$middlewares$2,
      _options$middlewares$3 = _options$middlewares.error,
      errorMiddlewares = _options$middlewares$3 === undefined ? [] : _options$middlewares$3,
      _options$debugDelay = options.debugDelay,
      debugDelay = _options$debugDelay === undefined ? 0 : _options$debugDelay,
      _options$axiosCancelT = options.axiosCancelTokenSource,
      axiosCancelTokenSource = _options$axiosCancelT === undefined ? axios.CancelToken.source() : _options$axiosCancelT;


  return (0, _commonFunctions.promiseWait)(debugDelay).then(function () {
    var next = (0, _getMiddlewaresHandler2.default)([].concat((0, _toConsumableArray3.default)(requestMiddlewares), [function (request, _ref) {
      var options = _ref.options;
      return axios((0, _extends3.default)({}, request, {
        cancelToken: options.axiosCancelTokenSource.token
      }));
    }]), [request, { options: options }]);
    return next();
  }).then(function (response) {
    var next = (0, _getMiddlewaresHandler2.default)([].concat((0, _toConsumableArray3.default)(responseMiddlewares), [function (response) {
      return Promise.resolve(response);
    }]), [response, { request: request, options: options }]);
    return Promise.resolve().then(next).then(function (response) {
      return response || Promise.reject(new ErrorFromMiddleware('Malformed Response: ' + response + ', please check you response middlewares'));
    }).catch(function (error) {
      return Promise.reject(new ErrorFromMiddleware(error));
    });
  }).catch(function (error) {
    if (error instanceof ErrorFromMiddleware) {
      return Promise.reject(error.error);
    }
    var next = (0, _getMiddlewaresHandler2.default)([].concat((0, _toConsumableArray3.default)(errorMiddlewares), [function (error) {
      return Promise.reject(error);
    }]), [error, { request: request, options: options }]);
    return Promise.resolve().then(next);
  });
};