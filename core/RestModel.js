'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var normalizeModelDefine = function normalizeModelDefine(modelDefine) {
  var normalized = _extends({}, modelDefine);

  if (typeof normalized.names === 'string') {
    normalized.names = {
      model: normalized.names,
      member: normalized.names,
      collection: normalized.names + 's'
    };
  }

  normalized.config = _extends({
    actionNoRedundantBody: true
  }, normalized.config);

  normalized.extensionConfigs = normalized.extensionConfigs || {};

  return normalized;
};

var RestModel = function RestModel(ns, modelDefine, Creators, methodConfigs) {
  var _this = this;

  _classCallCheck(this, RestModel);

  this.getShared = function (extensionName) {
    return extensionName ? _this.extensions.shared[extensionName] : _this.extensions.shared;
  };

  this.getExposed = function (extensionName) {
    return extensionName ? _this.extensions.exposed[extensionName] : _this.extensions.exposed;
  };

  this.ns = ns;
  this.modelDefine = normalizeModelDefine(modelDefine);
  this.methodConfigs = methodConfigs;

  var args = _extends({}, this.modelDefine, {
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
    _this.extensions.exposed[Creator.$name] = _extends({}, _this.extensions.exposed[Creator.$name], exposed);
  });
};

exports.default = RestModel;