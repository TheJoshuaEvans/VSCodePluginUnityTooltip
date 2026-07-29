import { test } from "node:test";
import assert from "node:assert/strict";
import { createCSharpParser, parseCSharp } from "./parser.ts";
import { computeTooltipHover } from "./hover.ts";
import { identifierPosition } from "./testHelpers.ts";

test("returns Markdown-escaped hover text for a field with a Tooltip", async () => {
	const parser = await createCSharpParser();
	const tree = parseCSharp(
		parser,
		`public class Foo
{
	[Tooltip("player_health")]
	[SerializeField] int health;
}
`,
	);

	assert.equal(
		computeTooltipHover(parser, tree.rootNode.text, identifierPosition(tree, "health")),
		String.raw`player\_health`,
	);
});

test("returns undefined for a field with no Tooltip", async () => {
	const parser = await createCSharpParser();
	const tree = parseCSharp(
		parser,
		`public class Foo
{
	[SerializeField] int health;
}
`,
	);

	assert.equal(computeTooltipHover(parser, tree.rootNode.text, identifierPosition(tree, "health")), undefined);
});

test("returns undefined when the position isn't over a field declaration", async () => {
	const parser = await createCSharpParser();
	const tree = parseCSharp(
		parser,
		`public class Foo
{
}
`,
	);

	assert.equal(computeTooltipHover(parser, tree.rootNode.text, identifierPosition(tree, "Foo")), undefined);
});
