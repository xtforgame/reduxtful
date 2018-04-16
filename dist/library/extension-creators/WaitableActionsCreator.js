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

var _ActionsCreator = require('./ActionsCreator');

var _ActionsCreator2 = _interopRequireDefault(_ActionsCreator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WaitableActionsCreator = (_temp = _class = function () {
  function WaitableActionsCreator() {
    _classCallCheck(this, WaitableActionsCreator);
  }

  _createClass(WaitableActionsCreator, [{
    key: 'getWaitSymbols',
    value: function getWaitSymbols() {
      var createReduxWaitForMiddleware = require('redux-wait-for-action');
      var WAIT_FOR_ACTION = createReduxWaitForMiddleware.WAIT_FOR_ACTION,
          ERROR_ACTION = createReduxWaitForMiddleware.ERROR_ACTION,
          CALLBACK_ARGUMENT = createReduxWaitForMiddleware.CALLBACK_ARGUMENT,
          CALLBACK_ERROR_ARGUMENT = createReduxWaitForMiddleware.CALLBACK_ERROR_ARGUMENT;

      return {
        WAIT_FOR_ACTION: WAIT_FOR_ACTION,
        ERROR_ACTION: ERROR_ACTION,
        CALLBACK_ARGUMENT: CALLBACK_ARGUMENT,
        CALLBACK_ERROR_ARGUMENT: CALLBACK_ERROR_ARGUMENT
      };
    }
  }, {
    key: 'create',
    value: function create(_ref, _ref2) {
      var ns = _ref.ns,
          names = _ref.names,
          getShared = _ref.getShared,
          methodConfigs = _ref.methodConfigs;
      var actionNoRedundantBody = _ref2.actionNoRedundantBody;

      var shared = {};
      var exposed = {};

      var symbols = this.getWaitSymbols();
      var sharedActionTypes = getShared(_ActionTypesCreator2.default.$name);
      var sharedActions = getShared(_ActionsCreator2.default.$name);

      methodConfigs.forEach(function (methodConfig) {
        shared[methodConfig.name] = {};
        if (!methodConfig.supportedActions.filter(function (a) {
          return a.name === 'respond';
        }).length || !methodConfig.supportedActions.filter(function (a) {
          return a.name === 'respondError';
        }).length) {
          return;
        }

        var actionTypes = sharedActionTypes[methodConfig.name];
        var actions = sharedActions[methodConfig.name];

        Object.keys(actionTypes).filter(function (key) {
          return key === 'start';
        }).forEach(function (key) {
          var type = actionTypes[key];
          var arg = {
            methodName: methodConfig.name,
            names: names,
            actionTypeName: key
          };

          var exposedName = methodConfig.getActionName(arg);
          var sharedName = methodConfig.name;
          var action = shared[sharedName][key] = WaitableActionsCreator.getActionCreator(type, actions, symbols);
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

  return WaitableActionsCreator;
}(), _class.$name = 'waitableActions', _class.getActionCreator = function (type, actions, symbols) {
  var WAIT_FOR_ACTION = symbols.WAIT_FOR_ACTION,
      ERROR_ACTION = symbols.ERROR_ACTION,
      CALLBACK_ARGUMENT = symbols.CALLBACK_ARGUMENT,
      CALLBACK_ERROR_ARGUMENT = symbols.CALLBACK_ERROR_ARGUMENT;


  return function () {
    var _extends2;

    var actionData = actions.start.apply(actions, arguments);
    var waitToken = Symbol();
    actionData.options.transferables = _extends({}, actionData.options.transferables, {
      waitToken: waitToken
    });
    return _extends({}, actionData, (_extends2 = {}, _defineProperty(_extends2, WAIT_FOR_ACTION, function (action) {
      return action.type === actions.respond.type && action.options.transferables.waitToken === waitToken;
    }), _defineProperty(_extends2, ERROR_ACTION, function (action) {
      return action.type === actions.respondError.type && action.options.transferables.waitToken === waitToken;
    }), _defineProperty(_extends2, CALLBACK_ARGUMENT, function (action) {
      return action;
    }), _defineProperty(_extends2, CALLBACK_ERROR_ARGUMENT, function (action) {
      return action;
    }), _extends2));
  };
}, _temp);
exports.default = WaitableActionsCreator;