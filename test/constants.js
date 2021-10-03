"use strict";

const {Environment} = require("../src");

const globalEnvironment = new Environment();

globalEnvironment.define("message", "a");
console.log(globalEnvironment.get("message"));
globalEnvironment.set("message", "b");
console.log(globalEnvironment.get("message"));
globalEnvironment.define("message", "a", true);
console.log(globalEnvironment.get("message"));
globalEnvironment.set("message", "b");
