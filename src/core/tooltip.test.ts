import { test } from "node:test";
import assert from "node:assert/strict";
import { createCSharpParser, parseCSharp } from "./parser.ts";
import { findTooltipAt } from "./tooltip.ts";
import { identifierPosition } from "./testHelpers.ts";

test("finds a Tooltip on a simple field", async () => {
	const parser = await createCSharpParser();
	const tree = parseCSharp(
		parser,
		`public class Foo
{
	[Tooltip("How fast the thing goes.")]
	[SerializeField] float speed;
}
`,
	);

	assert.equal(findTooltipAt(tree, identifierPosition(tree, "speed")), "How fast the thing goes.");
});

test("shares one Tooltip across every name in a multi-declarator field", async () => {
	const parser = await createCSharpParser();
	const tree = parseCSharp(
		parser,
		`public class Foo
{
	[Tooltip("Shared")]
	[SerializeField] float a, b;
}
`,
	);

	assert.equal(findTooltipAt(tree, identifierPosition(tree, "a")), "Shared");
	assert.equal(findTooltipAt(tree, identifierPosition(tree, "b")), "Shared");
});

test("decodes escape sequences in a regular string literal", async () => {
	const parser = await createCSharpParser();
	const tree = parseCSharp(
		parser,
		`public class Foo
{
	[Tooltip("Line one\\nLine two")]
	[SerializeField] int count;
}
`,
	);

	assert.equal(findTooltipAt(tree, identifierPosition(tree, "count")), "Line one\nLine two");
});

test("decodes a verbatim string literal, including embedded quotes", async () => {
	const parser = await createCSharpParser();
	const tree = parseCSharp(
		parser,
		`public class Foo
{
	[Tooltip(@"Say ""hi"".")]
	[SerializeField] int count;
}
`,
	);

	assert.equal(findTooltipAt(tree, identifierPosition(tree, "count")), 'Say "hi".');
});

test("returns undefined when the field has no Tooltip attribute", async () => {
	const parser = await createCSharpParser();
	const tree = parseCSharp(
		parser,
		`public class Foo
{
	[SerializeField] int count;
}
`,
	);

	assert.equal(findTooltipAt(tree, identifierPosition(tree, "count")), undefined);
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

	assert.equal(findTooltipAt(tree, identifierPosition(tree, "Foo")), undefined);
});
