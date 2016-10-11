'use strict';

let LvSerial = require('../');

let servoController = new LvSerial("/dev/tty.usbserial-A903CA0V", {
	open: (err) => {
		let vservo = servoController.servo(1);
		setTimeout(() => {
			vservo.unlock();
		}, 200);
		setTimeout(() => {
			vservo.getSid();
		}, 1000);
	}
});
