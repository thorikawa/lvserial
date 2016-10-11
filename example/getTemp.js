'use strict';

let LvSerial = require('../');

let servoController = new LvSerial("/dev/tty.usbserial-A903CA0V", {
	open: (err) => {
		let vservo = servoController.servo(0);
		setTimeout(() => {
			vservo.unlock();
		}, 0);
		setTimeout(() => {
			vservo.getTemp();
		}, 200);
	}
});
