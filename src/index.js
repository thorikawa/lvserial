'use strict';

const util = require('util');
const SerialPort = require("serialport");

// const FB_TPOS_DEFAULT_MIN = 0x0200;
// const FB_TPOS_DEFAULT_MAX = 0x0e00;
const FB_TPOS_DEFAULT_MIN = 0x0300;
const FB_TPOS_DEFAULT_MAX = 0x0d00;
const FB_TPOS_DEFAULT_CENTER = 0x0800;
const DEGREE_DEFAULT_MIN = 15;
const DEGREE_DEFAULT_MAX = 345;
const SID_BROADCAST = 0x3f;

function constrain (v, min, max) {
    return (Math.min(max, Math.max(min, v)));
};

function map (value, fromLow, fromHigh, toLow, toHigh) {
  return (value - fromLow) * (toHigh - toLow) / (fromHigh - fromLow) + toLow;
};

export default class ServoController {
	constructor(path, opts) {
		opts = opts || {};
		let baudrate = opts.baudrate || 115200;
		this.conn = new SerialPort.SerialPort(path, {
			baudrate: baudrate
		});

		this.conn.on('data', function(data) {
			console.log('data received: ' + data);
		});
		this.conn.on('open', opts.open || function(err) {});
		this.conn.on('error', opts.error || function(err) {
			console.error(err);
		});
	}

	servo(sid, option) {
		if (Array.isArray(sid)) {
			let servos = sid.map((s) => {
				return new Servo(this, s, option);
			});
			return servos;
		} else {
			return new Servo(this, sid, option);
		}
	}

	serialWrite(bytes) {
		// console.log(bytes);
		this.conn.write(bytes);
	}

	ramWrite(sid, address, data) {
		let len = data.length;
		let buf = new Buffer(3 + len);
		buf[0] = 0x80 | sid;
		buf[1] = 0x40 | 0x00 | len;
		buf[2] = address;
		let offset = 3;
		for (let d of data) {
			buf[offset++] = d;
		}
		this.serialWrite(buf);
	}

	ramRead(sid, address, len) {
		let buf = new Buffer(3 + len);
		buf[0] = 0x80 | sid;
		buf[1] = 0x00 | 0x20 | len;
		buf[2] = address;
		for (let i = 0; i < len; i++) {
			buf[3 + i] = 0x00;
		}
		this.serialWrite(buf);
	}

	ramBurstWrite(sid, data) {
		let len = data.length;
		let buf = new Buffer(1 + len);
		buf[0] = 0xc0 | sid;
		let offset = 1;
		for (let d of data) {
			buf[offset++] = d;
		}
		this.serialWrite(buf);
	}

	flashWrite(sid, address, data) {
		let len = data.length;
		let buf = new Buffer(5 + len);
		buf[0] = 0x80 | sid;
		buf[1] = 0x00 | 0x00 | len;
		buf[2] = (address & 0x7f);
		buf[3] = (address >> 7);
		let offset = 4;
		let sum = buf[2] + buf[3];
		for (let d of data) {
			buf[offset++] = d;
			sum += d;
		}
		// checksum
		buf[offset] = (-sum) & 0x7f;
		this.serialWrite(buf);
	}
}

class Servo {
	constructor(controller, sid, options) {

		this.controller = controller;
		this.sid = sid;
		this.min = DEGREE_DEFAULT_MIN;
		this.max = DEGREE_DEFAULT_MAX;

		if (options !== undefined) {
			if (options.range) {
				if (options.range.length < 2) {
					console.warn('The length of options.range must be greater than or equal to two.');
				} else {
					this.min = options.range[0];
					this.max = options.range[1];
					if (this.invert) {
						this.max = 360 - this.min;
						this.min = 360 - this.max;
					}
				}
			}

			this.invert = options.invert || false;
			this.debug = options.debug || false;
		}

	}

	unlock() {
		this.controller.ramWrite(this.sid, 0x14, [0x55]);
	}

	motorToggle(on) {
		this.controller.ramWrite(this.sid, 0x3b, [on ? 1 : 0]);
	}

	motorOn() {
		this.motorToggle(true);
	}

	motorOff() {
		this.motorToggle(false);
	}

