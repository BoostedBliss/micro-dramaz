import React, { useState } from "react";
import {
  X,
  CheckCircle2,
  Clock,
  Volume2,
  Moon,
  Layers,
  ArrowRight,
  Zap,
  Compass,
  Scissors,
  Sun,
  ZoomIn,
  Film,
  Copy,
} from "lucide-react";
import { ProjectData, BeatTransition, TransitionType } from "../types";
import {
  TRANSITION_PRESETS,
  DEFAULT_BEAT_TRANSITION,
  getTransitionMeta,
  applyTransitionToAllScenes,
} from "../utils/transitionPresets";

interface GlobalTransitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectData;
  onUpdateProject: (updated: Partial<ProjectData>) => void;
}

export const GlobalTransitionModal: React.FC<GlobalTransitionModalProps> = ({
  isOpen,
  onClose,
  project,
  onUpdateProject,
}) => {
  if (!isOpen) return null;

  const currentDefault: BeatTransition =
    project.defaultTransition ||
    project.scenes[0]?.transitionToNext ||
    DEFAULT_BEAT_TRANSITION;

  const [selectedType, setSelectedType] = useState<TransitionType>(currentDefault.type);
  const [duration, setDuration] = useState<number>(currentDefault.durationSeconds || 0.6);
  const [soundEffect, setSoundEffect] = useState<string>(
    currentDefault.soundEffect || getTransitionMeta(currentDefault.type).recommendedSoundEffect
  );
  const [isSuccess, setIsSuccess] = useState(false);

  const getTransitionIcon = (type: TransitionType, className = "w-4 h-4") => {
    switch (type) {
      case "fade_to_black":
        return <Moon className={className} />;
      case "cross_dissolve":
        return <Layers className={className} />;
      case "slide_in":
        return <ArrowRight className={className} />;
      case "glitch_flash":
        return <Zap className={className} />;
      case "whip_pan":
        return <Compass className={className} />;
      case "snap_cut":
        return <Scissors className={className} />;
      case "fade_to_white":
        return <Sun className={className} />;
      case "zoom_in":
        return <ZoomIn className={className} />;
      default:
        return <Layers className={className} />;
    }
  };

  const handleSelectType = (type: TransitionType) => {
    setSelectedType(type);
    const meta = getTransitionMeta(type);
    setDuration(meta.defaultDuration);
    setSoundEffect(meta.recommendedSoundEffect);
  };

  const handleApplyGlobalTransition = () => {
    const newTransition: BeatTransition = {
      type: selectedType,
      durationSeconds: duration,
      soundEffect,
    };

    const updatedScenes = applyTransitionToAllScenes(project.scenes, newTransition);

    onUpdateProject({
      defaultTransition: newTransition,
      scenes: updatedScenes,
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                10-Second Break Transition Master
              </h2>
              <p className="text-xs text-neutral-400">
                Set visual effects (fade-to-black, cross-dissolve, slide-in) for Snapchat movie installment breaks.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Preset Selector Grid */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2.5">
              Select Default 10s Break Visual Transition
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {TRANSITION_PRESETS.map((preset) => {
                const isSelected = selectedType === preset.type;
                return (
                  <button
                    key={preset.type}
                    type="button"
                    onClick={() => handleSelectType(preset.type)}
                    className={`p-3 rounded-2xl text-left border transition-all flex items-start gap-3 ${
                      isSelected
                        ? "bg-amber-500/10 border-amber-500 text-neutral-100 ring-1 ring-amber-500/50 shadow-md"
                        : "bg-neutral-950/60 border-neutral-800 text-neutral-300 hover:border-neutral-700"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                        isSelected
                          ? "bg-amber-500 text-neutral-950"
                          : "bg-neutral-800 text-neutral-400"
                      }`}
                    >
                      {getTransitionIcon(preset.type, "w-4 h-4")}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs text-white flex items-center justify-between">
                        <span>{preset.name}</span>
                        {isSelected && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-1 leading-snug">
                        {preset.description}
                      </p>
                      <div className="mt-1.5 text-[10px] text-amber-300/80 italic">
                        {preset.visualCue}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Duration & Sound Controls */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-amber-400" />
                  Transition Duration
                </span>
                <span className="font-mono font-bold text-amber-300 text-xs">
                  {duration.toFixed(2)}s
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.5"
                step="0.05"
                value={duration}
                onChange={(e) => setDuration(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
              />
              <div className="flex items-center gap-1 mt-2">
                {[0.2, 0.35, 0.6, 0.8, 1.2].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDuration(d)}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition-colors ${
                      Math.abs(duration - d) < 0.05
                        ? "bg-amber-500 text-neutral-950 border-amber-400"
                        : "bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white"
                    }`}
                  >
                    {d}s
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Volume2 className="w-3 h-3 text-amber-400" />
                Default Audio / SFX Cue
              </label>
              <input
                type="text"
                value={soundEffect}
                onChange={(e) => setSoundEffect(e.target.value)}
                placeholder="e.g. Sub-bass boom, digital whoosh..."
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <p className="text-[10px] text-neutral-500 mt-1">
                Embedded into the Production Package EDL and sound design cue sheet.
              </p>
            </div>
          </div>

          {/* Current Breakdown Preview */}
          <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 text-xs text-neutral-400 flex items-center justify-between">
            <div>
              <span className="font-bold text-neutral-200">
                Applies to {Math.max(0, project.scenes.length - 1)} break intervals
              </span>
              <p className="text-[11px] text-neutral-500">
                You can also customize any individual break directly on the storyboard timeline.
              </p>
            </div>

            <div className="text-right font-mono text-[11px] text-amber-300 font-bold">
              {project.scenes.length * 10}s runtime
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-900/90 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
          >
            Cancel
          </button>

          <button
            id="btn-apply-global-transitions-submit"
            type="button"
            onClick={handleApplyGlobalTransition}
            disabled={isSuccess}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-all shadow-md shadow-amber-500/20 disabled:opacity-50"
          >
            {isSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-neutral-950" />
                <span>Applied Across All Breaks!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Apply To All {Math.max(0, project.scenes.length - 1)} 10s Breaks</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
