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

var _getMiddlewaresHandler = require('../core/getMiddlewaresHandler');

var _getMiddlewaresHandler2 = _interopRequireDefault(_getMiddlewaresHandler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mergePartialState = function mergePartialState() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var action = arguments[1];
  var options = arguments[2];
  var isForCollection = arguments[3];
  var entryPath = arguments[4];
  var mergeFunc = arguments[5];

  if (entryPath.length) {
    var _entryPath = (0, _toArray3.default)(entryPath),
        id = _entryPath[0],
        rest = _entryPath.slice(1);

    return (0, _extends7.default)({}, state, (0, _defineProperty3.default)({}, id, mergePartialState(state[id], action, options, isForCollection, rest, mergeFunc)));
  } else {
    var _options$middlewares = options.middlewares;
    _options$middlewares = _options$middlewares === undefined ? {} : _options$middlewares;
    var _options$middlewares$ = _options$middlewares.node,
        nodeMiddlewares = _options$middlewares$ === undefined ? [] : _options$middlewares$,
        _options$middlewares$2 = _options$middlewares.collection,
        collectionMiddlewares = _options$middlewares$2 === undefined ? [] : _options$middlewares$2,
        _options$middlewares$3 = _options$middlewares.member,
        memberMiddlewares = _options$middlewares$3 === undefined ? [] : _options$middlewares$3;

    var middlewares = [].concat((0, _toConsumableArray3.default)(nodeMiddlewares), (0, _toConsumableArray3.default)(isForCollection ? collectionMiddlewares : memberMiddlewares), [mergeFunc]);
    var next = (0, _getMiddlewaresHandler2.default)(middlewares, [state, action, options]);
    return next();
  }
};

var deepMergeByPathArray = function deepMergeByPathArray(state, action, options) {
  var isForCollection = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
  return function (mergeFunc) {
    var entryPath = options.urlInfo.entryToPath(action.entry);
    return mergePartialState(state, action, options, isForCollection, ['hierarchy'].concat((0, _toConsumableArray3.default)(entryPath)), mergeFunc);
  };
};

var genSelectFunc = function genSelectFunc(method, _ref, isForCollection) {
  var urlInfo = _ref.urlInfo;
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

var genStartFunc = function genStartFunc(method, options, isForCollection) {
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var action = arguments[1];
    return deepMergeByPathArray(state, action, options, isForCollection)(function (partialState) {
      return (0, _extends7.default)({}, partialState);
    });
  };
};

var genCollectionRespondFunc = function genCollectionRespondFunc(method, options, isForCollection) {
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var action = arguments[1];
    var mergeNode = options.mergeNode,
        _options$mergeCollect = options.mergeCollection,
        mergeCollection = _options$mergeCollect === undefined ? function (_, __, action2) {
      return action2.data;
    } : _options$mergeCollect,
        updateMembersByCollection = options.updateMembersByCollection;

    var defaultMergeFunc = function defaultMergeFunc(partialState) {
      return (0, _extends7.default)({}, partialState, {
        collection: mergeCollection(method, partialState.collection, action, options)
      });
    };
    if (updateMembersByCollection) {
      defaultMergeFunc = function defaultMergeFunc(partialState) {
        return (0, _extends7.default)({}, partialState, {
          collection: mergeCollection(method, partialState.collection, action, options),
          byId: (0, _extends7.default)({}, partialState.byId, updateMembersByCollection(action.data))
        });
      };
    }
    mergeNode = mergeNode || function (method2, partialState, defaultMergeFunc2) {
      return defaultMergeFunc2(partialState);
    };
    return deepMergeByPathArray(state, action, options, isForCollection)(function (partialState) {
      return mergeNode(method, partialState, defaultMergeFunc, state, action, options, isForCollection);
    });
  };
};

var genCollectionRespondDeleteFunc = function genCollectionRespondDeleteFunc(method, options, isForCollection) {
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var action = arguments[1];
    return deepMergeByPathArray(state, action, options, isForCollection)(function (partialState) {
      return (0, _extends7.default)({}, partialState, {
        collection: null
      });
    });
  };
};

var genCollectionClearFunc = function genCollectionClearFunc(options, isForCollection) {
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var action = arguments[1];
    return deepMergeByPathArray(state, action, options, isForCollection)(function (partialState) {
      return (0, _extends7.default)({}, partialState, {
        collection: null
      });
    });
  };
};

