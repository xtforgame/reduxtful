'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class, _temp;

var _ActionTypesCreator = require('./ActionTypesCreator');

var _ActionTypesCreator2 = _interopRequireDefault(_ActionTypesCreator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ActionsCreator = (_temp = _class = function () {
  function ActionsCreator() {
    _classCallCheck(this, ActionsCreator);
  }

  _createClass(ActionsCreator, [{
    key: 'create',
    value: function create(_ref, _ref2) {
      var ns = _ref.ns,
          names = _ref.names,
          getShared = _ref.getShared,
          methodConfigs = _ref.methodConfigs;
      var actionNoRedundantBody = _ref2.actionNoRedundantBody;

      var shared = {};
      var exposed = {};

      var actionTypes = getShared(_ActionTypesCreator2.default.$name);

      methodConfigs.forEach(function (methodConfig) {
        shared[methodConfig.name] = {};
        var actionTypesForMethod = actionTypes[methodConfig.name];
        Object.keys(actionTypesForMethod).forEach(function (key) {
          var type = actionTypesForMethod[key];
          var arg = {
            methodName: methodConfig.name,
            names: names,
            actionTypeName: key
          };

          var exposedName = methodConfig.getActionName(arg);
          var sharedName = methodConfig.name;
          var action = shared[sharedName][key] = ActionsCreator.getActionCreator(type, methodConfig, key, actionNoRedundantBody);
          action.type = type;
          action.actionSet = shared[sharedName];
          action.sharedName = sharedName;
          action.exposedName = exposedName;

          exposed[exposedName] = action;
        });
      });

      return { shared: shared, exposed: exposed };
    }
  }]);

  return ActionsCreator;
}(), _class.$name = 'actions', _class.needIdArg = function (methodConfig, actionType) {
  if (methodConfig.needId != null) {
    return !!methodConfig.needId;
  }

  if (methodConfig.isForCollection === true && !(methodConfig.method === 'post' && actionType === 'respond')) {
    return false;
  }
  return true;
}, _class.needBodyArg = function (methodConfig, actionType, actionNoRedundantBody) {
  if (actionNoRedundantBody && actionType === 'start' && !methodConfig.needBody) {
    return false;
  }
  return true;
}, _class.getActionCreator = function (type, methodConfig, actionType, actionNoRedundantBody) {
  var withIdArg = ActionsCreator.needIdArg(methodConfig, actionType);
  var withBodyArg = ActionsCreator.needBodyArg(methodConfig, actionType, actionNoRedundantBody);

  if (withIdArg) {
    return withBodyArg ? function (id, data) {
      var entry = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
      return { type: type, data: data, entry: _extends({}, entry, { id: id }), options: _extends({ transferables: {} }, options) };
    } : function (id) {
      var entry = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      return { type: type, entry: _extends({}, entry, { id: id }), options: _extends({ transferables: {} }, options) };
    };
  } else {
    return withBodyArg ? function (data) {
      var entry = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      return { type: type, data: data, entry: entry, options: _extends({ transferables: {} }, options) };
    } : function () {
      var entry = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return { type: type, entry: entry, options: _extends({ transferables: {} }, options) };
    };
  }
}, _temp);
exports.default = ActionsCreator;