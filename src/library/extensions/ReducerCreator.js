/* eslint-disable max-len */
import ActionTypesCreator from './ActionTypesCreator';
import UrlInfo from '../core/UrlInfo';
import getMiddlewaresHandler from '../core/getMiddlewaresHandler';

const mergePartialState = (state = {}, action, options, isForCollection, entryPath, mergeFunc) => {
  if (entryPath.length) {
    const [id, ...rest] = entryPath;
    return {
      ...state,
      [id]: mergePartialState(state[id], action, options, isForCollection, rest, mergeFunc),
    };
  } else {
    const {
      middlewares: {
        node: nodeMiddlewares = [],
        collection: collectionMiddlewares = [],
        member: memberMiddlewares = [],
      } = {},
    } = options;
    const middlewares = [
      ...nodeMiddlewares,
      ...(isForCollection ? collectionMiddlewares : memberMiddlewares),
      mergeFunc,
    ];
    const next = getMiddlewaresHandler(middlewares, [state, action, options]);
    return next();
  }
};

const deepMergeByPathArray = (state, action, options, isForCollection = false) => (mergeFunc) => {
  const entryPath = options.urlInfo.entryToPath(action.entry);
  return mergePartialState(state, action, options, isForCollection, ['hierarchy', ...entryPath], mergeFunc);
};

// ===============================

const genSelectFunc = (method, { urlInfo }, isForCollection) => (state = {}, action) => {
  if (action.entry === undefined) {
    return {
      ...state,
      selection: null,
    };
  }
  const entryPath = urlInfo.entryToPath(action.entry);
  return {
    ...state,
    selection: {
      entry: {
        ...action.entry,
      },
      entryPath,
      id: action.entry.id,
    },
  };
};

const genStartFunc = (method, options, isForCollection) => (state = {}, action) => deepMergeByPathArray(state, action, options, isForCollection)(partialState => ({
  ...partialState,
}));

const genCollectionRespondFunc = (method, options, isForCollection) => (state = {}, action) => {
  let {
    mergeNode,
    mergeCollection = (_, __, action2) => action2.data,
    updateMembersByCollection,
  } = options;
  let defaultMergeFunc = partialState => ({
    ...partialState,
    collection: mergeCollection(method, partialState.collection, action, options),
  });
  if (updateMembersByCollection) {
    defaultMergeFunc = partialState => ({
      ...partialState,
      collection: mergeCollection(method, partialState.collection, action, options),
      byId: {
        ...partialState.byId,
        ...updateMembersByCollection(action.data),
      },
    });
  }
  mergeNode = mergeNode || ((method2, partialState, defaultMergeFunc2) => defaultMergeFunc2(partialState));
  return deepMergeByPathArray(state, action, options, isForCollection)(partialState => mergeNode(method, partialState, defaultMergeFunc, state, action, options, isForCollection));
};

const genCollectionRespondDeleteFunc = (method, options, isForCollection) => (state = {}, action) => deepMergeByPathArray(state, action, options, isForCollection)(partialState => ({
  ...partialState,
  collection: null,
}));

const genCollectionClearFunc = (options, isForCollection) => (state = {}, action) => deepMergeByPathArray(state, action, options, isForCollection)(partialState => ({
  ...partialState,
  collection: null,
}));

const genRepondFunc = (method, options, isForCollection) => (state = {}, action) => {
  const { id } = action.entry;
  let {
    mergeNode,
    mergeMember = (_, __, action2) => action2.data,
  } = options;
  const defaultMergeFunc = partialState => ({
    ...partialState,
    byId: {
      ...partialState.byId,
      [id]: mergeMember(method, partialState.byId && partialState.byId[id], action, options),
    },
  });
  mergeNode = mergeNode || ((method2, partialState, defaultMergeFunc2) => defaultMergeFunc2(partialState));
  return deepMergeByPathArray(state, action, options, isForCollection)(partialState => mergeNode(method, partialState, defaultMergeFunc, state, action, options, isForCollection));
};

const genRespondDeleteFunc = (method, options, isForCollection) => (state = {}, action) => {
  const { id } = action.entry;
  return deepMergeByPathArray(state, action, options, isForCollection)(partialState => ({
    ...partialState,
    byId: {
      ...partialState.byId,
      [id]: null,
    },
  }));
};

const genClearFunc = (options, isForCollection) => (state = {}, action) => {
  const { id } = action.entry;
  return deepMergeByPathArray(state, action, options, isForCollection)(partialState => ({
    ...partialState,
    byId: {
      ...partialState.byId,
      [id]: null,
    },
  }));
};

