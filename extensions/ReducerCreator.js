'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class, _temp;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _ActionTypesCreator = require('./ActionTypesCreator');

var _ActionTypesCreator2 = _interopRequireDefault(_ActionTypesCreator);

var _UrlInfo = require('../core/UrlInfo');

var _UrlInfo2 = _interopRequireDefault(_UrlInfo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

var mergePartialState = function mergePartialState() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var action = arguments[1];
  var entryPath = arguments[2];
  var mergeFunc = arguments[3];

  if (entryPath.length != 0) {
    var _entryPath = _toArray(entryPath),
        id = _entryPath[0],
        rest = _entryPath.slice(1);

    return _extends({}, state, _defineProperty({}, id, mergePartialState(state[id], action, rest, mergeFunc)));
  } else {
    return mergeFunc(state, action);
  }
};

var deepMergeByPathArray = function deepMergeByPathArray(state, action, _ref) {
  var urlInfo = _ref.urlInfo;
  return function (mergeFunc) {
    var entryPath = urlInfo.entryToPath(action.entry);
    return mergePartialState(state, action, ['hierarchy'].concat(_toConsumableArray(entryPath)), mergeFunc);
  };
};

var genSelectFunc = function genSelectFunc(method, _ref2) {
  var urlInfo = _ref2.urlInfo;
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var action = arguments[1];

    if (action.entry === undefined) {
      return _extends({}, state, {
        selection: null
      });
    }
    var entryPath = urlInfo.entryToPath(action.entry);
    return _extends({}, state, {
      selection: {
        entry: _extends({}, action.entry),
        entryPath: entryPath,
        id: action.data.id
      }
    });
  };
};

var genStartFunc = function genStartFunc(method, options) {
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var action = arguments[1];

    return deepMergeByPathArray(state, action, options)(function (partialState) {
      return _extends({}, partialState);
    });
  };
};

var genCollectionRespondFunc = function genCollectionRespondFunc(method, options) {
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var action = arguments[1];

    return deepMergeByPathArray(state, action, options)(function (partialState) {
      return _extends({}, partialState, {
        collection: action.data
      });
    });
  };
};

var genCollectionRespondDeleteFunc = function genCollectionRespondDeleteFunc(method, options) {
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var action = arguments[1];

    return deepMergeByPathArray(state, action, options)(function (partialState) {
      return _extends({}, partialState, {
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
      return _extends({}, partialState, {
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
    return deepMergeByPathArray(state, action, options)(function (partialState) {
      return _extends({}, partialState, {
        byId: _extends({}, partialState.byId, _defineProperty({}, id, action.data))
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
      return _extends({}, partialState, {
        byId: _extends({}, partialState.byId, _defineProperty({}, id, null))
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
      return _extends({}, partialState, {
        byId: _extends({}, partialState.byId, _defineProperty({}, id, null))
      });
    });
  };
};

var genClearEachFunc = function genClearEachFunc(options) {
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var action = arguments[1];

    return deepMergeByPathArray(state, action, options)(function (partialState) {
      return _extends({}, partialState, {
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
      return _extends({}, partialState);
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
    _classCallCheck(this, ReducerCreator);
  }

  _createClass(ReducerCreator, [{
    key: 'create',
    value: function create(_ref3) {
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
        var reducerFunctionCreators = genReducerFunctionCreators({
          urlInfo: urlInfo
        });

        var local = shared[methodConfig.name][reducerExposedFuncMapName] = {};
        Object.keys(actionTypes).forEach(function (key) {
          local[actionTypes[key]] = reducerFunctionCreators[methodConfig.name][key];
        });

        exposed[reducerExposedFuncMapName] = _extends({}, exposed[reducerExposedFuncMapName], local);
        exposed[reducerExposedName] = createReducerFromFuncMap(exposed[reducerExposedFuncMapName]);
      });

      return { shared: shared, exposed: exposed };
    }
  }]);

  return ReducerCreator;
}(), _class.$name = 'reducers', _temp);
exports.default = ReducerCreator;