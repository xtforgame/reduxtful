import { getHeaders } from '../test-utils/HeaderManager';

const responseMiddleware = (response, info) => {
  if(response.status === 200 && response.data.error){
    // for some error carried by a 200 response
    return Promise.reject(response.data.error);
  }
  return Promise.resolve(response);
};

export default {
  modelsDefine: {
    api: {
      url: '/api',
      names: { singular: 'api', plural: 'apis' },
      singleton: true,
      extensionConfigs: {
        epics: {
          getHeaders,
          responseMiddleware,
        },
        reducers: {
          getId: action => 'api', // action.data.user_id,
        },
      },
    },
    sessions: {
      url: '/api/sessions',
      names: { singular: 'session', plural: 'sessions' },
      extensionConfigs: {
        epics: {
          getHeaders,
          responseMiddleware,
        },
        selectors: {
          baseSelector: state => state.get('global').sessions,
        },
        reducers: {
          getId: action => 'me', // action.data.user_id,
        },
      },
    },
    users: {
      url: '/api/users',
      names: { singular: 'user', plural: 'users' },
      extensionConfigs: {
        epics: {
          getHeaders,
          responseMiddleware,
        },
        selectors: {
          baseSelector: state => state.get('global').users,
        },
        reducers: {
          getId: action => action.data.id,
        },
      },
    },
  },
  setupMock: (mock) => {
    return mock
    .onGet('/api/ssss').reply(200, { url: '/api/ssss' })
    .onPost('/api/users').reply(200, { url: '/api/users/1', id: 1 })
    .onGet('/api/users').reply(200, { url: '/api/users' })
    .onPatch('/api/users').reply(200, { url: '/api/users' })
    .onDelete('/api/users').reply(200, { url: '/api/users' });
  },
};
