import createMethodConfigs from './createMethodConfigs';
import UrlInfo from './UrlInfo';
import RestModel from './RestModel';
import ActionTypesCreator from '../extensions/ActionTypesCreator';
import ActionsCreator from '../extensions/ActionsCreator';
import ReducerCreator from '../extensions/ReducerCreator';

export const defaultExtensions = [
  ActionTypesCreator,
  ActionsCreator,
  ReducerCreator,
];

export default class ModelMap {
  constructor(ns, modelsDefine, extensions = defaultExtensions) {
    Object.keys(modelsDefine).forEach((key) => {
      const modelDefine = modelsDefine[key];
      const { url } = modelDefine;
      if (!url) {
        throw new Error(`No url provided: ${key}`);
      }
      UrlInfo.test(url, ['id']);
    });

    this.models = {};
    this.Creators = extensions;

    this.Creators.forEach((Creator) => {
      this[Creator.$name] = {};
    });

    this.methodConfigs = createMethodConfigs(this.ns, this.names);
    Object.keys(modelsDefine).forEach((key) => {
      const modelDefine = modelsDefine[key];
      this.models[key] = new RestModel(ns, modelDefine, this.Creators, this.methodConfigs);
      const model = this.models[key];
      this.Creators.forEach((Creator) => {
        const extensionName = Creator.$name;
        this[extensionName] = {
          ...this[extensionName],
          ...model.getExposed(extensionName),
        };
      });
    });
  }

  get(modelName) {
    return this.models[modelName];
  }

  subMap(...modelNames) {
    const result = {};
    modelNames.forEach((modelName) => {
      result[modelName] = this.get(modelName);
    });
    return result;
  }
}
