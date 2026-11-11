import React, { useState } from "react";
import {
  Sparkles,
  Sliders,
  Play,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Camera,
  Film,
  Zap,
  CheckCircle2,
  RefreshCw,
  Copy,
  Users,
  Eye,
  Sun,
  AlertCircle,
  Image as ImageIcon,
  Palette,
  Wand2,
  Layers,
} from "lucide-react";
import { SceneBeat, ProjectData, Character } from "../types";
import {
  getThematicPlaceholderThumbnail,
  generateAIPlaceholderThumbnail,
  STORYBOARD_PLACEHOLDER_STYLES,
  generateSvgStoryboardPlaceholder,
} from "../utils/placeholderThumbnails";
import { TransitionBreakSelector } from "./TransitionBreakSelector";
import { GlobalTransitionModal } from "./GlobalTransitionModal";
import {
  getTransitionMeta,
  applyTransitionToAllScenes,
  DEFAULT_BEAT_TRANSITION,
} from "../utils/transitionPresets";

interface StoryboardTimelineProps {
  project: ProjectData;
  onUpdateProject: (updated: Partial<ProjectData>) => void;
  onOpenEditingSuite: (scene: SceneBeat) => void;
  onOpenPlayer: () => void;
  onOpenCharacterBible: () => void;
  onOpenGlobalStyle: () => void;
}

