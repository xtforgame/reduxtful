import ActionTypesCreator from './ActionTypesCreator';

const createActionCreatorForCollection = (type) => (
  data,
  urlParams = {},
  otherParams = {}
) => ({
  type,
  data,
  urlParams,
  ...otherParams,
});

const createActionCreatorForMember = (type) => (
  id,
  data,
  urlParams = {},
  otherParams = {}
) => ({
  type,
  data,
  urlParams: {
    ...urlParams,
    id,
  },
  ...otherParams,
});

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

        const create = (methodConfig.isForCollection === true) && !(methodConfig.method === 'post' && key === 'respond') ?
          createActionCreatorForCollection
          : createActionCreatorForMember;

        shared[methodConfig.name][key] = create(type);
        exposed[methodConfig.getActionName(arg)] = shared[methodConfig.name][key];
      });
    });

    return { shared, exposed };
  }
}
