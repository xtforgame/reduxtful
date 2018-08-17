'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _class, _temp;

var _ActionTypesCreator = require('./ActionTypesCreator');

var _ActionTypesCreator2 = _interopRequireDefault(_ActionTypesCreator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ActionsCreator = (_temp = _class = function () {
  function ActionsCreator() {
    (0, _classCallCheck3.default)(this, ActionsCreator);
  }

  (0, _createClass3.default)(ActionsCreator, [{
    key: 'create',
    value: function create(_ref, _ref2) {
      var ns = _ref.ns,
          names = _ref.names,
          getShared = _ref.getShared,
          methodConfigs = _ref.methodConfigs;
      var actionNoRedundantBody = _ref2.actionNoRedundantBody,
          _ref2$getId = _ref2.getId,
          getId = _ref2$getId === undefined ? function (data) {
        return data.id;
      } : _ref2$getId;

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
          shared[sharedName][key] = ActionsCreator.getActionCreator(type, actionTypesForMethod, methodConfig, key, actionNoRedundantBody);
          var action = shared[sharedName][key];
          action.type = type;
          action.actionSet = shared[sharedName];
          action.sharedName = sharedName;
          action.exposedName = exposedName;
          action.getId = getId;

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
  if (actionNoRedundantBody && (actionType === 'start' || actionType === 'cancel') && !methodConfig.needBody) {
    return false;
  }
  if (methodConfig.name === 'selectPath') {
    return false;
  }
  return true;
}, _class.getActionCreator = function (type, actionTypes, methodConfig, actionType, actionNoRedundantBody) {
  var withIdArg = ActionsCreator.needIdArg(methodConfig, actionType);
  var withBodyArg = ActionsCreator.needBodyArg(methodConfig, actionType, actionNoRedundantBody);

  if (withIdArg) {
    return withBodyArg ? function (id, data) {
      var entry = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
      return {
        type: type,
        data: data,
        entry: (0, _extends3.default)({}, entry, { id: id }),
        options: (0, _extends3.default)({
          transferables: {},
          actionTypes: actionTypes,
          isForCollection: methodConfig.isForCollection,
          method: methodConfig.name
        }, options)
      };
    } : function (id) {
      var entry = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      return {
        type: type,
        entry: (0, _extends3.default)({}, entry, { id: id }),
        options: (0, _extends3.default)({
          transferables: {},
          actionTypes: actionTypes,
          isForCollection: methodConfig.isForCollection,
          method: methodConfig.name
        }, options)
      };
    };
  } else {
    return withBodyArg ? function (data) {
      var entry = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      return {
        type: type,
        data: data,
        entry: entry,
        options: (0, _extends3.default)({
          transferables: {},
          actionTypes: actionTypes,
          isForCollection: methodConfig.isForCollection,
          method: methodConfig.name
        }, options)
      };
    } : function () {
      var entry = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return {
        type: type,
        entry: entry,
        options: (0, _extends3.default)({
          transferables: {},
          actionTypes: actionTypes,
          isForCollection: methodConfig.isForCollection,
          method: methodConfig.name
        }, options)
      };
    };
  }
}, _temp);
exports.default = ActionsCreator;