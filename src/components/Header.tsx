import React from "react";
import {
  Film,
  Play,
  Share2,
  Download,
  Sparkles,
  Cloud,
  CloudOff,
  RefreshCw,
  Sliders,
  Users,
  FolderOpen,
  CheckCircle2,
  Layers,
  Palette,
} from "lucide-react";
import { ImageResolution, ProjectData, CloudSyncState } from "../types";
import { getTransitionMeta } from "../utils/transitionPresets";

interface HeaderProps {
  project: ProjectData;
  onUpdateProject: (updated: Partial<ProjectData>) => void;
  syncState: CloudSyncState;
  onManualSync: () => void;
  onOpenPlayer: () => void;
  onOpenExport: () => void;
  onOpenCloudSync: () => void;
  onOpenScriptUpload: () => void;
  onOpenCharacterBible: () => void;
  onOpenGlobalStyle: () => void;
  onOpenTransitions?: () => void;
  onToggleChat: () => void;
  isChatOpen: boolean;
  onSelectSampleScript: (sampleId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  project,
  onUpdateProject,
  syncState,
  onManualSync,
  onOpenPlayer,
  onOpenExport,
  onOpenCloudSync,
  onOpenScriptUpload,
  onOpenCharacterBible,
  onOpenGlobalStyle,
  onOpenTransitions,
  onToggleChat,
  isChatOpen,
  onSelectSampleScript,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-neutral-900/95 backdrop-blur-md border-b border-neutral-800 text-neutral-100 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Branding & Project Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-amber-400 to-yellow-200 bg-clip-text text-transparent">
                SnapStory AI
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
                Snapchat 10s Movies
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <span className="font-medium text-neutral-200 truncate max-w-[200px] sm:max-w-[320px]">
                {project.title || "Untitled Snapchat Project"}
              </span>
              <span>&bull;</span>
              <span>{project.scenes.length} Beats (10s each)</span>
            </div>
          </div>
        </div>

        {/* Center: Image Size Selector (Affordance for 1K, 2K, 4K) & Sample Scripts */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="flex items-center bg-neutral-800/80 border border-neutral-700/60 rounded-lg p-1 text-xs">
            <span className="text-neutral-400 px-2 font-medium">Image Res:</span>
            {(["1K", "2K", "4K"] as ImageResolution[]).map((res) => (
              <button
                key={res}
                id={`btn-res-${res}`}
                onClick={() => onUpdateProject({ selectedImageSize: res })}
                className={`px-2.5 py-1 rounded font-semibold transition-all ${
                  project.selectedImageSize === res
                    ? "bg-amber-500 text-neutral-950 shadow-sm"
                    : "text-neutral-300 hover:text-white hover:bg-neutral-700/50"
                }`}
                title={`Generate storyboards at ${res} high-resolution with gemini-3-pro-image-preview`}
              >
                {res}
              </button>
            ))}
          </div>

          {/* Sample Scripts Quick Selector */}
          <div className="relative">
            <select
              id="select-sample-script"
              onChange={(e) => {
                if (e.target.value) {
                  onSelectSampleScript(e.target.value);
                  e.target.value = "";
                }
              }}
              defaultValue=""
              className="bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-amber-500 focus:outline-none cursor-pointer"
            >
              <option value="" disabled>
                Load Sample Script...
              </option>
              <option value="glitch_apartment_404">The Glitch in 404 (Sci-Fi Thriller)</option>
              <option value="midnight_subway_car_6">Car 6 Has No Driver (Urban Suspense)</option>
            </select>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Sync & Offline Status */}
          <button
            id="btn-cloud-sync-status"
            onClick={onOpenCloudSync}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              !syncState.isOnline
                ? "bg-amber-950/40 text-amber-300 border-amber-800/60"
                : syncState.syncStatus === "syncing"
                ? "bg-blue-950/40 text-blue-300 border-blue-800/60"
                : "bg-neutral-800/80 text-neutral-300 border-neutral-700/60 hover:bg-neutral-800"
            }`}
            title="Click to manage team cloud sync and offline storage"
          >
            {!syncState.isOnline ? (
              <>
                <CloudOff className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Offline (Saved)</span>
              </>
            ) : syncState.syncStatus === "syncing" ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                <span className="hidden sm:inline">Syncing...</span>
              </>
            ) : (
              <>
                <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Cloud Synced</span>
              </>
            )}
          </button>

          {/* Global Style Preset Button */}
          <button
            id="btn-open-global-style"
            onClick={onOpenGlobalStyle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-800 hover:bg-neutral-750 text-amber-300 border border-amber-500/30 transition-all hover:border-amber-500/60"
            title="Apply a Global Style or Tone preset across all scene prompts to ensure unified aesthetic"
          >
            <Palette className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Style:</span>
            <span className="max-w-[100px] sm:max-w-[130px] truncate font-bold text-amber-200">
              {project.stylePreset || "Global Tone"}
            </span>
          </button>

          {/* 10s Break Transitions Master Button */}
          {onOpenTransitions && (
            <button
              id="btn-header-transitions"
              onClick={onOpenTransitions}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-800 hover:bg-neutral-750 text-blue-300 border border-blue-500/30 transition-all hover:border-blue-500/60"
              title="Configure visual transitions (fade-to-black, cross-dissolve, slide-in) for 10-second increment breaks"
            >
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Breaks:</span>
              <span className="max-w-[90px] sm:max-w-[120px] truncate font-bold text-blue-200">
                {
                  getTransitionMeta(
                    project.defaultTransition?.type || project.scenes[0]?.transitionToNext?.type
                  ).shortName
                }
              </span>
            </button>
          )}

          {/* Character Bible Button */}
          <button
            id="btn-open-character-bible"
            onClick={onOpenCharacterBible}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors"
            title="Manage Character Consistency Bible"
          >
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Characters ({project.characters.length})</span>
          </button>

          {/* Script Upload Button */}
          <button
            id="btn-open-script-upload"
            onClick={onOpenScriptUpload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors"
            title="Upload or paste script for AI 10-second breakdown"
          >
            <FolderOpen className="w-3.5 h-3.5 text-neutral-400" />
            <span className="hidden md:inline">Script</span>
          </button>

          {/* Play Snapchat Preview */}
          <button
            id="btn-play-snapchat-preview"
            onClick={onOpenPlayer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-yellow-300 border border-yellow-500/30 transition-colors"
            title="Preview 10-second increment movie player in 9:16 mobile frame"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Preview Player</span>
          </button>

          {/* Export Storyboards */}
          <button
            id="btn-export-storyboards"
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-100 border border-neutral-700 transition-colors"
            title="Export high-quality storyboards (ZIP bundle, EDL, CSV, PDF Binder)"
          >
            <Download className="w-3.5 h-3.5 text-neutral-400" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* AI Assistant Chatbot Toggle */}
          <button
            id="btn-toggle-gemini-chat"
            onClick={onToggleChat}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isChatOpen
                ? "bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20"
                : "bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30"
            }`}
            title="Chat with Gemini AI Director, Cinematographer, and Script Doctor"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">AI Director Chat</span>
          </button>
        </div>
      </div>
    </header>
  );
};
