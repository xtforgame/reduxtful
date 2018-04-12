import { toUnderscore } from '../utils';

export default class ActionTypesCreator {
  static $name = 'types';

  create({ ns, names, methodConfigs }) {
    let shared = {};
    let exposed = {};

    methodConfigs.forEach(methodConfig => {
      shared[methodConfig.name] = {};
      methodConfig.supportedActions.forEach(actionTypeName => {
        let arg = {
          methodName: methodConfig.name,
          names,
          actionTypeName,
        };

        let actionTypeConstant = methodConfig.getActionTypeName(arg);

        shared[methodConfig.name][actionTypeName] = `@@app/${ns}/${actionTypeConstant}`;
        exposed[actionTypeConstant] = shared[methodConfig.name][actionTypeName];
      });
    });
  
    return { shared, exposed };
  }
}

