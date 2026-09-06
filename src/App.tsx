import React, { useState, useEffect, useCallback, useRef } from "react";
import { Header } from "./components/Header";
import { StoryboardTimeline } from "./components/StoryboardTimeline";
import { EditingSuiteModal } from "./components/EditingSuiteModal";
import { SnapchatPlayerModal } from "./components/SnapchatPlayerModal";
import { CharacterBibleManager } from "./components/CharacterBibleManager";
import { ScriptUploaderModal } from "./components/ScriptUploaderModal";
import { GeminiChatbotDrawer } from "./components/GeminiChatbotDrawer";
import { CloudCollaborationModal } from "./components/CloudCollaborationModal";
import { ExportProductionModal } from "./components/ExportProductionModal";
import { GlobalStyleModal } from "./components/GlobalStyleModal";
import { GlobalTransitionModal } from "./components/GlobalTransitionModal";

import { ProjectData, SceneBeat, CloudSyncState } from "./types";
import {
  sampleGlitchApartmentProject,
  sampleSubwayGhostProject,
} from "./data/sampleScripts";
import {
  loadProjectLocally,
  saveProjectLocally,
  syncProjectToCloud,
  getPendingSyncCount,
} from "./utils/offlineStorage";

export default function App() {
  // Initialize project state from localStorage or load sample
  const [project, setProject] = useState<ProjectData>(() => {
    const saved = loadProjectLocally();
    return saved || sampleGlitchApartmentProject;
  });

  // Offline / Cloud Sync State
  const [syncState, setSyncState] = useState<CloudSyncState>({
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    lastSyncedAt: Date.now(),
    pendingChangesCount: 0,
    syncStatus: "idle",
  });

  // Modal & Drawer State
  const [activeEditingScene, setActiveEditingScene] = useState<SceneBeat | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [isCharacterBibleOpen, setIsCharacterBibleOpen] = useState(false);
  const [isScriptUploadOpen, setIsScriptUploadOpen] = useState(false);
  const [isGlobalStyleOpen, setIsGlobalStyleOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCloudSyncOpen, setIsCloudSyncOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isTransitionModalOpen, setIsTransitionModalOpen] = useState(false);

  // Auto-save debounce timer
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Update project helper with auto-save
  const handleUpdateProject = useCallback((updated: Partial<ProjectData>) => {
    setProject((prev) => {
      const nextProject: ProjectData = {
        ...prev,
        ...updated,
        lastSavedAt: Date.now(),
      };

      // Auto-save to local storage immediately
      saveProjectLocally(nextProject);

      // Debounce background cloud sync
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      autoSaveTimerRef.current = setTimeout(async () => {
        if (navigator.onLine) {
          setSyncState((s) => ({ ...s, syncStatus: "syncing" }));
          const ok = await syncProjectToCloud(nextProject);
          setSyncState((s) => ({
            ...s,
            syncStatus: ok ? "idle" : "error",
            lastSyncedAt: ok ? Date.now() : s.lastSyncedAt,
            pendingChangesCount: getPendingSyncCount(),
          }));
        }
      }, 2000);

      return nextProject;
    });
  }, []);

  // Online / Offline listeners
  useEffect(() => {
    const handleOnline = async () => {
      setSyncState((prev) => ({ ...prev, isOnline: true, syncStatus: "syncing" }));
      // Attempt syncing pending edits
      await syncProjectToCloud(project);
      setSyncState((prev) => ({
        ...prev,
        syncStatus: "idle",
        lastSyncedAt: Date.now(),
        pendingChangesCount: getPendingSyncCount(),
      }));
    };

    const handleOffline = () => {
      setSyncState((prev) => ({ ...prev, isOnline: false }));
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [project]);

  // Load sample script projects
  const handleSelectSampleScript = (sampleId: string) => {
    if (sampleId === "glitch_apartment_404") {
      handleUpdateProject(sampleGlitchApartmentProject);
    } else if (sampleId === "midnight_subway_car_6") {
      handleUpdateProject(sampleSubwayGhostProject);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-amber-500 selection:text-neutral-950">
      {/* Top Application Header */}
      <Header
        project={project}
        onUpdateProject={handleUpdateProject}
        syncState={syncState}
        onManualSync={() => syncProjectToCloud(project)}
        onOpenPlayer={() => setIsPlayerOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenCloudSync={() => setIsCloudSyncOpen(true)}
        onOpenScriptUpload={() => setIsScriptUploadOpen(true)}
        onOpenCharacterBible={() => setIsCharacterBibleOpen(true)}
        onOpenGlobalStyle={() => setIsGlobalStyleOpen(true)}
        onOpenTransitions={() => setIsTransitionModalOpen(true)}
        onToggleChat={() => setIsChatOpen(!isChatOpen)}
        isChatOpen={isChatOpen}
        onSelectSampleScript={handleSelectSampleScript}
      />

      {/* Main Storyboard Canvas & Timeline */}
      <main className="flex-1 pb-16">
        <StoryboardTimeline
          project={project}
          onUpdateProject={handleUpdateProject}
          onOpenEditingSuite={(scene) => setActiveEditingScene(scene)}
          onOpenPlayer={() => setIsPlayerOpen(true)}
          onOpenCharacterBible={() => setIsCharacterBibleOpen(true)}
          onOpenGlobalStyle={() => setIsGlobalStyleOpen(true)}
        />
      </main>

      {/* Editing Suite Modal for Composition and Lighting Adjustments */}
      <EditingSuiteModal
        isOpen={!!activeEditingScene}
        onClose={() => setActiveEditingScene(null)}
        scene={activeEditingScene}
        onSaveScene={(updatedScene) => {
          const updatedScenes = project.scenes.map((s) =>
            s.id === updatedScene.id ? updatedScene : s
          );
          handleUpdateProject({ scenes: updatedScenes });
          setActiveEditingScene(null);
        }}
      />

      {/* Snapchat 10s Movie Player Simulator */}
      <SnapchatPlayerModal
        isOpen={isPlayerOpen}
        onClose={() => setIsPlayerOpen(false)}
        scenes={project.scenes}
        projectTitle={project.title}
      />

      {/* AI Character Consistency Bible Manager */}
      <CharacterBibleManager
        isOpen={isCharacterBibleOpen}
        onClose={() => setIsCharacterBibleOpen(false)}
        characters={project.characters}
        onUpdateCharacters={(characters) => handleUpdateProject({ characters })}
      />

      {/* Script Upload & 10-Second Beat Analyzer Modal */}
      <ScriptUploaderModal
        isOpen={isScriptUploadOpen}
        onClose={() => setIsScriptUploadOpen(false)}
        onApplyParsedProject={(parsed) => handleUpdateProject(parsed)}
      />

      {/* Gemini Multi-turn Chatbot Drawer */}
      <GeminiChatbotDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        project={project}
      />

      {/* Cloud Collaboration & Offline Sync Modal */}
      <CloudCollaborationModal
        isOpen={isCloudSyncOpen}
        onClose={() => setIsCloudSyncOpen(false)}
        project={project}
        syncState={syncState}
        onRefreshSyncState={() =>
          setSyncState((s) => ({
            ...s,
            lastSyncedAt: Date.now(),
            pendingChangesCount: getPendingSyncCount(),
          }))
        }
        onImportProject={(imported) => handleUpdateProject(imported)}
      />

      {/* Export Production Package Modal */}
      <ExportProductionModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        project={project}
      />

      {/* Global Style & Tone Preset Modal */}
      <GlobalStyleModal
        isOpen={isGlobalStyleOpen}
        onClose={() => setIsGlobalStyleOpen(false)}
        project={project}
        onUpdateProject={handleUpdateProject}
      />

      {/* Global 10s Break Transitions Master Modal */}
      <GlobalTransitionModal
        isOpen={isTransitionModalOpen}
        onClose={() => setIsTransitionModalOpen(false)}
        project={project}
        onUpdateProject={handleUpdateProject}
      />
    </div>
  );
}
