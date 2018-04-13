/*eslint-disable no-unused-vars, no-undef */

import chai from 'chai';
import ModelMap from 'library/ModelMap';
import { capitalizeFirstLetter } from 'library/utils';
import {
  modelsDefine01,
} from '../../test-data';

const expect = chai.expect;

describe('ActionsCreator Test Cases', function(){
  describe('Basic', function(){
    this.timeout(10000);

    it('should export all actions', () => {
      const modelMap = new ModelMap('global', modelsDefine01);

      expect(modelMap).to.be.an.instanceof(ModelMap);
      expect(modelMap.actions, 'Not existed: modelMap.actions').to.exist;

      const actions = modelMap.actions;
      ['api', 'session', 'user']
      .map(resourceName => {
        const capitalizeResourceName = capitalizeFirstLetter(resourceName);
        expect(actions[`select${capitalizeResourceName}Path`], `Not existed: select${capitalizeResourceName}Path`).to.be.an.instanceof(Function);

        ['post', 'get', 'patch', 'delete']
        .map(methodName => {
          const capitalizeMethodName = capitalizeFirstLetter(methodName);
          expect(actions[`${methodName}${capitalizeResourceName}`], `Not existed: ${methodName}${capitalizeResourceName}`).to.be.an.instanceof(Function);
          expect(actions[`respond${capitalizeMethodName}${capitalizeResourceName}`], `Not existed: respond${capitalizeMethodName}${capitalizeResourceName}`).to.be.an.instanceof(Function);
          expect(actions[`respond${capitalizeMethodName}${capitalizeResourceName}Error`], `Not existed: respond${capitalizeMethodName}${capitalizeResourceName}Error`).to.be.an.instanceof(Function);
          expect(actions[`cancel${capitalizeMethodName}${capitalizeResourceName}`], `Not existed: cancel${capitalizeMethodName}${capitalizeResourceName}`).to.be.an.instanceof(Function);
          expect(actions[`${methodName}${capitalizeResourceName}ClearError`], `Not existed: ${methodName}${capitalizeResourceName}ClearError`).to.be.an.instanceof(Function);
        });
      });
    });
  });
});


