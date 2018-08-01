export default class ActionTypesCreator {
  static $name = 'types';

  create({ ns, names, methodConfigs }) {
    const shared = {};
    const exposed = {};

    methodConfigs.forEach((methodConfig) => {
      shared[methodConfig.name] = {};
      methodConfig.supportedActions.forEach(({ name: actionTypeName }) => {
        const arg = {
          methodName: methodConfig.name,
          names,
          actionTypeName,
        };

        const actionTypeConstantName = methodConfig.getActionName(arg);
        const actionTypeConstant = methodConfig.getActionContantName(arg);

        shared[methodConfig.name][actionTypeName] = `@@app/${ns}/${actionTypeConstant}`;
        exposed[actionTypeConstantName] = shared[methodConfig.name][actionTypeName];
      });
    });

    return { shared, exposed };
  }
}
