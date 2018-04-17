import ActionTypesCreator from './ActionTypesCreator';
import ActionsCreator from './ActionsCreator';

export default class WaitableActionsCreator {
  static $name = 'waitableActions';

  static getActionCreator = (type, actions, symbols) => {
    const {
      WAIT_FOR_ACTION,
      ERROR_ACTION,
      CALLBACK_ARGUMENT,
      CALLBACK_ERROR_ARGUMENT,
    } = symbols;

    return (...args) => {
      const actionData = actions.start(...args);
      const waitToken = Symbol();
      actionData.options.transferables = {
        ...actionData.options.transferables,
        waitToken,
      };
      return {
        ...actionData,
        [WAIT_FOR_ACTION]: action => action.type === actions.respond.type
          && action.options.transferables.waitToken === waitToken,
        [ERROR_ACTION]: action => (action.type === actions.cancel.type) || (action.type === actions.respondError.type
          && action.options.transferables.waitToken === waitToken),
        [CALLBACK_ARGUMENT]: action => action,
        [CALLBACK_ERROR_ARGUMENT]: action => action,
      };
    };
  }

  getWaitSymbols(){
    const createReduxWaitForMiddleware = require('redux-wait-for-action');
    const {
      WAIT_FOR_ACTION,
      ERROR_ACTION,
      CALLBACK_ARGUMENT,
      CALLBACK_ERROR_ARGUMENT,
    } = createReduxWaitForMiddleware;
    return {
      WAIT_FOR_ACTION,
      ERROR_ACTION,
      CALLBACK_ARGUMENT,
      CALLBACK_ERROR_ARGUMENT,
    };
  }

  create({ ns, names, getShared, methodConfigs }, { actionNoRedundantBody }){
    let shared = {};
    let exposed = {};

    const symbols = this.getWaitSymbols();
    const sharedActionTypes = getShared(ActionTypesCreator.$name);
    const sharedActions = getShared(ActionsCreator.$name);

    methodConfigs.forEach(methodConfig => {
      shared[methodConfig.name] = {};
      if(!methodConfig.supportedActions.filter(a => a.name === 'respond').length
        || !methodConfig.supportedActions.filter(a => a.name === 'respondError').length
      ){
        return ;
      }

      let actionTypes = sharedActionTypes[methodConfig.name];
      let actions = sharedActions[methodConfig.name];

      Object.keys(actionTypes).filter(key => key === 'start').forEach(key => {
        const type = actionTypes[key];
        let arg = {
          methodName: methodConfig.name,
          names,
          actionTypeName: key,
        };

        const exposedName = methodConfig.getActionName(arg);
        const sharedName = methodConfig.name;
        const action = shared[sharedName][key] = WaitableActionsCreator.getActionCreator(type, actions, symbols);
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
