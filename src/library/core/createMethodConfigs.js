import { toUnderscore, capitalizeFirstLetter } from './common-functions';

let supportedActions = [
  { name: 'start' },
  { name: 'respond' },
  { name: 'respondError' },
  { name: 'cancel' },
];

const getResourceCollectionName = (names) => (names.member === names.collection) ? `${names.member}Collection` : names.collection;

let getActionContantName = ({methodName, names, actionTypeName}) => {
  const upperCasedMethod = toUnderscore(methodName).toUpperCase();
  const upperCasedModelName = toUnderscore(names.model).toUpperCase();
  const upperCasedCollecionName = toUnderscore(getResourceCollectionName(names)).toUpperCase();
  const upperCasedMemberName = toUnderscore(names.member).toUpperCase();
  const upperCasedActionTypeName = toUnderscore(actionTypeName).toUpperCase();

  switch(methodName){
  case 'selectPath':
  case 'clearCollectionCache':
  case 'clearCache':
  case 'clearEachCache':
    return `${upperCasedModelName}_${upperCasedMethod}`;
  default:
    break;
  }

  switch(actionTypeName){
  case 'respond':
    return `${upperCasedMemberName}_RESPOND_${upperCasedMethod}`;
  case 'respondError':
    return `${upperCasedMemberName}_RESPOND_${upperCasedMethod}_ERROR`;
  case 'cancel':
    return `${upperCasedMemberName}_CANCEL_${upperCasedMethod}`;
  default:
    break;
  }

  return `${upperCasedMemberName}_${upperCasedMethod}_${upperCasedActionTypeName}`;
};

let getActionName = (isForCollection = false) => ({methodName, names, actionTypeName}) => {
  switch(methodName){
  case 'selectPath':
    return `select${capitalizeFirstLetter(names.model)}Path`;
  case 'clearCollectionCache':
    return `clear${capitalizeFirstLetter(getResourceCollectionName(names))}Cache`;
  case 'clearCache':
    return `clear${capitalizeFirstLetter(names.member)}Cache`;
  case 'clearEachCache':
    return `clearEach${capitalizeFirstLetter(names.member)}Cache`;
  default:
    break;
  }

  const resourceCollectionName = getResourceCollectionName(names);
  const resourceName = isForCollection ? resourceCollectionName : names.member;
  const _methodName = isForCollection ? methodName.substr(0, methodName.length - 'Collection'.length) : methodName;
  let _actionTypeName = actionTypeName;

  switch(actionTypeName){
  case 'start':
    _actionTypeName = '';
    break;
  case 'respond':
    return `${_actionTypeName}${capitalizeFirstLetter(_methodName)}${capitalizeFirstLetter(resourceName)}`;
  case 'respondError':
    return `respond${capitalizeFirstLetter(_methodName)}${capitalizeFirstLetter(resourceName)}Error`;
  case 'cancel':
    return `${_actionTypeName}${capitalizeFirstLetter(_methodName)}${capitalizeFirstLetter(resourceName)}`;
  default:
    break;
  }
  return `${_methodName}${capitalizeFirstLetter(resourceName)}${capitalizeFirstLetter(_actionTypeName)}`;
};

let getReducerName = ({names}) => {
  return `${names.model}Reducer`;
};

let getEpicName = (isForCollection = false) => ({methodName, names, actionTypeName}) => {
  const _getActionName = getActionName(isForCollection);
  return `${_getActionName({methodName, names, actionTypeName: 'start'})}Epic`;
};

let getSagaName = (isForCollection = false) => ({methodName, names, actionTypeName}) => {
  const _getActionName = getActionName(isForCollection);
  return `${_getActionName({methodName, names, actionTypeName: 'start'})}Saga`;
};

export default function createMethodConfigs(ns, names) {
  return [
    {
      name: 'selectPath',
      supportedActions: [{ name: 'start' }],
      needBody: false,
      getActionContantName,
      getActionName: getActionName(),
      getReducerName,
    },
    {
      name: 'postCollection',
      method: 'post',
      supportedActions,
      isForCollection: true,
      needBody: true,
      getUrlTemplate: ({names, url}) => url,
      getActionContantName,
      getActionName: getActionName(true),
      getReducerName,
      getEpicName: getEpicName(true),
      getSagaName: getSagaName(true),
    },
    {
      name: 'getCollection',
      method: 'get',
      supportedActions,
      isForCollection: true,
      needBody: false,
      getUrlTemplate: ({names, url}) => url,
      getActionContantName,
      getActionName: getActionName(true),
      getReducerName,
      getEpicName: getEpicName(true),
      getSagaName: getSagaName(true),
    },
    {
      name: 'patchCollection',
      method: 'patch',
      supportedActions,
      isForCollection: true,
      needBody: true,
      getUrlTemplate: ({names, url}) => url,
      getActionContantName,
      getActionName: getActionName(true),
      getReducerName,
      getEpicName: getEpicName(true),
      getSagaName: getSagaName(true),
    },
    {
      name: 'deleteCollection',
      method: 'delete',
      supportedActions,
      isForCollection: true,
      needBody: false,
      getUrlTemplate: ({names, url}) => url,
      getActionContantName,
      getActionName: getActionName(true),
      getReducerName,
      getEpicName: getEpicName(true),
      getSagaName: getSagaName(true),
    },
    {
      name: 'clearCollectionCache',
      supportedActions: [{ name: 'start' }],
      isForCollection: true,
      needBody: false,
      getUrlTemplate: ({names, url}) => url,
      getActionContantName,
      getActionName: getActionName(true),
      getReducerName,
      getEpicName: getEpicName(true),
      getSagaName: getSagaName(true),
    },
    {
      name: 'post',
      method: 'post',
      supportedActions,
      isForCollection: false,
      needBody: true,
      getUrlTemplate: ({names, url}) => `${url}/{id}`,
      getActionContantName,
      getActionName: getActionName(),
      getReducerName,
      getEpicName: getEpicName(),
      getSagaName: getSagaName(),
    },
    {
      name: 'get',
      method: 'get',
      supportedActions,
      isForCollection: false,
      needBody: false,
      getUrlTemplate: ({names, url}) => `${url}/{id}`,
      getActionContantName,
      getActionName: getActionName(),
      getReducerName,
      getEpicName: getEpicName(),
      getSagaName: getSagaName(),
    },
    {
      name: 'patch',
      method: 'patch',
      supportedActions,
      isForCollection: false,
      needBody: true,
      getUrlTemplate: ({names, url}) => `${url}/{id}`,
      getActionContantName,
      getActionName: getActionName(),
      getReducerName,
      getEpicName: getEpicName(),
      getSagaName: getSagaName(),
    },
    {
      name: 'delete',
      method: 'delete',
      supportedActions,
      isForCollection: false,
      needBody: false,
      getUrlTemplate: ({names, url}) => `${url}/{id}`,
      getActionContantName,
      getActionName: getActionName(),
      getReducerName,
      getEpicName: getEpicName(),
      getSagaName: getSagaName(),
    },
    {
      name: 'clearCache',
      supportedActions: [{ name: 'start' }],
      isForCollection: false,
      needBody: false,
      getActionContantName,
      getActionName: getActionName(),
      getReducerName,
      getEpicName: getEpicName(),
      getSagaName: getSagaName(),
    },
    {
      name: 'clearEachCache',
      supportedActions: [{ name: 'start' }],
      isForCollection: false,
      needId: false,
      needBody: false,
      getActionContantName,
      getActionName: getActionName(),
      getReducerName,
      getEpicName: getEpicName(),
      getSagaName: getSagaName(),
    },
  ];
}
