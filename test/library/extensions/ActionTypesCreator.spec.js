/*eslint-disable no-unused-vars, no-undef */

import chai from 'chai';
import { ModelMap } from 'library';
import { toUnderscore, capitalizeFirstLetter } from 'library/core/common-functions';
import {
  testData01,
} from '../../test-data';

const expect = chai.expect;

describe('ActionTypesCreator Test Cases', function(){
  describe('Basic', function(){
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
        const capitalizeModelName = capitalizeFirstLetter(modelName);
        const upperCasedModelName = toUnderscore(modelName).toUpperCase();
        expect(types[`select${capitalizeModelName}Path`], `Not equal: select${capitalizeModelName}Path`)
          .to.equal(`@@app/global/${upperCasedModelName}_SELECT_PATH`);

        [[collectionName, '_COLLECTION'], [memberName, '']].map(([resourceName, suffix]) => {
          const capitalizeResourceName = capitalizeFirstLetter(resourceName);

          ['post', 'get', 'patch', 'delete']
          .map(methodName => {
            const capitalizeMethodName = capitalizeFirstLetter(methodName);
            const upperCasedMethodName = toUnderscore(methodName).toUpperCase();
  
            expect(types[`${methodName}${capitalizeResourceName}`], `Not equal: ${methodName}${capitalizeResourceName}`)
              .to.equal(`@@app/global/${upperCasedModelName}_${upperCasedMethodName}${suffix}_START`);
            expect(types[`respond${capitalizeMethodName}${capitalizeResourceName}`], `Not equal: respond${capitalizeMethodName}${capitalizeResourceName}`)
              .to.equal(`@@app/global/${upperCasedModelName}_RESPOND_${upperCasedMethodName}${suffix}`);
            expect(types[`respond${capitalizeMethodName}${capitalizeResourceName}Error`], `Not equal: respond${capitalizeMethodName}${capitalizeResourceName}Error`)
              .to.equal(`@@app/global/${upperCasedModelName}_RESPOND_${upperCasedMethodName}${suffix}_ERROR`);
            expect(types[`cancel${capitalizeMethodName}${capitalizeResourceName}`], `Not equal: cancel${capitalizeMethodName}${capitalizeResourceName}`)
              .to.equal(`@@app/global/${upperCasedModelName}_CANCEL_${upperCasedMethodName}${suffix}`);
          });
  
          expect(types[`clear${capitalizeResourceName}Cache`], `Not equal: clear${capitalizeResourceName}Cache`)
            .to.equal(`@@app/global/${upperCasedModelName}_CLEAR${suffix}_CACHE`);
        });
      });
    });

  });
});


