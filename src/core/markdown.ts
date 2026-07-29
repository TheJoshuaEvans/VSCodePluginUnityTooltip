/**
 * Escapes Markdown-significant characters in plain text so it renders as
 * literal text rather than being interpreted as Markdown formatting.
 *
 * Needed because hover content renders as a `vscode.MarkdownString` -
 * without this, a tooltip like `"player_health"` would render as
 * "playerhealth" in italics, since a bare underscore is Markdown emphasis
 * syntax the tooltip's author never intended.
 *
 * @param text - Plain text, as authored in a `[Tooltip("...")]` attribute.
 * @returns The same text with Markdown-significant characters escaped.
 */
/** Characters that carry Markdown meaning and must be escaped to appear literally. */
const MARKDOWN_SPECIAL_CHARACTERS = /[\\`*_{}[\]()#+\-.!|<>]/g;

export function escapeMarkdown(text: string): string {
	return text.replace(MARKDOWN_SPECIAL_CHARACTERS, (character) => `\\${character}`);
}
