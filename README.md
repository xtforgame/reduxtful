# Reduxtful

Redux + RESTful

Run `npm install`

  1. `npm start` for development
  2. `npm run build` for build

## Example

```js
// modelMap.js

import axios from 'axios';
import { createSelector } from 'reselect';
import { Observable } from 'rxjs'; // [optional] for rxjs user
import * as effects from 'redux-saga/effects'; // [optional] for redux-saga user
import * as symbols from 'redux-wait-for-action';

import { ModelMap, defaultExtensions } from 'reduxtful';

// extension name: sagas
import SagaCreator from 'reduxtful/extensions/SagaCreator'; // [optional] for rxjs user
// extension name: epics
import EpicCreator from 'reduxtful/extensions/EpicCreator'; // [optional] for redux-saga user
// extension name: selectors
import SelectorsCreator from 'reduxtful/extensions/SelectorsCreator';
// extension name: waitableActions
import WaitableActionsCreator from 'reduxtful/extensions/WaitableActionsCreator';

/*
// extension name: types
import ActionTypesCreator from 'reduxtful/extensions/ActionTypesCreator';
// extension name: actions
import ActionsCreator from 'reduxtful/extensions/ActionsCreator';
// extension name: reducers
import ReducerCreator from 'reduxtful/extensions/ReducerCreator';

defaultExtensions = [
  ActionTypesCreator,
  ActionsCreator,
  ReducerCreator,
]
*/

const modelMapNamespace = 'global';

const requestMiddleware = (request, info, next) => next()
  .then(response => response);
const responseMiddleware = (response, info) => {
  if (response.status === 200 && response.data.error) {
    // for some error carried by a 200 response
    return Promise.reject(response.data.error);
  }
  return Promise.resolve(response);
};

// middlewares for request
const middlewares = {
  request: [requestMiddleware],
  response: [responseMiddleware],
};

// header provider
const getHeaders = () => ({ customHeader: 'xxx' });

// extension configs

// [optional] for rxjs user
const epics = {
  axios,
  Observable,
  getHeaders, // [optional]
  middlewares, // [optional]
};

// [optional] for redux-saga user
const sagas = {
  axios,
  effects,
  getHeaders, // [optional]
  middlewares, // [optional]
};

const waitableActions = { symbols };

const modelsDefine = {
  users: {
    url: '/api/users',
    names: {
      model: 'user', // will be used as the ruducer name (ex: ${modelName}Reducer)
      member: 'user', // will be used as the action names for members (ex: get${upperFirstLetter(modelName)})
      collection: 'users' // will be used as the action names for collection (ex: get${upperFirstLetter(modelName)})
    },
    config: {
      // actionNoRedundantBody: true,
      getId: data => data.id, // function to determine the member id from member response data
    },
    config: { // global configurations
      // actionNoRedundantBody: true,
    },
    extensionConfigs: { // extenstions configurations (by extension name)
      epics, // [optional] for rxjs user
      sagas, // [optional] for redux-saga user
      selectors: {
        createSelector,
        baseSelector: state => state[modelMapNamespace].users, // depends on your reducer design
      },
      waitableActions,
    },
  },
};

export default new ModelMap(
  modelMapNamespace, // model map namespace
  modelsDefine, // model definition
  defaultExtensions.concat([ // used extensions
    EpicCreator, // [optional] for rxjs user
    SagaCreator, // [optional] for redux-saga user
    SelectorsCreator,
    WaitableActionsCreator,
  ])
);

```

## API

### Basic CRUD

Assume that we use the following data as ```modelsDefine```
```js
const modelsDefine = {
  users: {
    url: '/api/{projectId}/users',
    names: {
      model: 'user',
      member: 'user',
      collection: 'users'
    },
    ...
    ...
  },
}
```

We will get the following actions

----

#### 1.Post collection - get<upperFirstLetter(names.collection)>(postData, entry, options)
```js
// example
postUser({ name: 'rick' }, { projectId: 'test-project' }, { query: { city: 'Taipei City' } });
/*
// will send the request 
POST /api/test-project/users?city=Taipei%20City
Body: { "name": "rick" }
*/
```

#### 2.Get member - get<upperFirstLetter(names.member)>(memberId, entry, options)
```js
// example
getUser(1, { projectId: 'test-project' }, { query: { city: 'Taipei City' } });
/*
// will send the request 
GET /api/test-project/users/1?city=Taipei%20City
*/
```

#### 3.Get collection - get<upperFirstLetter(names.collection)>(entry, options)
```js
// example
getUser({ projectId: 'test-project' }, { query: { city: 'Taipei City' } });
/*
// will send the request 
GET /api/test-project/users/1?city=Taipei%20City
*/
```

#### 4.Patch member - patch<upperFirstLetter(names.member)>(memberId, patchData, entry, options)
```js
// example
patchUser(1, { name: 'Not Rick' }, { projectId: 'test-project' }, { query: { city: 'Taipei City' } });
/*
// will send the request 
PATCH /api/test-project/users/1?city=Taipei%20City
Body: { "name": "rick" }
*/
```

#### 5.Delete member - patch<upperFirstLetter(names.member)>(memberId, entry, options)
```js
// example
deleteUser(1, { projectId: 'test-project' }, { query: { city: 'Taipei City' } });
/*
// will send the request 
DELETE /api/test-project/users/1?city=Taipei%20City
*/
```
