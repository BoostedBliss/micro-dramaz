import React, { useState } from "react";
import {
  X,
  Sliders,
  Sun,
  Contrast,
  Aperture,
  Eye,
  Crop,
  Layers,
  Sparkles,
  RotateCcw,
  Check,
  Grid3X3,
  Smartphone,
  Move,
  ArrowRight,
  Maximize2,
  Camera,
  Wand2,
} from "lucide-react";
import { SceneBeat, LightingSettings, CompositionSettings } from "../types";

interface EditingSuiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  scene: SceneBeat | null;
  onSaveScene: (updatedScene: SceneBeat) => void;
}

export const EditingSuiteModal: React.FC<EditingSuiteModalProps> = ({
  isOpen,
  onClose,
  scene,
  onSaveScene,
}) => {
  if (!isOpen || !scene) return null;

  const [activeTab, setActiveTab] = useState<"lighting" | "composition" | "ai_retouch">("lighting");
  const [lighting, setLighting] = useState<LightingSettings>({
    ...scene.lightingAdjustments,
  });
  const [composition, setComposition] = useState<CompositionSettings>({
    ...scene.compositionAdjustments,
  });
  const [currentImage, setCurrentImage] = useState<string>(
    scene.generatedImageUrl || scene.placeholderThumbnailUrl || ""
  );
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Preset framing handlers
  const applyFramingPreset = (preset: CompositionSettings["framingPreset"]) => {
    switch (preset) {
      case "extreme_close_up":
        setComposition((prev) => ({ ...prev, framingPreset: preset, scale: 1.4, panX: 0, panY: -10 }));
        break;
      case "close_up":
        setComposition((prev) => ({ ...prev, framingPreset: preset, scale: 1.2, panX: 0, panY: -5 }));
        break;
      case "medium_shot":
        setComposition((prev) => ({ ...prev, framingPreset: preset, scale: 1.0, panX: 0, panY: 0 }));
        break;
      case "low_angle":
        setComposition((prev) => ({ ...prev, framingPreset: preset, scale: 1.15, panX: 0, panY: 15 }));
        break;
      case "high_angle":
        setComposition((prev) => ({ ...prev, framingPreset: preset, scale: 1.15, panX: 0, panY: -15 }));
        break;
      case "dutch_tilt":
        setComposition((prev) => ({ ...prev, framingPreset: preset, scale: 1.1, panX: 0, panY: 0 }));
        break;
      default:
        break;
    }
  };

  const handleAiRetouch = async () => {
    if (!currentImage) {
      setAiError("No image available to edit. Please generate a frame first.");
      return;
    }
    if (!aiPrompt.trim()) {
      setAiError("Please describe the lighting or composition adjustment.");
      return;
    }

    setIsAiProcessing(true);
    setAiError(null);

    try {
      const res = await fetch("/api/edit-storyboard-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: currentImage,
          editInstruction: aiPrompt,
          lightingAdjustments: `Color tint: ${lighting.tintColor}, Brightness: ${lighting.brightness}%, Vignette: ${lighting.vignette}%`,
          compositionAdjustments: `Framing: ${composition.framingPreset}, Camera move: ${composition.cameraMovement}`,
          aspectRatio: scene.aspectRatio || "9:16",
          imageSize: scene.imageSize || "2K",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to process AI retouching.");
      }

      const data = await res.json();
      if (data.imageUrl) {
        setCurrentImage(data.imageUrl);
        setAiPrompt("");
      }
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || "AI image editing failed.");
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleSave = () => {
    onSaveScene({
      ...scene,
      generatedImageUrl: currentImage,
      lightingAdjustments: lighting,
      compositionAdjustments: composition,
      status: "edited",
    });
    onClose();
  };

  const resetAll = () => {
    setLighting({
      brightness: 0,
      contrast: 0,
      exposure: 0,
      vignette: 0,
      colorTemp: 0,
      tintColor: "none",
      tintOpacity: 0,
      grain: 0,
    });
    setComposition({
      scale: 1,
      panX: 0,
      panY: 0,
      framingPreset: "medium_shot",
      cameraOverlay: "none",
      cameraMovement: "static",
    });
    setCurrentImage(scene.generatedImageUrl || "");
  };

  // Build real-time CSS filter string
  const cssFilter = `
    brightness(${100 + lighting.brightness}%)
    contrast(${100 + lighting.contrast}%)
    ${lighting.colorTemp > 0 ? `sepia(${lighting.colorTemp * 0.4}%) hue-rotate(-10deg)` : ""}
    ${lighting.colorTemp < 0 ? `hue-rotate(${lighting.colorTemp * 0.5}deg) saturate(${100 + Math.abs(lighting.colorTemp) * 0.2}%)` : ""}
  `;

  // Color tint overlay styling
  const tintColors: Record<string, string> = {
    none: "transparent",
    cyan: "rgba(6, 182, 212, ",
    crimson: "rgba(239, 68, 68, ",
    amber: "rgba(245, 158, 11, ",
    emerald: "rgba(16, 185, 129, ",
    purple: "rgba(168, 85, 247, ",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-5xl h-[92vh] flex flex-col shadow-2xl overflow-hidden text-neutral-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-neutral-800 bg-neutral-900">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold">Storyboard Editing Suite</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-neutral-800 text-amber-400 border border-neutral-700">
                  Beat {scene.beatNumber} &bull; {scene.timecode}
                </span>
              </div>
              <p className="text-xs text-neutral-400 truncate max-w-md">{scene.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetAll}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
              title="Reset all lighting and composition sliders"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              aria-label="Close editing suite"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Workspace Body */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Left Canvas Preview (9:16 Vertical Snapchat Cinema Viewport) */}
          <div className="lg:col-span-6 bg-neutral-950 p-4 sm:p-6 flex flex-col items-center justify-center relative overflow-hidden border-b lg:border-b-0 lg:border-r border-neutral-800">
            <div className="relative w-full max-w-[260px] sm:max-w-[300px] aspect-[9/16] rounded-2xl overflow-hidden border-2 border-neutral-700/80 shadow-2xl bg-neutral-900 group">
              {currentImage ? (
                <div
                  className="w-full h-full relative overflow-hidden transition-transform duration-100 ease-out"
                  style={{
                    transform: `scale(${composition.scale}) translate(${composition.panX}%, ${composition.panY}%)`,
                  }}
                >
                  <img
                    src={currentImage}
                    alt={scene.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover select-none pointer-events-none"
                    style={{ filter: cssFilter }}
                  />

                  {/* Color Tint Overlay */}
                  {lighting.tintColor !== "none" && lighting.tintOpacity > 0 && (
                    <div
                      className="absolute inset-0 pointer-events-none mix-blend-color"
                      style={{
                        backgroundColor: `${tintColors[lighting.tintColor]}${lighting.tintOpacity / 100})`,
                      }}
                    />
                  )}

                  {/* Vignette Suspense Mask */}
                  {lighting.vignette > 0 && (
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: `radial-gradient(circle, transparent 40%, rgba(0,0,0,${
                          (lighting.vignette / 100) * 0.95
                        }) 100%)`,
                      }}
                    />
                  )}

                  {/* Film Grain Simulation */}
                  {lighting.grain > 0 && (
                    <div
                      className="absolute inset-0 pointer-events-none opacity-30 mix-blend-overlay"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                        opacity: lighting.grain / 100,
                      }}
                    />
                  )}
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-neutral-500">
                  <Camera className="w-10 h-10 mb-2 opacity-40 text-neutral-400" />
                  <p className="text-xs font-semibold">Frame not yet generated</p>
                  <p className="text-[11px] text-neutral-600 mt-1">
                    Generate the frame or use AI Re-touch to apply adjustments
                  </p>
                </div>
              )}

              {/* Composition Overlays */}
              {composition.cameraOverlay === "rule_of_thirds" && (
                <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-amber-400/40">
                  <div className="border-r border-b border-amber-400/30" />
                  <div className="border-r border-b border-amber-400/30" />
                  <div className="border-b border-amber-400/30" />
                  <div className="border-r border-b border-amber-400/30" />
                  <div className="border-r border-b border-amber-400/30" />
                  <div className="border-b border-amber-400/30" />
                  <div className="border-r border-amber-400/30" />
                  <div className="border-r border-amber-400/30" />
                  <div />
                </div>
              )}

              {composition.cameraOverlay === "director_crosshair" && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-16 h-16 border border-amber-500/50 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-amber-400 rounded-full" />
                  </div>
                  <div className="absolute w-full h-[1px] bg-amber-500/20" />
                  <div className="absolute h-full w-[1px] bg-amber-500/20" />
                </div>
              )}

              {composition.cameraOverlay === "snapchat_ui" && (
                <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 bg-gradient-to-b from-black/50 via-transparent to-black/70 text-white text-[11px]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-full bg-yellow-400 text-black font-bold flex items-center justify-center text-[10px]">
                        S
                      </div>
                      <span className="font-bold">SnapStory Movie</span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-black/40 font-mono text-[9px]">10s</span>
                  </div>
                  <div className="space-y-1">
                    <div className="bg-black/60 backdrop-blur-sm rounded-lg p-2 text-[10px] leading-tight border border-white/10">
                      <strong>CLIFFHANGER:</strong> {scene.cliffhangerHook}
                    </div>
                    <div className="h-7 rounded-full bg-white/20 backdrop-blur-md flex items-center px-3 text-[10px] text-white/70">
                      Tap right to advance &bull; Swipe up for Next Installation
                    </div>
                  </div>
                </div>
              )}

              {/* Camera Movement Badge */}
              <div className="absolute top-2 left-2 pointer-events-none bg-black/75 backdrop-blur-sm border border-neutral-700 px-2 py-0.5 rounded text-[10px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1">
                <span>[{composition.cameraMovement.replace("_", " ")}]</span>
              </div>

              {!scene.generatedImageUrl && currentImage && (
                <div className="absolute top-8 left-2 pointer-events-none flex items-center gap-1 bg-amber-500/95 text-neutral-950 font-black text-[9px] px-1.5 py-0.5 rounded shadow tracking-wider uppercase">
                  <Wand2 className="w-2.5 h-2.5" />
                  <span>Concept Draft</span>
                </div>
              )}

              {/* Timecode Badge */}
              <div className="absolute top-2 right-2 pointer-events-none bg-black/75 backdrop-blur-sm border border-neutral-700 px-2 py-0.5 rounded text-[10px] font-mono text-neutral-300">
                {scene.timecode}
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 text-[11px] text-neutral-400">
              <span className="font-semibold text-neutral-300">Format:</span> 9:16 Vertical Cinema
              <span>&bull;</span>
              <span className="font-semibold text-neutral-300">Res:</span> {scene.imageSize || "2K"}
              <span>&bull;</span>
              <span className="text-amber-400">Suspense: {scene.suspenseScore}/10</span>
            </div>
          </div>

          {/* Right Editing Controls Tabs */}
          <div className="lg:col-span-6 bg-neutral-900 flex flex-col overflow-hidden">
            {/* Control Tabs */}
            <div className="flex border-b border-neutral-800 bg-neutral-900/90 text-xs">
              <button
                onClick={() => setActiveTab("lighting")}
                className={`flex-1 py-3 font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
                  activeTab === "lighting"
                    ? "border-amber-500 text-amber-400 bg-amber-500/5"
                    : "border-transparent text-neutral-400 hover:text-neutral-200"
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Lighting & Atmosphere</span>
              </button>
              <button
                onClick={() => setActiveTab("composition")}
                className={`flex-1 py-3 font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
                  activeTab === "composition"
                    ? "border-amber-500 text-amber-400 bg-amber-500/5"
                    : "border-transparent text-neutral-400 hover:text-neutral-200"
                }`}
              >
                <Crop className="w-3.5 h-3.5" />
                <span>Composition & Framing</span>
              </button>
              <button
                onClick={() => setActiveTab("ai_retouch")}
                className={`flex-1 py-3 font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
                  activeTab === "ai_retouch"
                    ? "border-amber-500 text-amber-400 bg-amber-500/5"
                    : "border-transparent text-neutral-400 hover:text-neutral-200"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Re-Light</span>
              </button>
            </div>

            {/* Tab Panes */}
            <div className="flex-1 p-5 overflow-y-auto space-y-5 text-xs">
              {/* TAB 1: LIGHTING & ATMOSPHERE */}
              {activeTab === "lighting" && (
                <div className="space-y-4">
                  {/* Exposure & Brightness */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between font-medium text-neutral-300 mb-1">
                        <span>Brightness</span>
                        <span className="font-mono text-neutral-400">{lighting.brightness}%</span>
                      </div>
                      <input
                        type="range"
                        min="-50"
                        max="50"
                        value={lighting.brightness}
                        onChange={(e) =>
                          setLighting({ ...lighting, brightness: Number(e.target.value) })
                        }
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between font-medium text-neutral-300 mb-1">
                        <span>Contrast</span>
                        <span className="font-mono text-neutral-400">{lighting.contrast}%</span>
                      </div>
                      <input
                        type="range"
                        min="-50"
                        max="50"
                        value={lighting.contrast}
                        onChange={(e) =>
                          setLighting({ ...lighting, contrast: Number(e.target.value) })
                        }
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Suspense Vignette */}
                  <div>
                    <div className="flex justify-between font-medium text-neutral-300 mb-1">
                      <span>Suspense Edge Vignette (Crucial for Vertical Focus)</span>
                      <span className="font-mono text-neutral-400">{lighting.vignette}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={lighting.vignette}
                      onChange={(e) =>
                        setLighting({ ...lighting, vignette: Number(e.target.value) })
                      }
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  {/* Color Temperature */}
                  <div>
                    <div className="flex justify-between font-medium text-neutral-300 mb-1">
                      <span>Color Temperature (Cool Thriller vs Warm Dread)</span>
                      <span className="font-mono text-neutral-400">
                        {lighting.colorTemp < 0
                          ? `Cool (${lighting.colorTemp})`
                          : lighting.colorTemp > 0
                          ? `Warm (+${lighting.colorTemp})`
                          : "Neutral"}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      value={lighting.colorTemp}
                      onChange={(e) =>
                        setLighting({ ...lighting, colorTemp: Number(e.target.value) })
                      }
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  {/* Suspense Rim Light / Color Tint */}
                  <div>
                    <label className="block font-semibold text-neutral-300 mb-2">
                      Suspense Rim Light Tint Filter
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
                      {(["none", "cyan", "crimson", "amber", "emerald", "purple"] as const).map((col) => {
                        const isSelected = lighting.tintColor === col;
                        return (
                          <button
                            key={col}
                            type="button"
                            onClick={() =>
                              setLighting({
                                ...lighting,
                                tintColor: col,
                                tintOpacity: col === "none" ? 0 : lighting.tintOpacity || 25,
                              })
                            }
                            className={`p-2 rounded-lg border text-center font-semibold capitalize transition-all ${
                              isSelected
                                ? "bg-amber-500/20 border-amber-500 text-amber-300 ring-1 ring-amber-500/50"
                                : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                            }`}
                          >
                            {col}
                          </button>
                        );
                      })}
                    </div>

                    {lighting.tintColor !== "none" && (
                      <div>
                        <div className="flex justify-between font-medium text-neutral-300 mb-1">
                          <span>Tint Intensity</span>
                          <span className="font-mono text-neutral-400">{lighting.tintOpacity}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="80"
                          value={lighting.tintOpacity}
                          onChange={(e) =>
                            setLighting({ ...lighting, tintOpacity: Number(e.target.value) })
                          }
                          className="w-full accent-amber-500 cursor-pointer"
                        />
                      </div>
                    )}
                  </div>

                  {/* Film Grain */}
                  <div>
                    <div className="flex justify-between font-medium text-neutral-300 mb-1">
                      <span>Cinematic Film Grain</span>
                      <span className="font-mono text-neutral-400">{lighting.grain}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="60"
                      value={lighting.grain}
                      onChange={(e) =>
                        setLighting({ ...lighting, grain: Number(e.target.value) })
                      }
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: COMPOSITION & FRAMING */}
              {activeTab === "composition" && (
                <div className="space-y-4">
                  {/* Framing Presets */}
                  <div>
                    <label className="block font-semibold text-neutral-300 mb-2">
                      Vertical Framing Presets (9:16)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { id: "extreme_close_up", label: "Extreme Close-Up", desc: "Eyes / Terror hook" },
                        { id: "close_up", label: "Close-Up", desc: "Character emotion" },
                        { id: "medium_shot", label: "Medium Shot", desc: "Waist-up vertical" },
                        { id: "low_angle", label: "Low Angle", desc: "Menace / Scale" },
                        { id: "high_angle", label: "High Angle", desc: "Vulnerable POV" },
                        { id: "dutch_tilt", label: "Dutch Angle", desc: "Disorientation" },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => applyFramingPreset(item.id as any)}
                          className={`p-2 rounded-lg border text-left transition-all ${
                            composition.framingPreset === item.id
                              ? "bg-amber-500/15 border-amber-500 text-neutral-100 ring-1 ring-amber-500/50"
                              : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                          }`}
                        >
                          <div className="font-bold text-[11px] text-amber-300">{item.label}</div>
                          <div className="text-[10px] text-neutral-500 leading-tight">{item.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Manual Pan & Zoom */}
                  <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 space-y-3">
                    <span className="font-semibold text-neutral-300 block">Manual Pan & Scale</span>
                    <div>
                      <div className="flex justify-between font-medium text-neutral-400 mb-1">
                        <span>Zoom Scale</span>
                        <span className="font-mono text-neutral-300">{composition.scale.toFixed(2)}x</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="2"
                        step="0.05"
                        value={composition.scale}
                        onChange={(e) =>
                          setComposition({ ...composition, scale: Number(e.target.value) })
                        }
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="flex justify-between font-medium text-neutral-400 mb-1">
                          <span>Pan X</span>
                          <span className="font-mono text-neutral-300">{composition.panX}%</span>
                        </div>
                        <input
                          type="range"
                          min="-30"
                          max="30"
                          value={composition.panX}
                          onChange={(e) =>
                            setComposition({ ...composition, panX: Number(e.target.value) })
                          }
                          className="w-full accent-amber-500 cursor-pointer"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between font-medium text-neutral-400 mb-1">
                          <span>Pan Y</span>
                          <span className="font-mono text-neutral-300">{composition.panY}%</span>
                        </div>
                        <input
                          type="range"
                          min="-30"
                          max="30"
                          value={composition.panY}
                          onChange={(e) =>
                            setComposition({ ...composition, panY: Number(e.target.value) })
                          }
                          className="w-full accent-amber-500 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Guides and Overlays */}
                  <div>
                    <label className="block font-semibold text-neutral-300 mb-2">
                      Director Guides & Snapchat Overlays
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: "none", label: "Clean" },
                        { id: "rule_of_thirds", label: "Rule of 3rds" },
                        { id: "director_crosshair", label: "Crosshair" },
                        { id: "snapchat_ui", label: "Snapchat UI" },
                      ].map((ov) => (
                        <button
                          key={ov.id}
                          type="button"
                          onClick={() => setComposition({ ...composition, cameraOverlay: ov.id as any })}
                          className={`py-2 px-2.5 rounded-lg border text-center font-semibold text-[11px] transition-all ${
                            composition.cameraOverlay === ov.id
                              ? "bg-amber-500/20 border-amber-500 text-amber-300"
                              : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                          }`}
                        >
                          {ov.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Camera Movement Vector */}
                  <div>
                    <label className="block font-semibold text-neutral-300 mb-2">
                      Camera Movement Vector (10s Motion Cue)
                    </label>
                    <select
                      value={composition.cameraMovement}
                      onChange={(e) =>
                        setComposition({ ...composition, cameraMovement: e.target.value as any })
                      }
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="push_in">Quick Push-In (Building Tension)</option>
                      <option value="snap_zoom">Snap Zoom (Sudden Revelation)</option>
                      <option value="whip_pan">Whip Pan (Fast Transition)</option>
                      <option value="tilt_down">Slow Tilt Down (Floor/Clue Discovery)</option>
                      <option value="pull_out">Pull Out (Revealing Scope/Threat)</option>
                      <option value="static">Locked-Off Static (Claustrophobic Wait)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* TAB 3: AI RE-LIGHT & RE-TOUCH */}
              {activeTab === "ai_retouch" && (
                <div className="space-y-4">
                  <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-xl text-amber-200 text-xs">
                    <strong>Gemini AI Re-Lighting:</strong> Prompt the model to modify lighting direction, add atmospheric elements (volumetric fog, flashlight beams, strobe flashes), or reframe the scene while keeping the character consistent.
                  </div>

                  {aiError && (
                    <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-red-300 text-xs">
                      {aiError}
                    </div>
                  )}

                  <div>
                    <label className="block font-semibold text-neutral-300 mb-1.5">
                      Lighting & Composition AI Edit Instruction
                    </label>
                    <textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="e.g. Add a cold blue flashlight beam piercing through heavy bathroom steam; increase shadow darkness on the intruder silhouette..."
                      rows={4}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                    />
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "Add harsh neon flashlight beam",
                      "Convert to cold moonlight silhouette",
                      "Add rain streaks on foreground lens",
                      "Dramatize shadow across face",
                    ].map((presetPrompt) => (
                      <button
                        key={presetPrompt}
                        type="button"
                        onClick={() => setAiPrompt(presetPrompt)}
                        className="px-2.5 py-1 rounded-full bg-neutral-800 hover:bg-neutral-700 text-[11px] text-neutral-300 transition-colors"
                      >
                        + {presetPrompt}
                      </button>
                    ))}
                  </div>

                  <button
                    id="btn-apply-ai-retouch"
                    type="button"
                    onClick={handleAiRetouch}
                    disabled={isAiProcessing || !aiPrompt.trim()}
                    className="w-full py-2.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-all flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isAiProcessing ? "Re-Lighting with Gemini..." : "Execute AI Re-Light"}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-3.5 border-t border-neutral-800 bg-neutral-900 flex items-center justify-between">
              <div className="text-[11px] text-neutral-400">
                Adjustments previewed in real time on 9:16 canvas
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:bg-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="btn-save-editing-suite"
                  type="button"
                  onClick={handleSave}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-all shadow-md shadow-amber-500/20"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save & Apply Adjustments</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
