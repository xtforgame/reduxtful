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

var _commonFunctions = require('./common-functions');

var _getMiddlewaresHandler = require('./getMiddlewaresHandler');

var _getMiddlewaresHandler2 = _interopRequireDefault(_getMiddlewaresHandler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ErrorFromMiddleware = function ErrorFromMiddleware(error) {
  (0, _classCallCheck3.default)(this, ErrorFromMiddleware);

  this.error = error;
};

exports.default = function (axios, request) {
  var op = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var _op$middlewares = op.middlewares,
      _op$middlewares$reque = _op$middlewares.request,
      requestMiddlewares = _op$middlewares$reque === undefined ? [] : _op$middlewares$reque,
      _op$middlewares$respo = _op$middlewares.response,
      responseMiddlewares = _op$middlewares$respo === undefined ? [] : _op$middlewares$respo,
      _op$middlewares$error = _op$middlewares.error,
      errorMiddlewares = _op$middlewares$error === undefined ? [] : _op$middlewares$error,
      _op$debugDelay = op.debugDelay,
      debugDelay = _op$debugDelay === undefined ? 0 : _op$debugDelay,
      _op$axiosCancelTokenS = op.axiosCancelTokenSource,
      axiosCancelTokenSource = _op$axiosCancelTokenS === undefined ? axios.CancelToken.source() : _op$axiosCancelTokenS;


  return (0, _commonFunctions.promiseWait)(debugDelay).then(function () {
    var next = (0, _getMiddlewaresHandler2.default)([].concat((0, _toConsumableArray3.default)(requestMiddlewares), [function (req, _ref) {
      var options = _ref.options;
      return axios((0, _extends3.default)({}, req, {
        cancelToken: axiosCancelTokenSource.token
      }));
    }]), [request, { options: op }]);
    return next();
  }).then(function (response) {
    var next = (0, _getMiddlewaresHandler2.default)([].concat((0, _toConsumableArray3.default)(responseMiddlewares), [function (res) {
      return Promise.resolve(res);
    }]), [response, { request: request, options: op }]);
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
    }]), [error, { request: request, options: op }]);
    return Promise.resolve().then(next);
  });
};