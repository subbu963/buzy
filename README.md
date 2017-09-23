# buzy
Async queue manager for node and browser

## Usage
```javascript
import Buzy from 'buzy';

const buzy1 = new Buzy;
const buzy2 = new Buzy([], buzy1);

buzy1.addPromise(new Promise(function(resolve, reject) {
  setTimeout(function() {
    resolve('done');
  }, 1000);
}))
```