var genRepondFunc = function genRepondFunc(method, options, isForCollection) {
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var action = arguments[1];
    var id = action.entry.id;
    var mergeNode = options.mergeNode,
        _options$mergeMember = options.mergeMember,
        mergeMember = _options$mergeMember === undefined ? function (_, __, action2) {
      return action2.data;
    } : _options$mergeMember;

    var defaultMergeFunc = function defaultMergeFunc(partialState) {
      return (0, _extends7.default)({}, partialState, {
        byId: (0, _extends7.default)({}, partialState.byId, (0, _defineProperty3.default)({}, id, mergeMember(method, partialState.byId && partialState.byId[id], action, options)))
      });
    };
    mergeNode = mergeNode || function (method2, partialState, defaultMergeFunc2) {
      return defaultMergeFunc2(partialState);
    };
    return deepMergeByPathArray(state, action, options, isForCollection)(function (partialState) {
      return mergeNode(method, partialState, defaultMergeFunc, state, action, options, isForCollection);
    });
  };
};

var genRespondDeleteFunc = function genRespondDeleteFunc(method, options, isForCollection) {
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var action = arguments[1];
    var id = action.entry.id;

    return deepMergeByPathArray(state, action, options, isForCollection)(function (partialState) {
      return (0, _extends7.default)({}, partialState, {
        byId: (0, _extends7.default)({}, partialState.byId, (0, _defineProperty3.default)({}, id, null))
      });
    });
  };
};

var genClearFunc = function genClearFunc(options, isForCollection) {
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var action = arguments[1];
    var id = action.entry.id;

    return deepMergeByPathArray(state, action, options, isForCollection)(function (partialState) {
      return (0, _extends7.default)({}, partialState, {
        byId: (0, _extends7.default)({}, partialState.byId, (0, _defineProperty3.default)({}, id, null))
      });
    });
  };
};

var genClearEachFunc = function genClearEachFunc(options, isForCollection) {
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var action = arguments[1];
    return deepMergeByPathArray(state, action, options, isForCollection)(function (partialState) {
      return (0, _extends7.default)({}, partialState, {
        byId: {}
      });
    });
  };
};

var genRepondErrorFunc = function genRepondErrorFunc(method, options, isForCollection) {
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var action = arguments[1];
    return deepMergeByPathArray(state, action, options, isForCollection)(function (partialState) {
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
      start: genStartFunc('getCollection', options, true),
      respond: genCollectionRespondFunc('getCollection', options, true),
      respondError: genRepondErrorFunc('getCollection', options, true),
      cancel: null
    },
    patchCollection: {
      start: genStartFunc('patchCollection', options, true),
      respond: genCollectionRespondFunc('patchCollection', options, true),
      respondError: genRepondErrorFunc('patchCollection', options, true),
      cancel: null
    },
    deleteCollection: {
      start: genStartFunc('deleteCollection', options, true),
      respond: genCollectionRespondDeleteFunc('deleteCollection', options, true),
      respondError: genRepondErrorFunc('deleteCollection', options, true),
      cancel: null
    },
    clearCollectionCache: {
      start: genCollectionClearFunc(options, true),
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

function createReducerFromFuncMap(funcMap, options) {
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var action = arguments[1];

    var func = funcMap[action.type] || function (state2) {
      return state2;
    };

    var _options$middlewares2 = options.middlewares;
    _options$middlewares2 = _options$middlewares2 === undefined ? {} : _options$middlewares2;
    var _options$middlewares3 = _options$middlewares2.global,
        globalMiddlewares = _options$middlewares3 === undefined ? [] : _options$middlewares3;

    var middlewares = [].concat((0, _toConsumableArray3.default)(globalMiddlewares), [func]);
    var next = (0, _getMiddlewaresHandler2.default)(middlewares, [state, action, options]);
    return next();
  };
}

var ReducerCreator = (_temp = _class = function () {
  function ReducerCreator() {
    (0, _classCallCheck3.default)(this, ReducerCreator);
  }

  (0, _createClass3.default)(ReducerCreator, [{
    key: 'create',
    value: function create(_ref2, options, reducerOptions) {
      var ns = _ref2.ns,
          names = _ref2.names,
          url = _ref2.url,
          getShared = _ref2.getShared,
          methodConfigs = _ref2.methodConfigs;

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

        var mergedOptions = (0, _extends7.default)({}, options, reducerOptions, {
          urlInfo: urlInfo
        });

        var reducerExposedName = methodConfig.getReducerName(arg);
        var reducerExposedFuncMapName = reducerExposedName + 'FuncMap';
        var reducerFunctionCreators = genReducerFunctionCreators(mergedOptions);
        shared[methodConfig.name][reducerExposedFuncMapName] = {};
        var local = shared[methodConfig.name][reducerExposedFuncMapName];
        Object.keys(actionTypes).forEach(function (key) {
          local[actionTypes[key]] = reducerFunctionCreators[methodConfig.name][key];
        });

        exposed[reducerExposedFuncMapName] = (0, _extends7.default)({}, exposed[reducerExposedFuncMapName], local);
        exposed[reducerExposedName] = createReducerFromFuncMap(exposed[reducerExposedFuncMapName], mergedOptions);
      });

      return { shared: shared, exposed: exposed };
    }
  }]);
  return ReducerCreator;
}(), _class.$name = 'reducers', _temp);
exports.default = ReducerCreator;