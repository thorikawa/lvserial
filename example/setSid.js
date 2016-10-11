'use strict';

let LvSerial = require('../');

let servoController = new LvSerial("/dev/tty.usbserial-A903CA0V", {
	open: (err) => {
		let vservo = servoController.servo(0);
		setTimeout(() => {
			vservo.unlock();
		}, 200);
		setTimeout(() => {
			vservo.getSid();
		}, 1000);
		setTimeout(() => {
			vservo.setSid(2);
		}, 2000);
		setTimeout(() => {
			vservo.getSid();
		}, 3000);
		// setTimeout(() => {
		// 	vservo.reset();
		// }, 4000);
		// setTimeout(() => {
		// 	vservo.getSid();
		// }, 5000);
	}
});
