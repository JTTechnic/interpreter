"use strict";

/**
 * @enum {number}
 * @readonly
 */
const TokenType = {
	Boolean: 0,
	String: 1,
	Keyword: 2,
	Punctuation: 3,
	Operator: 4,
	Number: 5,
	Variable: 6,
	Call: 7,
	If: 8,
	Program: 9,
	Assign: 10,
	Binary: 11,
	Property: 12,
	ElseIf: 13
};

module.exports = TokenType;
