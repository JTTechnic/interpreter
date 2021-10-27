export enum TokenType {
	Boolean,
	String,
	Keyword,
	Punctuation,
	Operator,
	Number,
	Variable,
	Call,
	If,
	Program,
	Assign,
	Binary,
	Property,
	ElseIf
}

export type TokenTypes = [boolean, string, string, string, string, number, string];
