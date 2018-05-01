import ActionTypesCreator from './ActionTypesCreator';
import UrlInfo from '../core/UrlInfo';
import getMiddlewaresHandler from '../core/getMiddlewaresHandler';

const mergePartialState = (state = {}, action, options, isForCollection, entryPath, mergeFunc) => {
  if(entryPath.length != 0){
    let [id, ...rest] = entryPath;
    return {
      ...state,
      [id]: mergePartialState(state[id], action, options, isForCollection, rest, mergeFunc),
    }
  }else{
    const middlewares = (isForCollection ? options.collectionMiddlewares : options.memberMiddlewares) || [];
    const _middlewares = [
      ...middlewares,
      mergeFunc,
    ];
    const next = getMiddlewaresHandler(_middlewares, [state, action, options]);
    return next();
  }
}

const deepMergeByPathArray = (state, action, options, isForCollection = false) => mergeFunc => {
  const entryPath = options.urlInfo.entryToPath(action.entry);
  return mergePartialState(state, action, options, isForCollection, ['hierarchy', ...entryPath], mergeFunc);
}

// ===============================

const genSelectFunc = (method, { urlInfo }, isForCollection) => (state = {}, action) => {
  if(action.entry === undefined){
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

const genStartFunc = (method, options, isForCollection) => (state = {}, action) => {
  return deepMergeByPathArray(state, action, options, isForCollection)(partialState => ({
    ...partialState,
  }));
};

const genCollectionRespondFunc = (method, options, isForCollection) => (state = {}, action) => {
  const { mergeCollection = (_, __, action) => action.data } = options;
  return deepMergeByPathArray(state, action, options, isForCollection)(partialState => ({
    ...partialState,
    collection: mergeCollection(method, partialState.collection, action, options),
  }));
};

const genCollectionRespondDeleteFunc = (method, options, isForCollection) => (state = {}, action) => {
  return deepMergeByPathArray(state, action, options, isForCollection)(partialState => ({
    ...partialState,
    collection: null,
  }));
};

const genCollectionClearFunc = (options, isForCollection) => (state = {}, action) => {
  return deepMergeByPathArray(state, action, options, isForCollection)(partialState => ({
    ...partialState,
    collection: null,
  }));
};

const genRepondFunc = (method, options, isForCollection) => (state = {}, action) => {
  const id = action.entry.id;
  const { mergeMember = (_, __, action) => action.data } = options;
  return deepMergeByPathArray(state, action, options, isForCollection)(partialState => ({
    ...partialState,
    byId: {
      ...partialState.byId,
      [id]: mergeMember(method, partialState.byId && partialState.byId[id], action, options),
    },
  }));
};

const genRespondDeleteFunc = (method, options, isForCollection) => (state = {}, action) => {
  const id = action.entry.id;
  return deepMergeByPathArray(state, action, options, isForCollection)(partialState => ({
    ...partialState,
    byId: {
      ...partialState.byId,
      [id]: null,
    },
  }));
};

const genClearFunc = (options, isForCollection) => (state = {}, action) => {
  const id = action.entry.id;
  return deepMergeByPathArray(state, action, options, isForCollection)(partialState => ({
    ...partialState,
    byId: {
      ...partialState.byId,
      [id]: null,
    },
  }));
};

const genClearEachFunc = (options, isForCollection) => (state = {}, action) => {
  return deepMergeByPathArray(state, action, options, isForCollection)(partialState => ({
    ...partialState,
    byId: {},
  }));
};

const genRepondErrorFunc = (method, options, isForCollection) => (state = {}, action) => {
  return deepMergeByPathArray(state, action, options, isForCollection)(partialState => ({
    ...partialState,
  }));
};

const genReducerFunctionCreators = (options) => ({
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

function createReducerFromFuncMap(funcMap, options){
  return (state = {}, action) => {
    let func = funcMap[action.type] || (state => state);

    const middlewares = options.globalMiddlewares || [];
    const _middlewares = [
      ...middlewares,
      func,
    ];
    const next = getMiddlewaresHandler(_middlewares, [state, action, options]);
    return next();
  };
}

export default class ReducerCreator {
  static $name = 'reducers';

  create({ ns, names, url, getShared, methodConfigs }, options, reducerOptions){
    let shared = {};
    let exposed = {};

    methodConfigs.forEach(methodConfig => {
      shared[methodConfig.name] = {};

      let actionTypes = getShared(ActionTypesCreator.$name)[methodConfig.name];
      // console.log('actionTypes :', actionTypes);

      let urlInfo = new UrlInfo(url);

      let arg = {
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

      let local = shared[methodConfig.name][reducerExposedFuncMapName] = {};
      Object.keys(actionTypes).forEach(key => {
        local[actionTypes[key]] = reducerFunctionCreators[methodConfig.name][key];
      });

      exposed[reducerExposedFuncMapName] = {
        ...exposed[reducerExposedFuncMapName],
        ...local,
      }
      exposed[reducerExposedName] = createReducerFromFuncMap(exposed[reducerExposedFuncMapName], mergedOptions);
    });

    return { shared, exposed };
  }
}
