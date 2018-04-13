/*eslint-disable no-unused-vars, no-undef */

import chai from 'chai';
import ModelMap from 'library/ModelMap';
import { toUnderscore } from 'library/utils';
import {
  modelsDefine01,
} from '../../test-data';

const expect = chai.expect;

describe('ActionTypesCreator Test Cases', function(){
  describe('Basic', function(){
    this.timeout(10000);

    it('should export all types', () => {
      const modelMap = new ModelMap('global', modelsDefine01);

      expect(modelMap).to.be.an.instanceof(ModelMap);
      expect(modelMap.types, 'Not existed: modelMap.types').to.exist;

      const types = modelMap.types;

      ['api', 'session', 'user']
      .map(resourceName => {
        const upperCasedResourceName = toUnderscore(resourceName).toUpperCase();

        expect(types[`${upperCasedResourceName}_SELECT_PATH`], `Not existed: ${upperCasedResourceName}_SELECT_PATH`)
          .to.equal(`@@app/global/${upperCasedResourceName}_SELECT_PATH`);

        ['post', 'get', 'patch', 'delete']
        .map(methodName => {
          const upperCasedMethodName = toUnderscore(methodName).toUpperCase();

          expect(types[`${upperCasedResourceName}_${upperCasedMethodName}_START`], `Not existed: ${upperCasedResourceName}_${upperCasedMethodName}_START`)
            .to.equal(`@@app/global/${upperCasedResourceName}_${upperCasedMethodName}_START`);
          expect(types[`${upperCasedResourceName}_RESPOND_${upperCasedMethodName}`], `Not existed: ${upperCasedResourceName}_RESPOND_${upperCasedMethodName}`)
            .to.equal(`@@app/global/${upperCasedResourceName}_RESPOND_${upperCasedMethodName}`);
          expect(types[`${upperCasedResourceName}_RESPOND_${upperCasedMethodName}_ERROR`], `Not existed: ${upperCasedResourceName}_RESPOND_${upperCasedMethodName}_ERROR`)
            .to.equal(`@@app/global/${upperCasedResourceName}_RESPOND_${upperCasedMethodName}_ERROR`);
          expect(types[`${upperCasedResourceName}_CANCEL_${upperCasedMethodName}`], `Not existed: ${upperCasedResourceName}_CANCEL_${upperCasedMethodName}`)
            .to.equal(`@@app/global/${upperCasedResourceName}_CANCEL_${upperCasedMethodName}`);
          expect(types[`${upperCasedResourceName}_${upperCasedMethodName}_CLEAR_ERROR`], `Not existed: ${upperCasedResourceName}_${upperCasedMethodName}_CLEAR_ERROR`)
            .to.equal(`@@app/global/${upperCasedResourceName}_${upperCasedMethodName}_CLEAR_ERROR`);
        });
      });
    });

  });
});


