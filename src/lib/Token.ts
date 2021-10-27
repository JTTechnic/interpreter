import type { TokenType, TokenTypes } from "./TokenType";

export interface Token<T extends TokenType = TokenType> {
	type: T;
	value: TokenTypes[T];
}

export type ParserToken =
	| Token<TokenType.Boolean | TokenType.String | TokenType.Number>
	| OperatorToken
	| CallToken
	| IfToken
	| ProgramToken
	| VariableToken;

export interface OperatorToken {
	type: TokenType.Assign | TokenType.Binary;
	operator: string;
	left: ParserToken;
	right: ParserToken;
}

export interface CallToken {
	type: TokenType.Call;
	func: ParserToken;
	args: any[];
}

export interface ElseIfToken {
	type: TokenType.ElseIf;
	condition: ParserToken;
	then: ParserToken;
}

export interface IfToken {
	type: TokenType.If;
	condition: ParserToken;
	then: ParserToken;
	elseIf: ElseIfToken[];
	else?: ParserToken;
}

export interface ProgramToken {
	type: TokenType.Program;
	program: ParserToken[];
}

export interface VariableToken {
	type: TokenType.Variable;
	variable: string;
	properties: PropertyToken[];
}

export interface PropertyToken {
	type: TokenType.Property;
	name: string;
	args?: any[];
}
