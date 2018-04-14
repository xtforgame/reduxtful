import { toUnderscore, capitalizeFirstLetter } from './utils';

let supportedActions = [
  'start',
  'respond',
  'respondError',
  'cancel',
];

let getActionTypeName = ({methodName, names, actionTypeName}) => {
  const upperCasedMethod = toUnderscore(methodName).toUpperCase();
  const upperCasedSingleName = toUnderscore(names.singular).toUpperCase();
  const upperCasedActionTypeName = toUnderscore(actionTypeName).toUpperCase();

  switch(methodName){
  case 'selectPath':
  case 'clearCache':
    return `${upperCasedSingleName}_${upperCasedMethod}`;
  default:
    break;
  }

  switch(actionTypeName){
  case 'respond':
    return `${upperCasedSingleName}_RESPOND_${upperCasedMethod}`;
  case 'respondError':
    return `${upperCasedSingleName}_RESPOND_${upperCasedMethod}_ERROR`;
  case 'cancel':
    return `${upperCasedSingleName}_CANCEL_${upperCasedMethod}`;
  default:
    break;
  }

  return `${upperCasedSingleName}_${upperCasedMethod}_${upperCasedActionTypeName}`;
};

let getActionName = (isCollection = false) => ({methodName, names, actionTypeName}) => {
  switch(methodName){
  case 'selectPath':
    return `select${capitalizeFirstLetter(names.singular)}Path`;
  case 'clearCache':
    return `clear${capitalizeFirstLetter(names.singular)}Cache`;
  default:
    break;
  }

  const resourceName = isCollection ? `${names.singular}Collection` : names.singular;
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
  return `${names.singular}Reducer`;
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
      getActionTypeName,
      getActionName: getActionName(),
      getReducerName,
    },
    {
      name: 'postCollection',
      method: 'post',
      supportedActions,
      getUrlTemplate: ({names, url}) => url,
      getActionTypeName,
      getActionName: getActionName(true),
      getReducerName,
      getEpicName: getEpicName(true),
    },
    {
      name: 'getCollection',
      method: 'get',
      supportedActions,
      getUrlTemplate: ({names, url}) => url,
      getActionTypeName,
      getActionName: getActionName(true),
      getReducerName,
      getEpicName: getEpicName(true),
    },
    {
      name: 'patchCollection',
      method: 'patch',
      supportedActions,
      getUrlTemplate: ({names, url}) => url,
      getActionTypeName,
      getActionName: getActionName(true),
      getReducerName,
      getEpicName: getEpicName(true),
    },
    {
      name: 'deleteCollection',
      method: 'delete',
      supportedActions,
      getUrlTemplate: ({names, url}) => url,
      getActionTypeName,
      getActionName: getActionName(true),
      getReducerName,
      getEpicName: getEpicName(true),
    },
    {
      name: 'post',
      method: 'post',
      supportedActions,
      getUrlTemplate: ({names, url}) => url,
      getActionTypeName,
      getActionName: getActionName(),
      getReducerName,
      getEpicName: getEpicName(),
    },
    {
      name: 'get',
      method: 'get',
      supportedActions,
      getUrlTemplate: ({names, url}) => `${url}/{${names.singular}Id}`,
      getActionTypeName,
      getActionName: getActionName(),
      getReducerName,
      getEpicName: getEpicName(),
    },
    {
      name: 'patch',
      method: 'patch',
      supportedActions,
      getUrlTemplate: ({names, url}) => `${url}/{${names.singular}Id}`,
      getActionTypeName,
      getActionName: getActionName(),
      getReducerName,
      getEpicName: getEpicName(),
    },
    {
      name: 'delete',
      method: 'delete',
      supportedActions,
      getUrlTemplate: ({names, url}) => `${url}/{${names.singular}Id}`,
      getActionTypeName,
      getActionName: getActionName(),
      getReducerName,
      getEpicName: getEpicName(),
    },
    {
      name: 'clearCache',
      supportedActions: ['start'],
      getUrlTemplate: ({names, url}) => `${url}/{${names.singular}Id}`,
      getActionTypeName,
      getActionName: getActionName(),
      getReducerName,
      getEpicName: getEpicName(),
    },
  ];
}
