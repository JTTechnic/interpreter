export class Environment {
	/**
	 * The variables of this environment
	 */
	private readonly vars: {
		[name: string]: any;
	};

	/**
	 * Create a new environment
	 * @param parent The parent environment
	 */
	public constructor(private readonly parent?: Environment) {
		this.vars = Object.create(this.parent?.vars ?? null);
	}

	/**
	 * Extend the current environment
	 * @returns A new environment
	 */
	public extend() {
		return new Environment(this);
	}

	/**
	 * Lookup a variable
	 * @param name The name of the variable to lookup
	 * @returns The environment the variable was found in
	 */
	public lookup(name: string) {
		let scope: Environment | undefined;
		do {
			if (Object.prototype.hasOwnProperty.call((scope ?? this).vars, name)) return scope ?? this;
			scope = (scope ?? this).parent;
		} while (scope);
		return undefined;
	}

	/**
	 * Get a variable
	 * @param name The name of the variable to get
	 * @returns The found variable
	 * @throws {Error} Gets thrown if the variable was not found
	 */
	public get(name: string) {
		if (name in this.vars) return this.vars[name];
		throw new Error(`Undefined variable ${name}`);
	}

	/**
	 * Set a variable
	 * @param name The name of the variable to set
	 * @param value The new value of the variable
	 * @returns The value that was set
	 * @throws {Error} Gets thrown if the variable was not found
	 */
	public set<V>(name: string, value: V): V {
		const scope = this.lookup(name);
		if (!scope && this.parent) throw new Error(`Undefined variable ${name}`);
		(scope ?? this).vars[name] = value;
		return value;
	}

	/**
	 * Define a variable
	 * @param name The name of the variable to define
	 * @param value The value of the variable
	 * @param final Wether the variable can't be changed
	 * @returns The value that was set
	 */
	public define<V>(name: string, value: V, final = false): V {
		Object.defineProperty(this.vars, name, {
			value,
			writable: !final
		});
		return value;
	}
}
