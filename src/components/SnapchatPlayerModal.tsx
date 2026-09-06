import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Sparkles,
  ArrowRight,
  Share2,
  Zap,
  Layers,
  Moon,
} from "lucide-react";
import { SceneBeat, BeatTransition } from "../types";
import {
  getTransitionMeta,
  DEFAULT_BEAT_TRANSITION,
} from "../utils/transitionPresets";

interface SnapchatPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenes: SceneBeat[];
  projectTitle: string;
}

export const SnapchatPlayerModal: React.FC<SnapchatPlayerModalProps> = ({
  isOpen,
  onClose,
  scenes,
  projectTitle,
}) => {
  if (!isOpen || scenes.length === 0) return null;

  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [progress, setProgress] = useState(0); // 0 to 100% of the 10s increment
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isEndReached, setIsEndReached] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activeTransition, setActiveTransition] = useState<BeatTransition | null>(null);

  const scene = scenes[currentSceneIndex];
  const TEN_SECONDS_MS = 10000;
  const INTERVAL_MS = 100;

  const triggerTransitionTo = (targetIdx: number) => {
    if (isTransitioning) return;
    const transition =
      scenes[currentSceneIndex]?.transitionToNext || DEFAULT_BEAT_TRANSITION;
    const dur = transition.durationSeconds || 0.6;

    if (transition.type === "snap_cut") {
      setCurrentSceneIndex(targetIdx);
      setProgress(0);
      setIsEndReached(false);
      return;
    }

    setIsTransitioning(true);
    setActiveTransition(transition);

    const halfMs = Math.max(100, (dur * 1000) / 2);
    setTimeout(() => {
      setCurrentSceneIndex(targetIdx);
      setProgress(0);
      setIsEndReached(false);
    }, halfMs);

    setTimeout(() => {
      setIsTransitioning(false);
      setActiveTransition(null);
    }, dur * 1000);
  };

  useEffect(() => {
    if (!isPlaying || isEndReached || isTransitioning) return;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + (INTERVAL_MS / TEN_SECONDS_MS) * 100;
        if (next >= 100) {
          // Advance to next 10-second increment with visual transition
          if (currentSceneIndex < scenes.length - 1) {
            triggerTransitionTo(currentSceneIndex + 1);
            return 0;
          } else {
            setIsEndReached(true);
            setIsPlaying(false);
            return 100;
          }
        }
        return next;
      });
    }, INTERVAL_MS);

    return () => clearInterval(timer);
  }, [isPlaying, currentSceneIndex, scenes.length, isEndReached, isTransitioning]);

  const handleNext = () => {
    if (currentSceneIndex < scenes.length - 1) {
      triggerTransitionTo(currentSceneIndex + 1);
    } else {
      setIsEndReached(true);
      setIsPlaying(false);
    }
  };

  const handlePrev = () => {
    if (currentSceneIndex > 0) {
      setCurrentSceneIndex((prev) => prev - 1);
      setProgress(0);
      setIsEndReached(false);
      setIsPlaying(true);
    } else {
      setProgress(0);
    }
  };

  const restartPlayer = () => {
    setCurrentSceneIndex(0);
    setProgress(0);
    setIsEndReached(false);
    setIsPlaying(true);
  };

  // Build filter for visual styling
  const lighting = scene?.lightingAdjustments;
  const cssFilter = lighting
    ? `brightness(${100 + lighting.brightness}%) contrast(${100 + lighting.contrast}%)`
    : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Smartphone Frame */}
      <div className="relative w-full max-w-[340px] sm:max-w-[380px] h-[90vh] max-h-[780px] rounded-[36px] bg-black border-4 border-neutral-800 shadow-2xl flex flex-col overflow-hidden select-none">
        {/* Dynamic Island / Camera Notch */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-40 flex items-center justify-center border border-neutral-800/80">
          <div className="w-2.5 h-2.5 rounded-full bg-neutral-900 border border-neutral-700 mr-2" />
          <div className="w-2 h-2 rounded-full bg-blue-950/60" />
        </div>

        {/* Snapchat Story Progress Bars (10s increments) */}
        <div className="absolute top-9 inset-x-3 z-30 flex items-center gap-1">
          {scenes.map((_, idx) => {
            let barFill = 0;
            if (idx < currentSceneIndex) barFill = 100;
            else if (idx === currentSceneIndex) barFill = progress;

            return (
              <div
                key={idx}
                className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden backdrop-blur-sm"
              >
                <div
                  className="h-full bg-white transition-all duration-100 ease-linear"
                  style={{ width: `${barFill}%` }}
                />
              </div>
            );
          })}
        </div>

        {/* Top Story Info */}
        <div className="absolute top-12 inset-x-3 z-30 flex items-center justify-between text-white text-xs">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-amber-500 text-neutral-950 font-black flex items-center justify-center text-xs shadow-md">
              S
            </div>
            <div>
              <div className="font-bold text-xs tracking-tight flex items-center gap-1.5 drop-shadow">
                <span>{projectTitle}</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/80 text-black font-extrabold uppercase">
                  10s EPISODE
                </span>
              </div>
              <div className="text-[10px] text-white/80 drop-shadow">
                Beat {currentSceneIndex + 1} of {scenes.length} &bull; {scene?.timecode}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded-full border border-white/10">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1 hover:text-amber-400"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1 hover:text-amber-400"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            </button>
          </div>
        </div>

        {/* Screen Content */}
        <div className="relative flex-1 bg-neutral-950 overflow-hidden">
          {/* Main Visual Image */}
          {(scene?.generatedImageUrl || scene?.placeholderThumbnailUrl) ? (
            <div className="relative w-full h-full">
              <img
                src={scene.generatedImageUrl || scene.placeholderThumbnailUrl}
                alt={scene.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover animate-subtleZoom select-none"
                style={{ filter: cssFilter }}
              />
              {!scene.generatedImageUrl && (
                <div className="absolute top-12 left-3 pointer-events-none bg-amber-500/90 text-neutral-950 font-black text-[9px] px-2 py-0.5 rounded shadow uppercase tracking-wider z-10">
                  Concept Draft
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-neutral-400 bg-neutral-900">
              <Sparkles className="w-8 h-8 text-amber-500 mb-2 opacity-60" />
              <div className="font-bold text-xs text-neutral-200">Beat {scene?.beatNumber} Draft</div>
              <p className="text-[11px] text-neutral-500 mt-1 max-w-xs">{scene?.visualAction}</p>
            </div>
          )}

          {/* Vignette Overlay */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/60 via-transparent to-black/85" />

          {/* Touch Tap Zones for Snapchat Interaction */}
          <div className="absolute inset-0 grid grid-cols-3 z-20">
            {/* Left 1/3: Tap for previous beat */}
            <div
              className="cursor-pointer"
              onClick={handlePrev}
              title="Tap left to jump back 10 seconds"
            />
            {/* Center 1/3: Tap to pause / resume */}
            <div
              className="cursor-pointer flex items-center justify-center"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {!isPlaying && !isEndReached && (
                <div className="w-14 h-14 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-xl">
                  <Play className="w-6 h-6 fill-current ml-1" />
                </div>
              )}
            </div>
            {/* Right 1/3: Tap for next beat */}
            <div
              className="cursor-pointer"
              onClick={handleNext}
              title="Tap right to skip to next 10 seconds"
            />
          </div>

          {/* 10-Second Seconds Counter Badge */}
          <div className="absolute top-24 right-3 z-20 pointer-events-none flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-mono font-bold text-amber-300">
              <Zap className="w-3 h-3 text-yellow-400 fill-current" />
              <span>{(10 - (progress / 100) * 10).toFixed(1)}s</span>
            </div>

            {/* Upcoming 10s Break Transition Pill */}
            {progress >= 70 && currentSceneIndex < scenes.length - 1 && (
              <div className="animate-fadeIn flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-amber-500/40 text-[9px] font-bold text-amber-300 shadow-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                <span>
                  Break: {getTransitionMeta(scene?.transitionToNext?.type).shortName}
                </span>
              </div>
            )}
          </div>

          {/* Transition Visual Effects Layer */}
          {isTransitioning && activeTransition && (
            <div
              className={`absolute inset-0 z-30 pointer-events-none flex items-center justify-center transition-all ${
                activeTransition.type === "fade_to_black"
                  ? "bg-black animate-pulse"
                  : activeTransition.type === "fade_to_white"
                  ? "bg-white animate-pulse"
                  : activeTransition.type === "cross_dissolve"
                  ? "bg-black/60 backdrop-blur-md"
                  : activeTransition.type === "slide_in"
                  ? "bg-neutral-900 border-l-4 border-amber-500 animate-in slide-in-from-right duration-300"
                  : activeTransition.type === "glitch_flash"
                  ? "bg-fuchsia-950/80 invert animate-ping"
                  : activeTransition.type === "whip_pan"
                  ? "blur-md bg-neutral-900"
                  : activeTransition.type === "zoom_in"
                  ? "scale-125 bg-black/50"
                  : "bg-black"
              }`}
            >
              {/* Cinematic Transition Badge */}
              <div className="px-3.5 py-1.5 rounded-full bg-black/85 backdrop-blur-md border border-amber-500/60 text-white font-mono text-[11px] font-bold shadow-2xl flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>{getTransitionMeta(activeTransition.type).shortName}</span>
                <span className="text-amber-300/80 text-[10px] font-normal">
                  ({activeTransition.durationSeconds ?? 0.6}s)
                </span>
              </div>
            </div>
          )}

          {/* Bottom Captions & Suspense Cliffhanger Hook */}
          <div className="absolute bottom-16 inset-x-3 z-20 pointer-events-none space-y-2">
            {/* Camera / Visual Note */}
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400 drop-shadow">
              <span className="px-1.5 py-0.5 rounded bg-black/70 border border-amber-500/30 uppercase">
                {scene?.cameraSetup}
              </span>
            </div>

            {/* Dialogue / Action */}
            {scene?.dialogue ? (
              <div className="bg-black/75 backdrop-blur-md border border-white/10 rounded-xl p-2.5 text-xs text-white drop-shadow leading-relaxed">
                {scene.dialogue}
              </div>
            ) : (
              <div className="bg-black/60 backdrop-blur-sm border border-white/10 rounded-xl p-2 text-[11px] text-neutral-200 drop-shadow">
                {scene?.visualAction}
              </div>
            )}

            {/* Audio / SFX Cue */}
            {scene?.soundEffects && (
              <div className="text-[10px] text-amber-300/90 italic flex items-center gap-1 drop-shadow">
                <span>SFX:</span>
                <span>{scene.soundEffects}</span>
              </div>
            )}

            {/* 10-Sec Cliffhanger Callout (Active on the 7th-10th second) */}
            {progress >= 60 && (
              <div className="animate-pulse bg-gradient-to-r from-red-600/90 to-amber-600/90 text-white rounded-xl p-2.5 text-xs font-bold shadow-lg border border-red-400/40 flex items-start gap-2">
                <span className="px-1 py-0.5 rounded bg-black/40 text-[9px] uppercase font-black tracking-wider shrink-0 mt-0.5">
                  HOOK
                </span>
                <span className="leading-tight">{scene?.cliffhangerHook}</span>
              </div>
            )}
          </div>

          {/* End of Installation Cliffhanger Screen */}
          {isEndReached && (
            <div className="absolute inset-0 z-40 bg-black/95 flex flex-col items-center justify-center p-6 text-center text-white animate-fadeIn">
              <div className="w-12 h-12 rounded-full bg-amber-500 text-neutral-950 font-black flex items-center justify-center text-xl mb-3 shadow-lg shadow-amber-500/30">
                S
              </div>
              <h3 className="text-lg font-extrabold tracking-tight">INSTALLMENT 1 COMPLETE</h3>
              <p className="text-xs text-neutral-400 mt-1 max-w-xs">
                You've reached the micro-season cliffhanger. Will Maya survive Penthouse 404?
              </p>

              <div className="my-6 p-4 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-amber-300 font-semibold max-w-xs">
                "The shadow begins lifting a crowbar into the doorway frame..."
              </div>

              <div className="flex flex-col gap-2 w-full max-w-xs">
                <button
                  onClick={restartPlayer}
                  className="w-full py-2.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-colors shadow-md shadow-amber-500/20"
                >
                  Replay from Beat 1
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-2.5 rounded-xl font-medium text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors"
                >
                  Return to Storyboard Studio
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Snapchat Navigation Bar Simulation */}
        <div className="h-14 bg-black border-t border-neutral-900 px-4 flex items-center justify-between z-30 text-white/70 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentSceneIndex === 0}
              className="p-1 rounded-full hover:text-white disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-[11px]">
              {currentSceneIndex + 1}/{scenes.length}
            </span>
            <button
              onClick={handleNext}
              disabled={currentSceneIndex === scenes.length - 1}
              className="p-1 rounded-full hover:text-white disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-white/40">Tap sides to skip 10s</span>
          </div>
        </div>
      </div>
    </div>
  );
};
