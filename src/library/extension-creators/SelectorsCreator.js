import { createSelector } from 'reselect';
import { capitalizeFirstLetter } from '../utils';

const createSelectors = (names, baseSelector) => {
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
      if(!hierarchy || !selection || !selection.pathArray){
        return null;
      }
      let node = hierarchy;
      selection.pathArray.map(part => node = node && node[part]);
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

  create({ names, methodConfigs }, config){
    let shared = {};
    let exposed = {};

    // console.log('config :', config);
    if(!config.baseSelector){
      return { shared, exposed };
    }

    shared = createSelectors(names, config.baseSelector);
    exposed = { ...shared };

    return { shared, exposed };
  }
}
