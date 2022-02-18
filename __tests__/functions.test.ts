import { Environment, evaluate, parse } from "../src";

describe("Function testing", () => {
	test("short function", () => {
		const env = new Environment();
		const code = `
			function add(a, b): a + b;
			add(1, 2);
		`;
		expect(evaluate(parse(code), env)).toBe(3);
	});

	test("curly function", () => {
		const env = new Environment();
		const code = `
			function add(a, b): {
				a + b;
			}
			add(4, 1);
		`;
		expect(evaluate(parse(code), env)).toBe(5);
	});

	test("return function", () => {
		const env = new Environment();
		const code = `
			function add(a, b): {
				return a + b;
			}
			add(8, 4);
		`;
		expect(evaluate(parse(code), env)).toBe(12);
	});

	test("early return function", () => {
		const env = new Environment();
		const code = `
			function add(a, b, c): {
				return a + c;
				a + b;
			}
			add(8, 4, 1);
		`;
		expect(evaluate(parse(code), env)).toBe(9);
	});

	test("anonymous function", () => {
		const env = new Environment();
		const code = `
			function(a, b): {
				return a + b;
			}(8, 4);
		`;
		expect(evaluate(parse(code), env)).toBe(12);
	});

	test("invalid anonymous function", () => {
		const env = new Environment();
		const code = `
			function(a, b): a + b;(8, 4);
		`;
		expect(() => evaluate(parse(code), env)).toThrow();
	});

	test("variable function", () => {
		const env = new Environment();
		const code = `
			add = function(a, b): a + b;
			add(8, 4);
		`;
		expect(evaluate(parse(code), env)).toBe(12);
	});

	test("named function variable", () => {
		const env = new Environment();
		const code = `
			add = function a(a, b): a + b;
			add(8, 4);
		`;
		expect(evaluate(parse(code), env)).toBe(12);
	});
});
