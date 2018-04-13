/*eslint-disable no-unused-vars, no-undef */

import chai from 'chai';
import ModelMap from 'library/ModelMap';
import { capitalizeFirstLetter } from 'library/utils';
import {
  modelsDefine01,
} from '../../test-data';

const expect = chai.expect;

describe('EpicCreator Test Cases', function(){
  describe('Basic', function(){
    this.timeout(10000);

    it('should export all epics', () => {
      const modelMap = new ModelMap('global', modelsDefine01);

      expect(modelMap).to.be.an.instanceof(ModelMap);
      expect(modelMap.epics, 'Not existed: modelMap.epics').to.exist;

      const epics = modelMap.epics;
      ['api', 'session', 'user']
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


