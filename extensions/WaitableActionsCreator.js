'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _extends3 = require('babel-runtime/helpers/extends');

var _extends4 = _interopRequireDefault(_extends3);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _class, _temp;

var _ActionTypesCreator = require('./ActionTypesCreator');

var _ActionTypesCreator2 = _interopRequireDefault(_ActionTypesCreator);

var _ActionsCreator = require('./ActionsCreator');

var _ActionsCreator2 = _interopRequireDefault(_ActionsCreator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var WaitableActionsCreator = (_temp = _class = function () {
  function WaitableActionsCreator() {
    (0, _classCallCheck3.default)(this, WaitableActionsCreator);
  }

  (0, _createClass3.default)(WaitableActionsCreator, [{
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
    actionData.options.transferables = (0, _extends4.default)({}, actionData.options.transferables, {
      waitToken: waitToken
    });
    return (0, _extends4.default)({}, actionData, (_extends2 = {}, (0, _defineProperty3.default)(_extends2, WAIT_FOR_ACTION, function (action) {
      return action.type === actions.respond.type && action.options.transferables.waitToken === waitToken;
    }), (0, _defineProperty3.default)(_extends2, ERROR_ACTION, function (action) {
      return action.type === actions.cancel.type || action.type === actions.respondError.type && action.options.transferables.waitToken === waitToken;
    }), (0, _defineProperty3.default)(_extends2, CALLBACK_ARGUMENT, function (action) {
      return action;
    }), (0, _defineProperty3.default)(_extends2, CALLBACK_ERROR_ARGUMENT, function (action) {
      return action;
    }), _extends2));
  };
}, _temp);
exports.default = WaitableActionsCreator;