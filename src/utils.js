/**
 * Created by adithya.s on 23/09/17.
 */
function noop() {}
function type(value) {
    return Object.prototype.toString.call(value).match(/\w+/g)[1].toLowerCase();
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
    return type(fn) === 'function';
}
function isArray(ar) {
    return type(ar) === 'array';
}
function isPromise(promise) {
    return type(promise) === 'promise';
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