import { capitalizeFirstLetter } from '../core/common-functions';
import UrlInfo from '../core/UrlInfo';

export const namingConventions = {
  noun: {
    maker: targetName => `make${capitalizeFirstLetter(targetName)}Selector`,
    selector: targetName => `${targetName}Selector`,
  },
  verb: {
    maker: targetName => `makeSelect${capitalizeFirstLetter(targetName)}`,
    selector: targetName => `select${capitalizeFirstLetter(targetName)}`,
  },
};

const createSelectors = (createSelector, names, baseSelector, hierarchyLevel, namingConvention, selectorType) => {
  const resourceSelector = baseSelector;

  const makeResourceSelector = () => createSelector(
    resourceSelector,
    resources => resources,
  );

  const makeResourceHierarchySelector = () => createSelector(
    resourceSelector,
    resources => resources.hierarchy,
  );

  const makeResourceSelectionSelector = () => createSelector(
    resourceSelector,
    resources => resources.selection,
  );

  const makeSelectedResourceNodeSelector = () => createSelector(
    makeResourceHierarchySelector(),
    makeResourceSelectionSelector(),
    (hierarchy, selection) => {
      if (!hierarchy || !selection || !selection.entryPath) {
        return null;
      }
      let node = hierarchy;
      selection.entryPath.forEach(part => (node = node && node[part]));
      return node;
    }
  );

  const makeSelectedResourceCollectionSelector = () => createSelector(
    makeSelectedResourceNodeSelector(),
    (node) => {
      if (node && node.collection) {
        return node.collection;
      }
      return null;
    }
  );

  const makeSelectedResourceByIdSelector = () => createSelector(
    makeSelectedResourceNodeSelector(),
    (node) => {
      if (node && node.byId) {
        return node.byId;
      }
      return null;
    }
  );

  const makeSelectedResourceSelector = () => createSelector(
    makeSelectedResourceNodeSelector(),
    makeResourceSelectionSelector(),
    (node, selection) => {
      if (node && node.byId && selection.id != null) {
        return node.byId[selection.id];
      }
      return null;
    }
  );

  const modelName = names.model;
  const capitalizeModelName = capitalizeFirstLetter(modelName);

  let extra = {};
  if (hierarchyLevel === 0) {
    // for the resource with single-level-hierarchy
    const makeDefaultResourceNodeSelector = () => createSelector(
      makeResourceHierarchySelector(),
      hierarchy => hierarchy,
    );

    const makeDefaultResourceCollectionSelector = () => createSelector(
      makeDefaultResourceNodeSelector(),
      (node) => {
        if (node && node.collection) {
          return node.collection;
        }
        return null;
      }
    );

    const makeDefaultResourceByIdSelector = () => createSelector(
      makeDefaultResourceNodeSelector(),
      (node) => {
        if (node && node.byId) {
          return node.byId;
        }
        return null;
      }
    );
    extra = {
      [`default${capitalizeModelName}Node`]: makeDefaultResourceNodeSelector,
      [`default${capitalizeModelName}Collection`]: makeDefaultResourceCollectionSelector,
      [`default${capitalizeModelName}ById`]: makeDefaultResourceByIdSelector,
    };
  }

  const targetMakers = {
    [`${modelName}`]: makeResourceSelector,
    [`${modelName}Hierarchy`]: makeResourceHierarchySelector,
    [`${modelName}Selection`]: makeResourceSelectionSelector,
    [`selected${capitalizeModelName}Node`]: makeSelectedResourceNodeSelector,
    [`selected${capitalizeModelName}Collection`]: makeSelectedResourceCollectionSelector,
    [`selected${capitalizeModelName}ById`]: makeSelectedResourceByIdSelector,
    [`selected${capitalizeModelName}`]: makeSelectedResourceSelector,
    ...extra,
  };

  const selectors = {};

  Object.keys(targetMakers).forEach((targetName) => {
    const makeFunction = targetMakers[targetName];
    if (selectorType === 'all' || selectorType === 'maker') {
      selectors[namingConventions[namingConvention].maker(targetName)] = makeFunction;
    }

    if (selectorType === 'all' || selectorType === 'selector') {
      selectors[namingConventions[namingConvention].selector(targetName)] = makeFunction();
    }
  });
  return selectors;
};

export default class SelectorsCreator {
  static $name = 'selectors';

  create({ url, names, methodConfigs }, config, extensionConfig) {
    let shared = {};
    let exposed = {};

    const {
      createSelector,
      baseSelector,
      namingConvention = 'noun',
      selectorType = 'all', // ['all', 'maker', 'selector']
    } = extensionConfig;

    // console.log('extensionConfig :', extensionConfig);
    if (!baseSelector) {
      return { shared, exposed };
    }

    const hierarchyLevel = UrlInfo.parse(url).varParts.length;

    shared = createSelectors(createSelector, names, baseSelector, hierarchyLevel, namingConvention, selectorType);
    exposed = { ...shared };

    return { shared, exposed };
  }
}
