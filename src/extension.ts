import * as vscode from "vscode";
import type { Parser, Point } from "@vscode/tree-sitter-wasm";
import { createCSharpParser } from "./core/parser.ts";
import { computeTooltipHover } from "./core/hover.ts";
import { isUnityProjectFolder } from "./core/workspace.ts";

/**
 * Whether any open workspace folder was detected as a Unity project.
 * Computed once in {@link activate} and reused by {@link isUnityWorkspace},
 * rather than re-checking the filesystem on every hover.
 */
let unityWorkspaceDetected = false;

/**
 * The shared tree-sitter parser used by the hover provider, created lazily
 * on first use by {@link getParser} rather than unconditionally at
 * activation.
 */
let parserPromise: Promise<Parser> | undefined;

/**
 * Lazily creates and caches the C# parser the hover provider needs, so its
 * one-time WASM init cost is only paid if hovering actually happens.
 *
 * @returns The shared parser instance.
 */
function getParser(): Promise<Parser> {
	parserPromise ??= createCSharpParser();
	return parserPromise;
}

/**
 * Called by VS Code once when the extension is activated. Checks every open
 * workspace folder for a Unity project marker, and - only if at least one is
 * found - registers the hover provider that shows `[Tooltip]` text, so this
 * extension stays entirely inert in non-Unity C# projects.
 *
 * @param context - The extension's context, used to register disposables
 * that VS Code cleans up automatically on deactivation.
 */
export async function activate(context: vscode.ExtensionContext): Promise<void> {
	const folders = vscode.workspace.workspaceFolders ?? [];
	const results = await Promise.all(folders.map((folder) => isUnityProjectFolder(folder.uri.fsPath)));
	unityWorkspaceDetected = results.some(Boolean);

	if (!unityWorkspaceDetected) {
		return;
	}

	context.subscriptions.push(
		vscode.languages.registerHoverProvider("csharp", {
			async provideHover(document, position) {
				const parser = await getParser();
				const point: Point = { row: position.line, column: position.character };
				const markdown = computeTooltipHover(parser, document.getText(), point);
				return markdown === undefined ? undefined : new vscode.Hover(new vscode.MarkdownString(markdown));
			},
		}),
	);
}

/**
 * Called by VS Code when the extension is deactivated.
 */
export function deactivate(): void {}

/**
 * Whether the current workspace was detected as a Unity project at
 * activation time.
 *
 * @returns Whether any open workspace folder looks like a Unity project.
 */
export function isUnityWorkspace(): boolean {
	return unityWorkspaceDetected;
}
