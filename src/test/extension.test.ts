import * as assert from "node:assert/strict";
import * as vscode from "vscode";

suite("Extension activation", () => {
	test("activates without throwing", async () => {
		const extension = vscode.extensions.all.find(
			(candidate) => candidate.packageJSON.name === "vscode-unity-tooltip-hover",
		);
		assert.ok(extension, "expected the extension under test to be present in the Extension Development Host");
		await extension.activate();
		assert.equal(extension.isActive, true);
	});
});
