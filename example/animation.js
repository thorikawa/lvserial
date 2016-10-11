'use strict';

let LvSerial = require('../');
let TWEEN = require('tween.js');
const FPS = 30;

let servoController = new LvSerial("/dev/tty.usbserial-A903CA0V", {
	open: (err) => {

		let vservo = servoController.servo(0);

		setTimeout(() => {
			vservo.unlock();
		}, 200);
		setTimeout(() => {
			console.log('motor on');
			vservo.motorOn();
		}, 400);
		setTimeout(() => {
			console.log('set PG');
			// vservo.setPG(0x70);
		}, 600);
		setTimeout(() => {
			var coords = [180.0];
			var tween = new TWEEN.Tween(coords)
				.to([220.0], 5000)
				.onUpdate(function(value) {
					console.log("update", this);
					vservo.to(this[0]);
				})
				.start(Date.now());

			this.interval = setInterval(() => {
				let now = Date.now();
				TWEEN.update(now);
			}, 1000 / FPS);
		}, 2000);
		setTimeout(() => {
			console.log('motor off');
			vservo.motorOff();
		}, 8000);
	}
});
