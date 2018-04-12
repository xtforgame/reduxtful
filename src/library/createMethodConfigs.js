import { toUnderscore, capitalizeFirstLetter } from './utils';

let supportedActions = [
  'start',
  'success',
  'error',
  'cancel',
  'clearError',
];

let getActionTypeName = ({methodName, names, actionTypeName}) => {
  const upperCasedMethod = toUnderscore(methodName).toUpperCase();
  const upperCasedSingleName = toUnderscore(names.singular).toUpperCase();
  const upperCasedActionTypeName = toUnderscore(actionTypeName).toUpperCase();

  return `${upperCasedSingleName}_${upperCasedMethod}_${upperCasedActionTypeName}`;
};

let getActionName = ({methodName, names, actionTypeName}) => {
  let _actionTypeName = (actionTypeName === 'start' ? '' : actionTypeName);
  return `${methodName}${capitalizeFirstLetter(names.singular)}${capitalizeFirstLetter(_actionTypeName)}`;
};

let getReducerName = ({names}) => {
  return `${names.singular}Reducer`;
};

let getEpicName = ({methodName, names}) => {
  return `${methodName}${capitalizeFirstLetter(names.singular)}Epic`;
};

export default function createMethodConfigs(ns, names) {
  return [
    {
      name: 'selectPath',
      supportedActions: ['start'],
      getActionTypeName: ({methodName, names, actionTypeName}) => {
        const upperCasedMethod = toUnderscore(methodName).toUpperCase();
        const upperCasedSingleName = toUnderscore(names.singular).toUpperCase();
        return `${upperCasedSingleName}_${upperCasedMethod}`;
      },
      getActionName: ({methodName, names, actionTypeName}) => {
        return `select${capitalizeFirstLetter(names.singular)}Path`;
      },
      getReducerName,
    },
    {
      name: 'create',
      method: 'post',
      supportedActions,
      getUrlTemplate: ({names, url}) => url,
      getActionTypeName,
      getActionName,
      getReducerName,
      getEpicName,
    },
    {
      name: 'read',
      method: 'get',
      supportedActions,
      getUrlTemplate: ({names, url}) => `${url}/{${names.singular}Id}`,
      getActionTypeName,
      getActionName,
      getReducerName,
      getEpicName,
    },
    {
      name: 'readColl',
      method: 'get',
      supportedActions,
      getUrlTemplate: ({names, url}) => url,
      getActionTypeName,
      getActionName: ({methodName, names, actionTypeName}) => {
        let _actionTypeName = (actionTypeName === 'start' ? '' : actionTypeName);
        return `read${capitalizeFirstLetter(names.singular)}Coll${capitalizeFirstLetter(_actionTypeName)}`;
      },
      getReducerName,
      getEpicName: ({methodName, names}) => {
        return `read${capitalizeFirstLetter(names.singular)}CollEpic`;
      },
    },
    {
      name: 'update',
      method: 'patch',
      supportedActions,
      getUrlTemplate: ({names, url}) => `${url}/{${names.singular}Id}`,
      getActionTypeName,
      getActionName,
      getReducerName,
      getEpicName,
    },
    {
      name: 'clear',
      method: 'patch',
      supportedActions,
      getUrlTemplate: ({names, url}) => `${url}/{${names.singular}Id}`,
      getActionTypeName,
      getActionName,
      getReducerName,
      getEpicName,
    },
    {
      name: 'delete',
      method: 'delete',
      supportedActions,
      getUrlTemplate: ({names, url}) => `${url}/{${names.singular}Id}`,
      getActionTypeName,
      getActionName,
      getReducerName,
      getEpicName,
    },
  ];
}
