import treeSitterWasm from "@vscode/tree-sitter-wasm";
import type { Parser, Tree } from "@vscode/tree-sitter-wasm";
import { fileURLToPath } from "node:url";

// @vscode/tree-sitter-wasm's runtime is a UMD build (`module.exports = factory()`),
// which Node's CJS/ESM interop can't statically see named exports through - hence
// the default import + destructure here rather than `import { Parser, Language }`.
const { Parser: ParserCtor, Language } = treeSitterWasm;

let cSharpLanguage: Awaited<ReturnType<typeof Language.load>> | undefined;

/**
 * Loads the tree-sitter WASM runtime and the C# grammar, returning a parser
 * ready to parse C# source.
 *
 * Tree-sitter's WASM runtime requires an async init step before any parser
 * can be constructed, so callers await this once (e.g. during extension
 * activation) and reuse the returned parser for subsequent parses.
 *
 * @returns A `Parser` instance with the C# grammar already attached.
 */
export async function createCSharpParser(): Promise<Parser> {
	await ParserCtor.init();
	if (!cSharpLanguage) {
		const grammarPath = fileURLToPath(
			import.meta.resolve("@vscode/tree-sitter-wasm/wasm/tree-sitter-c-sharp.wasm"),
		);
		cSharpLanguage = await Language.load(grammarPath);
	}
	const parser = new ParserCtor();
	parser.setLanguage(cSharpLanguage);
	return parser;
}

/**
 * Parses a C# source string into a tree-sitter syntax tree.
 *
 * @param parser - A parser previously created by {@link createCSharpParser}.
 * @param source - The C# source text to parse.
 * @returns The resulting syntax tree.
 */
export function parseCSharp(parser: Parser, source: string): Tree {
	const tree = parser.parse(source);
	if (!tree) {
		throw new Error("tree-sitter failed to produce a syntax tree");
	}
	return tree;
}
