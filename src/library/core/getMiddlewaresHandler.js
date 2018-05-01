const getNext = ([middleware, ...middlewares], args) => {
  const nextFunction = middlewares.length === 0 ? null : getNext(middlewares, args);
  return () => {
    return middleware && middleware(...args, nextFunction);
  };
}

export default (middlewares, args) => {
  return getNext(middlewares, args);
}
