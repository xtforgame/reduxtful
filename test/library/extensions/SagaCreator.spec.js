/* eslint-disable no-unused-vars, no-undef */

import chai from 'chai';
import { ModelMap, defaultExtensions } from 'library';
import { capitalizeFirstLetter } from 'library/core/common-functions';
import SagaCreator from 'library/extensions/SagaCreator';
import {
  testData01,
} from '../../test-data';

const { expect } = chai;

describe('SagaCreator Test Cases', () => {
  describe('Basic', () => {
    it('should export all sagas', () => {
      const modelMap = new ModelMap('global', testData01.modelsDefine, defaultExtensions.concat([SagaCreator]));

      expect(modelMap).to.be.an.instanceof(ModelMap);
      expect(modelMap.sagas, 'Not existed: modelMap.sagas').to.exist;

      const { sagas } = modelMap;
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
        (singleton ? [collectionName] : [collectionName, memberName])
        .forEach((resourceName) => {
          const capitalizeResourceName = capitalizeFirstLetter(resourceName);

          ['post', 'get', 'patch', 'delete']
          .forEach((methodName) => {
            expect(sagas[`${methodName}${capitalizeResourceName}Saga`], `Not existed: ${methodName}${capitalizeResourceName}Saga`).to.be.an.instanceof(Function);
          });
        });
      });
    });
  });
});
