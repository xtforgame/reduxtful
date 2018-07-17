import { capitalizeFirstLetter } from '../core/common-functions';
import UrlInfo from '../core/UrlInfo';

const createSelectors = (createSelector, names, baseSelector, hierarchyLevel) => {
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

  const makeSelectedResourceByIdSelector = () => createSelector(
    makeSelectedResourceNodeSelector(),
    (node) => {
      if(node && node.byId){
        return node.byId;
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

  let extra = {};
  if(hierarchyLevel === 0){
    // for the resource with single-level-hierarchy
    const makeDefaultResourceNodeSelector = () => createSelector(
      makeResourceHierarchySelector(),
      hierarchy => hierarchy,
    )
  
    const makeDefaultResourceCollectionSelector = () => createSelector(
      makeDefaultResourceNodeSelector(),
      (node) => {
        if(node && node.collection){
          return node.collection;
        }
        return null;
      }
    )
  
    const makeDefaultResourceByIdSelector = () => createSelector(
      makeDefaultResourceNodeSelector(),
      (node) => {
        if(node && node.byId){
          return node.byId;
        }
        return null;
      }
    )
    extra = {
      [`makeDefault${capitalizeModelName}NodeSelector`]: makeDefaultResourceNodeSelector,
      [`makeDefault${capitalizeModelName}CollectionSelector`]: makeDefaultResourceCollectionSelector,
      [`makeDefault${capitalizeModelName}ByIdSelector`]: makeDefaultResourceByIdSelector,
    };
  }

  return {
    [`${modelName}Selector`]: resourceSelector,
    [`make${capitalizeModelName}HierarchySelector`]: makeResourceHierarchySelector,
    [`make${capitalizeModelName}SelectionSelector`]: makeResourceSelectionSelector,
    [`makeSelected${capitalizeModelName}NodeSelector`]: makeSelectedResourceNodeSelector,
    [`makeSelected${capitalizeModelName}CollectionSelector`]: makeSelectedResourceCollectionSelector,
    [`makeSelected${capitalizeModelName}ByIdSelector`]: makeSelectedResourceByIdSelector,
    [`makeSelected${capitalizeModelName}Selector`]: makeSelectedResourceSelector,
    ...extra,
  };
}

export default class SelectorsCreator {
  static $name = 'selectors';

  create({ url, names, methodConfigs }, config, extensionConfig){
    let shared = {};
    let exposed = {};

    // console.log('extensionConfig :', extensionConfig);
    if(!extensionConfig.baseSelector){
      return { shared, exposed };
    }

    const {
      createSelector,
    } = extensionConfig;

    const hierarchyLevel = UrlInfo.parse(url).varParts.length

    shared = createSelectors(createSelector, names, extensionConfig.baseSelector, hierarchyLevel);
    exposed = { ...shared };

    return { shared, exposed };
  }
}
