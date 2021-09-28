"use strict";

const TokenStream = require("./TokenStream");
const TokenType = require("../TokenType");

module.exports = class Parser {
	/**
	 * @typedef {[
	 *	boolean,
	 *	string,
	 *	string,
	 *	string,
	 *	string,
	 *	number,
	 *	string
	 * ]} TokenTypes
	 */

	/**
	 * @template {TokenType} [T=TokenType]
	 * @typedef {Object} Token
	 * @property {T} type
	 * @property {TokenTypes[T]} value
	 */

	/**
	 * @typedef OperatorToken
	 * @property {10 | 11} type
	 * @property {string} operator
	 * @property {ParserToken} left
	 * @property {ParserToken} right
	 */

	/**
	 * @typedef CallToken
	 * @property {7} type
	 * @property {ParserToken} func
	 * @property {any[]} args
	 */

	/**
	 * @typedef ElseIfToken
	 * @property {13} type
	 * @property {ParserToken} condition
	 * @property {ParserToken} then
	 */

	/**
	 * @typedef IfToken
	 * @property {8} type
	 * @property {ParserToken} condition
	 * @property {ParserToken} then
	 * @property {ElseIfToken[]} elseIf
	 * @property {ParserToken} [else]
	 */

	/**
	 * @typedef ProgramToken
	 * @property {9} type
	 * @property {ParserToken[]} program
	 */

	/**
	 * @typedef VariableToken
	 * @property {6} type
	 * @property {string} variable
	 * @property {PropertyToken[]} properties
	 */

	/**
	 * @typedef PropertyToken
	 * @property {12} type
	 * @property {string} name
	 * @property {any[]} [args]
	 */

	/**
	 * @typedef {Token<0 | 1 | 5> | OperatorToken | CallToken | IfToken | ProgramToken | VariableToken} ParserToken
	 */

	/**
	 * @param {TokenStream} input - The input of the parser
	 */
	constructor(input) {
		/**
		 * @type {{
		 * 	[key: string]: number;
		 * }}
		 * @private
		 * @readonly
		 */
		this.PRECEDENCE = {
			"=": 1,
			"||": 2,
			"&&": 3,
			"<": 7,
			">": 7,
			"<=": 7,
			">=": 7,
			"==": 7,
			"!=": 7,
			"+": 10,
			"-": 10,
			"*": 20,
			"/": 20,
			"%": 20
		};
		/**
		 * @type {{
		 * 	FALSE: Token<0>;
		 * }}
		 * @private
		 * @readonly
		 */
		this.TOKENS = {
			FALSE: {
				type: TokenType.Boolean,
				value: false
			}
		};

		if (!(input instanceof TokenStream)) throw new TypeError("Parser input should be of type TokenStream");

		/**
		 * @type {TokenStream}
		 * @private
		 * @readonly
		 */
		this.input = input;
	}

	/**
	 * @param {string} [character] - The character to check
	 * @returns {Token<3>}
	 * @private
	 */
	isPunctuation(character) {
		const token = this.input.peek();
		return token && token.type === TokenType.Punctuation && (!character || token.value === character) && token;
	}

	/**
	 * @param {string} [keyword] - The keyword to check
	 * @returns {Token<2>}
	 * @private
	 */
	isKeyword(keyword) {
		const token = this.input.peek();
		return token && token.type === TokenType.Keyword && (!keyword || token.value === keyword) && token;
	}

	/**
	 * @param {string} [operator] - The operator to check
	 * @returns {Token<4>}
	 * @private
	 */
	isOperator(operator) {
		const token = this.input.peek();
		return token && token.type === TokenType.Operator && (!operator || token.value === operator) && token;
	}

	/**
	 * @param {string} character - The character to skip
	 * @returns {void}
	 * @private
	 */
	skipPunctuation(character) {
		if (this.isPunctuation(character)) {
			this.input.next();
			return;
		}
		this.input.error(`Expecting punctuation: "${character}"`);
	}

	/**
	 * @param {string} keyword - The keyword to skip
	 * @returns {void}
	 * @private
	 */
	skipKeyword(keyword) {
		if (this.isKeyword(keyword)) {
			this.input.next();
			return;
		}
		this.input.error(`Expecting punctuation: "${keyword}"`);
	}

	/**
	 * @returns {void}
	 * @private
	 */
	unexpected() {
		return this.input.error(`Unexpected token: ${JSON.stringify(this.input.peek())}`);
	}

	/**
	 * @param {ParserToken} left - The left side of the binary
	 * @param {number} myPrecedence - The precendence of the binary
	 * @returns {ParserToken}
	 * @private
	 */
	maybeBinary(left, myPrecedence) {
		const token = this.isOperator();
		if (token) {
			const hisPrecedence = this.PRECEDENCE[token.value];
			if (hisPrecedence > myPrecedence) {
				this.input.next();
				return this.maybeBinary(
					{
						type: token.value === "=" ? TokenType.Assign : TokenType.Binary,
						operator: token.value,
						left,
						right: this.maybeBinary(this.parseAtom(), hisPrecedence)
					},
					myPrecedence
				);
			}
		}
		return left;
	}

	/**
	 * @param {string} start - The first character
	 * @param {string} end - The end character
	 * @param {string} seperator - The seperator
	 * @param {Function} parser - The function to use as parser
	 * @param {boolean} [seperatorRequired] - Wether the seperator is required in the code
	 * @returns {any[]}
	 * @private
	 */
	delimited(start, end, seperator, parser, seperatorRequired = true) {
		const values = [];
		let first = true;
		this.skipPunctuation(start);
		while (!this.input.eof()) {
			if (this.isPunctuation(end)) break;
			if (first) {
				first = false;
			} else if (seperatorRequired || this.isPunctuation(seperator)) {
				this.skipPunctuation(seperator);
			}
			if (this.isPunctuation(end)) break;
			values.push(parser());
		}
		this.skipPunctuation(end);
		return values;
	}

	/**
	 * @param {ParserToken} func - The function to use as call function
	 * @returns {CallToken}
	 * @private
	 */
	parseCall(func) {
		return {
			type: TokenType.Call,
			func,
			args: this.delimited("(", ")", ",", () => this.parseExpression())
		};
	}

	/**
	 * @returns {IfToken}
	 * @private
	 */
	parseIf() {
		this.skipKeyword("if");
		const condition = this.parseExpression();
		this.skipPunctuation(":");
		/** @type {IfToken} */
		const value = {
			type: TokenType.If,
			condition,
			then: this.parseExpression(),
			elseIf: []
		};
		if (this.isPunctuation(";")) this.input.next();
		while (this.isKeyword("else")) {
			this.input.next();
			if (!this.isKeyword("if")) {
				this.skipPunctuation(":");
				value.else = this.parseExpression();
				break;
			}
			this.input.next();
			const elseIfCondition = this.parseExpression();
			this.skipPunctuation(":");
			value.elseIf.push({
				type: TokenType.ElseIf,
				condition: elseIfCondition,
				then: this.parseExpression()
			});
			if (this.isPunctuation(";")) this.input.next();
		}
		return value;
	}

	/**
	 * @returns {Token<0>}
	 * @private
	 */
	parseBoolean() {
		return {
			type: TokenType.Boolean,
			value: this.input.next().value === "true"
		};
	}

	/**
	 * @param {Function} expression - The expression of the call
	 * @returns {any}
	 * @private
	 */
	maybeCall(expression) {
		expression = expression();
		return this.isPunctuation("(") ? this.parseCall(expression) : expression;
	}

	/**
	 * @returns {any}
	 * @private
	 */
	parseAtom() {
		return this.maybeCall(() => {
			if (this.isPunctuation("(")) {
				this.input.next();
				const expression = this.parseExpression();
				this.skipPunctuation(")");
				return expression;
			}
			if (this.isPunctuation("{")) return this.parseProgram();
			if (this.isKeyword("if")) return this.parseIf();
			if (this.isKeyword("true") || this.isKeyword("false")) return this.parseBoolean();
			if (this.input.peek().type === TokenType.Variable) return this.parseVariable();
			const token = this.input.next();
			if ([TokenType.Number, TokenType.String].includes(token.type)) return token;
			return this.unexpected();
		});
	}

	/**
	 * @returns {ProgramToken}
	 */
	parse() {
		const program = [];
		while (!this.input.eof()) {
			program.push(this.parseExpression());
			if (this.isPunctuation(";")) this.input.next();
		}
		return {
			type: TokenType.Program,
			program
		};
	}

	/**
	 * @returns {ParserToken}
	 * @private
	 */
	parseProgram() {
		const program = this.delimited(
			"{",
			"}",
			";",
			() => {
				if (this.isPunctuation(";")) this.input.next();
				return this.parseExpression();
			},
			false
		);
		if (program.length === 0) return this.TOKENS.FALSE;
		if (program.length === 1) return program[0];
		return {
			type: TokenType.Program,
			program
		};
	}

	/**
	 * @returns {any}
	 */
	parseExpression() {
		return this.maybeCall(() => this.maybeBinary(this.parseAtom(), 0));
	}

	/**
	 * @returns {VariableToken}
	 */
	parseVariable() {
		const variable = this.input.next().value;
		const properties = [];
		while (this.isPunctuation(".")) {
			this.input.next();
			properties.push(this.parseProperty());
		}
		return {
			type: TokenType.Variable,
			variable,
			properties
		};
	}

	/**
	 * @returns {PropertyToken}
	 */
	parseProperty() {
		const token = this.input.next();
		if (token.type !== TokenType.Variable) this.unexpected();
		const property = {
			type: TokenType.Property,
			name: token.value
		};
		if (this.isPunctuation("(")) {
			property.args = this.delimited("(", ")", ",", () => this.parseExpression());
		}
		return property;
	}
};
