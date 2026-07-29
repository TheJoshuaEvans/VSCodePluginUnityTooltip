import type { Parser, Point } from "@vscode/tree-sitter-wasm";
import { parseCSharp } from "./parser.ts";
import { findTooltipAt } from "./tooltip.ts";
import { escapeMarkdown } from "./markdown.ts";

/**
 * Computes the Markdown hover content for a position in C# source, or
 * `undefined` if that position isn't over a field with a `[Tooltip]`.
 *
 * Combines parsing, `[Tooltip]` extraction, and Markdown escaping into the
 * one pure computation the hover provider needs, kept free of `vscode`
 * types so it's unit-testable without an Extension Host - the actual
 * `vscode.HoverProvider` is a thin adapter over this.
 *
 * @param parser - A parser previously created by {@link createCSharpParser}.
 * @param source - The full text of the document being hovered.
 * @param position - The hover position within `source`.
 * @returns Markdown-escaped hover text, or `undefined` if nothing applies.
 */
export function computeTooltipHover(parser: Parser, source: string, position: Point): string | undefined {
	const tree = parseCSharp(parser, source);
	const tooltip = findTooltipAt(tree, position);
	return tooltip === undefined ? undefined : escapeMarkdown(tooltip);
}
