// @ts-nocheck
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { Environment, evaluate, parse } from "../src";

describe("Operators test", () => {
	const env = new Environment();
	function evalParse(code: string) {
		return evaluate(parse(code), env);
	}

	test("errors", () => {
		expect(() => evalParse("1 + false")).toThrow();
		expect(() => evalParse("5 / 0")).toThrow();
	});

	test("addition", () => {
		expect(evalParse("1 + 1")).toBe(1 + 1);
		expect(
			evalParse(`
				a = 1;
				a += 1;
			`)
		).toBe(1 + 1);
	});

	test("subtraction", () => {
		expect(evalParse("1 - 1")).toBe(1 - 1);
		expect(
			evalParse(`
				a = 1;
				a -= 1;
			`)
		).toBe(1 - 1);
	});

	test("multiplication", () => {
		expect(evalParse("3 * 4")).toBe(3 * 4);
	});

	test("division", () => {
		expect(evalParse("3 / 4")).toBe(3 / 4);
	});

	test("modulus", () => {
		expect(evalParse("3 % 4")).toBe(3 % 4);
	});

	test("logic", () => {
		expect(evalParse("true && false")).toBe(true && false);
		expect(evalParse("false && true")).toBe(false && true);
		expect(evalParse("true || false")).toBe(true || false);
		expect(evalParse("false || true")).toBe(false || true);
	});

	test("gt, lt", () => {
		expect(evalParse("1 > 2")).toBe(1 > 2);
		expect(evalParse("1 < 2")).toBe(1 < 2);
		expect(evalParse("1 <= 2")).toBe(1 <= 2);
		expect(evalParse("1 >= 2")).toBe(1 >= 2);
	});

	test("equal to", () => {
		expect(evalParse("1 == 2")).toBe(1 == 2);
		expect(evalParse("1 != 2")).toBe(1 != 2);
	});
});
