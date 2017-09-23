/**
 * Created by adithya.s on 23/09/17.
 */
const utils = require('./utils');

const stateMap = new WeakMap();
const MESSAGE_CODE_MAP = {
    STATE: 0,
    RESOLVE: 1,
    REJECT: 2
};
function asyncEvokeFunctions(arr, ...args) {
    arr.forEach(function(fn) {
        utils.defer(fn, ...args);
    });
}
module.exports = class Buzy {
    constructor(subscribers) {
        stateMap.set(this, {
            busy: false,
            activePromises: [],
            subscribers: []
        });
        this.addSubscribers(subscribers);
    }
    isBusy() {
        const state = stateMap.get(this);
        return state.busy;
    }
    addPromises(promises) {
        promises = utils.isArray(promises) ? promises : [promises];
        promises.forEach(this.addPromise.bind(this));
    }
    addPromise(promise) {
        if(!utils.isPromise(promise)) {
            throw new Error(`promise expected, ${utils.type(promise)} provided`);
        }
        const state = stateMap.get(this);
        state.activePromises.push(promise);
        state.busy = true;
        asyncEvokeFunctions(state.subscribers, {
            code: MESSAGE_CODE_MAP.STATE,
            busy: state.busy
        });
        const localCb = res => {
            const idx = state.activePromises.findIndex(item => item === promise);
            state.activePromises.splice(idx, 1);
            if(!state.activePromises.length) {
                state.busy = false;
                asyncEvokeFunctions(state.subscribers, {
                    code: MESSAGE_CODE_MAP.STATE,
                    busy: state.busy
                });
            }
        };
        promise.then(res => {
            asyncEvokeFunctions(state.subscribers, {
                code: MESSAGE_CODE_MAP.RESOLVE,
                value: res,
                promise: promise
            });
        }, error => {
            asyncEvokeFunctions(state.subscribers, {
                code: MESSAGE_CODE_MAP.REJECT,
                error: error,
                promise: promise
            });
        }).then(localCb);
    }
    addSubscriber(subscriber) {
        if(!utils.isFunction(subscriber)) {
            throw new Error(`subscriber should be a function, ${utils.type(subscriber)} provided`);
        }
        const state = stateMap.get(this);
        state.subscribers.push(subscriber);
    }
    addSubscribers(subscribers) {
        subscribers = utils.isArray(subscribers) ? subscribers : [subscribers];
        subscribers.forEach(this.addSubscriber.bind(this));
    }
};