/*eslint-disable no-unused-vars, no-undef */

import chai from 'chai';
import ModelMap from 'library/ModelMap';
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

describe('CRUD Test Cases', function(){
  let mock = null;
  beforeEach(() => {
    mock = testData01.setupMock(new MockAdapter(axios));
  });

  afterEach(() => {
    mock.restore();
  });

  describe('Basic', function(){
    this.timeout(100);

    it('should be able to pass the mockStore test', () => {
      const modelMap = new ModelMap('global', testData01.modelsDefine);
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
      const modelMap = new ModelMap('global', testData01.modelsDefine);
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
        reduxCompose(
          applyMiddleware(createEpicMiddleware(epic),
          createReduxWaitForMiddleware())
        )
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
  });

  describe('Methods', function(){
    this.timeout(100);
    let store = null;
    let modelMap = null;

    beforeEach(() => {
      modelMap = new ModelMap('global', testData01.modelsDefine);
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
        reduxCompose(
          applyMiddleware(createEpicMiddleware(epic),
          createReduxWaitForMiddleware())
        )
      );
    });

    describe('Collection', function(){
      it('should be able to post collection', () => {
        return store.dispatch({
          ...modelMap.actions.postUsers({id: 1}),
          [WAIT_FOR_ACTION]: action => action.type === modelMap.types.respondPostUsers,
          [ERROR_ACTION]: action => action.type === modelMap.types.respondPostUsersError,
          [CALLBACK_ARGUMENT]: action => action,
          [CALLBACK_ERROR_ARGUMENT]: action => action,
        })
        .then(payload => {
          // console.log('payload :', payload);
          // console.log('store.getState().get("global") :', JSON.stringify(store.getState().get('global'), null, 2));
          const global = store.getState().get('global');
          expect(global).to.nested.include({'user.hierarchy.byId[1].url': '/api/users/1'});
        });
      });

      it('should be able to get collection', () => {
        return store.dispatch({
          ...modelMap.actions.getUsers(),
          [WAIT_FOR_ACTION]: action => action.type === modelMap.types.respondGetUsers,
          [ERROR_ACTION]: action => action.type === modelMap.types.respondGetUsersError,
          [CALLBACK_ARGUMENT]: action => action,
          [CALLBACK_ERROR_ARGUMENT]: action => action,
        })
        .then(payload => {
          // console.log('payload :', payload);
          // console.log('store.getState().get("global") :', JSON.stringify(store.getState().get('global'), null, 2));
          const global = store.getState().get('global');
          expect(global).to.nested.include({'user.hierarchy.collection.url': '/api/users'});
        });
      });

      it('should be able to patch collection', () => {
        return store.dispatch({
          ...modelMap.actions.patchUsers(),
          [WAIT_FOR_ACTION]: action => action.type === modelMap.types.respondPatchUsers,
          [ERROR_ACTION]: action => action.type === modelMap.types.respondPatchUsersError,
          [CALLBACK_ARGUMENT]: action => action,
          [CALLBACK_ERROR_ARGUMENT]: action => action,
        })
        .then(payload => {
          // console.log('payload :', payload);
          // console.log('store.getState().get("global") :', JSON.stringify(store.getState().get('global'), null, 2));
          const global = store.getState().get('global');
          expect(global).to.nested.include({'user.hierarchy.collection.url': '/api/users'});
        });
      });

      it('should be able to delete collection', () => {
        return store.dispatch({
          ...modelMap.actions.deleteUsers(),
          [WAIT_FOR_ACTION]: action => action.type === modelMap.types.respondDeleteUsers,
          [ERROR_ACTION]: action => action.type === modelMap.types.respondDeleteUsersError,
          [CALLBACK_ARGUMENT]: action => action,
          [CALLBACK_ERROR_ARGUMENT]: action => action,
        })
        .then(payload => {
          // console.log('payload :', payload);
          // console.log('store.getState().get("global") :', JSON.stringify(store.getState().get('global'), null, 2));
          const global = store.getState().get('global');
          expect(global).to.nested.include({'user.hierarchy.collection': null});
        });
      });

      // =================
      it('should be able to clear collection', () => {
        return store.dispatch({
          ...modelMap.actions.getUsers(),
          [WAIT_FOR_ACTION]: action => action.type === modelMap.types.respondGetUsers,
          [ERROR_ACTION]: action => action.type === modelMap.types.respondGetUsersError,
          [CALLBACK_ARGUMENT]: action => action,
          [CALLBACK_ERROR_ARGUMENT]: action => action,
        })
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
        return store.dispatch({
          ...modelMap.actions.getUser(1),
          [WAIT_FOR_ACTION]: action => action.type === modelMap.types.respondGetUser,
          [ERROR_ACTION]: action => action.type === modelMap.types.respondGetUserError,
          [CALLBACK_ARGUMENT]: action => action,
          [CALLBACK_ERROR_ARGUMENT]: action => action,
        })
        .then(payload => {
          // console.log('payload :', payload);
          // console.log('store.getState().get("global") :', JSON.stringify(store.getState().get('global'), null, 2));
          const global = store.getState().get('global');
          expect(global).to.nested.include({'user.hierarchy.byId[1].url': '/api/users/1'});
        });
      });

      it('should be able to patch member', () => {
        return store.dispatch({
          ...modelMap.actions.patchUser(1, { name: 'rick' }),
          [WAIT_FOR_ACTION]: action => action.type === modelMap.types.respondPatchUser,
          [ERROR_ACTION]: action => action.type === modelMap.types.respondPatchUserError,
          [CALLBACK_ARGUMENT]: action => action,
          [CALLBACK_ERROR_ARGUMENT]: action => action,
        })
        .then(payload => {
          // console.log('payload :', payload);
          // console.log('store.getState().get("global") :', JSON.stringify(store.getState().get('global'), null, 2));
          const global = store.getState().get('global');
          expect(global).to.nested.include({'user.hierarchy.byId[1].url': '/api/users/1'});
          expect(global).to.nested.include({'user.hierarchy.byId[1].name': 'rick'});
        });
      });

      it('should be able to delete member', () => {
        return store.dispatch({
          ...modelMap.actions.deleteUser(1),
          [WAIT_FOR_ACTION]: action => action.type === modelMap.types.respondDeleteUser,
          [ERROR_ACTION]: action => action.type === modelMap.types.respondDeleteUserError,
          [CALLBACK_ARGUMENT]: action => action,
          [CALLBACK_ERROR_ARGUMENT]: action => action,
        })
        .then(payload => {
          // console.log('payload :', payload);
          // console.log('store.getState().get("global") :', JSON.stringify(store.getState().get('global'), null, 2));
          const global = store.getState().get('global');
          expect(global).to.nested.include({'user.hierarchy.byId[1]': null});
        });
      });

      // =================

      it('should be able to clear member', () => {
        return store.dispatch({
          ...modelMap.actions.getUser(1),
          [WAIT_FOR_ACTION]: action => action.type === modelMap.types.respondGetUser,
          [ERROR_ACTION]: action => action.type === modelMap.types.respondGetUserError,
          [CALLBACK_ARGUMENT]: action => action,
          [CALLBACK_ERROR_ARGUMENT]: action => action,
        })
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
        return store.dispatch({
          ...modelMap.actions.getUser(1),
          [WAIT_FOR_ACTION]: action => action.type === modelMap.types.respondGetUser,
          [ERROR_ACTION]: action => action.type === modelMap.types.respondGetUserError,
          [CALLBACK_ARGUMENT]: action => action,
          [CALLBACK_ERROR_ARGUMENT]: action => action,
        })
        .then(payload => {
          return store.dispatch({
            ...modelMap.actions.getUser(2),
            [WAIT_FOR_ACTION]: action => action.type === modelMap.types.respondGetUser,
            [ERROR_ACTION]: action => action.type === modelMap.types.respondGetUserError,
            [CALLBACK_ARGUMENT]: action => action,
            [CALLBACK_ERROR_ARGUMENT]: action => action,
          });
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
        return store.dispatch({
          ...modelMap.actions.getOwnedTask(1, { userId: 1 }),
          [WAIT_FOR_ACTION]: action => action.type === modelMap.types.respondGetOwnedTask,
          [ERROR_ACTION]: action => action.type === modelMap.types.respondGetOwnedTaskError,
          [CALLBACK_ARGUMENT]: action => action,
          [CALLBACK_ERROR_ARGUMENT]: action => action,
        })
        .then(payload => {
          // console.log('payload :', payload);
          // console.log('store.getState().get("global") :', JSON.stringify(store.getState().get('global'), null, 2));
          const global = store.getState().get('global');
          expect(global).to.nested.include({'ownedTask.hierarchy[1].byId[1].url': '/api/users/1/tasks/1'});
        });
      });

      it('should be able to patch member', () => {
        return store.dispatch({
          ...modelMap.actions.patchOwnedTask(1, { name: 'develop reduxtful lib.' }, { userId: 1 }),
          [WAIT_FOR_ACTION]: action => action.type === modelMap.types.respondPatchOwnedTask,
          [ERROR_ACTION]: action => action.type === modelMap.types.respondPatchOwnedTaskError,
          [CALLBACK_ARGUMENT]: action => action,
          [CALLBACK_ERROR_ARGUMENT]: action => action,
        })
        .then(payload => {
          // console.log('payload :', payload);
          // console.log('store.getState().get("global") :', JSON.stringify(store.getState().get('global'), null, 2));
          const global = store.getState().get('global');
          expect(global).to.nested.include({'ownedTask.hierarchy[1].byId[1].url': '/api/users/1/tasks/1'});
          expect(global).to.nested.include({'ownedTask.hierarchy[1].byId[1].name': 'develop reduxtful lib.'});
        });
      });

      it('should be able to delete member', () => {
        return store.dispatch({
          ...modelMap.actions.deleteOwnedTask(1, { userId: 1 }),
          [WAIT_FOR_ACTION]: action => action.type === modelMap.types.respondDeleteOwnedTask,
          [ERROR_ACTION]: action => action.type === modelMap.types.respondDeleteOwnedTaskError,
          [CALLBACK_ARGUMENT]: action => action,
          [CALLBACK_ERROR_ARGUMENT]: action => action,
        })
        .then(payload => {
          // console.log('payload :', payload);
          // console.log('store.getState().get("global") :', JSON.stringify(store.getState().get('global'), null, 2));
          const global = store.getState().get('global');
          expect(global).to.nested.include({'ownedTask.hierarchy[1].byId[1]': null});
        });
      });

      // =================

      it('should be able to clear member', () => {
        return store.dispatch({
          ...modelMap.actions.getOwnedTask(1, { userId: 1 }),
          [WAIT_FOR_ACTION]: action => action.type === modelMap.types.respondGetOwnedTask,
          [ERROR_ACTION]: action => action.type === modelMap.types.respondGetOwnedTaskError,
          [CALLBACK_ARGUMENT]: action => action,
          [CALLBACK_ERROR_ARGUMENT]: action => action,
        })
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

      it('should be able to clear member', () => {
        return store.dispatch({
          ...modelMap.actions.getOwnedTask(1, { userId: 1 }),
          [WAIT_FOR_ACTION]: action => action.type === modelMap.types.respondGetOwnedTask,
          [ERROR_ACTION]: action => action.type === modelMap.types.respondGetOwnedTaskError,
          [CALLBACK_ARGUMENT]: action => action,
          [CALLBACK_ERROR_ARGUMENT]: action => action,
        })
        .then(payload => {
          return store.dispatch({
            ...modelMap.actions.getOwnedTask(2, { userId: 1 }),
            [WAIT_FOR_ACTION]: action => action.type === modelMap.types.respondGetOwnedTask,
            [ERROR_ACTION]: action => action.type === modelMap.types.respondGetOwnedTaskError,
            [CALLBACK_ARGUMENT]: action => action,
            [CALLBACK_ERROR_ARGUMENT]: action => action,
          })
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
