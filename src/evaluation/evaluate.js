/* eslint-disable no-case-declarations */
"use strict";

const Operator = require("./Operator");
// eslint-disable-next-line no-unused-vars
const Environment = require("../Environment");
const TokenType = require("../TokenType");

/**
 * @param {ParserToken} expression - The expression to evaluate
 * @param {Environment} environment - The environment to use
 * @returns {any}
 */
module.exports = function evaluate(expression, environment) {
	switch (expression.type) {
		case TokenType.Number:
		case TokenType.String:
		case TokenType.Boolean:
			return expression.value;
		case TokenType.Variable:
			let variable = environment.get(expression.variable);
			if (!expression.properties.length) return variable;
			return eval(
				`variable.${expression.properties
					.map(
						(property, index) =>
							`${property.name}${
								property.args
									? `(...expression.properties[${index}].args.map(arg => evaluate(arg, environment)))`
									: ""
							}`
					)
					.join(".")}`
			);
		case TokenType.Assign:
			if (expression.left.type !== TokenType.Variable) {
				throw new Error(`Cannot assign to ${JSON.stringify(expression.left)}`);
			}
			return environment.set(expression.left.variable, evaluate(expression.right, environment));
		case TokenType.Binary:
			return Operator.apply(
				expression.operator,
				evaluate(expression.left, environment),
				evaluate(expression.right, environment)
			);
		case TokenType.If:
			for (const ifToken of [expression, ...expression.elseIf]) {
				const condition = evaluate(ifToken.condition, environment);
				if (condition !== false) return evaluate(ifToken.then, environment);
			}
			return expression.else ? evaluate(expression.else, environment) : false;
		case TokenType.Program:
			let val = false;
			// eslint-disable-next-line no-shadow
			expression.program.forEach(expression => {
				val = evaluate(expression, environment);
			});
			return val;
		case TokenType.Call:
			/** @type {Function} */
			const func = evaluate(expression.func, environment);
			return func(...expression.args.map(argument => evaluate(argument, environment)));
		default:
			throw new Error(`I don't know how to evaluate ${expression.type}`);
	}
};
