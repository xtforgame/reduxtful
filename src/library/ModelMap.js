import createMethodConfigs from './createMethodConfigs';
import RestModel from './RestModel';
import ActionTypesCreator from './extension-creators/ActionTypesCreator';
import ActionsCreator from './extension-creators/ActionsCreator';
import ReducerCreator from './extension-creators/ReducerCreator';
import EpicCreator from './extension-creators/EpicCreator';
import SelectorsCreator from './extension-creators/SelectorsCreator';

export default class ModelMap
{
  constructor(ns, modelsDefine){
    this.models = {};
    this.Creators = [
      ActionTypesCreator,
      ActionsCreator,
      ReducerCreator,
      EpicCreator,
      SelectorsCreator,
    ];

    this.Creators.map(Creator => {
      this[Creator.$name] = {};
    });

    this.methodConfigs = createMethodConfigs(this.ns, this.names);
    Object.keys(modelsDefine).forEach(key => {
      const modelDefine = modelsDefine[key];
      const model = this.models[key] = new RestModel(ns, modelDefine, this.Creators, this.methodConfigs);
      this.Creators.forEach(Creator => {
        const extensionName = Creator.$name;
        this[extensionName] = {
          ...this[extensionName],
          ...model.getExposed(extensionName),
        };
      });
    });
  }

  get(modelName){
    return this.models[modelName];
  }

  subMap(...modelNames){
    let result = {};
    modelNames.forEach(modelName => {
      result[modelName] = this.get(modelName);
    });
    return result;
  }
}
