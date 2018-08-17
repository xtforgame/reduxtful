'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createMethodConfigs;

var _commonFunctions = require('./common-functions');

var supportedActions = [{ name: 'start' }, { name: 'respond' }, { name: 'respondError' }, { name: 'cancel' }];

var getResourceCollectionName = function getResourceCollectionName(names) {
  return names.member === names.collection ? names.member + 'Collection' : names.collection;
};

var getActionContantName = function getActionContantName(_ref) {
  var methodName = _ref.methodName,
      names = _ref.names,
      actionTypeName = _ref.actionTypeName;

  var upperCasedMethod = (0, _commonFunctions.toUnderscore)(methodName).toUpperCase();
  var upperCasedModelName = (0, _commonFunctions.toUnderscore)(names.model).toUpperCase();

  var upperCasedActionTypeName = (0, _commonFunctions.toUnderscore)(actionTypeName).toUpperCase();

  switch (methodName) {
    case 'selectPath':
    case 'clearCollectionCache':
    case 'clearCache':
    case 'clearEachCache':
      return upperCasedModelName + '_' + upperCasedMethod;
    default:
      break;
  }

  switch (actionTypeName) {
    case 'respond':
      return upperCasedModelName + '_RESPOND_' + upperCasedMethod;
    case 'respondError':
      return upperCasedModelName + '_RESPOND_' + upperCasedMethod + '_ERROR';
    case 'cancel':
      return upperCasedModelName + '_CANCEL_' + upperCasedMethod;
    default:
      break;
  }

  return upperCasedModelName + '_' + upperCasedMethod + '_' + upperCasedActionTypeName;
};

var getActionName = function getActionName() {
  var isForCollection = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  return function (_ref2) {
    var methodName = _ref2.methodName,
        names = _ref2.names,
        actionTypeName = _ref2.actionTypeName;

    switch (methodName) {
      case 'selectPath':
        return 'select' + (0, _commonFunctions.capitalizeFirstLetter)(names.model) + 'Path';
      case 'clearCollectionCache':
        return 'clear' + (0, _commonFunctions.capitalizeFirstLetter)(getResourceCollectionName(names)) + 'Cache';
      case 'clearCache':
        return 'clear' + (0, _commonFunctions.capitalizeFirstLetter)(names.member) + 'Cache';
      case 'clearEachCache':
        return 'clearEach' + (0, _commonFunctions.capitalizeFirstLetter)(names.member) + 'Cache';
      default:
        break;
    }

    var resourceCollectionName = getResourceCollectionName(names);
    var resourceName = isForCollection ? resourceCollectionName : names.member;
    var _methodName = isForCollection ? methodName.substr(0, methodName.length - 'Collection'.length) : methodName;
    var _actionTypeName = actionTypeName;

    switch (actionTypeName) {
      case 'start':
        _actionTypeName = '';
        break;
      case 'respond':
        return '' + _actionTypeName + (0, _commonFunctions.capitalizeFirstLetter)(_methodName) + (0, _commonFunctions.capitalizeFirstLetter)(resourceName);
      case 'respondError':
        return 'respond' + (0, _commonFunctions.capitalizeFirstLetter)(_methodName) + (0, _commonFunctions.capitalizeFirstLetter)(resourceName) + 'Error';
      case 'cancel':
        return '' + _actionTypeName + (0, _commonFunctions.capitalizeFirstLetter)(_methodName) + (0, _commonFunctions.capitalizeFirstLetter)(resourceName);
      default:
        break;
    }
    return '' + _methodName + (0, _commonFunctions.capitalizeFirstLetter)(resourceName) + (0, _commonFunctions.capitalizeFirstLetter)(_actionTypeName);
  };
};

var getReducerName = function getReducerName(_ref3) {
  var names = _ref3.names;
  return names.model + 'Reducer';
};

var getEpicName = function getEpicName() {
  var isForCollection = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  return function (_ref4) {
    var methodName = _ref4.methodName,
        names = _ref4.names,
        actionTypeName = _ref4.actionTypeName;

    var _getActionName = getActionName(isForCollection);
    return _getActionName({ methodName: methodName, names: names, actionTypeName: 'start' }) + 'Epic';
  };
};

var getSagaName = function getSagaName() {
  var isForCollection = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  return function (_ref5) {
    var methodName = _ref5.methodName,
        names = _ref5.names,
        actionTypeName = _ref5.actionTypeName;

    var _getActionName = getActionName(isForCollection);
    return _getActionName({ methodName: methodName, names: names, actionTypeName: 'start' }) + 'Saga';
  };
};

