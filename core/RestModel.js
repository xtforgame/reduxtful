'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var normalizeModelDefine = function normalizeModelDefine(modelDefine) {
  var normalized = (0, _extends3.default)({}, modelDefine);

  if (typeof normalized.names === 'string') {
    normalized.names = {
      model: normalized.names,
      member: normalized.names,
      collection: normalized.names + 's'
    };
  }

  normalized.config = (0, _extends3.default)({
    actionNoRedundantBody: true
  }, normalized.config);

  normalized.extensionConfigs = normalized.extensionConfigs || {};

  return normalized;
};

var RestModel = function RestModel(ns, modelDefine, Creators, methodConfigs) {
  var _this = this;

  (0, _classCallCheck3.default)(this, RestModel);

  this.getShared = function (extensionName) {
    return extensionName ? _this.extensions.shared[extensionName] : _this.extensions.shared;
  };

  this.getExposed = function (extensionName) {
    return extensionName ? _this.extensions.exposed[extensionName] : _this.extensions.exposed;
  };

  this.ns = ns;
  this.modelDefine = normalizeModelDefine(modelDefine);
  this.methodConfigs = methodConfigs;

  var args = (0, _extends3.default)({}, this.modelDefine, {
    ns: this.ns,
    methodConfigs: this.methodConfigs,
    getShared: this.getShared,
    getExposed: this.getExposed
  });
  delete args.extensionConfigs;

  this.Creators = Creators;
  this.extensions = {
    shared: {},
    exposed: {}
  };

  this.Creators.forEach(function (Creator) {
    _this.extensions.shared[Creator.$name] = {};
    _this.extensions.exposed[Creator.$name] = {};

    var creator = new Creator();

    var _creator$create = creator.create(args, _this.modelDefine.config || {}, _this.modelDefine.extensionConfigs[Creator.$name] || {}),
        shared = _creator$create.shared,
        exposed = _creator$create.exposed;

    _this.extensions.shared[Creator.$name] = shared;
    _this.extensions.exposed[Creator.$name] = (0, _extends3.default)({}, _this.extensions.exposed[Creator.$name], exposed);
  });
};

exports.default = RestModel;