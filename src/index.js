function isArrayOfFunctions(array) {
    return Array.isArray(array) && array.length > 0 && array.every(item => item instanceof Function);
}

export default function reduxCombineActions() {
    return next => action => {
        if (!isArrayOfFunctions(action.payload)) {
            return next(action);
        }

        const { types, sequence } = action;
        const actions = action.payload;
        const [ PENDING, FULFILLED, REJECTED ] = types;
        let promise;

        next({
            type: PENDING
        });

        if (sequence) {
            promise = actions.reduce((result, item) => result.then(() => next(item())), Promise.resolve());
        } else {
            promise = Promise.all(actions.map(item => next(item())));
        }

        return promise.then(
            payload => next({
                payload,
                type: FULFILLED,
                meta: { status: 'success' }
            }),
            error => next({
                payload: error,
                type: REJECTED,
                meta: { status: 'error' }
            })
        );
    };
}
