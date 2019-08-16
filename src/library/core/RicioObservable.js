import ricioPromise from './ricioPromise';
import {
  toNull,
} from './helper-functions';

export default (wsProtocol, {
  map, catchError, take,
}, {
  race, from, of,
}) => (ricioOptions, {
  success: successAction = toNull,
  error: errorAction = toNull,
  cancel: cancelAction = toNull,
} = {}, options = {}) => {
  const {
    cancelStream$,
    ricioCancelToken,
  } = options;

  const observable = from(ricioPromise(wsProtocol, ricioOptions, options))
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
            ricioCancelToken.cancel('Operation canceled by the user.');
            return cancelAction(value);
          }),
          take(1),
        ),
    );
  }
  return observable;
};
