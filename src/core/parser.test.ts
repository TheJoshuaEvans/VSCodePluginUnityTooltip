import { test } from "node:test";
import assert from "node:assert/strict";
import { createCSharpParser, parseCSharp } from "./parser.ts";

test("parses valid C# into an error-free tree rooted at compilation_unit", async () => {
	const parser = await createCSharpParser();
	const tree = parseCSharp(parser, "class Foo { }");

	assert.equal(tree.rootNode.type, "compilation_unit");
	assert.equal(tree.rootNode.hasError, false);
});

test("flags invalid C# with an error node", async () => {
	const parser = await createCSharpParser();
	const tree = parseCSharp(parser, "class Foo { int x = ; }");

	assert.equal(tree.rootNode.hasError, true);
});
