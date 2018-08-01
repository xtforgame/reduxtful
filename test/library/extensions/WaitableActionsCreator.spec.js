/* eslint-disable no-unused-vars, no-undef */

import chai from 'chai';
import { ModelMap, defaultExtensions } from 'library';
import EpicCreator from 'library/extensions/EpicCreator';
import WaitableActionsCreator from 'library/extensions/WaitableActionsCreator';
import { capitalizeFirstLetter } from 'library/core/common-functions';
import {
  testData01,
} from '../../test-data';

const { expect } = chai;

describe('WaitableActionsCreator Test Cases', () => {
  describe('Basic', () => {
    it('should export all waitableActions', () => {
      const modelMap = new ModelMap('global', testData01.modelsDefine, defaultExtensions.concat([EpicCreator, WaitableActionsCreator]));

      expect(modelMap).to.be.an.instanceof(ModelMap);
      expect(modelMap.waitableActions, 'Not existed: modelMap.waitableActions').to.exist;

      const { waitableActions } = modelMap;
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

        (singleton ? [collectionName] : [collectionName, memberName])
        .forEach((resourceName) => {
          const capitalizeResourceName = capitalizeFirstLetter(resourceName);
          ['post', 'get', 'patch', 'delete']
          .forEach((methodName) => {
            const capitalizeMethodName = capitalizeFirstLetter(methodName);
            expect(waitableActions[`${methodName}${capitalizeResourceName}`], `Not existed: ${methodName}${capitalizeResourceName}`).to.be.an.instanceof(Function);
          });
        });
      });
    });
  });
});
