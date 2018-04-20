'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _axiosPromise = require('./axiosPromise');

var _axiosPromise2 = _interopRequireDefault(_axiosPromise);

var _helperFunctions = require('./helper-functions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ErrorFromMiddleware = function ErrorFromMiddleware(error) {
  (0, _classCallCheck3.default)(this, ErrorFromMiddleware);

  this.error = error;
};

exports.default = function (axios, Observable) {
  return function (axiosOptions) {
    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref$success = _ref.success,
        successAction = _ref$success === undefined ? _helperFunctions.toNull : _ref$success,
        _ref$error = _ref.error,
        errorAction = _ref$error === undefined ? _helperFunctions.toNull : _ref$error,
        _ref$cancel = _ref.cancel,
        cancelAction = _ref$cancel === undefined ? _helperFunctions.toNull : _ref$cancel;

    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var cancelStream$ = options.cancelStream$,
        _options$axiosCancelT = options.axiosCancelTokenSource,
        axiosCancelTokenSource = _options$axiosCancelT === undefined ? axios.CancelToken.source() : _options$axiosCancelT;

    var observable = Observable.fromPromise((0, _axiosPromise2.default)(axios, axiosOptions, options)).map(successAction).catch(function (error) {
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