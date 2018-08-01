import { promiseWait } from './common-functions';
import getMiddlewaresHandler from './getMiddlewaresHandler';

class ErrorFromMiddleware {
  constructor(error) {
    this.error = error;
  }
}

export default (axios, request, op = {}) => {
  const {
    middlewares: {
      request: requestMiddlewares = [],
      response: responseMiddlewares = [],
      error: errorMiddlewares = [],
    },
    debugDelay = 0,
    axiosCancelTokenSource = axios.CancelToken.source(),
  } = op;

  return promiseWait(debugDelay)
  .then(() => {
    const next = getMiddlewaresHandler([
      ...requestMiddlewares,
      (req, { options }) => axios({
        ...req,
        cancelToken: axiosCancelTokenSource.token,
      }),
    ],
    [request, { options: op }]);
    return next();
  })
  .then((response) => {
    const next = getMiddlewaresHandler([
      ...responseMiddlewares,
      res => Promise.resolve(res),
    ],
    [response, { request, options: op }]);
    return Promise.resolve()
    .then(next)
    .then(res => res || Promise.reject(new ErrorFromMiddleware(`Malformed Response: ${res}, please check you response middlewares`)))
    .catch(error => Promise.reject(new ErrorFromMiddleware(error)));
  })
  .catch((error) => {
    if (error instanceof ErrorFromMiddleware) {
      return Promise.reject(error.error);
    }
    const next = getMiddlewaresHandler([
      ...errorMiddlewares,
      err => Promise.reject(err),
    ],
    [error, { request, options: op }]);
    return Promise.resolve()
    .then(next);
  });
};
