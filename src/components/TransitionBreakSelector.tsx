import React, { useState } from "react";
import {
  Moon,
  Layers,
  ArrowRight,
  Zap,
  Compass,
  Scissors,
  Sun,
  ZoomIn,
  ChevronDown,
  Sliders,
  Check,
  Sparkles,
  Volume2,
  Copy,
  Clock,
  Play,
} from "lucide-react";
import { BeatTransition, TransitionType } from "../types";
import {
  TRANSITION_PRESETS,
  getTransitionMeta,
  DEFAULT_BEAT_TRANSITION,
} from "../utils/transitionPresets";

interface TransitionBreakSelectorProps {
  fromBeatNumber: number;
  toBeatNumber: number;
  currentTransition?: BeatTransition;
  onChangeTransition: (transition: BeatTransition) => void;
  onApplyToAllBreaks: (transition: BeatTransition) => void;
}

export const TransitionBreakSelector: React.FC<TransitionBreakSelectorProps> = ({
  fromBeatNumber,
  toBeatNumber,
  currentTransition = DEFAULT_BEAT_TRANSITION,
  onChangeTransition,
  onApplyToAllBreaks,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeType, setActiveType] = useState<TransitionType>(currentTransition.type);
  const [duration, setDuration] = useState<number>(currentTransition.durationSeconds || 0.6);
  const [soundEffect, setSoundEffect] = useState<string>(
    currentTransition.soundEffect || getTransitionMeta(currentTransition.type).recommendedSoundEffect
  );
  const [appliedAllNotice, setAppliedAllNotice] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);

  const meta = getTransitionMeta(currentTransition.type);

  const getTransitionIcon = (type: TransitionType, className = "w-3.5 h-3.5") => {
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
    setActiveType(type);
    const presetMeta = getTransitionMeta(type);
    setDuration(presetMeta.defaultDuration);
    setSoundEffect(presetMeta.recommendedSoundEffect);
    const updated: BeatTransition = {
      type,
      durationSeconds: presetMeta.defaultDuration,
      soundEffect: presetMeta.recommendedSoundEffect,
    };
    onChangeTransition(updated);
  };

  const handleUpdateDuration = (newDuration: number) => {
    setDuration(newDuration);
    onChangeTransition({
      type: activeType,
      durationSeconds: newDuration,
      soundEffect,
    });
  };

  const handleUpdateSound = (newSound: string) => {
    setSoundEffect(newSound);
    onChangeTransition({
      type: activeType,
      durationSeconds: duration,
      soundEffect: newSound,
    });
  };

  const handleApplyAll = () => {
    const updated: BeatTransition = {
      type: activeType,
      durationSeconds: duration,
      soundEffect,
    };
    onApplyToAllBreaks(updated);
    setAppliedAllNotice(true);
    setTimeout(() => setAppliedAllNotice(false), 3000);
  };

  const triggerPreview = () => {
    setIsPreviewing(false);
    setTimeout(() => setIsPreviewing(true), 50);
  };

  return (
    <div className="relative my-2 sm:my-3 flex flex-col items-center">
      {/* Visual Timeline Connection Guide Line */}
      <div className="w-full flex items-center justify-center relative">
        <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-neutral-700/80 to-transparent pointer-events-none" />

        {/* Central Transition Badge Button */}
        <button
          id={`btn-transition-break-${fromBeatNumber}-${toBeatNumber}`}
          type="button"
          onClick={() => {
            setActiveType(currentTransition.type);
            setDuration(currentTransition.durationSeconds || 0.6);
            setSoundEffect(
              currentTransition.soundEffect ||
                getTransitionMeta(currentTransition.type).recommendedSoundEffect
            );
            setIsOpen(!isOpen);
          }}
          className={`relative z-10 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border shadow-md transition-all group ${
            meta.badgeColor
          } hover:scale-105 hover:border-amber-400/80`}
          title={`Click to customize transition between Beat ${fromBeatNumber} and Beat ${toBeatNumber}`}
        >
          <span className="flex items-center gap-1">
            {getTransitionIcon(currentTransition.type, "w-3.5 h-3.5 text-amber-400")}
            <span className="text-[10px] uppercase font-black tracking-wider text-neutral-400">
              10s Break:
            </span>
          </span>

          <span className="font-bold text-white group-hover:text-amber-300 transition-colors">
            {meta.shortName}
          </span>

          <span className="text-[10px] text-neutral-400 font-mono px-1.5 py-0.5 rounded bg-black/40 border border-white/5">
            {currentTransition.durationSeconds ?? meta.defaultDuration}s
          </span>

          <ChevronDown
            className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${
              isOpen ? "rotate-180 text-amber-400" : ""
            }`}
          />
        </button>
      </div>

      {/* Expanded Transition Customizer Popover / Card */}
      {isOpen && (
        <div className="w-full max-w-2xl mt-3 p-4 sm:p-5 rounded-2xl bg-neutral-900 border-2 border-neutral-700 shadow-2xl z-30 animate-fadeIn text-neutral-100">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                &Delta;
              </span>
              <div>
                <h4 className="text-xs sm:text-sm font-black text-white">
                  10-Second Break Transition: Beat {fromBeatNumber} &rarr; Beat {toBeatNumber}
                </h4>
                <p className="text-[11px] text-neutral-400">
                  Choose visual transition and sound cue when the cliffhanger triggers the next installation.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
            >
              Done
            </button>
          </div>

          {/* Transition Effect Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3.5">
            {TRANSITION_PRESETS.map((preset) => {
              const isSelected = activeType === preset.type;
              return (
                <button
                  key={preset.type}
                  type="button"
                  onClick={() => handleSelectType(preset.type)}
                  className={`p-2.5 rounded-xl text-left border transition-all flex items-start gap-2.5 ${
                    isSelected
                      ? "bg-amber-500/10 border-amber-500/80 ring-1 ring-amber-500/50 shadow-md"
                      : "bg-neutral-950/60 border-neutral-800 hover:border-neutral-700 text-neutral-300"
                  }`}
                >
                  <div
                    className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                      isSelected
                        ? "bg-amber-500 text-neutral-950"
                        : "bg-neutral-800 text-neutral-400"
                    }`}
                  >
                    {getTransitionIcon(preset.type, "w-4 h-4")}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white truncate">
                        {preset.name}
                      </span>
                      {isSelected && (
                        <span className="w-4 h-4 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center shrink-0 ml-1">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-neutral-400 line-clamp-2 mt-0.5 leading-snug">
                      {preset.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Fine-Tuning Controls: Duration, Sound SFX, and Live Simulator */}
          <div className="mt-4 pt-3.5 border-t border-neutral-800 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Duration Slider & Presets (Cols 1-6) */}
            <div className="md:col-span-6 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-amber-400" />
                  Transition Duration:
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
                onChange={(e) => handleUpdateDuration(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
              />

              <div className="flex items-center gap-1 flex-wrap">
                {[0.2, 0.35, 0.6, 0.8, 1.2].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => handleUpdateDuration(d)}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition-colors ${
                      Math.abs(duration - d) < 0.05
                        ? "bg-amber-500 text-neutral-950 border-amber-400"
                        : "bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white"
                    }`}
                  >
                    {d === 0.2
                      ? "0.2s (Fast)"
                      : d === 0.6
                      ? "0.6s (Normal)"
                      : d === 0.8
                      ? "0.8s (Suspense)"
                      : `${d}s`}
                  </button>
                ))}
              </div>
            </div>

            {/* Audio / SFX Hook Note (Cols 7-12) */}
            <div className="md:col-span-6 space-y-1.5">
              <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                <Volume2 className="w-3 h-3 text-amber-400" />
                Audio / Sound Effect Cue:
              </label>
              <input
                type="text"
                value={soundEffect}
                onChange={(e) => handleUpdateSound(e.target.value)}
                placeholder="e.g. Bass drop, digital glitch tear..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <p className="text-[10px] text-neutral-500">
                Included in export sound cue sheet and EDL track comments.
              </p>
            </div>
          </div>

          {/* Mini Interactive Preview & Apply to All Bar */}
          <div className="mt-4 pt-3 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Preview Box */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={triggerPreview}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors"
              >
                <Play className="w-3 h-3 fill-current text-amber-400" />
                <span>Test Visual Effect</span>
              </button>

              {/* Live Preview Box */}
              <div className="relative w-28 h-8 rounded-lg overflow-hidden bg-neutral-950 border border-neutral-800 flex items-center justify-center text-[10px] font-bold text-neutral-400">
                <span className="z-0">Frame {fromBeatNumber} &rarr; {toBeatNumber}</span>

                {isPreviewing && (
                  <div
                    className={`absolute inset-0 z-10 pointer-events-none flex items-center justify-center ${
                      activeType === "fade_to_black"
                        ? "bg-black animate-pulse"
                        : activeType === "fade_to_white"
                        ? "bg-white animate-pulse"
                        : activeType === "cross_dissolve"
                        ? "bg-gradient-to-r from-neutral-800 via-amber-500/30 to-neutral-900 animate-pulse"
                        : activeType === "slide_in"
                        ? "bg-neutral-800 translate-x-0 animate-bounce"
                        : activeType === "glitch_flash"
                        ? "bg-fuchsia-500/40 invert"
                        : activeType === "whip_pan"
                        ? "blur-sm bg-neutral-800"
                        : activeType === "zoom_in"
                        ? "scale-125 bg-amber-500/20"
                        : "bg-black"
                    }`}
                    style={{ animationDuration: `${duration}s` }}
                  />
                )}
              </div>
            </div>

            {/* Apply To All 10s Breaks Button */}
            <div className="flex items-center gap-2">
              <button
                id={`btn-apply-transition-all-${fromBeatNumber}`}
                type="button"
                onClick={handleApplyAll}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-all shadow-sm"
                title="Apply this transition style and duration to ALL 10-second increment breaks across the movie"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Apply to All 10s Breaks</span>
              </button>

              {appliedAllNotice && (
                <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1 animate-fadeIn">
                  <Check className="w-3.5 h-3.5" />
                  Applied!
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
