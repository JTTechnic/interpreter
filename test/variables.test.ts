import { parse, evaluate, Environment } from "../src";

describe("Variable testing", () => {
	test("New Variable", () => {
		expect(() => evaluate(parse("a = 1;"), new Environment())).not.toThrowError();
	});

	test("Final Error", () => {
		const code = `
			final a = 1;
			a = "a";
		`;
		expect(() => evaluate(parse(code), new Environment())).toThrowError();
	});
});