export const StoryboardTimeline: React.FC<StoryboardTimelineProps> = ({
  project,
  onUpdateProject,
  onOpenEditingSuite,
  onOpenPlayer,
  onOpenCharacterBible,
  onOpenGlobalStyle,
}) => {
  const [generatingBeatId, setGeneratingBeatId] = useState<string | null>(null);
  const [generatingPlaceholderId, setGeneratingPlaceholderId] = useState<string | null>(null);
  const [activePickerSceneId, setActivePickerSceneId] = useState<string | null>(null);
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isTransitionModalOpen, setIsTransitionModalOpen] = useState(false);

  // Single beat image generation using gemini-3-pro-image-preview
  const handleGenerateSingleBeat = async (scene: SceneBeat) => {
    setGeneratingBeatId(scene.id);
    setGenerationError(null);

    try {
      // Find relevant character descriptions for consistency
      const relevantCharacters = project.characters
        .filter((c) => scene.charactersInScene.includes(c.name))
        .map((c) => `${c.name} (${c.appearanceDescription}, wearing: ${c.signatureWardrobe})`)
        .join("; ");

      const res = await fetch("/api/generate-storyboard-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenePrompt: scene.imagePrompt || scene.visualAction,
          stylePreset: project.stylePreset || project.visualTone,
          characterBible: relevantCharacters,
          cameraSetup: scene.cameraSetup,
          lightingSetup: scene.lighting,
          imageSize: project.selectedImageSize || scene.imageSize || "2K",
          aspectRatio: "9:16",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate image.");
      }

      const data = await res.json();

      if (data.imageUrl) {
        const updatedScenes = project.scenes.map((s) =>
          s.id === scene.id
            ? {
                ...s,
                generatedImageUrl: data.imageUrl,
                imageSize: project.selectedImageSize || "2K",
                aspectRatio: "9:16" as const,
                status: "approved" as const,
              }
            : s
        );
        onUpdateProject({ scenes: updatedScenes });
      }
    } catch (err: any) {
      console.error(err);
      setGenerationError(`Beat ${scene.beatNumber} generation error: ${err.message}`);
    } finally {
      setGeneratingBeatId(null);
    }
  };

  // Batch generation for all scenes missing images (or all scenes if forceAll is true)
  const handleBatchGenerate = async (forceAll: boolean = false) => {
    let targetScenes = forceAll
      ? project.scenes
      : project.scenes.filter((s) => !s.generatedImageUrl);

    if (targetScenes.length === 0) {
      if (
        confirm(
          "All storyboard frames are already generated. Would you like to re-render all frames with the current Global Style preset?"
        )
      ) {
        targetScenes = project.scenes;
      } else {
        return;
      }
    }

    setIsBatchGenerating(true);
    setBatchProgress({ current: 0, total: targetScenes.length });
    setGenerationError(null);

    let currentScenes = [...project.scenes];
    let count = 0;

    const CONCURRENCY_LIMIT = 3;
    for (let i = 0; i < targetScenes.length; i += CONCURRENCY_LIMIT) {
      const chunk = targetScenes.slice(i, i + CONCURRENCY_LIMIT);

      await Promise.all(
        chunk.map(async (scene) => {
          try {
            const relevantCharacters = project.characters
              .filter((c) => scene.charactersInScene.includes(c.name))
              .map((c) => `${c.name} (${c.appearanceDescription}, wearing: ${c.signatureWardrobe})`)
              .join("; ");

            const res = await fetch("/api/generate-storyboard-image", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                scenePrompt: scene.imagePrompt || scene.visualAction,
                stylePreset: project.stylePreset || project.visualTone,
                characterBible: relevantCharacters,
                cameraSetup: scene.cameraSetup,
                lightingSetup: scene.lighting,
                imageSize: project.selectedImageSize || "2K",
                aspectRatio: "9:16",
              }),
            });

            if (res.ok) {
              const data = await res.json();
              if (data.imageUrl) {
                currentScenes = currentScenes.map((s) =>
                  s.id === scene.id
                    ? {
                        ...s,
                        generatedImageUrl: data.imageUrl,
                        imageSize: project.selectedImageSize || "2K",
                        aspectRatio: "9:16" as const,
                        status: "approved" as const,
                      }
                    : s
                );
              }
            }
          } catch (err) {
            console.error("Batch item error:", err);
          } finally {
            count++;
            // Update progress in the state
            setBatchProgress({ current: count, total: targetScenes.length });
          }
        })
      );

      // Update the project state after each chunk finishes to avoid too frequent react re-renders
      onUpdateProject({ scenes: currentScenes });
    }

    setGeneratingBeatId(null);
    setIsBatchGenerating(false);
  };

  // Generate or regenerate AI placeholder thumbnail for a specific scene beat
  const handleGeneratePlaceholder = async (scene: SceneBeat) => {
    setGeneratingPlaceholderId(scene.id);
    setGenerationError(null);

    try {
      const thumbUrl = await generateAIPlaceholderThumbnail({
        sceneTitle: scene.title,
        visualAction: scene.visualAction,
        genre: project.genre,
        stylePreset: project.stylePreset || project.visualTone,
        beatNumber: scene.beatNumber,
        cameraSetup: scene.cameraSetup,
      });

      const updated = project.scenes.map((s) =>
        s.id === scene.id ? { ...s, placeholderThumbnailUrl: thumbUrl } : s
      );
      onUpdateProject({ scenes: updated });
    } catch (err: any) {
      console.error("Placeholder error:", err);
      // Fallback to thematic
      const fallbackUrl = getThematicPlaceholderThumbnail(
        project.genre,
        scene.beatNumber,
        scene.visualAction
      );
      onUpdateProject({
        scenes: project.scenes.map((s) =>
          s.id === scene.id ? { ...s, placeholderThumbnailUrl: fallbackUrl } : s
        ),
      });
    } finally {
      setGeneratingPlaceholderId(null);
    }
  };

  // Select a preset placeholder thumbnail style
  const handleSelectPlaceholder = (sceneId: string, imageUrl: string) => {
    const updated = project.scenes.map((s) =>
      s.id === sceneId ? { ...s, placeholderThumbnailUrl: imageUrl } : s
    );
    onUpdateProject({ scenes: updated });
    setActivePickerSceneId(null);
  };

  // Batch populate placeholder thumbnails for all scenes missing visuals
  const handleBatchPopulatePlaceholders = () => {
    const updated = project.scenes.map((s, idx) => {
      if (!s.generatedImageUrl && !s.placeholderThumbnailUrl) {
        return {
          ...s,
          placeholderThumbnailUrl: getThematicPlaceholderThumbnail(
            project.genre,
            idx + 1,
            s.visualAction
          ),
        };
      }
      return s;
    });
    onUpdateProject({ scenes: updated });
  };

  // Add new 10-second beat with immediate vertical placeholder thumbnail
  const handleAddBeat = () => {
    const nextIdx = project.scenes.length + 1;
    const startSec = (nextIdx - 1) * 10;
    const endSec = nextIdx * 10;
    const formatSec = (sec: number) => {
      const m = Math.floor(sec / 60).toString().padStart(2, "0");
      const s = (sec % 60).toString().padStart(2, "0");
      return `${m}:${s}`;
    };

    const actionDescription = "Vertical 9:16 close-up. Unexpected shadow movement creates imminent danger.";
    const thematicThumb = getThematicPlaceholderThumbnail(
      project.genre || project.visualTone,
      nextIdx,
      actionDescription
    );

    const newBeat: SceneBeat = {
      id: `beat_${Date.now()}`,
      beatNumber: nextIdx,
      timecode: `${formatSec(startSec)} - ${formatSec(endSec)}`,
      duration: "10s",
      title: `Beat ${nextIdx}: Tension Shift`,
      visualAction: actionDescription,
      dialogue: "Did you hear that?",
      soundEffects: "Heavy sudden breathing, metallic riser sound",
      cameraSetup: "Vertical 9:16 Extreme Close-Up",
      lighting: "Deep contrast shadow with cold amber edge lighting",
      suspenseScore: 8,
      cliffhangerHook: "Viewer must tap next to see who or what emerged from the shadows.",
      charactersInScene: project.characters.map((c) => c.name).slice(0, 1),
      imagePrompt: `Cinematic 9:16 vertical storyboard, Beat ${nextIdx}. High tension suspense thriller shot. Character looking in terror at an unseen doorway threat.`,
      placeholderThumbnailUrl: thematicThumb,
      imageSize: project.selectedImageSize || "2K",
      aspectRatio: "9:16",
      lightingAdjustments: {
        brightness: 0,
        contrast: 15,
        exposure: 0,
        vignette: 25,
        colorTemp: 0,
        tintColor: "none",
        tintOpacity: 0,
        grain: 10,
      },
      compositionAdjustments: {
        scale: 1,
        panX: 0,
        panY: 0,
        framingPreset: "close_up",
        cameraOverlay: "rule_of_thirds",
        cameraMovement: "push_in",
      },
      status: "draft",
    };

    onUpdateProject({ scenes: [...project.scenes, newBeat] });
  };

  const handleUpdateScene = (id: string, partial: Partial<SceneBeat>) => {
    onUpdateProject({
      scenes: project.scenes.map((s) => (s.id === id ? { ...s, ...partial } : s)),
    });
  };

  const handleDeleteBeat = (id: string) => {
    if (confirm("Remove this 10-second beat from the movie timeline?")) {
      const remaining = project.scenes
        .filter((s) => s.id !== id)
        .map((s, idx) => {
          const startSec = idx * 10;
          const endSec = (idx + 1) * 10;
          const formatSec = (sec: number) => {
            const m = Math.floor(sec / 60).toString().padStart(2, "0");
            const s = (sec % 60).toString().padStart(2, "0");
            return `${m}:${s}`;
          };
          return {
            ...s,
            beatNumber: idx + 1,
            timecode: `${formatSec(startSec)} - ${formatSec(endSec)}`,
          };
        });
      onUpdateProject({ scenes: remaining });
    }
  };

  const handleMoveBeat = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= project.scenes.length) return;

    const copy = [...project.scenes];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);

    // Re-index timecodes
    const reindexed = copy.map((s, idx) => {
      const startSec = idx * 10;
      const endSec = (idx + 1) * 10;
      const formatSec = (sec: number) => {
        const m = Math.floor(sec / 60).toString().padStart(2, "0");
        const s = (sec % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
      };
      return {
        ...s,
        beatNumber: idx + 1,
        timecode: `${formatSec(startSec)} - ${formatSec(endSec)}`,
      };
    });

    onUpdateProject({ scenes: reindexed });
  };

  const generatedCount = project.scenes.filter((s) => s.generatedImageUrl).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Project Overview Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-950 border border-neutral-800 text-neutral-100 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500 text-neutral-950">
                Snapchat Movie Format
              </span>
              <span className="text-xs text-neutral-400 font-medium">
                {project.genre} &bull; {project.scenes.length * 10}s Total Duration
              </span>

              {/* Global Style Preset Badge Button */}
              <button
                id="btn-timeline-global-style"
                type="button"
                onClick={onOpenGlobalStyle}
                className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition-colors"
                title="Change Global Style or Tone preset across all scene prompts"
              >
                <Palette className="w-3 h-3 text-amber-400" />
                <span>Style: {project.stylePreset || "Select Global Style"}</span>
              </button>

              {/* 10s Break Transitions Master Trigger */}
              <button
                id="btn-timeline-break-transitions"
                type="button"
                onClick={() => setIsTransitionModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30 hover:bg-blue-500/25 transition-colors"
                title="Configure visual transitions (fade-to-black, cross-dissolve, slide-in) across all 10-second increment breaks"
              >
                <Layers className="w-3 h-3 text-blue-400" />
                <span>
                  10s Breaks:{" "}
                  {
                    getTransitionMeta(
                      project.defaultTransition?.type || project.scenes[0]?.transitionToNext?.type
                    ).shortName
                  }
                </span>
              </button>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {project.title}
            </h1>
            <p className="text-xs text-neutral-300 mt-1 max-w-2xl leading-relaxed">
              {project.logline || "Upload or draft your 10-second suspense script installations."}
            </p>

            {/* Character Continuity Chips */}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                AI Character Consistency:
              </span>
              {project.characters.map((char) => (
                <button
                  key={char.id}
                  onClick={onOpenCharacterBible}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-[11px] text-amber-300 border border-neutral-700 transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="font-semibold">{char.name}</span>
                </button>
              ))}
              <button
                onClick={onOpenCharacterBible}
                className="text-[11px] text-neutral-400 hover:text-white underline underline-offset-2 ml-1"
              >
                Edit Cast Bible &rarr;
              </button>
            </div>
          </div>

          {/* Batch Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            {/* 10s Break Transitions Modal Trigger */}
            <button
              id="btn-open-transition-master"
              type="button"
              onClick={() => setIsTransitionModalOpen(true)}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl font-semibold text-xs bg-neutral-800 hover:bg-neutral-700 text-blue-300 border border-blue-500/30 transition-colors"
              title="Pick visual effects like fade-to-black, cross-dissolve, or slide-in for the 10-second increment breaks"
            >
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>Break Transitions</span>
            </button>

            {/* Global Style Preset Modal Trigger */}
            <button
              id="btn-open-global-style-presets"
              type="button"
              onClick={onOpenGlobalStyle}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl font-semibold text-xs bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-amber-500/30 transition-colors"
              title="Apply a Global Style or Tone preset to all scene prompts at once"
            >
              <Palette className="w-3.5 h-3.5 text-amber-400" />
              <span>Global Style</span>
            </button>

            <button
              id="btn-batch-generate-frames"
              type="button"
              onClick={() => handleBatchGenerate(false)}
              disabled={isBatchGenerating}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-all shadow-md shadow-amber-500/20 disabled:opacity-50"
            >
              {isBatchGenerating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>
                    Generating ({batchProgress.current}/{batchProgress.total})...
                  </span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {generatedCount === project.scenes.length
                      ? "Regenerate All Frames"
                      : `Generate Missing Frames (${project.scenes.length - generatedCount})`}
                  </span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onOpenPlayer}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl font-semibold text-xs bg-neutral-800 hover:bg-neutral-700 text-yellow-300 border border-yellow-500/30 transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Preview 10s Player</span>
            </button>

            <button
              id="btn-batch-placeholders"
              type="button"
              onClick={handleBatchPopulatePlaceholders}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl font-semibold text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition-colors"
              title="Ensure all new scenes without generated frames have visual storyboard concept thumbnails"
            >
              <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>Concept Placeholders</span>
            </button>

            <button
              id="btn-add-timeline-beat"
              type="button"
              onClick={handleAddBeat}
              className="flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl font-semibold text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-neutral-400" />
              <span>Add Beat</span>
            </button>
          </div>
        </div>
      </div>

      {generationError && (
        <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{generationError}</span>
        </div>
      )}

      {/* 10-Second Beat Cards Timeline */}
      <div className="space-y-4">
        {project.scenes.map((scene, index) => {
          const isGeneratingThis = generatingBeatId === scene.id;
          const lighting = scene.lightingAdjustments;
          const cssFilter = lighting
            ? `brightness(${100 + lighting.brightness}%) contrast(${100 + lighting.contrast}%)`
            : "";

          return (
            <React.Fragment key={scene.id}>
              <div
                className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-lg transition-all hover:border-neutral-700/80"
              >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* 9:16 Vertical Storyboard Preview Canvas (Cols 1-4) */}
                <div className="lg:col-span-4 flex flex-col items-center">
                  <div className="relative w-full max-w-[210px] aspect-[9/16] rounded-xl overflow-hidden border-2 border-neutral-800 shadow-xl bg-neutral-950 group">
                    {scene.generatedImageUrl ? (
                      <>
                        <img
                          src={scene.generatedImageUrl}
                          alt={scene.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 select-none"
                          style={{ filter: cssFilter }}
                        />

                        {/* Tint & Vignette Overlays */}
                        {lighting?.vignette > 0 && (
                          <div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                              background: `radial-gradient(circle, transparent 40%, rgba(0,0,0,${
                                (lighting.vignette / 100) * 0.95
                              }) 100%)`,
                            }}
                          />
                        )}

                        {/* Hover Overlay Button to Open Editing Suite */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3 text-center">
                          <button
                            id={`btn-edit-suite-${scene.id}`}
                            onClick={() => onOpenEditingSuite(scene)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 text-neutral-950 flex items-center gap-1.5 shadow-md"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                            <span>Adjust Composition & Light</span>
                          </button>
                          <button
                            onClick={() => handleGenerateSingleBeat(scene)}
                            disabled={isGeneratingThis}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 flex items-center gap-1.5 border border-neutral-700"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingThis ? "animate-spin" : ""}`} />
                            <span>Regenerate (gemini-3-pro)</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      /* Visual Storyboard Placeholder Thumbnail */
                      <div className="relative w-full h-full bg-neutral-950 overflow-hidden">
                        {(() => {
                          const placeholderUrl =
                            scene.placeholderThumbnailUrl ||
                            getThematicPlaceholderThumbnail(
                              project.genre || project.visualTone,
                              scene.beatNumber,
                              scene.visualAction
                            );

                          return (
                            <>
                              <img
                                src={placeholderUrl}
                                alt={`Draft storyboard for ${scene.title}`}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover select-none transition-transform duration-300 group-hover:scale-105 opacity-85"
                                style={{ filter: cssFilter }}
                              />

                              {/* Cinematic vignette & draft gradient */}
                              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/90 via-black/30 to-black/60" />

                              {/* Placeholder Concept Tag */}
                              <div className="absolute top-8 left-2 pointer-events-none flex items-center gap-1 bg-amber-500/95 text-neutral-950 px-1.5 py-0.5 rounded shadow text-[9px] font-black tracking-wider uppercase">
                                <Wand2 className="w-2.5 h-2.5" />
                                <span>Concept Draft</span>
                              </div>

                              {/* Action prompt snippet */}
                              <div className="absolute bottom-9 left-2 right-2 pointer-events-none">
                                <p className="text-[10px] text-neutral-200 line-clamp-2 leading-tight font-medium drop-shadow bg-black/60 p-1 rounded backdrop-blur-[2px]">
                                  {scene.visualAction || scene.imagePrompt}
                                </p>
                              </div>

                              {/* Hover Overlay with Generation & Concept Controls */}
                              <div className="absolute inset-0 bg-neutral-950/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-3 text-center">
                                <button
                                  id={`btn-generate-beat-${scene.id}`}
                                  type="button"
                                  onClick={() => handleGenerateSingleBeat(scene)}
                                  disabled={isGeneratingThis || isBatchGenerating}
                                  className="w-full py-2 px-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 disabled:opacity-50"
                                >
                                  <Sparkles className={`w-3.5 h-3.5 ${isGeneratingThis ? "animate-spin" : ""}`} />
                                  <span>{isGeneratingThis ? "Generating 9:16 Frame..." : "Generate Final (AI)"}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleGeneratePlaceholder(scene)}
                                  disabled={generatingPlaceholderId === scene.id}
                                  className="w-full py-1.5 px-2 rounded-lg text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-amber-300 flex items-center justify-center gap-1.5 border border-amber-500/40 transition-colors disabled:opacity-50"
                                >
                                  <RefreshCw
                                    className={`w-3 h-3 ${generatingPlaceholderId === scene.id ? "animate-spin" : ""}`}
                                  />
                                  <span>
                                    {generatingPlaceholderId === scene.id
                                      ? "Drafting Concept..."
                                      : "AI Concept Sketch"}
                                  </span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setActivePickerSceneId(
                                      activePickerSceneId === scene.id ? null : scene.id
                                    )
                                  }
                                  className="w-full py-1.5 px-2 rounded-lg text-xs font-medium bg-neutral-900/90 hover:bg-neutral-800 text-neutral-200 flex items-center justify-center gap-1 border border-neutral-700"
                                >
                                  <Palette className="w-3 h-3 text-amber-400" />
                                  <span>Change Concept Style</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => onOpenEditingSuite(scene)}
                                  className="w-full py-1 px-2 rounded-lg text-[11px] font-medium text-neutral-400 hover:text-white flex items-center justify-center gap-1"
                                >
                                  <Sliders className="w-3 h-3" />
                                  <span>Adjust Light & Comp</span>
                                </button>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    )}

                    {/* Top Timecode & Beat Badge */}
                    <div className="absolute top-2 left-2 pointer-events-none bg-black/80 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-mono font-bold text-amber-300 border border-neutral-700">
                      {scene.timecode}
                    </div>

                    {/* Bottom Status / Movement Badge */}
                    <div className="absolute bottom-2 left-2 pointer-events-none bg-black/80 backdrop-blur-sm px-2 py-0.5 rounded text-[9px] font-bold text-neutral-300 uppercase border border-neutral-700">
                      {scene.compositionAdjustments?.cameraMovement?.replace("_", " ") || "Push-In"}
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-center justify-center gap-2 flex-wrap w-full max-w-[210px]">
                    <button
                      id={`btn-edit-suite-sub-${scene.id}`}
                      onClick={() => onOpenEditingSuite(scene)}
                      className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 bg-neutral-800/80 hover:bg-neutral-800 px-2.5 py-1 rounded-lg border border-neutral-700/60 transition-colors"
                    >
                      <Sliders className="w-3 h-3" />
                      <span>Editing Suite</span>
                    </button>

                    {!scene.generatedImageUrl && (
                      <button
                        onClick={() =>
                          setActivePickerSceneId(
                            activePickerSceneId === scene.id ? null : scene.id
                          )
                        }
                        className="text-[11px] text-neutral-300 hover:text-white font-medium flex items-center gap-1 bg-neutral-800/80 hover:bg-neutral-800 px-2 py-1 rounded-lg border border-neutral-700/60 transition-colors"
                      >
                        <Palette className="w-3 h-3 text-amber-400" />
                        <span>Concepts</span>
                      </button>
                    )}
                  </div>

                  {/* Interactive Concept Style Picker Popover */}
                  {activePickerSceneId === scene.id && (
                    <div className="mt-3 w-full max-w-[260px] p-3 rounded-xl bg-neutral-950 border border-neutral-800 shadow-2xl z-20 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1">
                          <Palette className="w-3 h-3" />
                          Storyboard Concept
                        </span>
                        <button
                          onClick={() => setActivePickerSceneId(null)}
                          className="text-xs text-neutral-400 hover:text-white px-1 font-mono"
                        >
                          &times;
                        </button>
                      </div>
                      <p className="text-[10px] text-neutral-400">
                        Pick a 9:16 vertical concept draft thumbnail for Beat {scene.beatNumber}:
                      </p>
                      <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                        {STORYBOARD_PLACEHOLDER_STYLES.map((style) => (
                          <button
                            key={style.id}
                            type="button"
                            onClick={() => handleSelectPlaceholder(scene.id, style.imageUrl)}
                            className="relative group rounded-lg overflow-hidden border border-neutral-800 hover:border-amber-500 transition-all text-left"
                          >
                            <div className="aspect-[9/16] w-full bg-neutral-900">
                              <img
                                src={style.imageUrl}
                                alt={style.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            </div>
                            <div className="absolute inset-x-0 bottom-0 bg-neutral-950/90 p-1 text-[9px] font-bold text-neutral-200 truncate">
                              {style.name}
                            </div>
                          </button>
                        ))}
                      </div>
                      <div className="pt-1.5 flex items-center justify-between border-t border-neutral-800">
                        <button
                          type="button"
                          onClick={() =>
                            handleSelectPlaceholder(
                              scene.id,
                              generateSvgStoryboardPlaceholder({
                                title: scene.title,
                                beatNumber: scene.beatNumber,
                                timecode: scene.timecode,
                                genre: project.genre,
                                cameraSetup: scene.cameraSetup,
                              })
                            )
                          }
                          className="text-[10px] text-amber-400 hover:underline flex items-center gap-1"
                        >
                          <Film className="w-2.5 h-2.5" />
                          SVG Slate
                        </button>
                        <button
                          type="button"
                          onClick={() => handleGeneratePlaceholder(scene)}
                          disabled={generatingPlaceholderId === scene.id}
                          className="text-[10px] text-amber-300 font-bold hover:underline flex items-center gap-1"
                        >
                          <Wand2 className="w-2.5 h-2.5" />
                          AI Sketch
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Beat Details & 10-Second Suspense Hooks (Cols 5-12) */}
                <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
                  <div>
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-3 border-b border-neutral-800 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-[10px] font-extrabold uppercase text-amber-400 font-mono">
                            Beat {scene.beatNumber} &bull; 10s
                          </span>
                          <input
                            type="text"
                            value={scene.title}
                            onChange={(e) => handleUpdateScene(scene.id, { title: e.target.value })}
                            className="text-base font-bold text-neutral-100 bg-transparent hover:bg-neutral-800/60 focus:bg-neutral-950 px-1.5 py-0.5 rounded border border-transparent hover:border-neutral-700 focus:border-amber-500 focus:outline-none transition-colors"
                          />
                        </div>
                        <div className="text-xs text-neutral-400 mt-1 flex items-center gap-2">
                          <span>Camera: {scene.cameraSetup}</span>
                          <span>&bull;</span>
                          <span>Lighting: {scene.lighting}</span>
                        </div>
                      </div>

                      {/* Reorder and Delete actions */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleMoveBeat(index, "up")}
                          disabled={index === 0}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-30"
                          title="Move beat earlier in sequence"
                          aria-label="Move beat earlier in sequence"
                        >
                          <MoveUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMoveBeat(index, "down")}
                          disabled={index === project.scenes.length - 1}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-30"
                          title="Move beat later in sequence"
                          aria-label="Move beat later in sequence"
                        >
                          <MoveDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteBeat(scene.id)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-neutral-800"
                          title="Delete beat"
                          aria-label="Delete beat"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Visual Action Description */}
                    <div className="mt-3">
                      <label className="block text-[10px] uppercase font-bold text-neutral-500 tracking-wider mb-1">
                        Visual Action (10-Second Sequence)
                      </label>
                      <textarea
                        value={scene.visualAction}
                        onChange={(e) =>
                          handleUpdateScene(scene.id, {
                            visualAction: e.target.value,
                            imagePrompt: e.target.value,
                          })
                        }
                        rows={2}
                        className="w-full bg-neutral-950/80 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none focus:ring-1 focus:ring-amber-500 leading-relaxed font-sans"
                      />
                    </div>

                    {/* Dialogue & Sound Design */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-neutral-500 tracking-wider mb-1">
                          Dialogue / Spoken Audio
                        </label>
                        <input
                          type="text"
                          value={scene.dialogue}
                          onChange={(e) => handleUpdateScene(scene.id, { dialogue: e.target.value })}
                          placeholder="Character lines or narration..."
                          className="w-full bg-neutral-950/80 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-neutral-500 tracking-wider mb-1">
                          Sound Design / Music Cues
                        </label>
                        <input
                          type="text"
                          value={scene.soundEffects}
                          onChange={(e) => handleUpdateScene(scene.id, { soundEffects: e.target.value })}
                          placeholder="e.g. Distant metallic scrape, heavy bass riser"
                          className="w-full bg-neutral-950/80 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                    </div>

                    {/* 10-Second Snapchat Cliffhanger Hook */}
                    <div className="mt-3 p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                        <Zap className="w-3.5 h-3.5 fill-current" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-black tracking-wider text-amber-400">
                            10-Second Climax & Cliffhanger Hook (Keeps user tapping for next installation)
                          </span>
                          <span className="text-[10px] font-bold text-amber-300">
                            Suspense: {scene.suspenseScore}/10
                          </span>
                        </div>
                        <input
                          type="text"
                          value={scene.cliffhangerHook}
                          onChange={(e) =>
                            handleUpdateScene(scene.id, { cliffhangerHook: e.target.value })
                          }
                          placeholder="Cliffhanger prompt forcing the tap..."
                          className="w-full bg-neutral-950/60 border border-neutral-700/60 rounded-lg px-2.5 py-1.5 text-xs text-amber-100 font-medium mt-1 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Character Presence Tagging */}
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-800">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                        Cast in Scene:
                      </span>
                      {project.characters.map((char) => {
                        const isInScene = scene.charactersInScene.includes(char.name);
                        return (
                          <button
                            key={char.id}
                            type="button"
                            onClick={() => {
                              const updatedChars = isInScene
                                ? scene.charactersInScene.filter((n) => n !== char.name)
                                : [...scene.charactersInScene, char.name];
                              handleUpdateScene(scene.id, { charactersInScene: updatedChars });
                            }}
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                              isInScene
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                : "bg-neutral-800 text-neutral-400 border border-neutral-700 opacity-60 hover:opacity-100"
                            }`}
                          >
                            {char.name}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenEditingSuite(scene)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors flex items-center gap-1.5"
                      >
                        <Sun className="w-3.5 h-3.5 text-amber-400" />
                        <span>Adjust Composition & Light</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 10-Second Increment Break Transition Selector */}
            {index < project.scenes.length - 1 && (
              <TransitionBreakSelector
                fromBeatNumber={scene.beatNumber}
                toBeatNumber={project.scenes[index + 1]?.beatNumber ?? scene.beatNumber + 1}
                currentTransition={
                  scene.transitionToNext ||
                  project.defaultTransition ||
                  DEFAULT_BEAT_TRANSITION
                }
                onChangeTransition={(newTransition) => {
                  handleUpdateScene(scene.id, { transitionToNext: newTransition });
                }}
                onApplyToAllBreaks={(allTransition) => {
                  const updated = applyTransitionToAllScenes(project.scenes, allTransition);
                  onUpdateProject({
                    defaultTransition: allTransition,
                    scenes: updated,
                  });
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>

    {/* Bottom Add Beat Button */}
    <div className="text-center pt-4">
      <button
        onClick={handleAddBeat}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-xs bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 transition-all hover:border-neutral-700 shadow-md"
      >
        <Plus className="w-4 h-4 text-amber-400" />
        <span>Add Next 10-Second Installation Beat</span>
      </button>
    </div>

    {/* Global Transition Selector Modal */}
    {isTransitionModalOpen && (
      <GlobalTransitionModal
        isOpen={isTransitionModalOpen}
        onClose={() => setIsTransitionModalOpen(false)}
        project={project}
        onUpdateProject={onUpdateProject}
      />
    )}
  </div>
);
};
