"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _toConsumableArray2 = require("babel-runtime/helpers/toConsumableArray");

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _toArray2 = require("babel-runtime/helpers/toArray");

var _toArray3 = _interopRequireDefault(_toArray2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getNext = function getNext(_ref, args) {
  var _ref2 = (0, _toArray3.default)(_ref),
      middleware = _ref2[0],
      middlewares = _ref2.slice(1);

  var nextFunction = middlewares.length === 0 ? null : getNext(middlewares, args);
  return function () {
    return middleware && middleware.apply(undefined, (0, _toConsumableArray3.default)(args).concat([nextFunction]));
  };
};

exports.default = function (middlewares, args) {
  return getNext(middlewares, args);
};