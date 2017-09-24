/**
 * Created by adithya.s on 23/09/17.
 */
function noop() {}
function type(value) {
    const type = Object.prototype.toString.call(value).match(/\w+/g)[1];
    if(type === 'Object') {
        return value && value.constructor ? value.constructor.name : type;
    }
    return type;
}
function defer(fn, args) {
    if(!isFunction(fn)) {
        throw new Error(`callback should be a function, ${type(fn)} provided`);
    }
    args = isArray(args) ? args : [args];
    setTimeout(fn, 0, ...args);
}
function combinePromises(promises) {
    if(!isArray(promises)) {
        throw new Error(`callback should be an array, ${type(promises)} provided`);
    }
    Promise.all(promises.map(promise => {
        if(!isPromise(promise)) {
            throw new Error(`promise expected, ${type(promise)} provided`);
        }
        return promise.then(function(value) {
            return {
              value: value,
                status: 'resolved'
            };
        }, function(error) {
            return {
                error: error,
                status: 'rejected'
            };
        })
    }))
}
function isFunction(fn) {
    return type(fn) === 'Function';
}
function isArray(ar) {
    return type(ar) === 'Array';
}
function isPromise(promise) {
    return promise && isFunction(promise.then);
}
module.exports = {
    defer,
    noop,
    type,
    combinePromises,
    isFunction,
    isArray,
    isPromise
};