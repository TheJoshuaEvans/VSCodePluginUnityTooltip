import type { Node, Point, Tree } from "@vscode/tree-sitter-wasm";

/** Both spellings C# allows when applying the attribute: with or without the `Attribute` suffix. */
const TOOLTIP_ATTRIBUTE_NAMES = new Set(["Tooltip", "TooltipAttribute"]);

/**
 * Finds the `[Tooltip("...")]` attribute text covering a position in a parsed
 * C# syntax tree, decoded to its real string value (escape sequences and a
 * verbatim string's `""` both resolved).
 *
 * A field declared with multiple comma-separated names - e.g.
 * `[Tooltip("hp")] int a, b;` - shares one `[Tooltip]` across every name it
 * declares, since the attribute applies to the whole field declaration
 * rather than to an individual variable. Any position within that
 * declaration resolves to the same tooltip text regardless of which name
 * it's over.
 *
 * @param tree - A tree previously produced by {@link parseCSharp}.
 * @param position - The position to look up, typically the hover cursor's location.
 * @returns The Tooltip's decoded text, or `undefined` if `position` isn't over
 * a field declaration that carries a `[Tooltip]` attribute.
 */
export function findTooltipAt(tree: Tree, position: Point): string | undefined {
	let node: Node | null = tree.rootNode.descendantForPosition(position);
	while (node && node.type !== "field_declaration") {
		node = node.parent;
	}
	if (!node) {
		return undefined;
	}

	for (const attributeList of node.namedChildren) {
		if (attributeList?.type !== "attribute_list") {
			continue;
		}
		for (const attribute of attributeList.namedChildren) {
			if (attribute?.type !== "attribute") {
				continue;
			}
			const name = attribute.namedChild(0);
			if (!name || !TOOLTIP_ATTRIBUTE_NAMES.has(name.text)) {
				continue;
			}
			const literal = attribute.namedChild(1)?.namedChild(0)?.namedChild(0);
			if (literal) {
				return decodeCSharpStringLiteral(literal);
			}
		}
	}
	return undefined;
}

/**
 * Decodes a tree-sitter `string_literal` or `verbatim_string_literal` node's
 * source text into the real string value it represents in C# - resolving
 * escape sequences for a regular string literal, or collapsing a verbatim
 * string's `""` into a single literal quote.
 *
 * @param node - A `string_literal` or `verbatim_string_literal` node.
 * @returns The decoded string value.
 * @throws If `node` is neither a `string_literal` nor a `verbatim_string_literal`.
 */
export function decodeCSharpStringLiteral(node: Node): string {
	if (node.type === "verbatim_string_literal") {
		return node.text.slice(2, -1).replace(/""/g, '"');
	}
	if (node.type !== "string_literal") {
		throw new Error(`expected a string_literal or verbatim_string_literal node, got "${node.type}"`);
	}

	let result = "";
	for (const child of node.namedChildren) {
		if (child?.type === "string_literal_content") {
			result += child.text;
		} else if (child?.type === "escape_sequence") {
			result += decodeEscapeSequence(child.text);
		}
	}
	return result;
}

/** C#'s single-character escape sequences that don't need further decoding. */
const SIMPLE_ESCAPE_SEQUENCES: Record<string, string> = {
	"\\n": "\n",
	"\\r": "\r",
	"\\t": "\t",
	"\\0": "\0",
	"\\\\": "\\",
	'\\"': '"',
	"\\'": "'",
	"\\a": "\x07",
	"\\b": "\b",
	"\\f": "\f",
	"\\v": "\v",
};

/**
 * Decodes a single C# escape sequence's raw source text - e.g. `\n`, or a
 * `\uXXXX` unicode escape - into the character it represents.
 *
 * @param raw - The escape sequence's literal source text, backslash included.
 * @returns The decoded character, or `raw` unchanged if it isn't recognized.
 */
function decodeEscapeSequence(raw: string): string {
	const simple = SIMPLE_ESCAPE_SEQUENCES[raw];
	if (simple !== undefined) {
		return simple;
	}
	if (raw.startsWith("\\u") || raw.startsWith("\\x") || raw.startsWith("\\U")) {
		return String.fromCodePoint(Number.parseInt(raw.slice(2), 16));
	}
	return raw;
}
