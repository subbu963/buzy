/**
 * Created by adithya.s on 23/09/17.
 */
function noop() {}
function type(value) {
    return Object.prototype.toString.call(value).match(/\w+/g)[1].toLowerCase();
}
function defer(fn, args) {
    if(type(fn) != 'function') {
        throw new Error(`callback should be a function, ${type(fn)} provided`);
    }
    args = type(args) != 'array' ? [args] : args;
    setTimeout(fn, 0, ...args);
}
function combinePromises(promises) {
    if(type(promises) != 'array') {
        throw new Error(`callback should be a array, ${type(promises)} provided`);
    }
    Promise.all(promises.map(promise => {
        if(type(promise) != 'promise') {
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

module.exports = {
    defer: defer,
    noop: noop,
    type: type,
    combinePromises: combinePromises
};