/* eslint-disable no-unused-vars, no-undef */

import chai from 'chai';
import { ModelMap, defaultExtensions } from 'library';
import { capitalizeFirstLetter } from 'library/core/common-functions';
import EpicCreator from 'library/extensions/EpicCreator';
import {
  testData01,
} from '../../test-data';

const { expect } = chai;

describe('EpicCreator Test Cases', () => {
  describe('Basic', () => {
    it('should export all epics', () => {
      const modelMap = new ModelMap('global', testData01.modelsDefine, defaultExtensions.concat([EpicCreator]));

      expect(modelMap).to.be.an.instanceof(ModelMap);
      expect(modelMap.epics, 'Not existed: modelMap.epics').to.exist;

      const { epics } = modelMap;
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
            expect(epics[`${methodName}${capitalizeResourceName}Epic`], `Not existed: ${methodName}${capitalizeResourceName}Epic`).to.be.an.instanceof(Function);
          });
        });
      });
    });
  });
});
