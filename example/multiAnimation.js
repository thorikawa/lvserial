'use strict';

let LvSerial = require('../');
let TWEEN = require('tween.js');
const FPS = 30;

let servoController = new LvSerial("/dev/tty.usbserial-A903CA0V", {
	open: (err) => {

		let servos = servoController.servo([0, 1, 2]);
		servos.forEach(function(s, i) {
			s.debug = true;
		});

		setTimeout(() => {
			for (let s of servos) {
				s.unlock();
			}
		}, 200);
		setTimeout(() => {
			console.log('motor on');
			for (let s of servos) {
				s.motorOn();
			}
		}, 400);
		setTimeout(() => {
			var coords = [180.0, 180.0, 180.0];
			var tween = new TWEEN.Tween(coords)
				.to([220.0, 200.0, 200.0], 5000)
				.onUpdate(function(value) {
					console.log("update", this);
					for (let i = 0; i < servos.length; i++) {
						console.log(i, this[i]);
						servos[i].to(this[i]);
					}
				})
				.start(Date.now());

			this.interval = setInterval(() => {
				let now = Date.now();
				TWEEN.update(now);
			}, 1000 / FPS);
		}, 2000);
		setTimeout(() => {
			console.log('motor off');
			for (let s of servos) {
				s.motorOff();
			}
		}, 8000);
	}
});
