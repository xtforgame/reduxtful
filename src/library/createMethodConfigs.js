import { toUnderscore, capitalizeFirstLetter } from './utils';

let supportedActions = [
  'start',
  'respond',
  'respondError',
  'cancel',
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

let getActionName = (isCollection = false) => ({methodName, names, actionTypeName}) => {
  switch(methodName){
  case 'selectPath':
    return `select${capitalizeFirstLetter(names.model)}Path`;
  case 'clearCollectionCache':
    return `clear${capitalizeFirstLetter(getResourceCollectionName(names))}Cache`;
  case 'clearCache':
    return `clear${capitalizeFirstLetter(names.member)}Cache`;
  default:
    break;
  }

  const resourceCollectionName = getResourceCollectionName(names);
  const resourceName = isCollection ? resourceCollectionName : names.member;
  const _methodName = isCollection ? methodName.substr(0, methodName.length - 'Collection'.length) : methodName;
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

let getEpicName = (isCollection = false) => ({methodName, names, actionTypeName}) => {
  const _getActionName = getActionName(isCollection);
  return `${_getActionName({methodName, names, actionTypeName: 'start'})}Epic`;
};

export default function createMethodConfigs(ns, names) {
  return [
    {
      name: 'selectPath',
      supportedActions: ['start'],
      getActionContantName,
      getActionName: getActionName(),
      getReducerName,
    },
    {
      name: 'postCollection',
      method: 'post',
      isForCollection: true,
      supportedActions,
      getUrlTemplate: ({names, url}) => url,
      getActionContantName,
      getActionName: getActionName(true),
      getReducerName,
      getEpicName: getEpicName(true),
    },
    {
      name: 'getCollection',
      method: 'get',
      isForCollection: true,
      supportedActions,
      getUrlTemplate: ({names, url}) => url,
      getActionContantName,
      getActionName: getActionName(true),
      getReducerName,
      getEpicName: getEpicName(true),
    },
    {
      name: 'patchCollection',
      method: 'patch',
      isForCollection: true,
      supportedActions,
      getUrlTemplate: ({names, url}) => url,
      getActionContantName,
      getActionName: getActionName(true),
      getReducerName,
      getEpicName: getEpicName(true),
    },
    {
      name: 'deleteCollection',
      method: 'delete',
      isForCollection: true,
      supportedActions,
      getUrlTemplate: ({names, url}) => url,
      getActionContantName,
      getActionName: getActionName(true),
      getReducerName,
      getEpicName: getEpicName(true),
    },
    {
      name: 'clearCollectionCache',
      isForCollection: true,
      supportedActions: ['start'],
      getUrlTemplate: ({names, url}) => url,
      getActionContantName,
      getActionName: getActionName(true),
      getReducerName,
      getEpicName: getEpicName(true),
    },
    {
      name: 'post',
      method: 'post',
      isForCollection: false,
      supportedActions,
      getUrlTemplate: ({names, url}) => `${url}/{id}`,
      getActionContantName,
      getActionName: getActionName(),
      getReducerName,
      getEpicName: getEpicName(),
    },
    {
      name: 'get',
      method: 'get',
      isForCollection: false,
      supportedActions,
      getUrlTemplate: ({names, url}) => `${url}/{id}`,
      getActionContantName,
      getActionName: getActionName(),
      getReducerName,
      getEpicName: getEpicName(),
    },
    {
      name: 'patch',
      method: 'patch',
      isForCollection: false,
      supportedActions,
      getUrlTemplate: ({names, url}) => `${url}/{id}`,
      getActionContantName,
      getActionName: getActionName(),
      getReducerName,
      getEpicName: getEpicName(),
    },
    {
      name: 'delete',
      method: 'delete',
      isForCollection: false,
      supportedActions,
      getUrlTemplate: ({names, url}) => `${url}/{id}`,
      getActionContantName,
      getActionName: getActionName(),
      getReducerName,
      getEpicName: getEpicName(),
    },
    {
      name: 'clearCache',
      supportedActions: ['start'],
      isForCollection: false,
      getUrlTemplate: ({names, url}) => `${url}/{id}`,
      getActionContantName,
      getActionName: getActionName(),
      getReducerName,
      getEpicName: getEpicName(),
    },
  ];
}