const genClearEachFunc = (options, isForCollection) => (state = {}, action) => deepMergeByPathArray(state, action, options, isForCollection)(partialState => ({
  ...partialState,
  byId: {},
}));

const genRepondErrorFunc = (method, options, isForCollection) => (state = {}, action) => deepMergeByPathArray(state, action, options, isForCollection)(partialState => ({
  ...partialState,
}));

const genReducerFunctionCreators = options => ({
  selectPath: {
    start: genSelectFunc('selectPath', options),
  },
  postCollection: {
    start: genStartFunc('postCollection', options),
    respond: genRepondFunc('postCollection', options),
    respondError: genRepondErrorFunc('postCollection', options),
    cancel: null,
  },
  getCollection: {
    start: genStartFunc('getCollection', options, true),
    respond: genCollectionRespondFunc('getCollection', options, true),
    respondError: genRepondErrorFunc('getCollection', options, true),
    cancel: null,
  },
  patchCollection: {
    start: genStartFunc('patchCollection', options, true),
    respond: genCollectionRespondFunc('patchCollection', options, true),
    respondError: genRepondErrorFunc('patchCollection', options, true),
    cancel: null,
  },
  deleteCollection: {
    start: genStartFunc('deleteCollection', options, true),
    respond: genCollectionRespondDeleteFunc('deleteCollection', options, true),
    respondError: genRepondErrorFunc('deleteCollection', options, true),
    cancel: null,
  },
  clearCollectionCache: {
    start: genCollectionClearFunc(options, true),
    respond: null,
    respondError: null,
    cancel: null,
  },
  post: {
    start: genStartFunc('post', options),
    respond: null,
    respondError: genRepondErrorFunc('post', options),
    cancel: null,
  },
  get: {
    start: genStartFunc('get', options),
    respond: genRepondFunc('get', options),
    respondError: genRepondErrorFunc('get', options),
    cancel: null,
  },
  patch: {
    start: genStartFunc('patch', options),
    respond: genRepondFunc('patch', options),
    respondError: genRepondErrorFunc('patch', options),
    cancel: null,
  },
  delete: {
    start: genStartFunc('delete', options),
    respond: genRespondDeleteFunc('delete', options),
    respondError: genRepondErrorFunc('delete', options),
    cancel: null,
  },
  clearCache: {
    start: genClearFunc(options),
    respond: null,
    respondError: null,
    cancel: null,
  },
  clearEachCache: {
    start: genClearEachFunc(options),
    respond: null,
    respondError: null,
    cancel: null,
  },
});

function createReducerFromFuncMap(funcMap, options) {
  return (state = {}, action) => {
    const func = funcMap[action.type] || (state2 => state2);

    const {
      middlewares: {
        global: globalMiddlewares = [],
      } = {},
    } = options;
    const middlewares = [
      ...globalMiddlewares,
      func,
    ];
    const next = getMiddlewaresHandler(middlewares, [state, action, options]);
    return next();
  };
}

export default class ReducerCreator {
  static $name = 'reducers';

  create({
    ns, names, url, getShared, methodConfigs,
  }, options, reducerOptions) {
    const shared = {};
    const exposed = {};

    methodConfigs.forEach((methodConfig) => {
      shared[methodConfig.name] = {};

      const actionTypes = getShared(ActionTypesCreator.$name)[methodConfig.name];
      // console.log('actionTypes :', actionTypes);

      const urlInfo = new UrlInfo(url);

      const arg = {
        methodName: methodConfig.name,
        names,
      };

      const mergedOptions = {
        ...options,
        ...reducerOptions,
        urlInfo,
      };

      const reducerExposedName = methodConfig.getReducerName(arg);
      const reducerExposedFuncMapName = `${reducerExposedName}FuncMap`;
      const reducerFunctionCreators = genReducerFunctionCreators(mergedOptions);
      shared[methodConfig.name][reducerExposedFuncMapName] = {};
      const local = shared[methodConfig.name][reducerExposedFuncMapName];
      Object.keys(actionTypes).forEach((key) => {
        local[actionTypes[key]] = reducerFunctionCreators[methodConfig.name][key];
      });

      exposed[reducerExposedFuncMapName] = {
        ...exposed[reducerExposedFuncMapName],
        ...local,
      };
      exposed[reducerExposedName] = createReducerFromFuncMap(exposed[reducerExposedFuncMapName], mergedOptions);
    });

    return { shared, exposed };
  }
}
