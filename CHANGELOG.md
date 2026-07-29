# Changelog

All notable changes to this extension are documented here. Format loosely follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## [1.0.0] - 2026-07-29

First stable release. Functionality is unchanged from 0.0.3 - this marks the extension as feature-complete and verified end-to-end (both automated, including a real hover-provider integration test, and by hand against a real Unity project), not a behavior change.

- Marketplace listing now includes searchable keywords and a themed gallery banner.
- Added an automated integration test that exercises the real hover provider end-to-end (`vscode.executeHoverProvider` against a real Unity-shaped fixture workspace), rather than relying on manual verification alone.

## [0.0.3]

- Added an extension icon.
- Fixed a `vsce package` failure caused by literal `[...]` characters in the README's image alt text.
- `.github/` workflow files are no longer bundled into the packaged `.vsix`.
- README overhauled: accurate installation instructions, a screenshot, and a description of how the extension actually works.
- Added a weekly scheduled CI run against the latest VS Code release, to catch regressions from VS Code updates independent of any code change here.
- Fixed a bug where pushes to `main` without a version bump never ran tests at all.
- CI/CD: automatic tagging and GitHub Releases on version bumps; pinned GitHub Actions to v7 to stop relying on a deprecated Node 20 runtime.
- Added the MIT license.

## [0.0.1] - 2026-07-28

Initial release. Hovering a Unity field's `[Tooltip("...")]` attribute shows its text as IDE hover documentation, matching the equivalent feature already in Rider and Visual Studio Tools for Unity. Scoped to C# files in workspaces that look like Unity projects (detected via `ProjectSettings/ProjectVersion.txt`).
