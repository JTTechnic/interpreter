"use strict";

module.exports = class InputStream {
	constructor(input) {
		/**
		 * @type {number}
		 * @private
		 */
		this.position = 0;
		/**
		 * @type {number}
		 * @private
		 */
		this.line = 1;
		/**
		 * @type {number}
		 * @private
		 */
		this.column = 0;

		if (typeof input !== "string") throw new TypeError("Code input should be a string");

		/**
		 * @type {string}
		 * @readonly
		 */
		this.input = input;
	}

	/**
	 * @returns {string}
	 */
	next() {
		const character = this.input.charAt(this.position++);
		if (character === "\n") {
			this.line++;
			this.column = 0;
		} else {
			this.column++;
		}
		return character;
	}

	/**
	 * @param {number} amount - How much characters to peek
	 * @returns {string}
	 */
	peek(amount = 1) {
		if (typeof amount !== "number") throw new TypeError("Peek amount should be a number");
		return this.input.substring(this.position, this.position + amount);
	}

	/**
	 * @returns {boolean}
	 */
	eof() {
		return this.peek() === "";
	}

	/**
	 * @param {string} message - The error message to send
	 * @throws {Error} The error that was thrown
	 */
	error(message) {
		throw new Error(`${message} (${this.line}:${this.column})`);
	}
};
