import ActionTypesCreator from './ActionTypesCreator';

export default class ActionsCreator {
  static $name = 'actions';

  create({ ns, names, getShared, methodConfigs }){
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

        shared[methodConfig.name][key] = (
          data,
          urlParams = {},
          otherParams = {}
        ) => ({
          type,
          data,
          urlParams,
          ...otherParams,
        });
        exposed[methodConfig.getActionName(arg)] = shared[methodConfig.name][key];
      });
    });

    return { shared, exposed };
  }
}
