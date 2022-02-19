import { Environment } from "../src";

const globalEnvironment = new Environment();

test("constants", () => {
	try {
		globalEnvironment.define("message", "a");
		console.log(globalEnvironment.get("message"));
		globalEnvironment.set("message", "b");
		console.log(globalEnvironment.get("message"));
		globalEnvironment.define("message", "a", true);
		console.log(globalEnvironment.get("message"));
		globalEnvironment.set("message", "b");
	} catch (error) {
		expect(error).toBeInstanceOf(Error);
	}
});
