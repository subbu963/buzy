# buzy
Promise based async queue manager for node and browser.

Buzy is a blackbox into which you push promises and at each point in time you can know if any of the promises are still in pending state(busy state). Optionally you can subscribe for the event bus which will let you know when there is change in the blackbox state

Its particularly useful where you want to know if your system is busy with async activities like ajax calls etc. You can push promises in to the queue and buzy will do the job of letting you know when the state of the system changes.
Use cases can be:
1) Show loaders on ajax calls
2) Check if any of your tasks are pending before closing the browser
And similar others

## Installation
```bash
$ npm install buzy
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

To check if buzy is busy or not:
```javascript
buzy.isBusy() //true or false
```

## Examples
```javascript
import Buzy from 'buzy';

const buzy1 = new Buzy([function(message) {
  console.log(message);
   /*
      Prints the following:
      {
          code: 0,
          busy: true
      }
      And after 1000 milliseconds
      {
          code: 1,
          promise: Promise{'done'},
          value: 'done'
      }
      And then
      {
          code: 0,
          busy: false
      }
    */
}]);
const buzy2 = new Buzy([function(message) {
  console.log(message);
  /*
    Prints the following:
    {
        code: 0,
        busy: true
    }
    And after fetch is complete
    {
        code: 1 or 2 based on fetch result,
        promise: Promise{res from fetch},
        value: value or error: error based fetch result
    }
    And then after buzy1 is done with all the tasks
    {
        code: 0,
        busy: false
    }
  */
}], [buzy1]);

buzy1.addPromise(new Promise(function(resolve, reject) {
  setTimeout(function() {
    resolve('done');
  }, 1000);
}))
buzy2.addPromise(fetch('http://someurl'));
```
Check [Buzy.test.js](src/Buzy.test.js) for more exmaples
## To do
1) Cancellation of requests
2) Removal of subscribers/buzies
3) You tell me!