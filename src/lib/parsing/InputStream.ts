export class InputStream {
	/**
	 * The current position
	 */
	private position = 0;
	/**
	 * The current line
	 */
	private line = 1;
	/**
	 * The current column
	 */
	private column = 0;

	/**
	 * Make a new input stream
	 * @param input The code to use as input
	 */
	public constructor(private readonly input: string) {
		if (typeof this.input !== "string") throw new TypeError("Code input should be a string");
	}

	/**
	 * Get the next character from the input
	 * @returns The next character
	 */
	public next(): string  {
		const character = this.input.charAt(this.position++);
		if (character === "\n") {
			this.line++;
			this.column = 0;
		} else {
			this.column++;
		}
		return character;
	}

	/**
	 * Get characters without changing the current character index
	 * @param amount How much characters to peek
	 * @returns The peeked characters
	 */
	public peek(amount = 1): string  {
		if (typeof amount !== "number") throw new TypeError("Peek amount should be a number");
		return this.input.substring(this.position, this.position + amount);
	}

	/**
	 * Check if the end of the file has been reached
	 * @returns Wether the end of the file has been reached
	 */
	public eof(): boolean  {
		return this.peek() === "";
	}

	/**
	 * Throw an error with the current line and column number
	 * @param message The message for the error to throw
	 * @throws {Error} The error that got thrown
	 */
	public error(message: string): never {
		throw new Error(`${message} (${this.line}:${this.column})`);
	}
}
