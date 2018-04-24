'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _extends6 = require('babel-runtime/helpers/extends');

var _extends7 = _interopRequireDefault(_extends6);

var _toArray2 = require('babel-runtime/helpers/toArray');

var _toArray3 = _interopRequireDefault(_toArray2);

var _class, _temp;

var _ActionTypesCreator = require('./ActionTypesCreator');

var _ActionTypesCreator2 = _interopRequireDefault(_ActionTypesCreator);

var _UrlInfo = require('../core/UrlInfo');

var _UrlInfo2 = _interopRequireDefault(_UrlInfo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mergePartialState = function mergePartialState() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var action = arguments[1];
  var entryPath = arguments[2];
  var mergeFunc = arguments[3];

  if (entryPath.length != 0) {
    var _entryPath = (0, _toArray3.default)(entryPath),
        id = _entryPath[0],
        rest = _entryPath.slice(1);

    return (0, _extends7.default)({}, state, (0, _defineProperty3.default)({}, id, mergePartialState(state[id], action, rest, mergeFunc)));
  } else {
    return mergeFunc(state, action);
  }
};

var deepMergeByPathArray = function deepMergeByPathArray(state, action, _ref) {
  var urlInfo = _ref.urlInfo;
  return function (mergeFunc) {
    var entryPath = urlInfo.entryToPath(action.entry);
    return mergePartialState(state, action, ['hierarchy'].concat((0, _toConsumableArray3.default)(entryPath)), mergeFunc);
  };
};

var genSelectFunc = function genSelectFunc(method, _ref2) {
  var urlInfo = _ref2.urlInfo;
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var action = arguments[1];

    if (action.entry === undefined) {
      return (0, _extends7.default)({}, state, {
        selection: null
      });
    }
    var entryPath = urlInfo.entryToPath(action.entry);
    return (0, _extends7.default)({}, state, {
      selection: {
        entry: (0, _extends7.default)({}, action.entry),
        entryPath: entryPath,
        id: action.entry.id
      }
    });
  };
};

var genStartFunc = function genStartFunc(method, options) {
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var action = arguments[1];

    return deepMergeByPathArray(state, action, options)(function (partialState) {
      return (0, _extends7.default)({}, partialState);
    });
  };
};

var genCollectionRespondFunc = function genCollectionRespondFunc(method, options) {
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var action = arguments[1];
    var _options$mergeCollect = options.mergeCollection,
        mergeCollection = _options$mergeCollect === undefined ? function (_, __, action) {
      return action.data;
    } : _options$mergeCollect;

    return deepMergeByPathArray(state, action, options)(function (partialState) {
      return (0, _extends7.default)({}, partialState, {
        collection: mergeCollection(method, partialState.collection, action, options)
      });
    });
  };
};

var genCollectionRespondDeleteFunc = function genCollectionRespondDeleteFunc(method, options) {
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var action = arguments[1];

    return deepMergeByPathArray(state, action, options)(function (partialState) {
      return (0, _extends7.default)({}, partialState, {
        collection: null
      });
    });
  };
};

var genCollectionClearFunc = function genCollectionClearFunc(options) {
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var action = arguments[1];

    return deepMergeByPathArray(state, action, options)(function (partialState) {
      return (0, _extends7.default)({}, partialState, {
        collection: null
      });
    });
  };
};

var genRepondFunc = function genRepondFunc(method, options) {
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var action = arguments[1];

    var id = action.entry.id;
    var _options$mergeMember = options.mergeMember,
        mergeMember = _options$mergeMember === undefined ? function (_, __, action) {
      return action.data;
    } : _options$mergeMember;

    return deepMergeByPathArray(state, action, options)(function (partialState) {
      return (0, _extends7.default)({}, partialState, {
        byId: (0, _extends7.default)({}, partialState.byId, (0, _defineProperty3.default)({}, id, mergeMember(method, partialState.byId && partialState.byId[id], action, options)))
      });
    });
  };
};

var genRespondDeleteFunc = function genRespondDeleteFunc(method, options) {
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var action = arguments[1];

    var id = action.entry.id;
    return deepMergeByPathArray(state, action, options)(function (partialState) {
      return (0, _extends7.default)({}, partialState, {
        byId: (0, _extends7.default)({}, partialState.byId, (0, _defineProperty3.default)({}, id, null))
      });
    });
  };
};

var genClearFunc = function genClearFunc(options) {
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var action = arguments[1];

    var id = action.entry.id;
    return deepMergeByPathArray(state, action, options)(function (partialState) {
      return (0, _extends7.default)({}, partialState, {
        byId: (0, _extends7.default)({}, partialState.byId, (0, _defineProperty3.default)({}, id, null))
      });
    });
  };
};

