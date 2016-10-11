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