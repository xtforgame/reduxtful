'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ricioPromise = require('./ricioPromise');

var _ricioPromise2 = _interopRequireDefault(_ricioPromise);

var _helperFunctions = require('./helper-functions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (wsProtocol, _ref, _ref2) {
  var map = _ref.map,
      catchError = _ref.catchError,
      take = _ref.take;
  var race = _ref2.race,
      from = _ref2.from,
      of = _ref2.of;
  return function (ricioOptions) {
    var _ref3 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref3$success = _ref3.success,
        successAction = _ref3$success === undefined ? _helperFunctions.toNull : _ref3$success,
        _ref3$error = _ref3.error,
        errorAction = _ref3$error === undefined ? _helperFunctions.toNull : _ref3$error,
        _ref3$cancel = _ref3.cancel,
        cancelAction = _ref3$cancel === undefined ? _helperFunctions.toNull : _ref3$cancel;

    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var cancelStream$ = options.cancelStream$,
        ricioCancelToken = options.ricioCancelToken;


    var observable = from((0, _ricioPromise2.default)(wsProtocol, ricioOptions, options)).pipe(map(successAction), catchError(function (error) {
      return of(errorAction(error));
    }));

    if (cancelStream$) {
      return race(observable, cancelStream$.pipe(map(function (value) {
        ricioCancelToken.cancel('Operation canceled by the user.');
        return cancelAction(value);
      }), take(1)));
    }
    return observable;
  };
};