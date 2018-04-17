import ActionTypesCreator from './ActionTypesCreator';

export default class ActionsCreator {
  static $name = 'actions';

  static needIdArg = (methodConfig, actionType) => {
    if(methodConfig.needId != null){
      return !!methodConfig.needId;
    }
  
    // special case for posting a collection
    if((methodConfig.isForCollection === true)
      && !(methodConfig.method === 'post' && actionType === 'respond')){
      return false;
    }
    return true;
  }
  
  static needBodyArg = (methodConfig, actionType, actionNoRedundantBody) => {
    if(actionNoRedundantBody && (actionType === 'start' || actionType === 'cancel') && !methodConfig.needBody){
      return false;
    }
    return true;
  }
  
  static getActionCreator = (type, methodConfig, actionType, actionNoRedundantBody) => {
    const withIdArg = ActionsCreator.needIdArg(methodConfig, actionType);
    const withBodyArg = ActionsCreator.needBodyArg(methodConfig, actionType, actionNoRedundantBody);
  
    if(withIdArg){
      return withBodyArg ? ((id, data, entry = {}, options = {}) =>
        ({ type, data, entry: { ...entry, id }, options: { transferables: {}, ...options } })
      ): ((id, entry = {}, options = {}) =>
        ({ type, entry: { ...entry, id }, options: { transferables: {}, ...options } })
      );
    }else{
      return withBodyArg ? ((data, entry = {}, options = {}) =>
        ({ type, data, entry, options: { transferables: {}, ...options } })
      ): ((entry = {}, options = {}) =>
        ({ type, entry, options: { transferables: {}, ...options } })
      );
    }
  }

  create({ ns, names, getShared, methodConfigs }, { actionNoRedundantBody }){
    let shared = {};
    let exposed = {};

    let actionTypes = getShared(ActionTypesCreator.$name);

    methodConfigs.forEach(methodConfig => {
      shared[methodConfig.name] = {};
      const actionTypesForMethod = actionTypes[methodConfig.name];
      Object.keys(actionTypesForMethod).forEach(key => {
        const type = actionTypesForMethod[key];
        let arg = {
          methodName: methodConfig.name,
          names,
          actionTypeName: key,
        };

        const exposedName = methodConfig.getActionName(arg);
        const sharedName = methodConfig.name;
        const action = shared[sharedName][key] = ActionsCreator.getActionCreator(type, methodConfig, key, actionNoRedundantBody);
        action.type = type;
        action.actionSet = shared[sharedName];
        action.sharedName = sharedName;
        action.exposedName = exposedName;

        exposed[exposedName] = action;
      });
    });

    return { shared, exposed };
  }
}
