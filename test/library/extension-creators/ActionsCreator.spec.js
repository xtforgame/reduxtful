/*eslint-disable no-unused-vars, no-undef */

import chai from 'chai';
import ModelMap from 'library/ModelMap';
import { capitalizeFirstLetter } from 'library/utils';
import {
  testData01,
} from '../../test-data';

const expect = chai.expect;

describe('ActionsCreator Test Cases', function(){
  describe('Basic', function(){
    this.timeout(10000);

    it('should export all actions', () => {
      const modelMap = new ModelMap('global', testData01.modelsDefine);

      expect(modelMap).to.be.an.instanceof(ModelMap);
      expect(modelMap.actions, 'Not existed: modelMap.actions').to.exist;

      const actions = modelMap.actions;
      Object.keys(testData01.modelsDefine).map(key => testData01.modelsDefine[key]).map(m => m.names)
      .map(({
        collection: collectionName,
        member: memberName,
        model: modelName,
      }) => {
        const capitalizeModelName = capitalizeFirstLetter(modelName);
        expect(actions[`select${capitalizeModelName}Path`], `Not existed: select${capitalizeModelName}Path`).to.be.an.instanceof(Function);

        [collectionName, memberName]
        .map(resourceName => {
          const capitalizeResourceName = capitalizeFirstLetter(resourceName);
          ['post', 'get', 'patch', 'delete']
          .map(methodName => {
            const capitalizeMethodName = capitalizeFirstLetter(methodName);
            expect(actions[`${methodName}${capitalizeResourceName}`], `Not existed: ${methodName}${capitalizeResourceName}`).to.be.an.instanceof(Function);
            expect(actions[`respond${capitalizeMethodName}${capitalizeResourceName}`], `Not existed: respond${capitalizeMethodName}${capitalizeResourceName}`).to.be.an.instanceof(Function);
            expect(actions[`respond${capitalizeMethodName}${capitalizeResourceName}Error`], `Not existed: respond${capitalizeMethodName}${capitalizeResourceName}Error`).to.be.an.instanceof(Function);
            expect(actions[`cancel${capitalizeMethodName}${capitalizeResourceName}`], `Not existed: cancel${capitalizeMethodName}${capitalizeResourceName}`).to.be.an.instanceof(Function);
          });

          expect(actions[`clear${capitalizeResourceName}Cache`], `Not existed: clear${capitalizeResourceName}Cache`).to.be.an.instanceof(Function);
        });
      });
    });
  });
});


