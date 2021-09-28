"use strict";

const InputStream = require("./InputStream");
const Parser = require("./Parser");
const TokenStream = require("./TokenStream");

/**
 * @param {string} code - The code to parse
 * @returns {ProgramToken}
 */
module.exports = function parse(code) {
	return new Parser(new TokenStream(new InputStream(code))).parse();
};
