export const toNull = () => ({ type: 'TO_NULL' });

export const createRespondActionCreatorForCollection = (actions, startAction) => (response) => actions.respond(
  response.data,
  startAction.entry,
  {
    timestamp: new Date().getTime(),
    transferables: startAction.options.transferables,
    query: startAction.options.query,
    startAction,
  },
);

export const createRespondActionCreatorForPostCollection = (actions, startAction, getId) => (response) => actions.respond(
  getId(response.data),
  response.data,
  startAction.entry,
  {
    timestamp: new Date().getTime(),
    transferables: startAction.options.transferables,
    query: startAction.options.query,
    startAction,
  },
);

export const createRespondActionCreatorForMember = (actions, startAction, getId) => (response) => actions.respond(
  startAction.entry.id,
  response.data,
  startAction.entry,
  {
    timestamp: new Date().getTime(),
    transferables: startAction.options.transferables,
    query: startAction.options.query,
    startAction,
  },
);

export const createRespondErrorActionCreatorForCollection = (actions, startAction) => (error) => {
  // console.log('error :', error);
  return actions.respondError(
    { error },
    {},
    {
      timestamp: new Date().getTime(),
      transferables: startAction.options.transferables,
    }
  );
}

export const createRespondErrorActionCreatorForMember = (actions, startAction) => (error) => {
  // console.log('error :', error);
  return actions.respondError(
    startAction.entry.id,
    { error },
    {},
    {
      timestamp: new Date().getTime(),
      transferables: startAction.options.transferables,
    }
  );
}

export const getRespondActionCreators = methodConfig => {
  const funcs = {
    respondCreator: createRespondActionCreatorForCollection,
    respondErrorCreator: (methodConfig.isForCollection === true) ?
      createRespondErrorActionCreatorForCollection
      : createRespondErrorActionCreatorForMember,
  }

  // special case for posting a collection
  if(methodConfig.isForCollection !== true){
    funcs.respondCreator = createRespondActionCreatorForMember;
  }else if(methodConfig.method === 'post'){
    funcs.respondCreator = createRespondActionCreatorForPostCollection;
  }
  return funcs;
}

