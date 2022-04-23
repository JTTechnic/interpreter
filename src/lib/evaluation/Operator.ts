export class Operator {
	/**
	 * Check if a number is actually a number
	 * @param number The number to use
	 * @returns The number if no error got thrown
	 * @throws {TypeError} Gets thrown if the number is not a number
	 */
	private static num(number: any) {
		if (typeof number !== "number") throw new TypeError(`Expected number but got ${number}`);
		return number;
	}

	/**
	 * Check if a number can be used for deviding
	 * @param number The number to use
	 * @returns The number if no error got thrown
	 * @throws {TypeError} Gets thrown if the number is not a number
	 * @throws {Error} Gets thrown if the number is zero
	 */
	private static div(number: any) {
		if (Operator.num(number) === 0) throw new Error("Devide by zero");
		return number;
	}

	/**
	 * Apply an operator
	 * @param operator The operator to apply
	 * @param left The left side of the operator
	 * @param right The right side of the operator
	 * @returns The result of the applied operator
	 * @throws {TypeError} Gets thrown if the number is not a number
	 * @throws {Error} Gets thrown if the number is zero or the operator can't be applied
	 */
	public static apply(operator: string, left: any, right: any): number | boolean {
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
				return left === false ? right : left;
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
			case "+=":
				return (left += right);
			case "-=":
				return (left -= right);
			case "**":
				return left ** right;
			default:
				throw new Error(`Can't apply operator ${operator}`);
		}
	}
}
