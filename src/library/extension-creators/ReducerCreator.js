import ActionTypesCreator from './ActionTypesCreator';
import UrlInfo from '../UrlInfo';

const mergePartialState = (state = {}, action, entryPath, mergeFunc) => {
  if(entryPath.length != 0){
    let [id, ...rest] = entryPath;
    return {
      ...state,
      [id]: mergePartialState(state[id], action, rest, mergeFunc),
    }
  }else{
    return mergeFunc(state, action);
  }
}

const deepMergeByPathArray = (state, action, { urlInfo }) => mergeFunc => {
  const entryPath = urlInfo.entryToPath(action.entry);
  return mergePartialState(state, action, ['hierarchy', ...entryPath], mergeFunc);
}

// ===============================

const genSelectFunc = (method, { urlInfo }) => (state = {}, action) => {
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
      id: action.data.id,
    },
  };
};

const genStartFunc = (method, options) => (state = {}, action) => {
  return deepMergeByPathArray(state, action, options)(partialState => ({
    ...partialState,
    // isPending: {
    //   ...partialState.isPending,
    //   [method]: true,
    // },
  }));
};

const genCollectionRespondFunc = (method, options) => (state = {}, action) => {
  return deepMergeByPathArray(state, action, options)(partialState => ({
    ...partialState,
    // isPending: {
    //   ...partialState.isPending,
    //   [method]: false,
    // },
    collection: action.data,
    // error: {
    //   ...partialState.error,
    //   [method]: null,
    // },
  }));
};

const genCollectionRespondDeleteFunc = (method, options) => (state = {}, action) => {
  return deepMergeByPathArray(state, action, options)(partialState => ({
    ...partialState,
    // isPending: {
    //   ...partialState.isPending,
    //   [method]: false,
    // },
    collection: null,
    // error: {
    //   ...partialState.error,
    //   [method]: null,
    // },
  }));
};

const genCollectionClearFunc = (options) => (state = {}, action) => {
  return deepMergeByPathArray(state, action, options)(partialState => ({
    ...partialState,
    collection: null,
  }));
};

const genRepondFunc = (method, options) => (state = {}, action) => {
  const id = action.entry.id;
  return deepMergeByPathArray(state, action, options)(partialState => ({
    ...partialState,
    // isPending: {
    //   ...partialState.isPending,
    //   [method]: false,
    // },
    byId: {
      ...partialState.byId,
      [id]: action.data,
    },
    // error: {
    //   ...partialState.error,
    //   [method]: null,
    // },
  }));
};

const genRespondDeleteFunc = (method, options) => (state = {}, action) => {
  const id = action.entry.id;
  return deepMergeByPathArray(state, action, options)(partialState => ({
    ...partialState,
    // isPending: {
    //   ...partialState.isPending,
    //   [method]: false,
    // },
    byId: {
      ...partialState.byId,
      [id]: null,
    },
    // error: {
    //   ...partialState.error,
    //   [method]: null,
    // },
  }));
};

const genClearFunc = (options) => (state = {}, action) => {
  const id = action.entry.id;
  return deepMergeByPathArray(state, action, options)(partialState => ({
    ...partialState,
    byId: {
      ...partialState.byId,
      [id]: null,
    },
  }));
};

const genClearEachFunc = (options) => (state = {}, action) => {
  return deepMergeByPathArray(state, action, options)(partialState => ({
    ...partialState,
    byId: {},
  }));
};

const genRepondErrorFunc = (method, options) => (state = {}, action) => {
  return deepMergeByPathArray(state, action, options)(partialState => ({
    ...partialState,
    // isPending: {
    //   ...partialState.isPending,
    //   [method]: false,
    // },
    // error: {
    //   ...partialState.error,
    //   [method]: action.data && action.data.error,
    // },
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
    start: genStartFunc('getCollection', options),
    respond: genCollectionRespondFunc('getCollection', options),
    respondError: genRepondErrorFunc('getCollection', options),
    cancel: null,
  },
  patchCollection: {
    start: genStartFunc('patchCollection', options),
    respond: genCollectionRespondFunc('patchCollection', options),
    respondError: genRepondErrorFunc('patchCollection', options),
    cancel: null,
  },
  deleteCollection: {
    start: genStartFunc('deleteCollection', options),
    respond: genCollectionRespondDeleteFunc('deleteCollection', options),
    respondError: genRepondErrorFunc('deleteCollection', options),
    cancel: null,
  },
  clearCollectionCache: {
    start: genCollectionClearFunc(options),
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

function createReducerFromFuncMap(funcMap){
  return (state = {}, action) => {
    let func = funcMap[action.type];

    if(func){
      return func(state, action);
    }
    return state;
  };
}

export default class ReducerCreator {
  static $name = 'reducers';

  create({ ns, names, url, getShared, methodConfigs }){
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

      const reducerExposedName = methodConfig.getReducerName(arg);
      const reducerExposedFuncMapName = `${reducerExposedName}FuncMap`;
      const reducerFunctionCreators = genReducerFunctionCreators({
        urlInfo,
      });

      let local = shared[methodConfig.name][reducerExposedFuncMapName] = {};
      Object.keys(actionTypes).forEach(key => {
        local[actionTypes[key]] = reducerFunctionCreators[methodConfig.name][key];
      });

      exposed[reducerExposedFuncMapName] = {
        ...exposed[reducerExposedFuncMapName],
        ...local,
      }
      exposed[reducerExposedName] = createReducerFromFuncMap(exposed[reducerExposedFuncMapName]);
    });

    return { shared, exposed };
  }
}
