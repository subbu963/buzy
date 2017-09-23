/**
 * Created by adithya.s on 23/09/17.
 */
const Buzy = require('./Buzy');
const b = new Buzy([function (message) {
    console.log('in b', message);
}]);
const c = new Buzy([function (message) {
    console.log('in c', message, c.isBusy())
}], [b]);

b.addPromise(new Promise(function (resolve, reject) {
    setTimeout(function () {
        resolve('yo1');
    }, 1000);
}));

setTimeout(function () {
    b.addPromise(new Promise(function (resolve, reject) {
        setTimeout(function () {
            reject('yo2');
        }, 500);
    }));
}, 100);
setTimeout(function () {
    b.addPromise(new Promise(function (resolve, reject) {
        setTimeout(function () {
            reject('yo3');
        }, 10);
    }));
}, 500);