import axiosPromise from './axiosPromise';
import {
  toNull,
} from './helper-functions';

export default (axios, {
  map, catchError, take,
}, {
  race, from, of,
}) => (axiosOptions, {
  success: successAction = toNull,
  error: errorAction = toNull,
  cancel: cancelAction = toNull,
} = {}, options = {}) => {
  const {
    cancelStream$,
    axiosCancelTokenSource,
  } = options;

  const observable = from(axiosPromise(axios, axiosOptions, { ...options, axiosCancelTokenSource }))
  .pipe(
    map(successAction),
    catchError(error => of(errorAction(error))),
  );

  if (cancelStream$) {
    return race(
      observable,
      cancelStream$
        .pipe(
          map((value) => {
            axiosCancelTokenSource.cancel('Operation canceled by the user.');
            return cancelAction(value);
          }),
          take(1),
        ),
    );
  }
  return observable;
};
