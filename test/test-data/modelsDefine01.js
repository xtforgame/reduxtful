import { getHeaders } from '../test-utils/HeaderManager';

const responseMiddleware = (response, info) => {
  if(response.status === 200 && response.data.error){
    // for some error carried by a 200 response
    return Promise.reject(response.data.error);
  }
  return Promise.resolve(response);
};

export default {
  api: {
    url: 'https://httpbin.org/anything/api',
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
    url: 'https://httpbin.org/anything/api/sessions',
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
    url: 'https://httpbin.org/anything/api/users',
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
};
