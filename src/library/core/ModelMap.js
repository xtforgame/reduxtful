import createMethodConfigs from './createMethodConfigs';
import UrlInfo from './UrlInfo';
import RestModel from './RestModel';
import ActionTypesCreator from '../extensions/ActionTypesCreator';
import ActionsCreator from '../extensions/ActionsCreator';
import ReducerCreator from '../extensions/ReducerCreator';
import EpicCreator from '../extensions/EpicCreator';
import SelectorsCreator from '../extensions/SelectorsCreator';

export const defaultExtensions = [
  ActionTypesCreator,
  ActionsCreator,
  ReducerCreator,
  EpicCreator,
  SelectorsCreator,
];

export default class ModelMap
{
  constructor(ns, modelsDefine, extensions = defaultExtensions){
    Object.keys(modelsDefine).forEach(key => {
      const modelDefine = modelsDefine[key];
      const url = modelDefine.url;
      if(!url){
        throw new Error(`No url provided: ${key}`);
      }
      UrlInfo.test(url, ['id']);
    });

    this.models = {};
    this.Creators = extensions;

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
