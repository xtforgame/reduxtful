/*eslint-disable no-unused-vars, no-undef */

import chai from 'chai';
import ModelMap from 'library/ModelMap';
import {
  testData01,
} from '../../test-data';

const expect = chai.expect;

describe('ReducerCreator Test Cases', function(){
  describe('Basic', function(){
    this.timeout(10000);

    it('should export all reducers', () => {
      const modelMap = new ModelMap('global', testData01.modelsDefine);

      expect(modelMap).to.be.an.instanceof(ModelMap);
      expect(modelMap.reducers, 'Not existed: modelMap.reducers').to.exist;

      const reducers = modelMap.reducers;
      Object.keys(testData01.modelsDefine).map(key => testData01.modelsDefine[key]).map(m => m.names)
      .map(({ model: modelName }) => {
        expect(reducers[`${modelName}Reducer`], `Not existed: ${modelName}Reducer`).to.be.an.instanceof(Function);
      });
    });
  });
});
