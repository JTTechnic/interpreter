"use strict";

module.exports = class Environment {
	/**
	 * @param {Environment} [parent] - The parent evironment
	 */
	constructor(parent) {
		/**
		 * @type {{
		 * 	[name: string]: any;
		 * }}
		 * @private
		 * @readonly
		 */
		this.vars = Object.create(parent ? parent.vars : null);
		/**
		 * @type {Environment}
		 * @private
		 * @readonly
		 */
		this.parent = parent;
	}

	/**
	 * @returns {Environment}
	 */
	extend() {
		return new Environment(this);
	}

	/**
	 * @param {string} name - The variable name to lookup
	 * @returns {Environment}
	 */
	lookup(name) {
		// eslint-disable-next-line consistent-this
		let scope = this;
		while (scope) {
			if (Object.prototype.hasOwnProperty.call(scope.vars, name)) return scope;
			scope = scope.parent;
		}
		return undefined;
	}

	/**
	 * @param {string} name - The variable to get
	 * @returns {any}
	 */
	get(name) {
		if (name in this.vars) return this.vars[name];
		throw new Error(`Undefined variable ${name}`);
	}

	/**
	 * @param {string} name - The variable to set
	 * @param {any} value - The new value of the variable
	 * @returns {any}
	 */
	set(name, value) {
		let scope = this.lookup(name);
		// No global variables
		if (!scope && this.parent) throw new Error(`Undefined variable ${name}`);
		(scope || this).vars[name] = value;
		return value;
	}

	/**
	 * @param {string} name - The variable to define
	 * @param {any} value - The value of the variable
	 * @returns {any}
	 */
	define(name, value) {
		this.vars[name] = value;
		return value;
	}
};
