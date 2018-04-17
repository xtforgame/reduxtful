'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _utils = require('../utils');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ErrorFromMiddleware = function ErrorFromMiddleware(error) {
  _classCallCheck(this, ErrorFromMiddleware);

  this.error = error;
};

var toNull = function toNull() {
  return { type: 'TO_NULL' };
};

exports.default = function (axios, Observable) {
  return function (axiosOptions) {
    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref$success = _ref.success,
        successAction = _ref$success === undefined ? toNull : _ref$success,
        _ref$error = _ref.error,
        errorAction = _ref$error === undefined ? toNull : _ref$error,
        _ref$cancel = _ref.cancel,
        cancelAction = _ref$cancel === undefined ? toNull : _ref$cancel;

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
        cancelStream$ = options.cancelStream$,
        _options$axiosCancelT = options.axiosCancelTokenSource,
        axiosCancelTokenSource = _options$axiosCancelT === undefined ? axios.CancelToken.source() : _options$axiosCancelT;

    var observable = Observable.fromPromise((0, _utils.promiseWait)(debugDelay).then(function () {
      return axios(_extends({}, axiosOptions, {
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
    })).map(successAction).catch(function (error) {
      return Observable.of(errorAction(error));
    });

    if (cancelStream$) {
      observable = observable.race(cancelStream$.map(function () {
        axiosCancelTokenSource.cancel('Operation canceled by the user.');
        return cancelAction();
      }).take(1));
    }
    return observable;
  };
};