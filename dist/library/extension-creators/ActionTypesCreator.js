'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class, _temp;

var _utils = require('../utils');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ActionTypesCreator = (_temp = _class = function () {
  function ActionTypesCreator() {
    _classCallCheck(this, ActionTypesCreator);
  }

  _createClass(ActionTypesCreator, [{
    key: 'create',
    value: function create(_ref) {
      var ns = _ref.ns,
          names = _ref.names,
          methodConfigs = _ref.methodConfigs;

      var shared = {};
      var exposed = {};

      methodConfigs.forEach(function (methodConfig) {
        shared[methodConfig.name] = {};
        methodConfig.supportedActions.forEach(function (_ref2) {
          var actionTypeName = _ref2.name;

          var arg = {
            methodName: methodConfig.name,
            names: names,
            actionTypeName: actionTypeName
          };

          var actionTypeConstantName = methodConfig.getActionName(arg);
          var actionTypeConstant = methodConfig.getActionContantName(arg);

          shared[methodConfig.name][actionTypeName] = '@@app/' + ns + '/' + actionTypeConstant;
          exposed[actionTypeConstantName] = shared[methodConfig.name][actionTypeName];
        });
      });

      return { shared: shared, exposed: exposed };
    }
  }]);

  return ActionTypesCreator;
}(), _class.$name = 'types', _temp);
exports.default = ActionTypesCreator;