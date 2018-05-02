import { promiseWait } from '../core/common-functions';
import getMiddlewaresHandler from '../core/getMiddlewaresHandler';

class ErrorFromMiddleware {
  constructor(error){
    this.error = error;
  }
}

export default (axios, request, options = {}) => {
  const {
    middlewares: {
      request: requestMiddlewares = [],
      response: responseMiddlewares = [],
      error: errorMiddlewares = [],
    },
    debugDelay = 0,
    axiosCancelTokenSource = axios.CancelToken.source(),
  } = options;

  return promiseWait(debugDelay)
  .then(() => {
    const next = getMiddlewaresHandler([
      ...requestMiddlewares,
      (request, { options }) => axios({
        ...request,
        cancelToken: options.axiosCancelTokenSource.token,
      }),
    ],
    [request, { options }]);
    return next();
  })
  .then(response => {
    const next = getMiddlewaresHandler([
      ...responseMiddlewares,
      (response) => Promise.resolve(response),
    ],
    [response, { request, options }]);
    return Promise.resolve()
    .then(next)
    .then(response => response || Promise.reject(new ErrorFromMiddleware(`Malformed Response: ${response}, please check you response middlewares`)))
    .catch(error => Promise.reject(new ErrorFromMiddleware(error)));
  })
  .catch((error) => {
    if(error instanceof ErrorFromMiddleware){
      return Promise.reject(error.error);
    }
    const next = getMiddlewaresHandler([
      ...errorMiddlewares,
      (error) => Promise.reject(error),
    ],
    [error, { request, options }]);
    return Promise.resolve()
    .then(next);
  })
};
