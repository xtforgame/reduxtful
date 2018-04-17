import { promiseWait } from '../core/functions';

class ErrorFromMiddleware {
  constructor(error){
    this.error = error;
  }
}

export default (axios, axiosOptions, options = {}) => {
  const {
    responseMiddleware = (response) => Promise.resolve(response),
    errorMiddleware = (error) => Promise.reject(error),
    debugDelay = 0,
    axiosCancelTokenSource = axios.CancelToken.source(),
  } = options;
  return promiseWait(debugDelay)
  .then(() => axios({
    ...axiosOptions,
    cancelToken: axiosCancelTokenSource.token,
  }))
  .then(response => {
    return Promise.resolve()
    .then(() => responseMiddleware(response, { request: axiosOptions, options }))
    .catch(error => Promise.reject(new ErrorFromMiddleware(error)));
  })
  .catch((error) => {
    if(error instanceof ErrorFromMiddleware){
      return Promise.reject(error.error);
    }
    return Promise.resolve()
    .then(() => errorMiddleware(error, { request: axiosOptions, options }));
  })
};
