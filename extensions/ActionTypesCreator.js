'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _class, _temp;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ActionTypesCreator = (_temp = _class = function () {
  function ActionTypesCreator() {
    (0, _classCallCheck3.default)(this, ActionTypesCreator);
  }

  (0, _createClass3.default)(ActionTypesCreator, [{
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