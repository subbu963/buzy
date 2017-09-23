# buzy
Async queue manager for node and browser

## Installation
```bash
$ npm install buzy
```
## Usage
```javascript
import Buzy from 'buzy';

const buzy1 = new Buzy;
const buzy2 = new Buzy([function(message) {
  console.log(message);
}], [buzy1]);

buzy1.addPromise(new Promise(function(resolve, reject) {
  setTimeout(function() {
    resolve('done');
  }, 1000);
}))
```

## Syntax
```javascript
new Buzy(subscribers, buzies);
```
- subscribers - array of functions which will be called upon the change when there is a state change or when a promise is resolved/reject(this wont be triggered for buzies dependent on other buzies)
- buzies - array of buzies to subscribe on to

Subscribers will be called with the following message data structure
```javascript
{
    code: number, // 0 - STATE change, 1 - RESOLVE, 2 - REJECT
    busy: true/false,
    promise: promise, //promise which is last resolved/rejected
    value: value, // value of the resolution
    error: error // error of the rejection
}
```

New promises can be added with: 
```javascript
buzy.addPromise(promise) //single promise
buzy.addPromises(promises) //array of promises
```
New subscribers can be added with: 
```javascript
buzy.addSubscriber(subscriber) //single subscriber
buzy.addSubscribers(subscribers) //array of subscribers
```
New buzies can be added with: 
```javascript
buzy.addBuzy(buzy) //single buzy
buzy.addBuzies(buzies)//array of buzies
```

To check is a buzy is busy or not:
```javascript
buzy.isBusy() //true or false
```

## To do
1) Cancellation of requests
2) You tell me!