var genClearEachFunc = function genClearEachFunc(options) {
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var action = arguments[1];

    return deepMergeByPathArray(state, action, options)(function (partialState) {
      return (0, _extends7.default)({}, partialState, {
        byId: {}
      });
    });
  };
};

var genRepondErrorFunc = function genRepondErrorFunc(method, options) {
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var action = arguments[1];

    return deepMergeByPathArray(state, action, options)(function (partialState) {
      return (0, _extends7.default)({}, partialState);
    });
  };
};

var genReducerFunctionCreators = function genReducerFunctionCreators(options) {
  return {
    selectPath: {
      start: genSelectFunc('selectPath', options)
    },
    postCollection: {
      start: genStartFunc('postCollection', options),
      respond: genRepondFunc('postCollection', options),
      respondError: genRepondErrorFunc('postCollection', options),
      cancel: null
    },
    getCollection: {
      start: genStartFunc('getCollection', options),
      respond: genCollectionRespondFunc('getCollection', options),
      respondError: genRepondErrorFunc('getCollection', options),
      cancel: null
    },
    patchCollection: {
      start: genStartFunc('patchCollection', options),
      respond: genCollectionRespondFunc('patchCollection', options),
      respondError: genRepondErrorFunc('patchCollection', options),
      cancel: null
    },
    deleteCollection: {
      start: genStartFunc('deleteCollection', options),
      respond: genCollectionRespondDeleteFunc('deleteCollection', options),
      respondError: genRepondErrorFunc('deleteCollection', options),
      cancel: null
    },
    clearCollectionCache: {
      start: genCollectionClearFunc(options),
      respond: null,
      respondError: null,
      cancel: null
    },
    post: {
      start: genStartFunc('post', options),
      respond: null,
      respondError: genRepondErrorFunc('post', options),
      cancel: null
    },
    get: {
      start: genStartFunc('get', options),
      respond: genRepondFunc('get', options),
      respondError: genRepondErrorFunc('get', options),
      cancel: null
    },
    patch: {
      start: genStartFunc('patch', options),
      respond: genRepondFunc('patch', options),
      respondError: genRepondErrorFunc('patch', options),
      cancel: null
    },
    delete: {
      start: genStartFunc('delete', options),
      respond: genRespondDeleteFunc('delete', options),
      respondError: genRepondErrorFunc('delete', options),
      cancel: null
    },
    clearCache: {
      start: genClearFunc(options),
      respond: null,
      respondError: null,
      cancel: null
    },
    clearEachCache: {
      start: genClearEachFunc(options),
      respond: null,
      respondError: null,
      cancel: null
    }

  };
};

function createReducerFromFuncMap(funcMap) {
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var action = arguments[1];

    var func = funcMap[action.type];

    if (func) {
      return func(state, action);
    }
    return state;
  };
}

var ReducerCreator = (_temp = _class = function () {
  function ReducerCreator() {
    (0, _classCallCheck3.default)(this, ReducerCreator);
  }

  (0, _createClass3.default)(ReducerCreator, [{
    key: 'create',
    value: function create(_ref3, options, reducerOptions) {
      var ns = _ref3.ns,
          names = _ref3.names,
          url = _ref3.url,
          getShared = _ref3.getShared,
          methodConfigs = _ref3.methodConfigs;

      var shared = {};
      var exposed = {};

      methodConfigs.forEach(function (methodConfig) {
        shared[methodConfig.name] = {};

        var actionTypes = getShared(_ActionTypesCreator2.default.$name)[methodConfig.name];


        var urlInfo = new _UrlInfo2.default(url);

        var arg = {
          methodName: methodConfig.name,
          names: names
        };

        var reducerExposedName = methodConfig.getReducerName(arg);
        var reducerExposedFuncMapName = reducerExposedName + 'FuncMap';
        var reducerFunctionCreators = genReducerFunctionCreators((0, _extends7.default)({}, options, reducerOptions, {
          urlInfo: urlInfo
        }));

        var local = shared[methodConfig.name][reducerExposedFuncMapName] = {};
        Object.keys(actionTypes).forEach(function (key) {
          local[actionTypes[key]] = reducerFunctionCreators[methodConfig.name][key];
        });

        exposed[reducerExposedFuncMapName] = (0, _extends7.default)({}, exposed[reducerExposedFuncMapName], local);
        exposed[reducerExposedName] = createReducerFromFuncMap(exposed[reducerExposedFuncMapName]);
      });

      return { shared: shared, exposed: exposed };
    }
  }]);
  return ReducerCreator;
}(), _class.$name = 'reducers', _temp);
exports.default = ReducerCreator;