/*eslint-disable no-unused-vars, no-undef */

import chai from 'chai';
import { ModelMap, defaultExtensions, WaitableActionsCreator } from 'library';
import { capitalizeFirstLetter } from 'library/core/functions';
import {
  testData01,
} from '../../test-data';

const expect = chai.expect;

describe('WaitableActionsCreator Test Cases', function(){
  describe('Basic', function(){
    it('should export all waitableActions', () => {
      const modelMap = new ModelMap('global', testData01.modelsDefine, defaultExtensions.concat([WaitableActionsCreator]));

      expect(modelMap).to.be.an.instanceof(ModelMap);
      expect(modelMap.waitableActions, 'Not existed: modelMap.waitableActions').to.exist;

      const waitableActions = modelMap.waitableActions;
      Object.keys(testData01.modelsDefine).map(key => testData01.modelsDefine[key]).map(m => m.names)
      .map(({
        collection: collectionName,
        member: memberName,
        model: modelName,
      }) => {
        const capitalizeModelName = capitalizeFirstLetter(modelName);

        [collectionName, memberName]
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


