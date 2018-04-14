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
      ['api', 'session', 'user']
      .map(resourceName => {
        expect(reducers[`${resourceName}Reducer`], `Not existed: ${resourceName}Reducer`).to.be.an.instanceof(Function);
      });
    });
  });
});
