/*eslint-disable no-unused-vars, no-undef */

import chai from 'chai';
import { ModelMap, defaultExtensions } from 'library';
import EpicCreator from 'library/extensions/EpicCreator';
import SelectorsCreator from 'library/extensions/SelectorsCreator';
import WaitableActionsCreator from 'library/extensions/WaitableActionsCreator';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import configureMockStore from 'redux-mock-store';
import { combineReducers, createStore, applyMiddleware, compose as reduxCompose } from 'redux';
import { combineReducers as combineImmutableReducers } from 'redux-immutable';
import createReduxWaitForMiddleware,
{
  WAIT_FOR_ACTION,
  ERROR_ACTION,
  CALLBACK_ARGUMENT,
  CALLBACK_ERROR_ARGUMENT,
} from 'redux-wait-for-action';
import { Map as ImmutableMap } from 'immutable';
import {
  createEpicMiddleware,
  combineEpics,
} from 'redux-observable';
import {
  testData01,
} from '../test-data';

const expect = chai.expect;

describe('Epic CRUD Test Cases', function(){
  let mock = null;
  beforeEach(() => {
    mock = testData01.setupMock(new MockAdapter(axios));
  });

  afterEach(() => {
    mock.restore();
  });

  describe('Basic', function(){
    this.timeout(3000);

    it('should be able to pass the mockStore test', () => {
      const modelMap = new ModelMap('global', testData01.modelsDefine, defaultExtensions.concat([EpicCreator, SelectorsCreator, WaitableActionsCreator]));
      const epic = combineEpics(...Object.keys(modelMap.epics).map(key => modelMap.epics[key]));
      const middlewares = [createEpicMiddleware(epic), createReduxWaitForMiddleware()];
      const mockStore = configureMockStore(middlewares)
      const store = mockStore(ImmutableMap({ global: {} }));

      return store.dispatch({
        ...modelMap.actions.getApi('api-member-01'),
        [WAIT_FOR_ACTION]: action => action.type === modelMap.types.respondGetApi,
        [ERROR_ACTION]: action => action.type === modelMap.types.respondGetApiError,
        [CALLBACK_ARGUMENT]: action => action,
        [CALLBACK_ERROR_ARGUMENT]: action => action,
      })
      .then(payload => {
        // console.log('payload :', payload);
      });
    });

    it('should be able to pass the real redux with immutable reducers test', () => {
      const modelMap = new ModelMap('global', testData01.modelsDefine, defaultExtensions.concat([EpicCreator, SelectorsCreator, WaitableActionsCreator]));
      // console.log('modelMap.actions :', modelMap.actions);
      expect(modelMap).to.be.an.instanceof(ModelMap);

      const epic = combineEpics(...Object.keys(modelMap.epics).map(key => modelMap.epics[key]));
      const store =  createStore(
        combineImmutableReducers({
          global: combineReducers({
            api: modelMap.reducers.apiReducer,
            user: modelMap.reducers.userReducer,
            session: modelMap.reducers.sessionReducer,
            ownedTask: modelMap.reducers.ownedTaskReducer,
          }),
        }),
        ImmutableMap({ global: {} }),
        reduxCompose(applyMiddleware(createEpicMiddleware(epic), createReduxWaitForMiddleware()))
      );
      return store.dispatch({
        ...modelMap.actions.getApi('api-member-01'),
        [WAIT_FOR_ACTION]: action => action.type === modelMap.types.respondGetApi,
        [ERROR_ACTION]: action => action.type === modelMap.types.respondGetApiError,
        [CALLBACK_ARGUMENT]: action => action,
        [CALLBACK_ERROR_ARGUMENT]: action => action,
      })
      .then(payload => {
        // console.log('payload :', payload);
        // console.log('store.getState().get("global") :', JSON.stringify(store.getState().get('global'), null, 2));
        const global = store.getState().get('global');
        expect(global).to.nested.include({'api.hierarchy.byId.api-member-01.url': '/api/api-member-01'});
      });
    });

    it('should be able to cancel', () => {
      const modelMap = new ModelMap('global', testData01.modelsDefine, defaultExtensions.concat([EpicCreator, SelectorsCreator, WaitableActionsCreator]));
      // console.log('modelMap.actions :', modelMap.actions);
      expect(modelMap).to.be.an.instanceof(ModelMap);

      const epic = combineEpics(...Object.keys(modelMap.epics).map(key => modelMap.epics[key]));
      const store =  createStore(
        combineImmutableReducers({
          global: combineReducers({
            api: modelMap.reducers.apiReducer,
            user: modelMap.reducers.userReducer,
            session: modelMap.reducers.sessionReducer,
            ownedTask: modelMap.reducers.ownedTaskReducer,
          }),
        }),
        ImmutableMap({ global: {} }),
        reduxCompose(applyMiddleware(createEpicMiddleware(epic), createReduxWaitForMiddleware()))
      );
      const p = store.dispatch({
        ...modelMap.actions.getApi('api-can-be-cancel'),
        [WAIT_FOR_ACTION]: action => action.type === modelMap.types.respondGetApi,
        [ERROR_ACTION]: action => action.type === modelMap.types.respondGetApiError || action.type === modelMap.types.cancelGetApi,
        [CALLBACK_ARGUMENT]: action => action,
        [CALLBACK_ERROR_ARGUMENT]: action => action,
      })
      .then(() => {
        return Promise.reject('not be canceled');
      })
      .catch(action => {
        if(action === 'not be canceled'){
          return Promise.reject('not be canceled');
        }
        expect(action).to.nested.include({type: modelMap.types.cancelGetApi});
      });
      store.dispatch(modelMap.actions.cancelGetApi('api-can-be-cancel'));
      return p;
    });
  });

  describe('Methods', function(){
    this.timeout(100);
    let store = null;
    let modelMap = null;

    beforeEach(() => {
      modelMap = new ModelMap('global', testData01.modelsDefine, defaultExtensions.concat([EpicCreator, SelectorsCreator, WaitableActionsCreator]));
      // console.log('modelMap.actions :', modelMap.actions);
      expect(modelMap).to.be.an.instanceof(ModelMap);

      const epic = combineEpics(...Object.keys(modelMap.epics).map(key => modelMap.epics[key]));
      store =  createStore(
        combineImmutableReducers({
          global: combineReducers({
            api: modelMap.reducers.apiReducer,
            user: modelMap.reducers.userReducer,
            session: modelMap.reducers.sessionReducer,
            ownedTask: modelMap.reducers.ownedTaskReducer,
          }),
        }),
        ImmutableMap({ global: {} }),
        reduxCompose(applyMiddleware(createEpicMiddleware(epic), createReduxWaitForMiddleware()))
      );
    });

    describe('Collection', function(){
      it('should be able to post collection', () => {
        return store.dispatch(modelMap.waitableActions.postUsers({id: 1}))
        .then(payload => {
          // console.log('payload :', payload);
          // console.log('store.getState().get("global") :', JSON.stringify(store.getState().get('global'), null, 2));
          const global = store.getState().get('global');
          expect(global).to.nested.include({'user.hierarchy.byId[1].url': '/api/users/1'});
        });
      });

      it('should be able to get collection', () => {
        return store.dispatch(modelMap.waitableActions.getUsers())
        .then(payload => {
          // console.log('payload :', payload);
          // console.log('store.getState().get("global") :', JSON.stringify(store.getState().get('global'), null, 2));
          const global = store.getState().get('global');
          expect(global).to.nested.include({'user.hierarchy.collection.url': '/api/users'});
        });
      });

      it('should be able to patch collection', () => {
        return store.dispatch(modelMap.waitableActions.patchUsers())
        .then(payload => {
          // console.log('payload :', payload);
          // console.log('store.getState().get("global") :', JSON.stringify(store.getState().get('global'), null, 2));
          const global = store.getState().get('global');
          expect(global).to.nested.include({'user.hierarchy.collection.url': '/api/users'});
        });
      });

      it('should be able to delete collection', () => {
        return store.dispatch(modelMap.waitableActions.deleteUsers())
        .then(payload => {
          // console.log('payload :', payload);
          // console.log('store.getState().get("global") :', JSON.stringify(store.getState().get('global'), null, 2));
          const global = store.getState().get('global');
          expect(global).to.nested.include({'user.hierarchy.collection': null});
        });
      });

      it('should be able to cancel', () => {
        const p = store.dispatch(modelMap.waitableActions.getUsers())
        .then(() => {
          return Promise.reject('not be canceled');
        })
        .catch(action => {
          if(action === 'not be canceled'){
            return Promise.reject('not be canceled');
          }
          expect(action).to.nested.include({type: modelMap.types.cancelGetUsers});
        });
        store.dispatch(modelMap.actions.cancelGetUsers());
        return p;
      });

      // =================
      it('should be able to clear collection', () => {
        return store.dispatch(modelMap.waitableActions.getUsers())
        .then(payload => {
          // console.log('payload :', payload);
          // console.log('store.getState().get("global") :', JSON.stringify(store.getState().get('global'), null, 2));
          let global = store.getState().get('global');
          expect(global).to.nested.include({'user.hierarchy.collection.url': '/api/users'});

          store.dispatch(modelMap.actions.clearUsersCache());
          global = store.getState().get('global');
          expect(global).to.nested.include({'user.hierarchy.collection': null});
        });
      });
    });

    describe('Member', function(){
      it('should be able to get member', () => {
        return store.dispatch(modelMap.waitableActions.getUser(1))
        .then(payload => {
          // console.log('payload :', payload);
          // console.log('store.getState().get("global") :', JSON.stringify(store.getState().get('global'), null, 2));
          const global = store.getState().get('global');
          expect(global).to.nested.include({'user.hierarchy.byId[1].url': '/api/users/1'});
        });
      });

      it('should be able to patch member', () => {
        return store.dispatch(modelMap.waitableActions.patchUser(1, { name: 'rick' }))
        .then(payload => {
          // console.log('payload :', payload);
          // console.log('store.getState().get("global") :', JSON.stringify(store.getState().get('global'), null, 2));
          const global = store.getState().get('global');
          expect(global).to.nested.include({'user.hierarchy.byId[1].url': '/api/users/1'});
          expect(global).to.nested.include({'user.hierarchy.byId[1].name': 'rick'});
        });
      });

      it('should be able to delete member', () => {
        return store.dispatch(modelMap.waitableActions.deleteUser(1))
        .then(payload => {
          // console.log('payload :', payload);
          // console.log('store.getState().get("global") :', JSON.stringify(store.getState().get('global'), null, 2));
          const global = store.getState().get('global');
          expect(global).to.nested.include({'user.hierarchy.byId[1]': null});
        });
      });

      it('should be able to cancel', () => {
        const p = store.dispatch(modelMap.waitableActions.getUser('can-be-cancel'))
        .then(() => {
          return Promise.reject('not be canceled');
        })
        .catch(action => {
          if(action === 'not be canceled'){
            return Promise.reject('not be canceled');
          }
          expect(action).to.nested.include({type: modelMap.types.cancelGetUser});
        });
        store.dispatch(modelMap.actions.cancelGetUser('can-be-cancel'));
        return p;
      });

      // =================

      it('should be able to clear member', () => {
        return store.dispatch(modelMap.waitableActions.getUser(1))
        .then(payload => {
          // console.log('payload :', payload);
          // console.log('store.getState().get("global") :', JSON.stringify(store.getState().get('global'), null, 2));
          let global = store.getState().get('global');
          expect(global).to.nested.include({'user.hierarchy.byId[1].url': '/api/users/1'});

          store.dispatch(modelMap.actions.clearUserCache(1));
          global = store.getState().get('global');
          expect(global).to.nested.include({'user.hierarchy.byId[1]': null});
        });
      });

      it('should be able to clear each member', () => {
        return store.dispatch(modelMap.waitableActions.getUser(1))
        .then(payload => {
          return store.dispatch(modelMap.waitableActions.getUser(2));
        })
        .then(payload => {
          // console.log('payload :', payload);
          // console.log('store.getState().get("global") :', JSON.stringify(store.getState().get('global'), null, 2));
          let global = store.getState().get('global');
          expect(global).to.nested.include({'user.hierarchy.byId[1].url': '/api/users/1'});
          expect(global).to.nested.include({'user.hierarchy.byId[2].url': '/api/users/2'});

          store.dispatch(modelMap.actions.clearEachUserCache());
          global = store.getState().get('global');
          expect(global).to.not.have.nested.property('user.hierarchy.byId[1]');
          expect(global).to.not.have.nested.property('user.hierarchy.byId[2]');
        });
      });
    });

    describe('Deep Member', function(){
      it('should be able to get member', () => {
        return store.dispatch(modelMap.waitableActions.getOwnedTask(1, { userId: 1 }))
        .then(payload => {
          // console.log('payload :', payload);
          // console.log('store.getState().get("global") :', JSON.stringify(store.getState().get('global'), null, 2));
          const global = store.getState().get('global');
          expect(global).to.nested.include({'ownedTask.hierarchy[1].byId[1].url': '/api/users/1/tasks/1'});
        });
      });

      it('should be able to patch member', () => {
        return store.dispatch(modelMap.waitableActions.patchOwnedTask(1, { name: 'develop reduxtful lib.' }, { userId: 1 }, {}))
        .then(payload => {
          // console.log('payload :', payload);
          // console.log('store.getState().get("global") :', JSON.stringify(store.getState().get('global'), null, 2));
          const global = store.getState().get('global');
          expect(global).to.nested.include({'ownedTask.hierarchy[1].byId[1].url': '/api/users/1/tasks/1'});
          expect(global).to.nested.include({'ownedTask.hierarchy[1].byId[1].name': 'develop reduxtful lib.'});
        });
      });

      it('should be able to delete member', () => {
        return store.dispatch(modelMap.waitableActions.deleteOwnedTask(1, { userId: 1 }))
        .then(payload => {
          // console.log('payload :', payload);
          // console.log('store.getState().get("global") :', JSON.stringify(store.getState().get('global'), null, 2));
          const global = store.getState().get('global');
          expect(global).to.nested.include({'ownedTask.hierarchy[1].byId[1]': null});
        });
      });

      it('should be able to cancel', () => {
        const p = store.dispatch(modelMap.waitableActions.getOwnedTask(1, { userId: 1 }))
        .then(() => {
          return Promise.reject('not be canceled');
        })
        .catch(action => {
          if(action === 'not be canceled'){
            return Promise.reject('not be canceled');
          }
          expect(action).to.nested.include({type: modelMap.types.cancelGetOwnedTask});
        });
        store.dispatch(modelMap.actions.cancelGetOwnedTask(1, { userId: 1 }));
        return p;
      });

      // =================

      it('should be able to clear member', () => {
        return store.dispatch(modelMap.waitableActions.getOwnedTask(1, { userId: 1 }))
        .then(payload => {
          // console.log('payload :', payload);
          // console.log('store.getState().get("global") :', JSON.stringify(store.getState().get('global'), null, 2));
          let global = store.getState().get('global');
          expect(global).to.nested.include({'ownedTask.hierarchy[1].byId[1].url': '/api/users/1/tasks/1'});

          store.dispatch(modelMap.actions.clearOwnedTaskCache(1, { userId: 1 }));
          global = store.getState().get('global');
          expect(global).to.nested.include({'ownedTask.hierarchy[1].byId[1]': null});
        });
      });

      it('should be able to clear each member', () => {
        return store.dispatch(modelMap.waitableActions.getOwnedTask(1, { userId: 1 }))
        .then(payload => {
          return store.dispatch(modelMap.waitableActions.getOwnedTask(2, { userId: 1 }))
        })
        .then(payload => {
          // console.log('payload :', payload);
          // console.log('store.getState().get("global") :', JSON.stringify(store.getState().get('global'), null, 2));
          let global = store.getState().get('global');
          expect(global).to.nested.include({'ownedTask.hierarchy[1].byId[1].url': '/api/users/1/tasks/1'});
          expect(global).to.nested.include({'ownedTask.hierarchy[1].byId[2].url': '/api/users/1/tasks/2'});

          store.dispatch(modelMap.actions.clearEachOwnedTaskCache({ userId: 1 }));
          global = store.getState().get('global');
          expect(global).to.not.have.nested.property('ownedTask.hierarchy[1].byId[1]');
          expect(global).to.not.have.nested.property('ownedTask.hierarchy[1].byId[2]');
        });
      });
    });
  });
});
