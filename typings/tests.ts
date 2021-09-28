import {Environment, evaluate, parse} from ".";

const env = new Environment();
const parsed = parse(`funcion("some code")`);

evaluate(parsed, env);