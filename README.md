lvserial
====
Node module for servo motors which support LVSerial protocol provided by Vstone.

# Compatiblity
I confirmed that this plugin works with VS-SV3310 and Arduino UNO. It should work with VS-SV1150 as well.

# Example

```js
'use strict';

let LvSerial = require('../');

let servoController = new LvSerial("/dev/tty.usbserial-A903CA0V", {
	open: (err) => {
		let vservo = servoController.servo(0, {
			range: [160, 200],
			invert: true
		});
		vservo.debug = true;

		setTimeout(() => {
			vservo.unlock();
		}, 0);
		setTimeout(() => {
			console.log('motor on');
			vservo.motorOn();
		}, 1000);
		setTimeout(() => {
			console.log('set PG');
			vservo.setPG(0x70);
		}, 2000);
		setTimeout(() => {
			console.log('move to 160 degree');
			vservo.to(160);
		}, 3000);
		setTimeout(() => {
			console.log('move to 200 degree');
			vservo.to(200);
		}, 5000);
		setTimeout(() => {
			console.log('move to 180 degree');
			vservo.to(180);
		}, 7000);
		setTimeout(() => {
			console.log('move to 180 degree');
			vservo.to(180);
		}, 9000);
		setTimeout(() => {
			console.log('motor off');
			// vservo.motorOff();
		}, 11000);
	}
});
```

You can find more examples in [examples](./examples) folder.

# Reference
https://vstone.co.jp/products/v_servo/qa.html

# License
MIT License
