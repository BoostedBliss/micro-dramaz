import React, { useState } from "react";
import {
  X,
  Palette,
  Sparkles,
  Check,
  Eye,
  RefreshCw,
  Wand2,
} from "lucide-react";
import { ProjectData, SceneBeat } from "../types";
import {
  GLOBAL_STYLE_PRESETS,
  StylePreset,
  transformPromptWithGlobalStyle,
  applyGlobalStyleToProject,
} from "../utils/stylePresets";

interface GlobalStyleModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectData;
  onUpdateProject: (updated: Partial<ProjectData>) => void;
  onBatchRegenerate?: () => void;
}

export const GlobalStyleModal: React.FC<GlobalStyleModalProps> = ({
  isOpen,
  onClose,
  project,
  onUpdateProject,
  onBatchRegenerate,
}) => {
  // Find current preset or default to first
  const initialPreset =
    GLOBAL_STYLE_PRESETS.find((p) => p.name === project.stylePreset) ||
    GLOBAL_STYLE_PRESETS[0];

  const [selectedPreset, setSelectedPreset] = useState<StylePreset>(initialPreset);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [customStylePrompt, setCustomStylePrompt] = useState<string>(
    project.customStylePrompt || ""
  );
  const [updatePrompts, setUpdatePrompts] = useState<boolean>(true);
  const [updateLighting, setUpdateLighting] = useState<boolean>(true);
  const [updateComposition, setUpdateComposition] = useState<boolean>(true);
  const [useAiHarmonizer, setUseAiHarmonizer] = useState<boolean>(false);
  const [previewSceneIndex, setPreviewSceneIndex] = useState<number>(0);
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories = ["All", "Thriller & Noir", "Horror & Suspense", "Sci-Fi & Cyberpunk", "Stylized Cinema"];

  const filteredPresets =
    selectedCategory === "All"
      ? GLOBAL_STYLE_PRESETS
      : GLOBAL_STYLE_PRESETS.filter((p) => p.category === selectedCategory);

  const previewScene: SceneBeat | undefined =
    project.scenes[previewSceneIndex] || project.scenes[0];

  const beforePrompt = previewScene
    ? previewScene.imagePrompt || previewScene.visualAction
    : "No scenes available in project.";

  const afterPrompt = previewScene
    ? transformPromptWithGlobalStyle(
        previewScene.imagePrompt,
        previewScene.visualAction,
        selectedPreset,
        customStylePrompt
      )
    : "";

  const handleApplyPreset = async (andRegenerate: boolean = false) => {
    setIsApplying(true);
    setFeedbackMessage(null);

    try {
      if (useAiHarmonizer) {
        setFeedbackMessage("Harmonizing all scene prompts with Gemini AI...");
        const res = await fetch("/api/apply-global-style", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stylePreset: selectedPreset.name,
            stylePromptModifier: selectedPreset.visualPromptModifier,
            customStylePrompt,
            scenes: project.scenes,
            characters: project.characters,
            genre: project.genre,
            useAiHarmonizer: true,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.updatedScenes && Array.isArray(data.updatedScenes)) {
            const promptMap = new Map(data.updatedScenes.map((s: any) => [s.id, s.imagePrompt]));
            const updatedScenes = project.scenes.map((s) => {
              const newPrompt = promptMap.get(s.id) || s.imagePrompt;
              return {
                ...s,
                imagePrompt: newPrompt,
                lightingAdjustments: updateLighting
                  ? { ...selectedPreset.defaultLighting }
                  : s.lightingAdjustments,
                compositionAdjustments: updateComposition
                  ? { ...s.compositionAdjustments, ...selectedPreset.defaultComposition }
                  : s.compositionAdjustments,
              };
            });

            onUpdateProject({
              stylePreset: selectedPreset.name,
              visualTone: `${selectedPreset.name} - ${selectedPreset.tagline}`,
              customStylePrompt,
              scenes: updatedScenes,
              lastSavedAt: new Date().toISOString(),
              version: (project.version || 1) + 1,
            });

            setFeedbackMessage(
              `Successfully harmonized all ${updatedScenes.length} scenes with ${selectedPreset.name}!`
            );

            setTimeout(() => {
              onClose();
              if (andRegenerate && onBatchRegenerate) {
                onBatchRegenerate();
              }
            }, 600);
            return;
          }
        }
      }

      // Fast deterministic client apply
      const updatedProject = applyGlobalStyleToProject(project, selectedPreset, {
        updatePrompts,
        updateLighting,
        updateComposition,
        customStylePrompt,
      });

      onUpdateProject(updatedProject);
      setFeedbackMessage(
        `Applied "${selectedPreset.name}" to all ${updatedProject.scenes.length} scene beats!`
      );

      setTimeout(() => {
        onClose();
        if (andRegenerate && onBatchRegenerate) {
          onBatchRegenerate();
        }
      }, 500);
    } catch (err: any) {
      console.error(err);
      setFeedbackMessage(`Error applying preset: ${err.message}`);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl my-auto bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl text-neutral-100 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-white">
                  Global Style & Tone Presets
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Movie-Wide Aesthetic
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Apply a cohesive visual aesthetic and lighting palette across all {project.scenes.length} Snapchat movie beats.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Active Preset Pill & Category Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    selectedCategory === cat
                      ? "bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20"
                      : "bg-neutral-800 hover:bg-neutral-750 text-neutral-300 border border-neutral-700/60"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="text-xs text-neutral-400 flex items-center gap-2">
              <span>Current Project Style:</span>
              <span className="font-semibold text-amber-300 bg-neutral-800 px-2 py-0.5 rounded-lg border border-neutral-700">
                {project.stylePreset || "Not Set"}
              </span>
            </div>
          </div>

          {/* Preset Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {filteredPresets.map((preset) => {
              const isSelected = selectedPreset.id === preset.id;

              return (
                <div
                  key={preset.id}
                  onClick={() => setSelectedPreset(preset)}
                  className={`group relative rounded-2xl cursor-pointer overflow-hidden border transition-all duration-200 flex flex-col justify-between ${
                    isSelected
                      ? "bg-neutral-800/90 border-amber-500 ring-2 ring-amber-500/40 shadow-xl shadow-amber-500/10"
                      : "bg-neutral-900/80 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-850"
                  }`}
                >
                  {/* Visual Top Preview */}
                  <div className="relative h-32 w-full overflow-hidden bg-neutral-950">
                    <img
                      src={preset.sampleImageUrl}
                      alt={preset.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/40 to-transparent" />

                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-amber-500 text-neutral-950 p-1 rounded-full shadow-lg">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}

                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-black/70 text-neutral-300 backdrop-blur-sm border border-neutral-700/60">
                        {preset.category}
                      </span>
                    </div>

                    {/* Color Swatch Bar */}
                    <div className="absolute bottom-1.5 left-2 flex items-center gap-1">
                      {preset.palette.map((color, idx) => (
                        <span
                          key={idx}
                          className="w-3 h-3 rounded-full border border-black/40 shadow-sm"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <h3 className="text-sm font-black text-white group-hover:text-amber-300 transition-colors">
                        {preset.name}
                      </h3>
                      <p className="text-[11px] text-neutral-400 font-medium line-clamp-2 mt-0.5 leading-snug">
                        {preset.tagline}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[10px] text-neutral-400 font-mono">
                      <span>Vignette: {preset.defaultLighting.vignette}%</span>
                      <span>Grain: {preset.defaultLighting.grain}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Preset Deep Dive & Customization */}
          <div className="p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                  Active Style Directive
                </span>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <span>{selectedPreset.name}</span>
                  <span className="text-xs font-normal text-neutral-400">
                    &bull; {selectedPreset.tagline}
                  </span>
                </h4>
              </div>

              {/* Color Palette Display */}
              <div className="flex items-center gap-2 bg-neutral-900 px-3 py-1.5 rounded-xl border border-neutral-800">
                <span className="text-[10px] text-neutral-400 font-semibold uppercase">Palette:</span>
                <div className="flex items-center gap-1.5">
                  {selectedPreset.palette.map((c, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <span
                        className="w-4 h-4 rounded-full border border-neutral-700 shadow-sm"
                        style={{ backgroundColor: c }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Custom Style Notes */}
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">
                Custom Director Style Notes (Optional modifier appended to all prompts):
              </label>
              <input
                type="text"
                value={customStylePrompt}
                onChange={(e) => setCustomStylePrompt(e.target.value)}
                placeholder="e.g. Anamorphic lens distortion, rainy car windshield reflections, 16mm warm haze..."
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            {/* Live Prompt Transformation Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  <span>Live Prompt Transformation Preview</span>
                </span>
                {project.scenes.length > 1 && (
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-neutral-400">Previewing:</span>
                    <select
                      value={previewSceneIndex}
                      onChange={(e) => setPreviewSceneIndex(Number(e.target.value))}
                      className="bg-neutral-900 border border-neutral-700 text-neutral-200 text-[11px] rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      {project.scenes.map((s, idx) => (
                        <option key={s.id} value={idx}>
                          Beat {s.beatNumber}: {s.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800/80 space-y-1">
                  <div className="text-[10px] font-bold uppercase text-neutral-400">
                    Current Scene Prompt (Beat {previewScene?.beatNumber || 1})
                  </div>
                  <p className="text-xs text-neutral-400 line-clamp-4 leading-relaxed font-mono">
                    {beforePrompt}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-neutral-900 border border-amber-500/40 space-y-1 shadow-inner">
                  <div className="text-[10px] font-bold uppercase text-amber-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Transformed with {selectedPreset.name}
                  </div>
                  <p className="text-xs text-neutral-200 line-clamp-4 leading-relaxed font-mono">
                    {afterPrompt}
                  </p>
                </div>
              </div>
            </div>

            {/* Application Scope Checkboxes */}
            <div className="pt-2 border-t border-neutral-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-neutral-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={updatePrompts}
                  onChange={(e) => setUpdatePrompts(e.target.checked)}
                  className="rounded border-neutral-700 bg-neutral-900 text-amber-500 focus:ring-amber-500"
                />
                <span>Update all Scene Prompts (`imagePrompt`)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-neutral-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={updateLighting}
                  onChange={(e) => setUpdateLighting(e.target.checked)}
                  className="rounded border-neutral-700 bg-neutral-900 text-amber-500 focus:ring-amber-500"
                />
                <span>Apply Color Filter to Timeline & Player</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-neutral-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={useAiHarmonizer}
                  onChange={(e) => setUseAiHarmonizer(e.target.checked)}
                  className="rounded border-neutral-700 bg-neutral-900 text-amber-500 focus:ring-amber-500"
                />
                <span className="flex items-center gap-1">
                  <Wand2 className="w-3 h-3 text-amber-400" />
                  <span>AI Story Harmonizer (Gemini)</span>
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-900/95 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-neutral-400">
            {feedbackMessage ? (
              <span className="text-amber-300 font-medium animate-pulse">
                {feedbackMessage}
              </span>
            ) : (
              <span>
                Applying will update <strong>{project.scenes.length}</strong> 10-second scene beats to <strong>{selectedPreset.name}</strong>.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => handleApplyPreset(false)}
              disabled={isApplying}
              className="flex-1 sm:flex-none px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 disabled:opacity-50 transition-all"
            >
              {isApplying ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Applying Style...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Apply to All {project.scenes.length} Beats</span>
                </>
              )}
            </button>

            {onBatchRegenerate && (
              <button
                type="button"
                onClick={() => handleApplyPreset(true)}
                disabled={isApplying}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-amber-500/40 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                title="Apply style and immediately regenerate all storyboard frames with the new visual aesthetic"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Apply & Re-render Frames</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
