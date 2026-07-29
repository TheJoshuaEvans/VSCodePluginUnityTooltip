import { access } from "node:fs/promises";
import { join } from "node:path";

/**
 * Checks whether a folder looks like a Unity project, by checking for the
 * `ProjectSettings/ProjectVersion.txt` file every Unity project has - Unity
 * writes it itself on project creation, and nothing else has a reason to.
 *
 * Used to scope hover activation to Unity workspaces specifically, so this
 * extension stays quiet in ordinary (non-Unity) C# projects.
 *
 * @param folderPath - Absolute path to the candidate folder.
 * @returns Whether the folder looks like a Unity project root.
 */
export async function isUnityProjectFolder(folderPath: string): Promise<boolean> {
	try {
		await access(join(folderPath, "ProjectSettings", "ProjectVersion.txt"));
		return true;
	} catch {
		return false;
	}
}
