import axiosPromise from './axiosPromise';

class ErrorFromMiddleware {
  constructor(error){
    this.error = error;
  }
}

const toNull = () => ({ type: 'TO_NULL' });

export default (axios, Observable) => (axiosOptions, {
    success: successAction = toNull,
    error: errorAction = toNull,
    cancel: cancelAction = toNull,
  } = {}, options = {}
) => {
  const {
    cancelStream$,
    axiosCancelTokenSource = axios.CancelToken.source(),
  } = options;
  let observable = Observable.fromPromise(axiosPromise(axios, axiosOptions, options))
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
