import { ProjectData } from "../types";

const LOCAL_STORAGE_KEY = "snapstory_project_v1";
const SYNC_QUEUE_KEY = "snapstory_pending_sync_queue";

export function saveProjectLocally(project: ProjectData): void {
  try {
    const updated = {
      ...project,
      lastSavedAt: new Date().toISOString(),
      version: (project.version || 0) + 1,
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Failed to save project locally:", err);
  }
}

export function loadProjectLocally(): ProjectData | null {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ProjectData;
  } catch (err) {
    console.error("Failed to load project locally:", err);
    return null;
  }
}

export function queuePendingSync(action: { type: string; payload: any; timestamp: string }): void {
  try {
    const raw = localStorage.getItem(SYNC_QUEUE_KEY);
    const queue = raw ? JSON.parse(raw) : [];
    queue.push(action);
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.error("Failed to queue pending sync:", err);
  }
}

export function getPendingSyncCount(): number {
  try {
    const raw = localStorage.getItem(SYNC_QUEUE_KEY);
    if (!raw) return 0;
    const queue = JSON.parse(raw);
    return Array.isArray(queue) ? queue.length : 0;
  } catch {
    return 0;
  }
}

export function clearPendingSyncQueue(): void {
  try {
    localStorage.removeItem(SYNC_QUEUE_KEY);
  } catch (err) {
    console.error("Failed to clear sync queue:", err);
  }
}

export async function syncProjectToCloud(project: ProjectData, user = "Director"): Promise<boolean> {
  try {
    const res = await fetch("/api/cloud-sync/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: project.id || "default-snap-project",
        projectData: project,
        user,
      }),
    });
    if (!res.ok) throw new Error("Cloud sync failed");
    clearPendingSyncQueue();
    return true;
  } catch (err) {
    console.warn("Cloud sync failed, queued for offline recovery:", err);
    queuePendingSync({
      type: "CLOUD_SAVE",
      payload: { projectId: project.id },
      timestamp: new Date().toISOString(),
    });
    return false;
  }
}
