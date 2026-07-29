import type { Node, Point, Tree } from "@vscode/tree-sitter-wasm";

/**
 * Finds the position of an `identifier` node with the given text, for
 * pointing extraction functions at a specific field name in a test's source
 * without hardcoding fragile row/column numbers by hand.
 *
 * @param tree - The tree to search.
 * @param name - The identifier text to find.
 * @returns The matching identifier's start position.
 * @throws If no `identifier` node with that text exists in the tree.
 */
export function identifierPosition(tree: Tree, name: string): Point {
	const position = findIdentifierPosition(tree.rootNode, name);
	if (!position) {
		throw new Error(`no identifier named "${name}" found in tree`);
	}
	return position;
}

/**
 * Recursively searches from a node for the first `identifier` whose text
 * matches `name`.
 *
 * @param node - The node to search from.
 * @param name - The identifier text to find.
 * @returns The match's start position, or `undefined` if none is found under `node`.
 */
function findIdentifierPosition(node: Node, name: string): Point | undefined {
	if (node.type === "identifier" && node.text === name) {
		return node.startPosition;
	}
	for (let i = 0; i < node.childCount; i++) {
		const found = findIdentifierPosition(node.child(i)!, name);
		if (found) {
			return found;
		}
	}
	return undefined;
}
