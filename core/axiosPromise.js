'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _commonFunctions = require('../core/common-functions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ErrorFromMiddleware = function ErrorFromMiddleware(error) {
  (0, _classCallCheck3.default)(this, ErrorFromMiddleware);

  this.error = error;
};

exports.default = function (axios, axiosOptions) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var _options$responseMidd = options.responseMiddleware,
      responseMiddleware = _options$responseMidd === undefined ? function (response) {
    return Promise.resolve(response);
  } : _options$responseMidd,
      _options$errorMiddlew = options.errorMiddleware,
      errorMiddleware = _options$errorMiddlew === undefined ? function (error) {
    return Promise.reject(error);
  } : _options$errorMiddlew,
      _options$debugDelay = options.debugDelay,
      debugDelay = _options$debugDelay === undefined ? 0 : _options$debugDelay,
      _options$axiosCancelT = options.axiosCancelTokenSource,
      axiosCancelTokenSource = _options$axiosCancelT === undefined ? axios.CancelToken.source() : _options$axiosCancelT;

  return (0, _commonFunctions.promiseWait)(debugDelay).then(function () {
    return axios((0, _extends3.default)({}, axiosOptions, {
      cancelToken: axiosCancelTokenSource.token
    }));
  }).then(function (response) {
    return Promise.resolve().then(function () {
      return responseMiddleware(response, { request: axiosOptions, options: options });
    }).catch(function (error) {
      return Promise.reject(new ErrorFromMiddleware(error));
    });
  }).catch(function (error) {
    if (error instanceof ErrorFromMiddleware) {
      return Promise.reject(error.error);
    }
    return Promise.resolve().then(function () {
      return errorMiddleware(error, { request: axiosOptions, options: options });
    });
  });
};