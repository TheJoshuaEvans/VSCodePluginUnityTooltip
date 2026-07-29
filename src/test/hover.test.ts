import * as assert from "node:assert/strict";
import * as vscode from "vscode";
import { createCSharpParser, parseCSharp } from "../core/parser.ts";
import { identifierPosition } from "../core/testHelpers.ts";

suite("Hover provider", () => {
	test("shows the Markdown-escaped Tooltip text for a real field in a real document", async () => {
		const folder = vscode.workspace.workspaceFolders?.[0];
		assert.ok(folder, "expected the test host to have opened the fixture workspace");

		const fileUri = vscode.Uri.joinPath(folder.uri, "Sample.cs");
		const document = await vscode.workspace.openTextDocument(fileUri);

		// Reuses our own parser/lookup rather than a hand-counted line/column,
		// so this test doesn't silently drift if the fixture file is edited.
		const parser = await createCSharpParser();
		const tree = parseCSharp(parser, document.getText());
		const fieldPosition = identifierPosition(tree, "health");
		const position = new vscode.Position(fieldPosition.row, fieldPosition.column);

		const hovers =
			(await vscode.commands.executeCommand<vscode.Hover[]>(
				"vscode.executeHoverProvider",
				fileUri,
				position,
			)) ?? [];

		const matched = hovers.some((hover) =>
			hover.contents.some((content) => {
				const text = content instanceof vscode.MarkdownString ? content.value : String(content);
				return text === String.raw`player\_health`;
			}),
		);
		assert.ok(matched, "expected a hover containing the Markdown-escaped Tooltip text");
	});
});
