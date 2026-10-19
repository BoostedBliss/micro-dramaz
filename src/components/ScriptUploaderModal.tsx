import React, { useState } from "react";
import { X, Upload, Sparkles, FileText, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { ProjectData } from "../types";
import { getThematicPlaceholderThumbnail } from "../utils/placeholderThumbnails";
import { GLOBAL_STYLE_PRESETS } from "../utils/stylePresets";
import { DEFAULT_BEAT_TRANSITION } from "../utils/transitionPresets";

interface ScriptUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyParsedProject: (parsedProject: Partial<ProjectData>) => void;
}

export const ScriptUploaderModal: React.FC<ScriptUploaderModalProps> = ({
  isOpen,
  onClose,
  onApplyParsedProject,
}) => {
  const [scriptText, setScriptText] = useState("");
  const [genre, setGenre] = useState("Psychological Sci-Fi Thriller");
  const [selectedStyle, setSelectedStyle] = useState(GLOBAL_STYLE_PRESETS[0].name);
  const [targetBeats, setTargetBeats] = useState<number>(6);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setScriptText(text);
      setError(null);
    };
    reader.onerror = () => {
      setError("Failed to read the file. Please paste the script text directly.");
    };
    reader.readAsText(file);
  };

  const handleParse = async () => {
    if (!scriptText.trim()) {
      setError("Please paste a script or upload a file first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setStatusMessage("Analyzing 10-second Snapchat Movie suspense arcs...");

    try {
      setTimeout(() => {
        setStatusMessage("Extracting character consistency bibles & wardrobes...");
      }, 1500);

      setTimeout(() => {
        setStatusMessage("Generating 9:16 vertical cinema prompts & cliffhanger hooks...");
      }, 3500);

      const res = await fetch("/api/parse-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scriptText,
          genre,
          stylePreset: selectedStyle,
          targetBeatsCount: `${targetBeats} beats`,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to parse script.");
      }

      const result = await res.json();

      // Format scenes with default lighting and composition settings
      const formattedScenes = (result.scenes || []).map((scene: any, idx: number) => ({
        id: `beat_${Date.now()}_${idx + 1}`,
        beatNumber: idx + 1,
        timecode: scene.timecode || `${formatSec(idx * 10)} - ${formatSec((idx + 1) * 10)}`,
        duration: "10s",
        title: scene.title || `Beat ${idx + 1}`,
        visualAction: scene.visualAction || "",
        dialogue: scene.dialogue || "",
        soundEffects: scene.soundEffects || "",
        cameraSetup: scene.cameraSetup || "Vertical 9:16 Close-Up",
        lighting: scene.lighting || "High contrast suspense lighting",
        suspenseScore: scene.suspenseScore || 8,
        cliffhangerHook: scene.cliffhangerHook || "Pacing hook forcing viewer to tap next.",
        charactersInScene: scene.charactersInScene || [],
        imagePrompt: scene.imagePrompt || scene.visualAction,
        placeholderThumbnailUrl: getThematicPlaceholderThumbnail(
          result.genre || genre,
          idx + 1,
          scene.visualAction
        ),
        imageSize: "2K",
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
          framingPreset: "medium_shot",
          cameraOverlay: "rule_of_thirds",
          cameraMovement: "push_in",
        },
        status: "draft",
        transitionToNext: { ...DEFAULT_BEAT_TRANSITION },
      }));

      onApplyParsedProject({
        title: result.title || "Untitled Snapchat Project",
        logline: result.logline || "",
        genre: result.genre || genre,
        visualTone: result.visualTone || selectedStyle,
        stylePreset: selectedStyle,
        defaultTransition: { ...DEFAULT_BEAT_TRANSITION },
        characters: (result.characters || []).map((c: any) => ({
          ...c,
          isActive: true,
        })),
        scenes: formattedScenes,
      });

      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while parsing the script.");
    } finally {
      setIsLoading(false);
      setStatusMessage("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-neutral-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/90">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold">Upload & Parse Script</h2>
              <p className="text-xs text-neutral-400">
                Snapchat Movies: Converted into 10-second suspense increments with character bibles
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

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-red-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* File Upload Zone */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
              Script File or Paste Screenplay
            </label>
            <div className="relative border-2 border-dashed border-neutral-700 hover:border-amber-500/60 rounded-xl p-4 text-center transition-colors bg-neutral-950/40 mb-3">
              <input
                type="file"
                accept=".txt,.fountain,.pdf,.docx,.json"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="w-6 h-6 mx-auto mb-1 text-neutral-400" />
              <p className="text-xs font-medium text-neutral-300">
                Drop your screenplay (.txt, .fountain) or click to browse
              </p>
              <p className="text-[11px] text-neutral-500">Supports scripts, beat sheets, or scene dialogue</p>
            </div>

            <textarea
              id="textarea-script-input"
              value={scriptText}
              onChange={(e) => setScriptText(e.target.value)}
              placeholder="Or paste your screenplay / scene text here...&#10;&#10;Example:&#10;MAYA blinks in the steam-fogged bathroom mirror. Her reflection does NOT blink back. A shadow crosses the doorway..."
              rows={6}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 font-mono leading-relaxed"
            />
          </div>

          {/* Configuration Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Genre */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                Genre & Narrative Vibe
              </label>
              <input
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="e.g. Psychological Thriller, Mystery"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            {/* Target 10-second Beats Count */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                Target 10-Sec Beats (Installations)
              </label>
              <select
                value={targetBeats}
                onChange={(e) => setTargetBeats(Number(e.target.value))}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value={4}>4 Beats (40 Seconds - Micro Episode)</option>
                <option value={6}>6 Beats (60 Seconds - 1 Minute Series)</option>
                <option value={8}>8 Beats (80 Seconds - Extended Thriller)</option>
                <option value={10}>10 Beats (100 Seconds - Full Episode)</option>
              </select>
            </div>
          </div>

          {/* Style Preset Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
              Visual Cinematic Style Preset
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {GLOBAL_STYLE_PRESETS.map((preset) => {
                const isSelected = selectedStyle === preset.name;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setSelectedStyle(preset.name)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "bg-amber-500/10 border-amber-500/50 text-neutral-100 ring-1 ring-amber-500/50"
                        : "bg-neutral-950/50 border-neutral-800 text-neutral-300 hover:border-neutral-700"
                    }`}
                  >
                    <div className="font-semibold text-xs text-amber-300 flex items-center justify-between">
                      <span>{preset.name}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                    </div>
                    <div className="text-[11px] text-neutral-400 mt-1 leading-snug">{preset.description}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-900/90 flex items-center justify-between gap-4">
          <div className="text-xs text-neutral-400">
            {isLoading ? (
              <span className="text-amber-300 font-medium flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                {statusMessage}
              </span>
            ) : (
              <span>Extracts characters & generates 10s suspense storyboards</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:bg-neutral-800 transition-colors"
            >
              Cancel
            </button>
            <button
              id="btn-confirm-parse-script"
              type="button"
              onClick={handleParse}
              disabled={isLoading || !scriptText.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-amber-500/20"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isLoading ? "Generating Breakdown..." : "Break Down into 10s Beats"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function formatSec(seconds: number): string {
  const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}