	toTpos(tpos) {
		tpos = parseInt(tpos);
		if (tpos < FB_TPOS_DEFAULT_MIN || tpos > FB_TPOS_DEFAULT_MAX) {
			console.warn(`tpos value is out of range. Please specify the value from ${FB_TPOS_DEFAULT_MIN} to ${FB_TPOS_DEFAULT_MAX}.`);
			return;
		}
		this.controller.ramWrite(this.sid, 0x30, [tpos & 0x7f, (tpos >> 7) & 0x7f]);
	}

	to(degree) {
		degree = constrain(degree, this.min, this.max);
		if (this.invert) {
			degree = 360 - degree;
		}
		if (this.debug) {
			console.log('to', this.sid, degree);
		}
		let tpos = map(degree, DEGREE_DEFAULT_MIN, DEGREE_DEFAULT_MAX, FB_TPOS_DEFAULT_MIN, FB_TPOS_DEFAULT_MAX);
		this.toTpos(tpos);
	}

	toTpos_bst(tpos) {
		tpos = parseInt(tpos);
		if (tpos < FB_TPOS_DEFAULT_MIN || tpos > FB_TPOS_DEFAULT_MAX) {
			console.warn(`tpos value is out of range. Please specify the value from ${FB_TPOS_DEFAULT_MIN} to ${FB_TPOS_DEFAULT_MAX}.`);
			return;
		}
		if (this.debug) {
			console.log('toTpos_bst', this.sid, tpos);
		}
		// TODO: This burst write assumes that BST_LEN is 0x04 and BST_WA0, BST_WA1, BST_WA2, and BST_WA3 are FB_TPOS0, FB_TPOS1, PWM_EN and BST_DUM respectively.
		this.controller.ramBurstWrite(this.sid, [tpos & 0x7f, (tpos >> 7) & 0x7f, 1, 0]);
	}

	to_bst(degree) {
		degree = constrain(degree, this.min, this.max);
		if (this.invert) {
			degree = 360 - degree;
		}
		// if (this.debug) {
		// 	console.log('to_bst', this.sid, degree);
		// }
		let tpos = map(degree, DEGREE_DEFAULT_MIN, DEGREE_DEFAULT_MAX, FB_TPOS_DEFAULT_MIN, FB_TPOS_DEFAULT_MAX);
		this.toTpos_bst(tpos);
	}

	setSid(newSid) {
		if (newSid < 0 || newSid > 127) {
			console.warn(`New sid is out of range. Please specify the value from 0 to 127.`);
			return;
		}
		this.controller.flashWrite(this.sid, 0x08, [newSid]);
		console.log("You need to restart the V-SERVO to update sid.");
	}

	setPG(newValue) {
		this.controller.ramWrite(this.sid, 0x32, [newValue & 0x7f]);
	}

	getSid() {
		this.controller.ramRead(this.sid, 0x08, 1);
	}

	getTemp() {
		this.controller.ramRead(this.sid, 0x26, 2);
	}

	getSpeed() {
		this.controller.ramRead(this.sid, 0x22, 2);
	}

	getPos() {
		this.controller.ramRead(this.sid, 0x20, 2);
	}

	getBackEMF() {
		this.controller.ramRead(this.sid, 0x24, 2);
	}

	getVoltage() {
		this.controller.ramRead(this.sid, 0x28, 2);
	}

	getIERR() {
		this.controller.ramRead(this.sid, 0x2a, 2);
	}

	reset() {
		this.controller.flashWrite(this.sid, 0x00, [0x3e8 & 0x7f, 0x3e8 >> 7]);
	}

	// [Animation.render](position) {
	// 	return this.to(position[0]);
	// }

	// [Animation.normalize](keyFrames) {
	// 	// There are a couple of properties that are device type sepcific
	// 	// that we need to convert to something generic
	// 	keyFrames.forEach(function(keyFrame, index) {
	// 		if (typeof keyFrame.degrees !== "undefined") {
	// 			keyFrame.value = keyFrame.degrees;
	// 		}
	// 		if (typeof keyFrame.copyDegrees !== "undefined") {
	// 			keyFrame.copyValue = keyFrame.copyDegrees;
	// 		}
	// 	});
	// 	return keyFrames;
	// }
}

// Collection.installMethodForwarding(
// 	Servos.prototype, Servo.prototype, ['unlock', 'motorOn', 'motorOff', 'to']
// );
