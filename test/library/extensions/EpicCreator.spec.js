/*eslint-disable no-unused-vars, no-undef */

import chai from 'chai';
import { ModelMap, defaultExtensions } from 'library';
import { capitalizeFirstLetter } from 'library/core/functions';
import EpicCreator from 'library/extensions/EpicCreator';
import {
  testData01,
} from '../../test-data';

const expect = chai.expect;

describe('EpicCreator Test Cases', function(){
  describe('Basic', function(){
    it('should export all epics', () => {
      const modelMap = new ModelMap('global', testData01.modelsDefine, defaultExtensions.concat([EpicCreator]));

      expect(modelMap).to.be.an.instanceof(ModelMap);
      expect(modelMap.epics, 'Not existed: modelMap.epics').to.exist;

      const epics = modelMap.epics;
      Object.keys(testData01.modelsDefine).map(key => testData01.modelsDefine[key]).map(m => m.names)
      .map(({
        collection: collectionName,
        member: memberName,
        model: modelName,
      }) => {
        [collectionName, memberName]
        .map(resourceName => {
          const capitalizeResourceName = capitalizeFirstLetter(resourceName);

          ['post', 'get', 'patch', 'delete']
          .map(methodName => {
            expect(epics[`${methodName}${capitalizeResourceName}Epic`], `Not existed: ${methodName}${capitalizeResourceName}Epic`).to.be.an.instanceof(Function);
          });
        });
      });
    });
  });
});


