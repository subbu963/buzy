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
function isBuzy(buzy) {
    return buzy instanceof Buzy;
}

class Buzy {
    constructor(subscribers, buzies) {
        stateMap.set(this, {
            busy: false,
            pendingPromises: [],
            subscribers: [],
            buzies: []
        });
        this.addSubscribers(subscribers);
        this.addBuzies(buzies);
    }
    isBusy() {
        const state = stateMap.get(this);
        return state.busy;
    }
    addPromises(promises) {
        if(!utils.isArray(promises)) {
            throw new Error(`array expected, ${utils.type(promises)} provided`);
        }
        promises.forEach(this.addPromise.bind(this));
    }
    addPromise(promise) {
        if(!utils.isPromise(promise)) {
            throw new Error(`promise expected, ${utils.type(promise)} provided`);
        }
        const state = stateMap.get(this);
        state.pendingPromises.push(promise);
        if(!state.busy) {
            asyncEvokeFunctions(state.subscribers, {
                code: MESSAGE_CODE_MAP.STATE,
                busy: true
            });
        }
        state.busy = true;
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
        }).then(res => {
            const idx = state.pendingPromises.findIndex(item => item === promise);
            state.pendingPromises.splice(idx, 1);
            if(!state.pendingPromises.length) {
                state.busy = false;
                asyncEvokeFunctions(state.subscribers, {
                    code: MESSAGE_CODE_MAP.STATE,
                    busy: state.busy
                });
            }
        });
    }
    addSubscriber(subscriber) {
        if(!utils.isFunction(subscriber)) {
            throw new Error(`subscriber should be a function, ${utils.type(subscriber)} provided`);
        }
        const state = stateMap.get(this);
        state.subscribers.push(subscriber);
    }
    addSubscribers(subscribers) {
        if(!subscribers) {
            return;
        }
        if(!utils.isArray(subscribers)) {
            throw new Error(`array expected, ${utils.type(subscribers)} provided`);
        }
        subscribers.forEach(this.addSubscriber.bind(this));
    }
    addBuzy(buzy) {
        if(!isBuzy(buzy)) {
            throw new Error(`instance of Buzy expected, ${utils.type(buzy)} provided`);
        }
        const state = stateMap.get(this);
        state.buzies.push(buzy);
        if(buzy.isBusy() && !state.busy) {
            asyncEvokeFunctions(state.subscribers, {
                code: MESSAGE_CODE_MAP.STATE,
                busy: state.busy
            });
        }
        state.busy = state.busy || buzy.isBusy();
        buzy.addSubscriber(function(message) {
            if(MESSAGE_CODE_MAP.STATE !== message.code) {
                return;
            }
            const isBusy = !!Math.max(...state.buzies.map(_buzy => _buzy.isBusy()));
            if(state.busy !== isBusy) {
                asyncEvokeFunctions(state.subscribers, {
                    code: MESSAGE_CODE_MAP.STATE,
                    busy: isBusy
                });
            }
            state.busy = isBusy;
        });
    }
    addBuzies(buzies) {
        if(!buzies) {
            return;
        }
        if(!utils.isArray(buzies)) {
            throw new Error(`array expected, ${utils.type(buzies)} provided`);
        }
        buzies.forEach(this.addBuzy.bind(this));
    }
}
module.exports = Buzy;