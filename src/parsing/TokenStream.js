"use strict";

const InputStream = require("./InputStream");
const TokenType = require("../TokenType");

module.exports = class TokenStream {
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
	 * @param {InputStream} input - The input of the stream
	 */
	constructor(input) {
		/**
		 * @type {Token}
		 * @private
		 */
		this.currentToken = null;
		/**
		 * @type {string[]}
		 * @private
		 * @readonly
		 */
		this.KEYWORDS = ["if", "else", "true", "false"];

		if (!(input instanceof InputStream)) throw new TypeError("TokenStream input should be of type InputStream");

		/**
		 * @type {InputStream}
		 * @private
		 * @readonly
		 */
		this.input = input;
	}

	/**
	 * @param {string} word - The word to check
	 * @returns {boolean}
	 * @private
	 */
	isKeyword(word) {
		return this.KEYWORDS.includes(word);
	}

	/**
	 * @param {string} character - The character to check
	 * @returns {boolean}
	 * @private
	 */
	isDigit(character) {
		return /[0-9]/.test(character);
	}

	/**
	 * @param {string} character - The character to check
	 * @returns {boolean}
	 * @private
	 */
	isIDStart(character) {
		return /[a-z_]/i.test(character);
	}

	/**
	 * @param {string} character - The character to check
	 * @returns {boolean}
	 * @private
	 */
	isID(character) {
		return this.isIDStart(character) || /[?!\-<>=0123456789]/.test(character);
	}

	/**
	 * @param {string} character - The character to check
	 * @returns {boolean}
	 * @private
	 */
	isOperatorCharacter(character) {
		return /[+\-*/%=&|<>!]/.test(character);
	}

	/**
	 * @param {string} character - The character to check
	 * @returns {boolean}
	 * @private
	 */
	isPunctuation(character) {
		return /[,;(){}.:]/.test(character);
	}

	/**
	 * @param {string} character - The character to check
	 * @returns {boolean}
	 * @private
	 */
	isWhitespace(character) {
		return /\s/.test(character);
	}

	/**
	 * @param {string} characters - The characters to check
	 * @returns {boolean}
	 * @private
	 */
	isComment(characters) {
		return characters === "//";
	}

	/**
	 * @param {function(string): boolean} func - The function to check when to stop reading
	 * @returns {string}
	 * @private
	 */
	readWhile(func) {
		let string = "";
		while (!this.input.eof() && func(this.input.peek())) string += this.input.next();
		return string;
	}

	/**
	 * @returns {Token<5>}
	 * @private
	 */
	readNumber() {
		let hasDot = false;
		const number = this.readWhile(character => {
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
	 * @returns {Token<2 | 6>}
	 * @private
	 */
	readIndent() {
		const id = this.readWhile(char => this.isID(char));
		return {
			type: this.isKeyword(id) ? TokenType.Keyword : TokenType.Variable,
			value: id
		};
	}

	/**
	 * @param {string} endCharacter - The last character to read
	 * @returns {string}
	 * @private
	 */
	readEscaped(endCharacter) {
		let escaped = false,
			string = "";
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
	 * @returns {Token<1>}
	 * @private
	 */
	readString() {
		return {
			type: TokenType.String,
			value: this.readEscaped('"')
		};
	}

	/**
	 * @private
	 */
	skipComment() {
		this.readWhile(character => character !== "\n");
		this.input.next();
	}

	/**
	 * @returns {Token | null}
	 */
	readNext() {
		this.readWhile(character => this.isWhitespace(character));
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
		if (this.isOperatorCharacter(character)) {
			return {
				type: TokenType.Operator,
				// eslint-disable-next-line no-shadow
				value: this.readWhile(character => this.isOperatorCharacter(character))
			};
		}
		return this.input.error(`Can't handle character: ${character}`);
	}

	/**
	 * @returns {Token}
	 */
	next() {
		const token = this.currentToken;
		this.currentToken = null;
		return token || this.readNext();
	}

	/**
	 * @returns {Token}
	 */
	peek() {
		if (!this.currentToken) this.currentToken = this.readNext();
		return this.currentToken;
	}

	/**
	 * @returns {boolean}
	 */
	eof() {
		return this.peek() === null;
	}

	/**
	 * @param {string} message - The error message to send
	 * @returns {void}
	 * @throws {Error} The error that was thrown
	 */
	error(message) {
		return this.input.error(message);
	}
};
