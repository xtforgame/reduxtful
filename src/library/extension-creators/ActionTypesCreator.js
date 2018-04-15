import { toUnderscore } from '../utils';

export default class ActionTypesCreator {
  static $name = 'types';

  create({ ns, names, methodConfigs }) {
    let shared = {};
    let exposed = {};

    methodConfigs.forEach(methodConfig => {
      shared[methodConfig.name] = {};
      methodConfig.supportedActions.forEach(({ name: actionTypeName }) => {
        let arg = {
          methodName: methodConfig.name,
          names,
          actionTypeName,
        };

        let actionTypeConstantName = methodConfig.getActionName(arg);
        let actionTypeConstant = methodConfig.getActionContantName(arg);

        shared[methodConfig.name][actionTypeName] = `@@app/${ns}/${actionTypeConstant}`;
        exposed[actionTypeConstantName] = shared[methodConfig.name][actionTypeName];
      });
    });
  
    return { shared, exposed };
  }
}

