import ActionTypesCreator from './ActionTypesCreator';

const createActionCreatorForCollection = (type, withDataArg = true) => {
  if(withDataArg){
    return (data, entry = {}, options = {}) =>
      ({ type, data, entry, options: { transferables: {}, ...options } });
  }else{
    return (entry = {}, options = {}) =>
      ({ type, entry, options: { transferables: {}, ...options } });
  }
};

const createActionCreatorForMember = (type, withDataArg = true) => {
  if(withDataArg){
    return (id, data, entry = {}, options = {}) =>
      ({ type, data, entry: { ...entry, id }, options: { transferables: {}, ...options } });
  }else{
    return (id, entry = {}, options = {}) =>
      ({ type, entry: { ...entry, id }, options: { transferables: {}, ...options } });
  }
};

const getCreateFunction = (methodConfig, actionType) => {
  if(methodConfig.needId === true){
    return createActionCreatorForMember;
  }else if(methodConfig.needId === false){
    return createActionCreatorForCollection;
  }

  if((methodConfig.isForCollection === true)
    && !(methodConfig.method === 'post' && actionType === 'respond')){
    return createActionCreatorForCollection;
  }
  return createActionCreatorForMember;
}

export default class ActionsCreator {
  static $name = 'actions';

  create({ ns, names, getShared, methodConfigs }, config, { noRedundantBody = true }){
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

        let withBody = true;
        if(noRedundantBody && key === 'start' && !methodConfig.needBody){
          withBody = false;
        }
        // special case for posting a collection
        const create = getCreateFunction(methodConfig, key);

        shared[methodConfig.name][key] = create(type, withBody);
        exposed[methodConfig.getActionName(arg)] = shared[methodConfig.name][key];
      });
    });

    return { shared, exposed };
  }
}
