import { InputStream } from "../src/lib/parsing/InputStream";
import { TokenStream } from "../src/lib/parsing/TokenStream";
import { Environment, evaluate, parse } from "../src";

const code = `
content.set("under this message an embed is being displayed");
embed();
embed.description("description");
embed.title("title");
embed.footer("footer");
embed.color("RED");
embed.footer.icon("https://example.com/i.png");
if getuservar("second", "131313131313131313"):
	content.addln("this is a second message that only gets displayed if the uservar second is true for the user");
else if getuservar("third", "131313131313131313"):
	content.addln("third message");
else:
	content.addln("message if both first and second return false");
if message == "hi":
	setuservar("second", true, "131313131313131313");
else if message == "bye":
	setuservar("third", true, "131313131313131313");
else: {
	setuservar("second", false, "131313131313131313");
	setuservar("third", false, "131313131313131313");
}
// comment
`;

test("input stream", () => {
	expect(new InputStream(code)).toBeInstanceOf(InputStream);
});

test("token stream", () => {
	expect(new TokenStream(new InputStream(code))).toBeInstanceOf(TokenStream);
});

test("evaluation", () => {
	const environment = new Environment();
	const parsed = parse(code);

	function embed() {
		console.log("NEW EMBED MADE");
	}

	embed.description = (description: string) => {
		console.log(`EMBED DESCRIPTION SET TO ${description}`);
	};

	embed.title = (title: string) => {
		console.log(`EMBED TITLE SET TO ${title}`);
	};

	embed.footer = (footer: string) => {
		console.log(`EMBED FOOTER SET TO ${footer}`);
	};

	embed.color = (color: string) => {
		console.log(`EMBED COLOR SET TO ${color}`);
	};

	// @ts-ignore
	embed.footer.icon = (icon: string) => {
		console.log(`EMBED FOOTER ICON SET TO ${icon}`);
	};

	environment.define("embed", embed);
	environment.define("getuservar", () => Boolean(Math.round(Math.random())));
	environment.define("message", "h");
	environment.define("setuservar", (name: string, value: any, user: string) => {
		console.log(`var ${name} set to ${value} for ${user}`);
	});
	environment.define("content", {
		set: (value: string) => {
			console.log(`Content set to ${value}`);
		},
		addln: (value: string) => {
			console.log(`Line ${value} added to content`);
		}
	});

	expect(evaluate(parsed, environment)).toBe(undefined);
});
