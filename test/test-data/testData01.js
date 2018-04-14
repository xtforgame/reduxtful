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
      names: { model:'api', member: 'api', collection: 'apis' },
      singleton: true,
      config: {
        getId: data => 'api', // data.user_id,
      },
      extensionConfigs: {
        epics: {
          getHeaders,
          responseMiddleware,
        },
      },
    },
    sessions: {
      url: '/api/sessions',
      names: { model:'session', member: 'session', collection: 'sessions' },
      config: {
        getId: data => 'me', // data.user_id,
      },
      extensionConfigs: {
        epics: {
          getHeaders,
          responseMiddleware,
        },
        selectors: {
          baseSelector: state => state.get('global').sessions,
        },
      },
    },
    users: {
      url: '/api/users',
      names: { model:'user', member: 'user', collection: 'users' },
      config: {
        getId: data => data.id,
      },
      extensionConfigs: {
        epics: {
          getHeaders,
          responseMiddleware,
        },
        selectors: {
          baseSelector: state => state.get('global').users,
        },
      },
    },
  },
  setupMock: (mock) => {
    return mock
    .onGet('/api/api-member-01').reply(200, { url: '/api/api-member-01' })
    .onPost('/api/users').reply(200, { url: '/api/users/1', id: 1 })
    .onGet('/api/users').reply(200, { url: '/api/users' })
    .onPatch('/api/users').reply(200, { url: '/api/users' })
    .onDelete('/api/users').reply(200, { url: '/api/users' });
  },
};
