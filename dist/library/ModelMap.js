'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.defaultExtensions = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _createMethodConfigs = require('./createMethodConfigs');

var _createMethodConfigs2 = _interopRequireDefault(_createMethodConfigs);

var _UrlInfo = require('./UrlInfo');

var _UrlInfo2 = _interopRequireDefault(_UrlInfo);

var _RestModel = require('./RestModel');

var _RestModel2 = _interopRequireDefault(_RestModel);

var _ActionTypesCreator = require('./extension-creators/ActionTypesCreator');

var _ActionTypesCreator2 = _interopRequireDefault(_ActionTypesCreator);

var _ActionsCreator = require('./extension-creators/ActionsCreator');

var _ActionsCreator2 = _interopRequireDefault(_ActionsCreator);

var _ReducerCreator = require('./extension-creators/ReducerCreator');

var _ReducerCreator2 = _interopRequireDefault(_ReducerCreator);

var _EpicCreator = require('./extension-creators/EpicCreator');

var _EpicCreator2 = _interopRequireDefault(_EpicCreator);

var _SelectorsCreator = require('./extension-creators/SelectorsCreator');

var _SelectorsCreator2 = _interopRequireDefault(_SelectorsCreator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var defaultExtensions = exports.defaultExtensions = [_ActionTypesCreator2.default, _ActionsCreator2.default, _ReducerCreator2.default, _EpicCreator2.default, _SelectorsCreator2.default];

var ModelMap = function () {
  function ModelMap(ns, modelsDefine) {
    var _this = this;

    var extensions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : defaultExtensions;

    _classCallCheck(this, ModelMap);

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

    this.Creators.map(function (Creator) {
      _this[Creator.$name] = {};
    });

    this.methodConfigs = (0, _createMethodConfigs2.default)(this.ns, this.names);
    Object.keys(modelsDefine).forEach(function (key) {
      var modelDefine = modelsDefine[key];
      var model = _this.models[key] = new _RestModel2.default(ns, modelDefine, _this.Creators, _this.methodConfigs);
      _this.Creators.forEach(function (Creator) {
        var extensionName = Creator.$name;
        _this[extensionName] = _extends({}, _this[extensionName], model.getExposed(extensionName));
      });
    });
  }

  _createClass(ModelMap, [{
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