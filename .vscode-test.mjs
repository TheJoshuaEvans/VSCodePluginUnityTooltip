import { defineConfig } from "@vscode/test-cli";
import path from "node:path";

export default defineConfig({
	files: "out/test/**/*.test.js",
	// Unity-shaped (has ProjectSettings/ProjectVersion.txt) so the hover
	// provider actually registers - see src/extension.ts's isUnityWorkspace gate.
	workspaceFolder: path.join(import.meta.dirname, "src/test/fixtures/sample-workspace"),
});
