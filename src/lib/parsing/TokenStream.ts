import { InputStream } from "./InputStream";
import type { Token } from "../Token";
import { TokenType } from "../TokenType";

export class TokenStream {
	/**
	 * The keywords of the interpreter
	 */
	private static readonly KEYWORDS = ["if", "else", "true", "false", "final", "function", "return"];

	/**
	 * The current token of this stream
	 */
	private currentToken: Token | null = null;

	/**
	 * The previous token of this stream
	 */
	private previousToken: Token | null = null;

	/**
	 * Make a new token stream
	 * @param input The input stream to use at input
	 */
	public constructor(private readonly input: InputStream) {
		if (!(input instanceof InputStream)) throw new TypeError("TokenStream input should be of type InputStream");
	}

	/**
	 * Check if a word is a keyword
	 * @param word The word to check
	 * @returns Wether the word is a keyword
	 */
	private isKeyword(word: string) {
		return TokenStream.KEYWORDS.includes(word);
	}

	/**
	 * Check if a character is a digit
	 * @param character The character to check
	 * @returns Wether the character is a digit
	 */
	private isDigit(character: string) {
		return /[0-9]/.test(character);
	}

	/**
	 * Check if a character is the start of an ID
	 * @param character The character to check
	 * @returns Wether the character is the start of an ID
	 */
	private isIDStart(character: string) {
		return /[a-z_]/i.test(character);
	}

	/**
	 * Check if a character is an ID
	 * @param character The character to check
	 * @returns Wether the character is an ID
	 */
	private isID(character: string) {
		return this.isIDStart(character) || /[?!\-<>=0123456789]/.test(character);
	}

	/**
	 * Check if a character is an operator
	 * @param character The character to check
	 * @returns Wether the character is an operator
	 */
	private isOperator(character: string) {
		return /[+\-*/%=&|<>!]/.test(character);
	}

	/**
	 * Check if a character is a punctuation character
	 * @param character The character to check
	 * @returns Wether the character is a punctuation character
	 */
	private isPunctuation(character: string) {
		return /[,;(){}.:]/.test(character);
	}

	/**
	 * Check if a character is whitespace
	 * @param character The character to check
	 * @returns Wether the character is whitespace
	 */
	private isWhitespace(character: string) {
		return /\s/.test(character);
	}

	/**
	 * Check if characters are a comment
	 * @param characters The characters to check
	 * @returns Wether the characters are a comment
	 */
	private isComment(characters: string) {
		return characters === "//";
	}

	/**
	 * Read until a function returns true
	 * @param func The function to check when to stop reading
	 * @returns The string that was read
	 */
	private readWhile(func: (character: string) => boolean) {
		let string = "";
		while (!this.input.eof() && func(this.input.peek())) string += this.input.next();
		return string;
	}

	/**
	 * Read a number
	 * @returns The read number as token
	 */
	private readNumber(): Token<TokenType.Number> {
		let hasDot = false;
		const number = this.readWhile((character) => {
			if (character === ".") {
				if (hasDot) return false;
				hasDot = true;
				return true;
			}
			return this.isDigit(character);
		});
		return {
			type: TokenType.Number,
			value: parseFloat(number)
		};
	}

	/**
	 * Read an indent
	 * @returns The read indent as token
	 */
	private readIndent(): Token<TokenType.Keyword | TokenType.Variable> {
		const id = this.readWhile((char) => this.isID(char));
		return {
			type: this.isKeyword(id) ? TokenType.Keyword : TokenType.Variable,
			value: id
		};
	}

	/**
	 * Read an escaped string
	 * @param endCharacter The character to stop at
	 * @returns The escaped string
	 */
	private readEscaped(endCharacter: string) {
		let escaped = false;
		let string = "";
		this.input.next();
		while (!this.input.eof()) {
			const character = this.input.next();
			if (escaped) {
				string += character;
				escaped = false;
			} else if (character === "\\") {
				escaped = true;
			} else if (character === endCharacter) {
				break;
			} else {
				string += character;
			}
		}
		return string;
	}

	/**
	 * Read a string
	 * @returns The read string
	 */
	private readString(): Token<TokenType.String> {
		return {
			type: TokenType.String,
			value: this.readEscaped('"')
		};
	}

	/**
	 * Skip a comment
	 */
	private skipComment() {
		this.readWhile((character) => character !== "\n");
		this.input.next();
	}

	/**
	 * Read the next character(s)
	 * @returns The next token if it exists
	 */
	private readNext(): Token | null {
		this.readWhile((character) => this.isWhitespace(character));
		if (this.input.eof()) return null;
		const character = this.input.peek();
		if (this.isComment(this.input.peek(2))) {
			this.skipComment();
			return this.readNext();
		}
		if (character === '"') return this.readString();
		if (this.isDigit(character)) return this.readNumber();
		if (this.isIDStart(character)) return this.readIndent();
		if (this.isPunctuation(character)) {
			return {
				type: TokenType.Punctuation,
				value: this.input.next()
			};
		}
		if (this.isOperator(character)) {
			return {
				type: TokenType.Operator,
				value: this.readWhile((character) => this.isOperator(character))
			};
		}
		return this.input.error(`Can't handle character: ${character}`);
	}

	/**
	 * Get the next token
	 * @returns The next token
	 */
	public next() {
		const token = this.currentToken;
		this.currentToken = null;
		this.previousToken = token;
		return token ?? this.readNext();
	}

	/**
	 * Get the current token or the next one if it doesn't exist
	 * @returns The next token
	 */
	public peek() {
		this.currentToken ??= this.readNext();
		return this.currentToken;
	}

	public peekLeft() {
		return this.previousToken;
	}

	/**
	 * Check if the end of the file has been reached
	 * @returns Wether the end of the file has been reached
	 */
	public eof() {
		return this.peek() === null;
	}

	/**
	 * Throw an error with the current line and column number
	 * @param message The message for the error to throw
	 * @throws {Error} The error that got thrown
	 */
	public error(message: string) {
		return this.input.error(message);
	}
}
