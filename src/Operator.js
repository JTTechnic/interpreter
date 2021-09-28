"use strict";

module.exports = class Operator {
	/**
	 * @param {number} number - The number to use
	 * @returns {number}
	 * @private
	 */
	static num(number) {
		if (typeof number !== "number") throw new Error(`Expected number but got ${number}`);
		return number;
	}

	/**
	 * @param {number} number - The number to use for devining
	 * @returns {number}
	 * @private
	 */
	static div(number) {
		if (Operator.num(number) === 0) throw new Error("Devide by zero");
		return number;
	}

	/**
	 * @param {string} operator - The operator to apply
	 * @param {any} left - The left side of the operator
	 * @param {any} right - The right side of the operator
	 * @returns {number | boolean}
	 */
	static apply(operator, left, right) {
		switch (operator) {
			case "+":
				return this.num(left) + this.num(right);
			case "-":
				return this.num(left) - this.num(right);
			case "*":
				return this.num(left) * this.num(right);
			case "/":
				return this.num(left) / this.div(right);
			case "%":
				return this.num(left) % this.div(right);
			case "&&":
				return left !== false && right;
			case "||":
				return left !== false ? left : right;
			case "<":
				return this.num(left) < this.num(right);
			case ">":
				return this.num(left) > this.num(right);
			case "<=":
				return this.num(left) <= this.num(right);
			case ">=":
				return this.num(left) >= this.num(right);
			case "==":
				return left === right;
			case "!=":
				return left !== right;
			default:
				throw new Error(`Can't apply operator ${operator}`);
		}
	}
};
