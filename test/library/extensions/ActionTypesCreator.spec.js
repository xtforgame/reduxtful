/* eslint-disable no-unused-vars, no-undef */

import chai from 'chai';
import { ModelMap } from 'library';
import { toUnderscore, capitalizeFirstLetter } from 'library/core/common-functions';
import {
  testData01,
} from '../../test-data';

const { expect } = chai;

describe('ActionTypesCreator Test Cases', () => {
  describe('Basic', () => {
    it('should export all types', () => {
      const modelMap = new ModelMap('global', testData01.modelsDefine);

      expect(modelMap).to.be.an.instanceof(ModelMap);
      expect(modelMap.types, 'Not equal: modelMap.types').to.exist;

      const { types } = modelMap;

      Object.keys(testData01.modelsDefine)
      .map(key => testData01.modelsDefine[key])
      .map(m => ({ names: m.names, singleton: m.singleton }))
      .forEach(({
        names: {
          collection: collectionName,
          member: memberName,
          model: modelName,
        },
        singleton,
      }) => {
        const capitalizeModelName = capitalizeFirstLetter(modelName);
        const upperCasedModelName = toUnderscore(modelName).toUpperCase();
        expect(types[`select${capitalizeModelName}Path`], `Not equal: select${capitalizeModelName}Path`)
          .to.equal(`@@app/global/${upperCasedModelName}_SELECT_PATH`);

        (singleton ? [[collectionName, '_COLLECTION']] : [[collectionName, '_COLLECTION'], [memberName, '']])
        .forEach(([resourceName, suffix]) => {
          const capitalizeResourceName = capitalizeFirstLetter(resourceName);

          ['post', 'get', 'patch', 'delete']
          .forEach((methodName) => {
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
