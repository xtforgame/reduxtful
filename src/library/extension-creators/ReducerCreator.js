import ActionTypesCreator from './ActionTypesCreator';
import UrlInfo from '../UrlInfo';

const mergePartialState = (state = {}, action, pathArray, mergeFunc) => {
  if(pathArray.length != 0){
    let [id, ...rest] = pathArray;
    return {
      ...state,
      [id]: mergePartialState(state[id], action, rest, mergeFunc),
    }
  }else{
    return mergeFunc(state, action);
  }
}

const deepMergeByPathArray= (state, action, { urlInfo }) => mergeFunc => {
  const pathArray = urlInfo.urlParamsToArray(action.urlParams);
  return mergePartialState(state, action, ['hierarchy', ...pathArray], mergeFunc);
}

// ===============================

const genSelectFunc = (method, { urlInfo }) => (state = {}, action) => {
  if(action.urlParams === undefined){
    return {
      ...state,
      selection: null,
    };
  }
  const pathArray = urlInfo.urlParamsToArray(action.urlParams);
  return {
    ...state,
    selection: {
      pathArray,
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
  const id = options.getId(action);
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
  const id = options.getId(action);
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
  const id = options.getId(action);
  return deepMergeByPathArray(state, action, options)(partialState => ({
    ...partialState,
    byId: {
      ...partialState.byId,
      [id]: null,
    },
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

  create({ ns, names, url, getShared, methodConfigs }, { getId = (action => action.data.id) }){
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
        getId,
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
