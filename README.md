# VS Code Unity Tooltip Hover

A VS Code extension that shows a Unity field's `[Tooltip("...")]` attribute text as
IDE hover documentation - closing a feature gap that exists in every other major
Unity-aware C# editor.

## The problem

Both JetBrains Rider (via its bundled Unity plugin) and Visual Studio (via Visual
Studio Tools for Unity / VSTU) already surface `[Tooltip("...")]` content as
hover/QuickInfo documentation when you hover a `[SerializeField]` field in source.
The explicit intent (per JetBrains' own docs) is "so you don't have to add
unnecessary summaries" - one string, shown both in the Unity Inspector and in the
IDE.

VS Code has no equivalent. This was confirmed by hand (no luck) and by research
(see below) before starting this project - it isn't a case of the feature existing
somewhere unexpected.

## What this extension does

Hover a Unity-serialized field (or its declaration) that has a
`[Tooltip("...")]` attribute -> show that string as hover documentation, same as
Rider/VSTU already do.

## Prior art checked (none of it solves this)

- **Official "Unity for Visual Studio Code" extension**
  (`VisualStudioToolsForUnity.vstuc`, Microsoft, built on C# Dev Kit). Bundles
  [Microsoft.Unity.Analyzers](https://github.com/microsoft/Microsoft.Unity.Analyzers) -
  Roslyn analyzers that catch Unity-specific correctness bugs (e.g. `GetComponent`
  in a hot loop, coroutine misuse) - plus general hover docs for Unity *engine*
  APIs. Nothing found confirms it surfaces a *user's own* `[Tooltip]` attribute
  content as hover text on their custom fields. Different problem (code
  correctness + engine API docs), not this one.
- **[UnityContrib/code-analysis](https://github.com/UnityContrib/code-analysis)**
  (community Roslyn analyzers). Has a `UCHasTooltip` rule that flags any
  `[SerializeField]` missing a `[Tooltip]`, with an auto-fix - but the fix just
  inserts an empty `[Tooltip("")]` for you to fill in by hand. Enforces
  *presence*, doesn't derive or display *content*. Adjacent, not the same thing.
  (There's also a `UCNonEmptyTooltip` rule with no auto-fix.)
- Rider's own tooltip-hover feature has an open regression as of this writing
  ([RIDER-69836](https://youtrack.jetbrains.com/issue/RIDER-69836), "Rider no
  longer shows any tooltips for anything") - unrelated to building this, but
  explains why the feature might currently look broken/missing even where it's
  supposed to exist.

## Architecture decision: tree-sitter, not regex, not Roslyn

The core problem is: given a cursor position, determine whether it's over a field
declaration, and if that field has a `[Tooltip("...")]` attribute, extract the
string. Multiple options were weighted, but this was the final choice:

1. **Tree-sitter** (`tree-sitter-c-sharp` grammar, via the `web-tree-sitter` WASM
   build). Real syntax tree, runs in-process with no native binary/per-platform
   build complexity, fast and incremental, well-trodden path for VS Code
   extensions that need structural awareness without full semantic analysis.
   **Chosen.**

## Core VS Code API surface

- `vscode.languages.registerHoverProvider(selector, { provideHover })` - standard,
  well-documented hover provider API.
- Should only activate for files recognized as Unity C# scripts (e.g. a
  `UnityEngine` using directive, or the workspace containing
  `ProjectSettings/ProjectVersion.txt`) to avoid odd behavior in non-Unity C#
  projects.

## Status

Design/research only so far - this README captures the findings and decisions
from that discussion. No code written yet. Next step is scaffolding the extension
project (package.json, tree-sitter-c-sharp dependency, hover provider skeleton).
