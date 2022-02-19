import { Config } from "@jest/types";

export default (): Config.InitialOptions => ({
	testMatch: ["**/+(*.)+(spec|test).+(ts|js)?(x)"],
	testEnvironment: "node",
	collectCoverage: true,
	coverageProvider: "v8",
	coverageDirectory: "coverage",
	coverageReporters: ["html", "text", "clover"],
	coverageThreshold: {
		global: {
			branches: 70,
			lines: 70,
			statements: 70
		}
	},
	coveragePathIgnorePatterns: ["/node_modules/"]
});
