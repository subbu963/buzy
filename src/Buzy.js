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
    return utils.type(buzy) === 'Buzy';
}

module.exports = class Buzy {
    constructor(subscribers, buzies) {
        stateMap.set(this, {
            busy: false,
            activePromises: [],
            subscribers: [],
            buzies: []
        });
        const state = stateMap.get(this);
        this.addSubscribers(subscribers);
        this.addBuzies(buzies);
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
        if(!subscribers) {
            return;
        }
        subscribers = utils.isArray(subscribers) ? subscribers : [subscribers];
        subscribers.forEach(this.addSubscriber.bind(this));
    }
    addBuzy(buzy) {
        if(!isBuzy(buzy)) {
            throw new Error(`instance of Buzy expected, ${utils.type(buzy)} provided`);
        }
        const state = stateMap.get(this);
        state.buzies.push(buzy);
        state.busy = state.busy || buzy.isBusy();
        asyncEvokeFunctions(state.subscribers, {
            code: MESSAGE_CODE_MAP.STATE,
            busy: state.busy
        });
        buzy.addSubscriber(function(message) {
            if(MESSAGE_CODE_MAP.STATE !== message.code) {
                return;
            }
            state.busy = !!Math.max(...state.buzies.map(_buzy => _buzy.isBusy()));
            asyncEvokeFunctions(state.subscribers, {
                code: MESSAGE_CODE_MAP.STATE,
                busy: state.busy
            });
        });
    }
    addBuzies(buzies) {
        if(!buzies) {
            return;
        }
        buzies = utils.isArray(buzies) ? buzies : [buzies];
        buzies.forEach(this.addBuzy.bind(this));
    }
};