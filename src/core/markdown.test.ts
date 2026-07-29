import { test } from "node:test";
import assert from "node:assert/strict";
import { escapeMarkdown } from "./markdown.ts";

test("leaves plain text with no special characters unchanged", () => {
	assert.equal(escapeMarkdown("How fast the thing goes"), "How fast the thing goes");
});

test("escapes underscores so they don't trigger emphasis", () => {
	assert.equal(escapeMarkdown("player_health"), String.raw`player\_health`);
});

test("escapes asterisks so they don't trigger emphasis", () => {
	assert.equal(escapeMarkdown("very*important*setting"), String.raw`very\*important\*setting`);
});

test("escapes backticks so they don't trigger inline code", () => {
	assert.equal(escapeMarkdown("wraps `Foo.Bar`"), "wraps \\`Foo\\.Bar\\`");
});

test("escapes square brackets and parens so they don't trigger a link", () => {
	assert.equal(escapeMarkdown("see [docs](http://example.com)"), "see \\[docs\\]\\(http://example\\.com\\)");
});

test("escapes angle brackets and pipes", () => {
	assert.equal(escapeMarkdown("a <b> | c"), String.raw`a \<b\> \| c`);
});

test("escapes a literal backslash without double-escaping adjacent characters", () => {
	assert.equal(escapeMarkdown(String.raw`a\b_c`), String.raw`a\\b\_c`);
});
