export enum TokenType {
	Boolean = 0,
	String = 1,
	Keyword = 2,
	Punctuation = 3,
	Operator = 4,
	Number = 5,
	Variable = 6,
	Call = 7,
	If = 8,
	Program = 9,
	Assign = 10,
	Binary = 11,
	Property = 12,
	ElseIf = 13
}

export type TokenTypes = [boolean, string, string, string, string, number, string];

export interface Token<T extends TokenType = TokenType> {
	type: T;
	value: TokenTypes[T];
}

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
	args: any[];
}

export type ParserToken =
	| Token<TokenType.Boolean | TokenType.String | TokenType.Number>
	| OperatorToken
	| CallToken
	| IfToken
	| ProgramToken
	| VariableToken;

export class Environment {
	private readonly vars: {
		[name: string]: any;
	};
	private readonly parent?: Environment;
	public constructor(parent?: Environment);
	public extend(): Environment;
	public lookup(name: string): Environment;
	public get(name: string): any;
	public set(name: string, value: any): any;
	public define(name: string, value: any, final?: boolean): any;
}

export const parse: (code: string) => ProgramToken;

export const evaluate: (expression: ParserToken, environment: Environment) => any;
