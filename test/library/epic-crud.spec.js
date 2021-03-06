/* eslint-disable no-unused-vars, no-undef, prefer-promise-reject-errors, consistent-return */

import chai from 'chai';
import { ModelMap, defaultExtensions } from 'library';
import EpicCreator from 'library/extensions/EpicCreator';
import SelectorsCreator from 'library/extensions/SelectorsCreator';
import WaitableActionsCreator from 'library/extensions/WaitableActionsCreator';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import configureMockStore from 'redux-mock-store';
import {
  combineReducers, createStore, applyMiddleware, compose as reduxCompose,
} from 'redux';
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

const { expect } = chai;

describe('Epic CRUD Test Cases', () => {
  let mock = null;
  beforeEach(() => {
    mock = testData01.setupMock(new MockAdapter(axios));
  });

  afterEach(() => {
    mock.restore();
  });

  describe('Basic', function () {
    this.timeout(3000);

    it('should be able to pass the mockStore test', () => {
      const modelMap = new ModelMap('global', testData01.modelsDefine, defaultExtensions.concat([EpicCreator, SelectorsCreator, WaitableActionsCreator]));
      const epic = combineEpics(...Object.keys(modelMap.epics).map(key => modelMap.epics[key]));
      const epicMiddleware = createEpicMiddleware();
      const middlewares = [epicMiddleware, createReduxWaitForMiddleware()];
      const mockStore = configureMockStore(middlewares);
      const store = mockStore(ImmutableMap({ global: {} }));
      epicMiddleware.run(epic);

      return store.dispatch({
        ...modelMap.actions.getApi(),
        [WAIT_FOR_ACTION]: action => action.type === modelMap.types.respondGetApi,
        [ERROR_ACTION]: action => action.type === modelMap.types.respondGetApiError,
        [CALLBACK_ARGUMENT]: action => action,
        [CALLBACK_ERROR_ARGUMENT]: action => action,
      })
      .then((payload) => {
        // console.log('payload :', payload);
      });
    });

    it('should be able to pass the real redux with immutable reducers test', () => {
      const modelMap = new ModelMap('global', testData01.modelsDefine, defaultExtensions.concat([EpicCreator, SelectorsCreator, WaitableActionsCreator]));
      // console.log('modelMap.actions :', modelMap.actions);
      expect(modelMap).to.be.an.instanceof(ModelMap);

      const epic = combineEpics(...Object.keys(modelMap.epics).map(key => modelMap.epics[key]));
      const epicMiddleware = createEpicMiddleware();
      const store = createStore(
        combineImmutableReducers({
          global: combineReducers({
            api: modelMap.reducers.apiReducer,
            user: modelMap.reducers.userReducer,
            session: modelMap.reducers.sessionReducer,
            ownedTask: modelMap.reducers.ownedTaskReducer,
          }),
        }),
        ImmutableMap({ global: {} }),
        reduxCompose(applyMiddleware(epicMiddleware, createReduxWaitForMiddleware()))
      );
      epicMiddleware.run(epic);
      return store.dispatch({
        ...modelMap.actions.getApi(),
        [WAIT_FOR_ACTION]: action => action.type === modelMap.types.respondGetApi,
        [ERROR_ACTION]: action => action.type === modelMap.types.respondGetApiError,
        [CALLBACK_ARGUMENT]: action => action,
        [CALLBACK_ERROR_ARGUMENT]: action => action,
      })
      .then((payload) => {
        // console.log('payload :', payload);
        // console.log('store.getState().get("global") :', JSON.stringify(store.getState().get('global'), null, 2));
        const global = store.getState().get('global');
        expect(global).to.nested.include({ 'api.hierarchy.collection.url': '/api' });
      });
    });

    it('should be able to cancel', () => {
      const modelMap = new ModelMap('global', testData01.modelsDefine, defaultExtensions.concat([EpicCreator, SelectorsCreator, WaitableActionsCreator]));
      // console.log('modelMap.actions :', modelMap.actions);
      expect(modelMap).to.be.an.instanceof(ModelMap);

      const epic = combineEpics(...Object.keys(modelMap.epics).map(key => modelMap.epics[key]));
      const epicMiddleware = createEpicMiddleware();
      const store = createStore(
        combineImmutableReducers({
          global: combineReducers({
            api: modelMap.reducers.apiReducer,
            user: modelMap.reducers.userReducer,
            session: modelMap.reducers.sessionReducer,
            ownedTask: modelMap.reducers.ownedTaskReducer,
          }),
        }),
        ImmutableMap({ global: {} }),
        reduxCompose(applyMiddleware(epicMiddleware, createReduxWaitForMiddleware()))
      );
      epicMiddleware.run(epic);
      const p = store.dispatch({
        ...modelMap.actions.getApi({}, { query: { delay: 1000 } }),
        [WAIT_FOR_ACTION]: action => action.type === modelMap.types.respondGetApi,
        [ERROR_ACTION]: action => action.type === modelMap.types.respondGetApiError || action.type === modelMap.types.cancelGetApi, // eslint-disable-line max-len
        [CALLBACK_ARGUMENT]: action => action,
        [CALLBACK_ERROR_ARGUMENT]: action => action,
      })
      .then(() => Promise.reject('not be canceled'))
      .catch((action) => {
        if (action === 'not be canceled') {
          return Promise.reject('not be canceled');
        }
        expect(action).to.nested.include({ type: modelMap.types.cancelGetApi });
      });
      setTimeout(() => {
        store.dispatch(modelMap.actions.cancelGetApi());
      }, 30);

      return p;
    });
  });

  describe('Methods', function () {
    this.timeout(100);
    let store = null;
    let modelMap = null;

    beforeEach(() => {
      modelMap = new ModelMap('global', testData01.modelsDefine, defaultExtensions.concat([EpicCreator, SelectorsCreator, WaitableActionsCreator]));
      // console.log('modelMap.actions :', modelMap.actions);
      expect(modelMap).to.be.an.instanceof(ModelMap);

      const epic = combineEpics(...Object.keys(modelMap.epics).map(key => modelMap.epics[key]));
      const epicMiddleware = createEpicMiddleware();
      store = createStore(
        combineImmutableReducers({
          global: combineReducers({
            api: modelMap.reducers.apiReducer,
            user: modelMap.reducers.userReducer,
            session: modelMap.reducers.sessionReducer,
            ownedTask: modelMap.reducers.ownedTaskReducer,
          }),
        }),
        ImmutableMap({ global: {} }),
        reduxCompose(applyMiddleware(epicMiddleware, createReduxWaitForMiddleware()))
      );
      epicMiddleware.run(epic);
    });

    describe('Collection', () => {
      it('should be able to post collection', () => store.dispatch(modelMap.waitableActions.postUsers({ id: 1 }))
        .then((payload) => {
          // console.log('payload :', payload);
          // console.log('store.getState().get("global") :', JSON.stringify(store.getState().get('global'), null, 2));
          const global = store.getState().get('global');
          expect(global).to.nested.include({ 'user.hierarchy.byId[1].url': '/api/users/1' });
        }));

      it('should be able to get collection', () => store.dispatch(modelMap.waitableActions.getUsers())
        .then((payload) => {
          // console.log('payload :', payload);
          // console.log('store.getState().get("global") :', JSON.stringify(store.getState().get('global'), null, 2));
          const global = store.getState().get('global');
          expect(global).to.nested.include({ 'user.hierarchy.collection.url': '/api/users' });
          // for the updateMembersByCollection feature
          expect(global).to.nested.include({ 'user.hierarchy.byId[0].name': 'rick' });
          expect(global).to.nested.include({ 'user.hierarchy.byId[1].name': 'foo' });
        }));

      it('should be able to merge collection by a custom function', () => store.dispatch(modelMap.waitableActions.getUsers({}, { query: { offset: 0, limit: 1 } }))
        .then((payload) => {
          // console.log('payload :', payload);
          // console.log('store.getState().get("global") :', JSON.stringify(store.getState().get('global'), null, 2));
          const global = store.getState().get('global');
          expect(global).to.nested.include({ 'user.hierarchy.collection.url': '/api/users' });
          expect(global).to.nested.include({ 'user.hierarchy.collection.users[0].name': 'rick' });
          expect(global).to.nested.include({ 'user.hierarchy.collection.users[0].url': '/api/users/1' });
          expect(global).to.nested.include({ 'user.hierarchy.collection.next.offset': 1 });
          expect(global).to.nested.include({ 'user.hierarchy.collection.next.limit': 1 });
          return store.dispatch(modelMap.waitableActions.getUsers(
            {},
            { query: global.user.hierarchy.collection.next }
          ));
        })
        .then((payload) => {
          // console.log('payload :', payload);
          // console.log('store.getState().get("global") :', JSON.stringify(store.getState().get('global'), null, 2));
          const global = store.getState().get('global');
          expect(global).to.nested.include({ 'user.hierarchy.collection.url': '/api/users' });
          expect(global).to.nested.include({ 'user.hierarchy.collection.users[0].name': 'rick' });
          expect(global).to.nested.include({ 'user.hierarchy.collection.users[0].url': '/api/users/1' });

          expect(global).to.nested.include({ 'user.hierarchy.collection.url': '/api/users' });
          expect(global).to.nested.include({ 'user.hierarchy.collection.users[1].name': 'foo' });
          expect(global).to.nested.include({ 'user.hierarchy.collection.users[1].url': '/api/users/2' });
          expect(global).to.nested.include({ 'user.hierarchy.collection.next': null });
        }));

      it('should be able to patch collection', () => store.dispatch(modelMap.waitableActions.patchUsers())
        .then((payload) => {
          // console.log('payload :', payload);
          // console.log('store.getState().get("global") :', JSON.stringify(store.getState().get('global'), null, 2));
          const global = store.getState().get('global');
          expect(global).to.nested.include({ 'user.hierarchy.collection.url': '/api/users' });
        }));

      it('should be able to delete collection', () => store.dispatch(modelMap.waitableActions.deleteUsers())
        .then((payload) => {
          // console.log('payload :', payload);
          // console.log('store.getState().get("global") :', JSON.stringify(store.getState().get('global'), null, 2));
          const global = store.getState().get('global');
          expect(global).to.nested.include({ 'user.hierarchy.collection': null });
        }));

      it('should be able to cancel', () => {
        const p = store.dispatch(modelMap.waitableActions.getUsers())
        .then(() => Promise.reject('not be canceled'))
        .catch((action) => {
          if (action === 'not be canceled') {
            return Promise.reject('not be canceled');
          }
          expect(action).to.nested.include({ type: modelMap.types.cancelGetUsers });
        });
        store.dispatch(modelMap.actions.cancelGetUsers());
        return p;
      });

      // =================
      it('should be able to clear collection', () => store.dispatch(modelMap.waitableActions.getUsers())
        .then((payload) => {
          // console.log('payload :', payload);
          // console.log('store.getState().get("global") :', JSON.stringify(store.getState().get('global'), null, 2));
          let global = store.getState().get('global');
          expect(global).to.nested.include({ 'user.hierarchy.collection.url': '/api/users' });

          store.dispatch(modelMap.actions.clearUsersCache());
          global = store.getState().get('global');
          expect(global).to.nested.include({ 'user.hierarchy.collection': null });
        }));

      it('should be able to select collection', () => {
        store.dispatch(modelMap.actions.selectUserPath());
        const global = store.getState().get('global');
        expect(global).to.have.nested.property('user.selection.entry');
        expect(global).to.nested.include({ 'user.selection.entry.id': undefined });
        expect(global).to.have.nested.property('user.selection.entryPath');
        expect(global).to.nested.include({ 'user.selection.id': undefined });
        return true;
      });
    });

    describe('Member', () => {
      it('should be able to get member', () => store.dispatch(modelMap.waitableActions.getUser(1))
        .then((payload) => {
          // console.log('payload :', payload);
          // console.log('store.getState().get("global") :', JSON.stringify(store.getState().get('global'), null, 2));
          const global = store.getState().get('global');
          expect(global).to.nested.include({ 'user.hierarchy.byId[1].url': '/api/users/1' });
        }));

      it('should be able to patch member', () => store.dispatch(modelMap.waitableActions.patchUser(1, { name: 'rick' }))
        .then((payload) => {
          // console.log('payload :', payload);
          // console.log('store.getState().get("global") :', JSON.stringify(store.getState().get('global'), null, 2));
          const global = store.getState().get('global');
          expect(global).to.nested.include({ 'user.hierarchy.byId[1].url': '/api/users/1' });
          expect(global).to.nested.include({ 'user.hierarchy.byId[1].name': 'rick' });
        }));

      it('should be able to delete member', () => store.dispatch(modelMap.waitableActions.deleteUser(1))
        .then((payload) => {
          // console.log('payload :', payload);
          // console.log('store.getState().get("global") :', JSON.stringify(store.getState().get('global'), null, 2));
          const global = store.getState().get('global');
          expect(global).to.not.have.nested.property('user.hierarchy.byId[1]');
        }));

      it('should be able to cancel', () => {
        const p = store.dispatch(modelMap.waitableActions.getUser('can-be-cancel'))
        .then(() => Promise.reject('not be canceled'))
        .catch((action) => {
          if (action === 'not be canceled') {
            return Promise.reject('not be canceled');
          }
          expect(action).to.nested.include({ type: modelMap.types.cancelGetUser });
        });
        store.dispatch(modelMap.actions.cancelGetUser('can-be-cancel'));
        return p;
      });

      // =================

      it('should be able to clear member', () => store.dispatch(modelMap.waitableActions.getUser(1))
        .then((payload) => {
          // console.log('payload :', payload);
          // console.log('store.getState().get("global") :', JSON.stringify(store.getState().get('global'), null, 2));
          let global = store.getState().get('global');
          expect(global).to.nested.include({ 'user.hierarchy.byId[1].url': '/api/users/1' });

          store.dispatch(modelMap.actions.clearUserCache(1));
          global = store.getState().get('global');
          expect(global).to.not.have.nested.property('user.hierarchy.byId[1]');
        }));

      it('should be able to clear each member', () => store.dispatch(modelMap.waitableActions.getUser(1))
        .then(payload => store.dispatch(modelMap.waitableActions.getUser(2)))
        .then((payload) => {
          // console.log('payload :', payload);
          // console.log('store.getState().get("global") :', JSON.stringify(store.getState().get('global'), null, 2));
          let global = store.getState().get('global');
          expect(global).to.nested.include({ 'user.hierarchy.byId[1].url': '/api/users/1' });
          expect(global).to.nested.include({ 'user.hierarchy.byId[2].url': '/api/users/2' });

          store.dispatch(modelMap.actions.clearEachUserCache());
          global = store.getState().get('global');
          expect(global).to.not.have.nested.property('user.hierarchy.byId[1]');
          expect(global).to.not.have.nested.property('user.hierarchy.byId[2]');
        }));

      it('should be able to select member', () => {
        store.dispatch(modelMap.actions.selectUserPath(1));
        const global = store.getState().get('global');
        expect(global).to.have.nested.property('user.selection.entry');
        expect(global).to.nested.include({ 'user.selection.entry.id': 1 });
        expect(global).to.have.nested.property('user.selection.entryPath');
        expect(global).to.nested.include({ 'user.selection.id': 1 });
        return true;
      });
    });

    describe('Deep Member', () => {
      it('should be able to get member', () => store.dispatch(modelMap.waitableActions.getOwnedTask(1, { userId: 1 }))
        .then((payload) => {
          // console.log('payload :', payload);
          // console.log('store.getState().get("global") :', JSON.stringify(store.getState().get('global'), null, 2));
          const global = store.getState().get('global');
          expect(global).to.nested.include({ 'ownedTask.hierarchy[1].byId[1].url': '/api/users/1/tasks/1' });
          expect(global).to.nested.include({ 'ownedTask.hierarchy[1].entryInfo.map.userId': 1 });
        }));

      it('should be able to patch member', () => store.dispatch(modelMap.waitableActions.patchOwnedTask(1, { name: 'develop reduxtful lib.' }, { userId: 1 }, {}))
        .then((payload) => {
          // console.log('payload :', payload);
          // console.log('store.getState().get("global") :', JSON.stringify(store.getState().get('global'), null, 2));
          const global = store.getState().get('global');
          expect(global).to.nested.include({ 'ownedTask.hierarchy[1].byId[1].url': '/api/users/1/tasks/1' });
          expect(global).to.nested.include({ 'ownedTask.hierarchy[1].byId[1].name': 'develop reduxtful lib.' });
          expect(global).to.nested.include({ 'ownedTask.hierarchy[1].entryInfo.map.userId': 1 });
        }));

      it('should be able to delete member', () => store.dispatch(modelMap.waitableActions.deleteOwnedTask(1, { userId: 1 }))
        .then((payload) => {
          // console.log('payload :', payload);
          // console.log('store.getState().get("global") :', JSON.stringify(store.getState().get('global'), null, 2));
          const global = store.getState().get('global');
          expect(global).to.not.have.nested.property('ownedTask.hierarchy[1].byId[1]');
        }));

      it('should be able to cancel', () => {
        const p = store.dispatch(modelMap.waitableActions.getOwnedTask(1, { userId: 1 }))
        .then(() => Promise.reject('not be canceled'))
        .catch((action) => {
          if (action === 'not be canceled') {
            return Promise.reject('not be canceled');
          }
          expect(action).to.nested.include({ type: modelMap.types.cancelGetOwnedTask });
        });
        store.dispatch(modelMap.actions.cancelGetOwnedTask(1, { userId: 1 }));
        return p;
      });

      // =================

      it('should be able to clear member', () => store.dispatch(modelMap.waitableActions.getOwnedTask(1, { userId: 1 }))
        .then((payload) => {
          // console.log('payload :', payload);
          // console.log('store.getState().get("global") :', JSON.stringify(store.getState().get('global'), null, 2));
          let global = store.getState().get('global');
          expect(global).to.nested.include({ 'ownedTask.hierarchy[1].byId[1].url': '/api/users/1/tasks/1' });

          store.dispatch(modelMap.actions.clearOwnedTaskCache(1, { userId: 1 }));
          global = store.getState().get('global');
          expect(global).to.not.have.nested.property('ownedTask.hierarchy[1].byId[1]');
        }));

      it('should be able to clear each member', () => store.dispatch(modelMap.waitableActions.getOwnedTask(1, { userId: 1 }))
        .then(payload => store.dispatch(modelMap.waitableActions.getOwnedTask(2, { userId: 1 })))
        .then((payload) => {
          // console.log('payload :', payload);
          // console.log('store.getState().get("global") :', JSON.stringify(store.getState().get('global'), null, 2));
          let global = store.getState().get('global');
          expect(global).to.nested.include({ 'ownedTask.hierarchy[1].byId[1].url': '/api/users/1/tasks/1' });
          expect(global).to.nested.include({ 'ownedTask.hierarchy[1].byId[2].url': '/api/users/1/tasks/2' });

          store.dispatch(modelMap.actions.clearEachOwnedTaskCache({ userId: 1 }));
          global = store.getState().get('global');
          expect(global).to.not.have.nested.property('ownedTask.hierarchy[1].byId[1]');
          expect(global).to.not.have.nested.property('ownedTask.hierarchy[1].byId[2]');
        }));

      it('should be able to select deep member', () => {
        store.dispatch(modelMap.actions.selectOwnedTaskPath(1, { userId: 2 }));
        const global = store.getState().get('global');
        expect(global).to.have.nested.property('ownedTask.selection.entry');
        expect(global).to.nested.include({ 'ownedTask.selection.entry.id': 1 });
        expect(global).to.nested.include({ 'ownedTask.selection.entry.userId': 2 });
        expect(global).to.have.nested.property('ownedTask.selection.entryPath');
        expect(global).to.nested.include({ 'ownedTask.selection.entryPath[0]': 2 });
        expect(global).to.nested.include({ 'ownedTask.selection.id': 1 });
        return true;
      });
    });
  });
});
