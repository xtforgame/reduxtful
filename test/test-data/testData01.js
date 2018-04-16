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
        // actionNoRedundantBody: true,
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
        // actionNoRedundantBody: true,
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
        // actionNoRedundantBody: true,
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
    ownedTasks: {
      url: '/api/users/{userId}/tasks',
      names: { model:'ownedTask', member: 'ownedTask', collection: 'ownedTasks' },
      config: {
        // actionNoRedundantBody: true,
        getId: data => data.id,
      },
      extensionConfigs: {
        epics: {
          getHeaders,
          responseMiddleware,
        },
        selectors: {
          baseSelector: state => state.get('global').ownedTasks,
        },
      },
    },
  },
  setupMock: (mock) => {
    return mock
    .onGet('/api/api-member-01').reply(200, { url: '/api/api-member-01' })
    .onPost('/api/users').reply(201, { url: '/api/users/1', id: 1 })
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

    .onGet('/api/users/1/tasks/1').reply(200, { url: '/api/users/1/tasks/1' })
    .onPatch('/api/users/1/tasks/1', { name: 'develop reduxtful lib.' }).reply(200, { name: 'develop reduxtful lib.', url: '/api/users/1/tasks/1' })
    .onPatch('/api/users/1/tasks/1').reply(200, { url: '/api/users/1/tasks/1' })
    .onDelete('/api/users/1/tasks/1').reply(200, { url: '/api/users/1/tasks/1' })
    
    .onGet('/api/users/1/tasks/2').reply(200, { url: '/api/users/1/tasks/2' })
    .onPatch('/api/users/1/tasks/2', { name: 'develop back-end api.' }).reply(200, { name: 'develop back-end api.', url: '/api/users/1/tasks/2' })
    .onPatch('/api/users/1/tasks/2').reply(200, { url: '/api/users/1/tasks/2' })
    .onDelete('/api/users/1/tasks/2').reply(200, { url: '/api/users/1/tasks/2' });
  },
};
