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
module.exports = class Buzy {
    constructor(notifier) {
        stateMap.set(this, {
            busy: false,
            activePromises: [],
            notifier: notifier || utils.noop
        });
    }
    notify(message) {
        const state = stateMap.get(this);
        utils.defer(state.notifier, message);
    }
    isBusy() {
        const state = stateMap.get(this);
        return state.busy;
    }
    add(promise) {
        if(utils.type(promise) != 'promise') {
            throw new Error(`promise expected, ${utils.type(promise)} provided`);
        }
        const state = stateMap.get(this);
        state.activePromises.push(promise);
        state.busy = true;
        this.notify({
            code: MESSAGE_CODE_MAP.STATE,
            busy: state.busy
        });
        const localCb = res => {
            const idx = state.activePromises.findIndex(item => item === promise);
            state.activePromises.splice(idx, 1);
            if(!state.activePromises.length) {
                state.busy = false;
                this.notify({
                    code: MESSAGE_CODE_MAP.STATE,
                    busy: state.busy
                });
            }
        };
        promise.then(res => {
            this.notify({
                code: MESSAGE_CODE_MAP.RESOLVE,
                value: res,
                promise: promise
            });
        }, error => {
            this.notify({
                code: MESSAGE_CODE_MAP.REJECT,
                error: error,
                promise: promise
            });
        }).then(localCb);
    }
};