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
    isPending: {
      ...partialState.isPending,
      [method]: true,
    },
  }));
};

const genCollSuccessFunc = (method, options) => (state = {}, action) => {
  return deepMergeByPathArray(state, action, options)(partialState => ({
    ...partialState,
    isPending: {
      ...partialState.isPending,
      [method]: false,
    },
    collection: action.data,
    error: {
      ...partialState.error,
      [method]: null,
    },
  }));
};

const genSuccessFunc = (method, options) => (state = {}, action) => {
  const id = options.getId(action);
  return deepMergeByPathArray(state, action, options)(partialState => ({
    ...partialState,
    isPending: {
      ...partialState.isPending,
      [method]: false,
    },
    byId: {
      ...partialState.byId,
      [id]: action.data,
    },
    error: {
      ...partialState.error,
      [method]: null,
    },
  }));
};

const genClearSuccessFunc = (method, options) => (state = {}, action) => {
  const id = options.getId(action);
  return deepMergeByPathArray(state, action, options)(partialState => ({
    ...partialState,
    byId: {
      ...partialState.byId,
      [id]: null,
    },
  }));
};

const genDeleteSuccessFunc = (method, options) => (state = {}, action) => {
  const id = options.getId(action);
  return deepMergeByPathArray(state, action, options)(partialState => ({
    ...partialState,
    isPending: {
      ...partialState.isPending,
      [method]: false,
    },
    byId: {
      ...partialState.byId,
      [id]: null,
    },
    error: {
      ...partialState.error,
      [method]: null,
    },
  }));
};

const genErrorFunc = (method, options) => (state = {}, action) => {
  return deepMergeByPathArray(state, action, options)(partialState => ({
    ...partialState,
    isPending: {
      ...partialState.isPending,
      [method]: false,
    },
    error: {
      ...partialState.error,
      [method]: action.data && action.data.error,
    },
  }));
};

const genClearErrorFunc = (method, options) => (state = {}, action) => {
  return deepMergeByPathArray(state, action, options)(partialState => ({
    ...partialState,
    isPending: {
      ...partialState.isPending,
      [method]: false,
    },
    error: {
      ...partialState.error,
      [method]: null,
    },
  }));
};

const genReducerFunctionCreators = (options) => ({
  selectPath: {
    start: genSelectFunc('selectPath', options),
  },
  create: {
    start: genStartFunc('create', options),
    success: genSuccessFunc('create', options),
    error: genErrorFunc('create', options),
    cancel: null,
    clearError: genClearErrorFunc('create', options),
  },
  read: {
    start: genStartFunc('read', options),
    success: genSuccessFunc('read', options),
    error: genErrorFunc('read', options),
    cancel: null,
    clearError: genClearErrorFunc('read', options),
  },
  readColl: {
    start: genStartFunc('readColl', options),
    success: genCollSuccessFunc('readColl', options),
    error: genErrorFunc('readColl', options),
    cancel: null,
    clearError: genClearErrorFunc('readColl', options),
  },
  update: {
    start: genStartFunc('update', options),
    success: genSuccessFunc('update', options),
    error: genErrorFunc('update', options),
    cancel: null,
    clearError: genClearErrorFunc('update', options),
  },
  clear: {
    start: genClearSuccessFunc('clear', options),
    success: null,
    error: null,
    cancel: null,
    clearError: null,
  },
  delete: {
    start: genStartFunc('delete', options),
    success: genDeleteSuccessFunc('delete', options),
    error: genErrorFunc('delete', options),
    cancel: null,
    clearError: genClearErrorFunc('delete', options),
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
