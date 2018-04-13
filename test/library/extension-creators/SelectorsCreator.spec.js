/*eslint-disable no-unused-vars, no-undef */

import chai from 'chai';
import ModelMap from 'library/ModelMap';
import { capitalizeFirstLetter } from 'library/utils';
import {
  modelsDefine01,
} from '../../test-data';

const expect = chai.expect;

describe('SelectorsCreator Test Cases', function(){
  describe('Basic', function(){
    this.timeout(10000);

    it('should export all selectors', () => {
      const modelMap = new ModelMap('global', modelsDefine01);

      expect(modelMap).to.be.an.instanceof(ModelMap);
      expect(modelMap.selectors, 'Not existed: modelMap.selectors').to.exist;

      const selectors = modelMap.selectors;
      ['session', 'user']
      .map(resourceName => {
        const capitalizeResourceName = capitalizeFirstLetter(resourceName);
        expect(selectors[`${resourceName}Selector`], `Not existed: ${resourceName}Selector`).to.be.an.instanceof(Function);
        expect(selectors[`make${capitalizeResourceName}HierarchySelector`], `Not existed: make${capitalizeResourceName}HierarchySelector`).to.be.an.instanceof(Function);
        expect(selectors[`make${capitalizeResourceName}SelectionSelector`], `Not existed: make${capitalizeResourceName}SelectionSelector`).to.be.an.instanceof(Function);
        expect(selectors[`makeSelected${capitalizeResourceName}NodeSelector`], `Not existed: makeSelected${capitalizeResourceName}NodeSelector`).to.be.an.instanceof(Function);
        expect(selectors[`makeSelected${capitalizeResourceName}CollectionSelector`], `Not existed: makeSelected${capitalizeResourceName}CollectionSelector`).to.be.an.instanceof(Function);
        expect(selectors[`makeSelected${capitalizeResourceName}Selector`], `Not existed: makeSelected${capitalizeResourceName}Selector`).to.be.an.instanceof(Function);
      });
    });
  });
});


