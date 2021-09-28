/* eslint-disable capitalized-comments */
"use strict";

const {Environment, evaluate} = require("../src");
const InputStream = require("../src/parsing/InputStream");
const Parser = require("../src/parsing/Parser");
const TokenStream = require("../src/parsing/TokenStream");

const iStream = new InputStream(`
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
`);

// while (!iStream.eof()) {
// 	console.log(iStream.next());
// }

const tStream = new TokenStream(iStream);

// while (!tStream.eof()) {
// 	console.log(tStream.next());
// }

const parsed = new Parser(tStream).parse();

// console.log(parsed);

const globalEnvironment = new Environment();

function embed() {
	console.log("NEW EMBED MADE");
}

embed.description = description => {
	console.log(`EMBED DESCRIPTION SET TO ${description}`);
};

embed.title = title => {
	console.log(`EMBED TITLE SET TO ${title}`);
};

embed.footer = footer => {
	console.log(`EMBED FOOTER SET TO ${footer}`);
};

embed.color = color => {
	console.log(`EMBED COLOR SET TO ${color}`);
};

embed.footer.icon = icon => {
	console.log(`EMBED FOOTER ICON SET TO ${icon}`);
};

globalEnvironment.define("embed", embed);
globalEnvironment.define("getuservar", () => Boolean(Math.round(Math.random())));
globalEnvironment.define("message", "h");
globalEnvironment.define("setuservar", (name, value, user) => {
	console.log(`var ${name} set to ${value} for ${user}`);
});
globalEnvironment.define("content", {
	set: value => {
		console.log(`Content set to ${value}`);
	},
	addln: value => {
		console.log(`Line ${value} added to content`);
	}
});

evaluate(parsed, globalEnvironment);
