import { capitalizeFirstLetter } from '../core/functions';

const createSelectors = (createSelector, names, baseSelector) => {
  const resourceSelector = baseSelector;

  const makeResourceHierarchySelector = () => createSelector(
    resourceSelector,
    (resources) => resources.hierarchy,
  );

  const makeResourceSelectionSelector = () => createSelector(
    resourceSelector,
    (resources) => resources.selection,
  );

  const makeSelectedResourceNodeSelector = () => createSelector(
    makeResourceHierarchySelector(),
    makeResourceSelectionSelector(),
    (hierarchy, selection) => {
      if(!hierarchy || !selection || !selection.entryPath){
        return null;
      }
      let node = hierarchy;
      selection.entryPath.map(part => node = node && node[part]);
      return node;
    }
  )

  const makeSelectedResourceCollectionSelector = () => createSelector(
    makeSelectedResourceNodeSelector(),
    (node) => {
      if(node && node.collection){
        return node.collection;
      }
      return null;
    }
  )

  const makeSelectedResourceSelector = () => createSelector(
    makeSelectedResourceNodeSelector(),
    makeResourceSelectionSelector(),
    (node, selection) => {
      if(node && node.byId && selection.id != null){
        return node.byId[selection.id];
      }
      return null;
    }
  )

  const modelName = names.model;
  const capitalizeModelName = capitalizeFirstLetter(modelName);

  return {
    [`${modelName}Selector`]: resourceSelector,
    [`make${capitalizeModelName}HierarchySelector`]: makeResourceHierarchySelector,
    [`make${capitalizeModelName}SelectionSelector`]: makeResourceSelectionSelector,
    [`makeSelected${capitalizeModelName}NodeSelector`]: makeSelectedResourceNodeSelector,
    [`makeSelected${capitalizeModelName}CollectionSelector`]: makeSelectedResourceCollectionSelector,
    [`makeSelected${capitalizeModelName}Selector`]: makeSelectedResourceSelector,
  };
}

export default class SelectorsCreator {
  static $name = 'selectors';

  create({ names, methodConfigs }, config, extensionConfig){
    let shared = {};
    let exposed = {};

    // console.log('extensionConfig :', extensionConfig);
    if(!extensionConfig.baseSelector){
      return { shared, exposed };
    }

    const {
      createSelector,
    } = extensionConfig;

    shared = createSelectors(createSelector, names, extensionConfig.baseSelector);
    exposed = { ...shared };

    return { shared, exposed };
  }
}
