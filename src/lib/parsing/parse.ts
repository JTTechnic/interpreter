import { InputStream } from "./InputStream";
import { Parser } from "./Parser";
import { TokenStream } from "./TokenStream";

/**
 * Parse code to a program
 * @param code The code to parse
 * @returns The parsed code
 */
export function parse(code: string) {
	return new Parser(new TokenStream(new InputStream(code))).parse();
}
