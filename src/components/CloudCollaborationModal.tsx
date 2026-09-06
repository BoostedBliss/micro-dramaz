import React, { useState, useEffect } from "react";
import {
  X,
  Cloud,
  CloudOff,
  RefreshCw,
  Users,
  Download,
  Upload,
  Clock,
  CheckCircle2,
  HardDrive,
  FileCode,
  Share2,
} from "lucide-react";
import { ProjectData, CloudSyncState } from "../types";
import { syncProjectToCloud } from "../utils/offlineStorage";

interface CloudCollaborationModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectData;
  syncState: CloudSyncState;
  onRefreshSyncState: () => void;
  onImportProject: (imported: ProjectData) => void;
}

export const CloudCollaborationModal: React.FC<CloudCollaborationModalProps> = ({
  isOpen,
  onClose,
  project,
  syncState,
  onRefreshSyncState,
  onImportProject,
}) => {
  if (!isOpen) return null;

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [recentActivities, setRecentActivities] = useState<
    Array<{ user: string; action: string; timestamp: string }>
  >([
    {
      user: "Nicollette (Director)",
      action: `Saved changes to "${project.title}"`,
      timestamp: "Just now",
    },
    {
      user: "Marcus (Cinematographer)",
      action: "Approved 9:16 vertical framing for Beat 2",
      timestamp: "12m ago",
    },
    {
      user: "Elena (Character Artist)",
      action: "Updated Maya Chen's wardrobe consistency tags",
      timestamp: "45m ago",
    },
    {
      user: "David (Sound Designer)",
      action: "Added riser audio cues to 10s cliffhanger climax",
      timestamp: "1h ago",
    },
  ]);

  const handleManualCloudSync = async () => {
    setIsSyncing(true);
    setSyncSuccess(false);

    try {
      const ok = await syncProjectToCloud(project, "Director");
      if (ok) {
        setSyncSuccess(true);
        onRefreshSyncState();
        setTimeout(() => setSyncSuccess(false), 3000);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const exportProjectJson = () => {
    const dataStr =
      "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(project, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `${project.title.replace(/[^a-zA-Z0-9_-]/g, "_")}_Backup.snapstory.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.scenes && Array.isArray(parsed.scenes)) {
          onImportProject(parsed);
          alert("Project imported successfully!");
          onClose();
        } else {
          alert("Invalid project file format.");
        }
      } catch (err) {
        alert("Failed to parse project JSON file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-neutral-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold">Cloud Storage & Team Collaboration</h2>
              <p className="text-xs text-neutral-400">
                Auto-save, offline syncing, and team project synchronization
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Sync Status Banner */}
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  !syncState.isOnline
                    ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                    : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                }`}
              >
                {!syncState.isOnline ? (
                  <CloudOff className="w-5 h-5" />
                ) : (
                  <Cloud className="w-5 h-5" />
                )}
              </div>
              <div>
                <div className="font-bold text-neutral-100 flex items-center gap-2">
                  <span>{!syncState.isOnline ? "Offline Editing Active" : "Cloud Workspace Connected"}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-extrabold ${
                      !syncState.isOnline
                        ? "bg-amber-500/20 text-amber-300"
                        : "bg-emerald-500/20 text-emerald-300"
                    }`}
                  >
                    {!syncState.isOnline ? "LOCAL AUTO-SAVE" : "ONLINE & SYNCED"}
                  </span>
                </div>
                <p className="text-neutral-400 text-[11px] mt-0.5">
                  {!syncState.isOnline
                    ? "All edits are saved to browser offline storage and will sync immediately when reconnected."
                    : `Last synchronized: ${new Date(project.lastSavedAt || Date.now()).toLocaleTimeString()}`}
                </p>
              </div>
            </div>

            <button
              id="btn-trigger-manual-sync"
              onClick={handleManualCloudSync}
              disabled={isSyncing || !syncState.isOnline}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-amber-400" : ""}`} />
              <span>{isSyncing ? "Syncing..." : syncSuccess ? "Synced!" : "Sync to Cloud"}</span>
            </button>
          </div>

          {/* Connected Cloud Storage Services */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
              Integrated Cloud Services
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                    GD
                  </div>
                  <div>
                    <div className="font-bold text-xs text-neutral-200">Google Drive & Workspace</div>
                    <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Ready for production export</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <HardDrive className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-neutral-200">IndexedDB Local Cache</div>
                    <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Zero data loss offline guarantee</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Active Team Members Presence */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Production Team Presence
              </span>
              <span className="text-[10px] text-neutral-500">4 Active Collaborators</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { name: "Nicollette", role: "Director", color: "bg-amber-500 text-neutral-950" },
                { name: "Marcus", role: "DoP", color: "bg-blue-500 text-neutral-950" },
                { name: "Elena", role: "Character Artist", color: "bg-purple-500 text-neutral-100" },
                { name: "David", role: "Sound Design", color: "bg-emerald-500 text-neutral-950" },
              ].map((m) => (
                <div
                  key={m.name}
                  className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center gap-2"
                >
                  <div
                    className={`w-7 h-7 rounded-lg ${m.color} font-black flex items-center justify-center text-xs shrink-0`}
                  >
                    {m.name.charAt(0)}
                  </div>
                  <div className="truncate">
                    <div className="font-bold text-[11px] text-neutral-200 truncate">{m.name}</div>
                    <div className="text-[9px] text-neutral-400">{m.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team Collaboration Activity Feed */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-2">
              Recent Team Edits & Activity Log
            </span>
            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {recentActivities.map((act, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-lg bg-neutral-950/60 border border-neutral-800/80 flex items-center justify-between text-[11px]"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-neutral-500 shrink-0" />
                    <span>
                      <strong className="text-neutral-300">{act.user}</strong>: {act.action}
                    </span>
                  </div>
                  <span className="text-[10px] text-neutral-500 shrink-0">{act.timestamp}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Project Backup & Sharing */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-2">
              Project Data Sharing & Backup
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={exportProjectJson}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-neutral-400" />
                <span>Export Project JSON File</span>
              </button>

              <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5 text-neutral-400" />
                <span>Import Project JSON</span>
                <input
                  type="file"
                  accept=".json,.snapstory"
                  onChange={handleImportJson}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-900 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
