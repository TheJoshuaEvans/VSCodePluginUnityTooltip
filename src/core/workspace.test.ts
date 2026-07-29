import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { isUnityProjectFolder } from "./workspace.ts";

/**
 * Creates a fresh temp directory for a test, optionally seeded to look like
 * a Unity project root, and registers its cleanup on `t`.
 *
 * @param t - The running test's context, used to schedule cleanup.
 * @param seedAsUnityProject - Whether to write a `ProjectSettings/ProjectVersion.txt` marker.
 * @returns The created directory's absolute path.
 */
async function createFixtureFolder(t: import("node:test").TestContext, seedAsUnityProject: boolean): Promise<string> {
	const folderPath = await mkdtemp(join(tmpdir(), "unity-tooltip-workspace-test-"));
	t.after(() => rm(folderPath, { recursive: true, force: true }));

	if (seedAsUnityProject) {
		await mkdir(join(folderPath, "ProjectSettings"));
		await writeFile(join(folderPath, "ProjectSettings", "ProjectVersion.txt"), "m_EditorVersion: 6000.0.0f1\n");
	}

	return folderPath;
}

test("recognizes a folder with ProjectSettings/ProjectVersion.txt as a Unity project", async (t) => {
	const folderPath = await createFixtureFolder(t, true);
	assert.equal(await isUnityProjectFolder(folderPath), true);
});

test("does not recognize an ordinary folder as a Unity project", async (t) => {
	const folderPath = await createFixtureFolder(t, false);
	assert.equal(await isUnityProjectFolder(folderPath), false);
});

test("does not recognize a nonexistent folder as a Unity project", async () => {
	assert.equal(await isUnityProjectFolder(join(tmpdir(), "definitely-does-not-exist-unity-tooltip")), false);
});
