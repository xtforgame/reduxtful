'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.defaultExtensions = undefined;

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _createMethodConfigs = require('./createMethodConfigs');

var _createMethodConfigs2 = _interopRequireDefault(_createMethodConfigs);

var _UrlInfo = require('./UrlInfo');

var _UrlInfo2 = _interopRequireDefault(_UrlInfo);

var _RestModel = require('./RestModel');

var _RestModel2 = _interopRequireDefault(_RestModel);

var _ActionTypesCreator = require('../extensions/ActionTypesCreator');

var _ActionTypesCreator2 = _interopRequireDefault(_ActionTypesCreator);

var _ActionsCreator = require('../extensions/ActionsCreator');

var _ActionsCreator2 = _interopRequireDefault(_ActionsCreator);

var _ReducerCreator = require('../extensions/ReducerCreator');

var _ReducerCreator2 = _interopRequireDefault(_ReducerCreator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaultExtensions = exports.defaultExtensions = [_ActionTypesCreator2.default, _ActionsCreator2.default, _ReducerCreator2.default];

var ModelMap = function () {
  function ModelMap(ns, modelsDefine) {
    var _this = this;

    var extensions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : defaultExtensions;
    (0, _classCallCheck3.default)(this, ModelMap);

    Object.keys(modelsDefine).forEach(function (key) {
      var modelDefine = modelsDefine[key];
      var url = modelDefine.url;

      if (!url) {
        throw new Error('No url provided: ' + key);
      }
      _UrlInfo2.default.test(url, ['id']);
    });

    this.models = {};
    this.Creators = extensions;

    this.Creators.forEach(function (Creator) {
      _this[Creator.$name] = {};
    });

    this.methodConfigs = (0, _createMethodConfigs2.default)(this.ns, this.names);
    Object.keys(modelsDefine).forEach(function (key) {
      var modelDefine = modelsDefine[key];
      _this.models[key] = new _RestModel2.default(ns, modelDefine, _this.Creators, _this.methodConfigs);
      var model = _this.models[key];
      _this.Creators.forEach(function (Creator) {
        var extensionName = Creator.$name;
        _this[extensionName] = (0, _extends3.default)({}, _this[extensionName], model.getExposed(extensionName));
      });
    });
  }

  (0, _createClass3.default)(ModelMap, [{
    key: 'get',
    value: function get(modelName) {
      return this.models[modelName];
    }
  }, {
    key: 'subMap',
    value: function subMap() {
      var _this2 = this;

      var result = {};

      for (var _len = arguments.length, modelNames = Array(_len), _key = 0; _key < _len; _key++) {
        modelNames[_key] = arguments[_key];
      }

      modelNames.forEach(function (modelName) {
        result[modelName] = _this2.get(modelName);
      });
      return result;
    }
  }]);
  return ModelMap;
}();

exports.default = ModelMap;