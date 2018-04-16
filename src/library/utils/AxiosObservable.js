import { promiseWait } from '../utils';

class ErrorFromMiddleware {
  constructor(error){
    this.error = error;
  }
}

const toNull = () => { type: 'TO_NULL' };

export default (axios, Observable) => (axiosOptions, {
    success: successAction = toNull,
    error: errorAction = toNull,
    cancel: cancelAction = toNull,
  } = {}, options = {}
) => {
  const {
    responseMiddleware = (response) => Promise.resolve(response),
    errorMiddleware = (error) => Promise.reject(error),
    debugDelay = 0,
    cancelStream$,
    axiosCancelTokenSource = axios.CancelToken.source(),
  } = options;
  let observable = Observable.fromPromise(
    promiseWait(debugDelay)
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
  )
  .map(successAction)
  .catch(error => {
    return Observable.of(errorAction(error))
  });

  if(cancelStream$){
    observable = observable.race(
      cancelStream$
        .map(() => {
          axiosCancelTokenSource.cancel('Operation canceled by the user.');
          return cancelAction();
        })
        .take(1)
    );
  }
  return observable;
};
