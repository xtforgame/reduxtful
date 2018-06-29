import { getHeaders } from '../test-utils/HeaderManager';
import axios from 'axios';
import { Observable } from 'rxjs';
import { takeEvery, call, put, race, take, select } from 'redux-saga/effects';
import { createSelector } from 'reselect';

const requestMiddleware = (request, info, next) => {
  // console.log('request :', request);
  return next()
  .then(response => response);
};

const responseMiddleware = (response, info) => {
  if(response.status === 200 && response.data.error){
    // for some error carried by a 200 response
    return Promise.reject(response.data.error);
  }
  return Promise.resolve(response);
};

const epics = {
  axios,
  Observable,
  getHeaders,
  middlewares: {
    request: [requestMiddleware],
    response: [responseMiddleware],
  },
}

const sagas = {
  axios,
  effects: { takeEvery, call, put, race, take, select },
  getHeaders,
  middlewares: {
    request: [requestMiddleware],
    response: [responseMiddleware],
  },
}

export default {
  modelsDefine: {
    api: {
      url: '/api',
      names: { model:'api', collection: 'api' },
      singleton: true,
      config: {
        // actionNoRedundantBody: true,
        getId: data => 'api', // data.user_id,
      },
      extensionConfigs: {
        epics,
        sagas,
      },
    },
    sessions: {
      url: '/api/sessions',
      names: { model:'session', member: 'session', collection: 'sessions' },
      config: {
        // actionNoRedundantBody: true,
        getId: data => 'me', // data.user_id,
      },
      extensionConfigs: {
        epics,
        sagas,
        selectors: {
          createSelector,
          baseSelector: state => state.get('global').sessions,
        },
      },
    },
    users: {
      url: '/api/users',
      names: { model:'user', member: 'user', collection: 'users' },
      config: {
        // actionNoRedundantBody: true,
        getId: data => data.id,
      },
      extensionConfigs: {
        reducers: {
          middlewares: {
            global: [(state, action, options, next) => {
              return next();
            }],
            node: [(state, action, options, next) => {
              return next();
            }],
            collection: [(state, action, options, next) => {
              return next();
            }],
            member: [(state, action, options, next) => {
              return next();
            }],
          },
          mergeNode: (method, currentData, defaultMergeFunc, state, action, options, isForCollection) => {
            return defaultMergeFunc(currentData);
            // if(isForCollection){
            //   let {
            //     mergeCollection = (_, __, action) => action.data,
            //   } = options;
            //   return ({
            //     ...currentData,
            //     collection: mergeCollection(method, currentData.collection, action, options),
            //   });
            // }else{
            //   const id = action.entry.id;
            //   let {
            //     mergeMember = (_, __, action) => action.data,
            //   } = options;
            //   return ({
            //     ...currentData,
            //     byId: {
            //       ...currentData.byId,
            //       [id]: mergeMember(method, currentData.byId && currentData.byId[id], action, options),
            //     },
            //   });
            // }
          },
          mergeMember: (method, currentData, action, options) => {
            return action.data;
          },
          mergeCollection: (method, currentData, action, options) => {
            if(!currentData){
              return action.data;
            }
            const query = action.options.query;
            const users = currentData.users ? [...currentData.users] : [];
            for (let index = 0; index < query.offset; index++) {
              if(users[index] === undefined){
                // make sure that users[index] is set to undefined
                users[index] = undefined;
              }
            }
            users.splice(query.offset, query.limit, ...action.data.users);
            return {
              ...action.data,
              users,
            };
          },
        },
        epics,
        sagas,
        selectors: {
          createSelector,
          baseSelector: state => state.get('global').users,
        },
      },
    },
    ownedTasks: {
      url: '/api/users/{userId}/tasks',
      names: { model:'ownedTask', member: 'ownedTask', collection: 'ownedTasks' },
      config: {
        // actionNoRedundantBody: true,
        getId: data => data.id,
      },
      extensionConfigs: {
        epics,
        sagas,
        selectors: {
          createSelector,
          baseSelector: state => state.get('global').ownedTasks,
        },
      },
    },
  },
  setupMock: (mock) => {
    return mock
    .onGet('/api', { params: { delay: 1000 } }).reply((config) =>
      new Promise(resolve => setTimeout(() =>
        resolve([200, { url: '/api' }]), 1000)
      )
    )
    .onGet('/api').reply(200, { url: '/api' })
    .onPost('/api/users').reply(201, { url: '/api/users/1', id: 1 })
    .onGet('/api/users', { params: { offset: 0, limit: 1 } }).reply(200, { url: '/api/users', users: [{ name: 'rick', url: '/api/users/1' }], next: { offset: 1, limit: 1 } })
    .onGet('/api/users', { params: { offset: 1, limit: 1 } }).reply(200, { url: '/api/users', users: [{ name: 'foo', url: '/api/users/2' }], next: null })
    .onGet('/api/users').reply(200, { url: '/api/users' })
    .onPatch('/api/users').reply(200, { url: '/api/users' })
    .onDelete('/api/users').reply(200, { url: '/api/users' })

    .onGet('/api/users/1').reply(200, { url: '/api/users/1' })
    .onPatch('/api/users/1', { name: 'rick' }).reply(200, { name: 'rick', url: '/api/users/1' })
    .onPatch('/api/users/1').reply(200, { url: '/api/users/1' })
    .onDelete('/api/users/1').reply(200, { url: '/api/users/1' })

    .onGet('/api/users/2').reply(200, { url: '/api/users/2' })
    .onPatch('/api/users/2', { name: 'rick' }).reply(200, { name: 'foo', url: '/api/users/2' })
    .onPatch('/api/users/2').reply(200, { url: '/api/users/2' })
    .onDelete('/api/users/2').reply(200, { url: '/api/users/2' })

    .onGet('/api/users/can-be-cancel').reply((config) =>
      new Promise(resolve => setTimeout(() =>
        resolve([200, { url: '/api/users/can-be-cancel' }]), 1000)
      )
    )

    .onGet('/api/users/1/tasks/1').reply(200, { url: '/api/users/1/tasks/1' })
    .onPatch('/api/users/1/tasks/1', { name: 'develop reduxtful lib.' }).reply(200, { name: 'develop reduxtful lib.', url: '/api/users/1/tasks/1' })
    .onPatch('/api/users/1/tasks/1').reply(200, { url: '/api/users/1/tasks/1' })
    .onDelete('/api/users/1/tasks/1').reply(200, { url: '/api/users/1/tasks/1' })

    .onGet('/api/users/1/tasks/2').reply(200, { url: '/api/users/1/tasks/2' })
    .onPatch('/api/users/1/tasks/2', { name: 'develop back-end api.' }).reply(200, { name: 'develop back-end api.', url: '/api/users/1/tasks/2' })
    .onPatch('/api/users/1/tasks/2').reply(200, { url: '/api/users/1/tasks/2' })
    .onDelete('/api/users/1/tasks/2').reply(200, { url: '/api/users/1/tasks/2' })
    
    .onGet('/api/users/1/tasks/can-be-cancel').reply((config) =>
      new Promise(resolve => setTimeout(() =>
        resolve([200, { url: '/api/users/1/tasks/can-be-cancel' }]), 1000)
      )
    );
  },
};
