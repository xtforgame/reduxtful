/* eslint-disable no-unused-vars, no-undef */

import chai from 'chai';
import { ModelMap } from 'library';
import {
  testData01,
} from '../../test-data';

const { expect } = chai;

describe('ReducerCreator Test Cases', () => {
  describe('Basic', () => {
    it('should export all reducers', () => {
      const modelMap = new ModelMap('global', testData01.modelsDefine);

      expect(modelMap).to.be.an.instanceof(ModelMap);
      expect(modelMap.reducers, 'Not existed: modelMap.reducers').to.exist;

      const { reducers } = modelMap;
      Object.keys(testData01.modelsDefine)
      .map(key => testData01.modelsDefine[key])
      .map(m => m.names)
      .forEach(({ model: modelName }) => {
        expect(reducers[`${modelName}Reducer`], `Not existed: ${modelName}Reducer`).to.be.an.instanceof(Function);
      });
    });
  });
});
