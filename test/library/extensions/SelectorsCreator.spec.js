/*eslint-disable no-unused-vars, no-undef */

import chai from 'chai';
import { ModelMap } from 'library';
import { capitalizeFirstLetter } from 'library/core/functions';
import {
  testData01,
} from '../../test-data';

const expect = chai.expect;

describe('SelectorsCreator Test Cases', function(){
  describe('Basic', function(){
    it('should export all selectors', () => {
      const modelMap = new ModelMap('global', testData01.modelsDefine);

      expect(modelMap).to.be.an.instanceof(ModelMap);
      expect(modelMap.selectors, 'Not existed: modelMap.selectors').to.exist;

      const selectors = modelMap.selectors;
      Object.keys(testData01.modelsDefine).map(key => testData01.modelsDefine[key])
      .filter(m => m.extensionConfigs && m.extensionConfigs.selectors && m.extensionConfigs.selectors.baseSelector)
      .map(m => m.names)
      .map(({
        collection: collectionName,
        member: memberName,
        model: modelName,
      }) => {
        const capitalizeModelName = capitalizeFirstLetter(modelName);
        expect(selectors[`${modelName}Selector`], `Not existed: ${modelName}Selector`).to.be.an.instanceof(Function);
        expect(selectors[`make${capitalizeModelName}HierarchySelector`], `Not existed: make${capitalizeModelName}HierarchySelector`).to.be.an.instanceof(Function);
        expect(selectors[`make${capitalizeModelName}SelectionSelector`], `Not existed: make${capitalizeModelName}SelectionSelector`).to.be.an.instanceof(Function);
        expect(selectors[`makeSelected${capitalizeModelName}NodeSelector`], `Not existed: makeSelected${capitalizeModelName}NodeSelector`).to.be.an.instanceof(Function);
        expect(selectors[`makeSelected${capitalizeModelName}CollectionSelector`], `Not existed: makeSelected${capitalizeModelName}CollectionSelector`).to.be.an.instanceof(Function);
        expect(selectors[`makeSelected${capitalizeModelName}Selector`], `Not existed: makeSelected${capitalizeModelName}Selector`).to.be.an.instanceof(Function);
      });
    });
  });
});


