/*eslint-disable no-unused-vars, no-undef */

import chai from 'chai';
import ModelMap from 'library/ModelMap';
import { toUnderscore } from 'library/utils';
import {
  testData01,
} from '../../test-data';

const expect = chai.expect;

describe('ActionTypesCreator Test Cases', function(){
  describe('Basic', function(){
    this.timeout(10000);

    it('should export all types', () => {
      const modelMap = new ModelMap('global', testData01.modelsDefine);

      expect(modelMap).to.be.an.instanceof(ModelMap);
      expect(modelMap.types, 'Not equal: modelMap.types').to.exist;

      const types = modelMap.types;

      Object.keys(testData01.modelsDefine).map(key => testData01.modelsDefine[key]).map(m => m.names)
      .map(({
        collection: collectionName,
        member: memberName,
        model: modelName,
      }) => {
        const upperCasedModelName = toUnderscore(modelName).toUpperCase();
        expect(types[`${upperCasedModelName}_SELECT_PATH`], `Not equal: ${upperCasedModelName}_SELECT_PATH`)
          .to.equal(`@@app/global/${upperCasedModelName}_SELECT_PATH`);

        ['', '_COLLECTION'].map(suffix => {
          ['post', 'get', 'patch', 'delete']
          .map(methodName => {
            const upperCasedMethodName = toUnderscore(methodName).toUpperCase();
  
            expect(types[`${upperCasedModelName}_${upperCasedMethodName}${suffix}_START`], `Not equal: ${upperCasedModelName}_${upperCasedMethodName}${suffix}_START`)
              .to.equal(`@@app/global/${upperCasedModelName}_${upperCasedMethodName}${suffix}_START`);
            expect(types[`${upperCasedModelName}_RESPOND_${upperCasedMethodName}${suffix}`], `Not equal: ${upperCasedModelName}_RESPOND_${upperCasedMethodName}${suffix}`)
              .to.equal(`@@app/global/${upperCasedModelName}_RESPOND_${upperCasedMethodName}${suffix}`);
            expect(types[`${upperCasedModelName}_RESPOND_${upperCasedMethodName}${suffix}_ERROR`], `Not equal: ${upperCasedModelName}_RESPOND_${upperCasedMethodName}${suffix}_ERROR`)
              .to.equal(`@@app/global/${upperCasedModelName}_RESPOND_${upperCasedMethodName}${suffix}_ERROR`);
            expect(types[`${upperCasedModelName}_CANCEL_${upperCasedMethodName}${suffix}`], `Not equal: ${upperCasedModelName}_CANCEL_${upperCasedMethodName}${suffix}`)
              .to.equal(`@@app/global/${upperCasedModelName}_CANCEL_${upperCasedMethodName}${suffix}`);
          });
  
          expect(types[`${upperCasedModelName}_CLEAR${suffix}_CACHE`], `Not equal: ${upperCasedModelName}_CLEAR${suffix}_CACHE`)
            .to.equal(`@@app/global/${upperCasedModelName}_CLEAR${suffix}_CACHE`);
        });
      });
    });

  });
});


