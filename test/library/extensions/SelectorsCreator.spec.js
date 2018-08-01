/* eslint-disable no-unused-vars, no-undef */

import chai from 'chai';
import { ModelMap, defaultExtensions } from 'library';
import { capitalizeFirstLetter } from 'library/core/common-functions';
import SelectorsCreator from 'library/extensions/SelectorsCreator';
import {
  testData01,
} from '../../test-data';

const { expect } = chai;

describe('SelectorsCreator Test Cases', () => {
  describe('Basic', () => {
    it('should export all selectors', () => {
      const modelMap = new ModelMap('global', testData01.modelsDefine, defaultExtensions.concat([SelectorsCreator]));

      expect(modelMap).to.be.an.instanceof(ModelMap);
      expect(modelMap.selectors, 'Not existed: modelMap.selectors').to.exist;

      const { selectors } = modelMap;
      Object.keys(testData01.modelsDefine)
      .map(key => testData01.modelsDefine[key])
      .filter(m => m.extensionConfigs && m.extensionConfigs.selectors && m.extensionConfigs.selectors.baseSelector)
      .map(m => m.names)
      .forEach(({
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
