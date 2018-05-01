import { getHeaders } from '../test-utils/HeaderManager';
import axios from 'axios';
import { Observable } from 'rxjs';
import { takeEvery, call, put, race, take } from 'redux-saga/effects';
import { createSelector } from 'reselect';

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
  responseMiddleware,
}

const sagas = {
  axios,
  effects: { takeEvery, call, put, race, take },
  getHeaders,
  responseMiddleware,
}

export default {
  modelsDefine: {
    api: {
      url: '/api',
      names: { model:'api', member: 'api', collection: 'apis' },
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
          globalMiddlewares: [(state, action, options, next) => {
            return next();
          }],
          collectionMiddlewares: [(state, action, options, next) => {
            return next();
          }],
          memberMiddlewares: [(state, action, options, next) => {
            return next();
          }],
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
    .onGet('/api/api-member-01').reply(200, { url: '/api/api-member-01' })
    .onGet('/api/api-can-be-cancel').reply((config) =>
      new Promise(resolve => setTimeout(() =>
        resolve([200, { url: '/api/api-can-be-cancel' }]), 1000)
      )
    )
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