function createMethodConfigs(ns, names) {
  return [{
    name: 'selectPath',
    supportedActions: [{ name: 'start' }],
    needBody: false,
    getActionContantName: getActionContantName,
    getActionName: getActionName(),
    getReducerName: getReducerName
  }, {
    name: 'postCollection',
    method: 'post',
    supportedActions: supportedActions,
    isForCollection: true,
    needBody: true,
    getUrlTemplate: function getUrlTemplate(_ref6) {
      var names2 = _ref6.names2,
          url = _ref6.url;
      return url;
    },
    getActionContantName: getActionContantName,
    getActionName: getActionName(true),
    getReducerName: getReducerName,
    getEpicName: getEpicName(true),
    getSagaName: getSagaName(true)
  }, {
    name: 'getCollection',
    method: 'get',
    supportedActions: supportedActions,
    isForCollection: true,
    needBody: false,
    getUrlTemplate: function getUrlTemplate(_ref7) {
      var names2 = _ref7.names2,
          url = _ref7.url;
      return url;
    },
    getActionContantName: getActionContantName,
    getActionName: getActionName(true),
    getReducerName: getReducerName,
    getEpicName: getEpicName(true),
    getSagaName: getSagaName(true)
  }, {
    name: 'patchCollection',
    method: 'patch',
    supportedActions: supportedActions,
    isForCollection: true,
    needBody: true,
    getUrlTemplate: function getUrlTemplate(_ref8) {
      var names2 = _ref8.names2,
          url = _ref8.url;
      return url;
    },
    getActionContantName: getActionContantName,
    getActionName: getActionName(true),
    getReducerName: getReducerName,
    getEpicName: getEpicName(true),
    getSagaName: getSagaName(true)
  }, {
    name: 'deleteCollection',
    method: 'delete',
    supportedActions: supportedActions,
    isForCollection: true,
    needBody: false,
    getUrlTemplate: function getUrlTemplate(_ref9) {
      var names2 = _ref9.names2,
          url = _ref9.url;
      return url;
    },
    getActionContantName: getActionContantName,
    getActionName: getActionName(true),
    getReducerName: getReducerName,
    getEpicName: getEpicName(true),
    getSagaName: getSagaName(true)
  }, {
    name: 'clearCollectionCache',
    supportedActions: [{ name: 'start' }],
    isForCollection: true,
    needBody: false,
    getUrlTemplate: function getUrlTemplate(_ref10) {
      var names2 = _ref10.names2,
          url = _ref10.url;
      return url;
    },
    getActionContantName: getActionContantName,
    getActionName: getActionName(true),
    getReducerName: getReducerName,
    getEpicName: getEpicName(true),
    getSagaName: getSagaName(true)
  }, {
    name: 'post',
    method: 'post',
    supportedActions: supportedActions,
    isForCollection: false,
    needBody: true,
    getUrlTemplate: function getUrlTemplate(_ref11) {
      var names2 = _ref11.names2,
          url = _ref11.url;
      return url + '/{id}';
    },
    getActionContantName: getActionContantName,
    getActionName: getActionName(),
    getReducerName: getReducerName,
    getEpicName: getEpicName(),
    getSagaName: getSagaName()
  }, {
    name: 'get',
    method: 'get',
    supportedActions: supportedActions,
    isForCollection: false,
    needBody: false,
    getUrlTemplate: function getUrlTemplate(_ref12) {
      var names2 = _ref12.names2,
          url = _ref12.url;
      return url + '/{id}';
    },
    getActionContantName: getActionContantName,
    getActionName: getActionName(),
    getReducerName: getReducerName,
    getEpicName: getEpicName(),
    getSagaName: getSagaName()
  }, {
    name: 'patch',
    method: 'patch',
    supportedActions: supportedActions,
    isForCollection: false,
    needBody: true,
    getUrlTemplate: function getUrlTemplate(_ref13) {
      var names2 = _ref13.names2,
          url = _ref13.url;
      return url + '/{id}';
    },
    getActionContantName: getActionContantName,
    getActionName: getActionName(),
    getReducerName: getReducerName,
    getEpicName: getEpicName(),
    getSagaName: getSagaName()
  }, {
    name: 'delete',
    method: 'delete',
    supportedActions: supportedActions,
    isForCollection: false,
    needBody: false,
    getUrlTemplate: function getUrlTemplate(_ref14) {
      var names2 = _ref14.names2,
          url = _ref14.url;
      return url + '/{id}';
    },
    getActionContantName: getActionContantName,
    getActionName: getActionName(),
    getReducerName: getReducerName,
    getEpicName: getEpicName(),
    getSagaName: getSagaName()
  }, {
    name: 'clearCache',
    supportedActions: [{ name: 'start' }],
    isForCollection: false,
    needBody: false,
    getActionContantName: getActionContantName,
    getActionName: getActionName(),
    getReducerName: getReducerName,
    getEpicName: getEpicName(),
    getSagaName: getSagaName()
  }, {
    name: 'clearEachCache',
    supportedActions: [{ name: 'start' }],
    isForCollection: false,
    needId: false,
    needBody: false,
    getActionContantName: getActionContantName,
    getActionName: getActionName(),
    getReducerName: getReducerName,
    getEpicName: getEpicName(),
    getSagaName: getSagaName()
  }];
}