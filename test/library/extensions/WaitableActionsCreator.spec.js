/*eslint-disable no-unused-vars, no-undef */

import chai from 'chai';
import { ModelMap, defaultExtensions } from 'library';
import EpicCreator from 'library/extensions/EpicCreator';
import WaitableActionsCreator from 'library/extensions/WaitableActionsCreator';
import { capitalizeFirstLetter } from 'library/core/common-functions';
import {
  testData01,
} from '../../test-data';

const expect = chai.expect;

describe('WaitableActionsCreator Test Cases', function(){
  describe('Basic', function(){
    it('should export all waitableActions', () => {
      const modelMap = new ModelMap('global', testData01.modelsDefine, defaultExtensions.concat([EpicCreator, WaitableActionsCreator]));

      expect(modelMap).to.be.an.instanceof(ModelMap);
      expect(modelMap.waitableActions, 'Not existed: modelMap.waitableActions').to.exist;

      const waitableActions = modelMap.waitableActions;
      Object.keys(testData01.modelsDefine).map(key => testData01.modelsDefine[key]).map(m => ({ names: m.names, singleton: m.singleton }))
      .map(({
        names: {
          collection: collectionName,
          member: memberName,
          model: modelName,
        },
        singleton,
      }) => {
        const capitalizeModelName = capitalizeFirstLetter(modelName);

        (singleton ? [collectionName] : [collectionName, memberName])
        .map(resourceName => {
          const capitalizeResourceName = capitalizeFirstLetter(resourceName);
          ['post', 'get', 'patch', 'delete']
          .map(methodName => {
            const capitalizeMethodName = capitalizeFirstLetter(methodName);
            expect(waitableActions[`${methodName}${capitalizeResourceName}`], `Not existed: ${methodName}${capitalizeResourceName}`).to.be.an.instanceof(Function);
          });
        });
      });
    });
  });
});


