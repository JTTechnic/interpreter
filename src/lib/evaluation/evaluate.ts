/* eslint-disable no-case-declarations */
import type { Environment } from "../Environment";
import { Operator } from "./Operator";
import type { ParserToken, Token } from "../Token";
import { TokenType } from "../TokenType";

export function evaluate(expression: ParserToken, environment: Environment): any {
	switch (expression.type) {
		case TokenType.Number:
		case TokenType.String:
		case TokenType.Boolean:
			return expression.value;
		case TokenType.Variable:
			const variable = environment.get(expression.variable);
			if (!expression.properties.length) return variable;
			// TODO remove eval
			// eslint-disable-next-line no-eval
			return eval(
				`variable.${expression.properties
					.map(
						(property, index) =>
							`${property.name}${
								property.args ? `(...expression.properties[${index}].args.map(arg => evaluate(arg, environment)))` : ""
							}`
					)
					.join(".")}`
			);
		case TokenType.Assign:
			if (expression.left.type !== TokenType.Variable)
				throw new Error(`Cannot assign to ${JSON.stringify(expression.left)}`);
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
			let val: any = false;
			expression.program.forEach((expression) => (val = evaluate(expression, environment)));
			return val;
		case TokenType.Call:
			const func = evaluate(expression.func, environment);
			return func(
				null,
				expression.args.map((argument: ParserToken) => evaluate(argument, environment))
			);
		default:
			throw new Error(`I don't know how to evaluate ${(expression as Token).type}`);
	}
}
