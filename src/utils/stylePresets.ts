import { LightingSettings, CompositionSettings, SceneBeat, ProjectData } from "../types";

export interface StylePreset {
  id: string;
  name: string;
  category: "Thriller & Noir" | "Horror & Suspense" | "Sci-Fi & Cyberpunk" | "Stylized Cinema";
  tagline: string;
  description: string;
  visualPromptModifier: string;
  palette: string[];
  sampleImageUrl: string;
  defaultLighting: LightingSettings;
  defaultComposition: Partial<CompositionSettings>;
}

export const GLOBAL_STYLE_PRESETS: StylePreset[] = [
  {
    id: "cinematic_dark_thriller",
    name: "Cinematic Dark Thriller",
    category: "Thriller & Noir",
    tagline: "Teal & amber shadows, Fincher psychological dread",
    description: "Anamorphic rim lighting, clinical high-contrast shadows, desaturated cool tones with warm tungsten accents.",
    visualPromptModifier: "David Fincher psychological thriller aesthetic, desaturated teal shadows and warm tungsten amber highlights, anamorphic rim lighting, sharp razor focus, clinical high-contrast tension, 35mm film texture.",
    palette: ["#0d2229", "#11464e", "#c69214", "#e2a93c"],
    sampleImageUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=720&h=1280&q=80",
    defaultLighting: {
      brightness: -10,
      contrast: 25,
      exposure: -5,
      vignette: 35,
      colorTemp: -15,
      tintColor: "emerald",
      tintOpacity: 25,
      grain: 20,
    },
    defaultComposition: {
      framingPreset: "close_up",
      cameraMovement: "push_in",
      cameraOverlay: "rule_of_thirds",
    },
  },
  {
    id: "found_footage_pov",
    name: "Gritty Found Footage / Smartphone POV",
    category: "Horror & Suspense",
    tagline: "Smartphone camera, flashlight beam, raw mobile terror",
    description: "Visceral first-person Snapchat perspective, digital ISO grain, harsh phone LED glare, and claustrophobic darkness.",
    visualPromptModifier: "Hyper-immersive smartphone POV found footage, raw handheld camera shake angle, blinding white phone LED flashlight cutting through pitch darkness, digital ISO noise, lens flare, authentic mobile video terror.",
    palette: ["#0a0a0a", "#292929", "#e2e8f0", "#94a3b8"],
    sampleImageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=720&h=1280&q=80",
    defaultLighting: {
      brightness: -5,
      contrast: 30,
      exposure: 10,
      vignette: 50,
      colorTemp: 5,
      tintColor: "none",
      tintOpacity: 0,
      grain: 45,
    },
    defaultComposition: {
      framingPreset: "dutch_tilt",
      cameraMovement: "snap_zoom",
      cameraOverlay: "snapchat_ui",
    },
  },
  {
    id: "cyberpunk_neon",
    name: "Neon Cyberpunk & Claustrophobia",
    category: "Sci-Fi & Cyberpunk",
    tagline: "Electric magenta & cyan neon, wet reflections, tech anxiety",
    description: "Blade Runner 2049 aesthetic with drenched saturated lights, foggy condensation, and futuristic urban danger.",
    visualPromptModifier: "Blade Runner 2049 neon cyberpunk aesthetic, drenched in electric magenta and turquoise neon reflections, rainy wet surfaces, heavy atmosphere haze, futuristic surveillance dystopia, anamorphic horizontal streaks.",
    palette: ["#120326", "#e11d48", "#06b6d4", "#a855f7"],
    sampleImageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=720&h=1280&q=80",
    defaultLighting: {
      brightness: -5,
      contrast: 35,
      exposure: 0,
      vignette: 40,
      colorTemp: -30,
      tintColor: "purple",
      tintOpacity: 35,
      grain: 25,
    },
    defaultComposition: {
      framingPreset: "low_angle",
      cameraMovement: "tilt_down",
      cameraOverlay: "rule_of_thirds",
    },
  },
  {
    id: "psychological_glitch_horror",
    name: "Psychological Glitch Horror",
    category: "Horror & Suspense",
    tagline: "Phosphor greens, analog tears, unsettling mirror distortions",
    description: "Uncanny surveillance vibes, sick green hues, scanlines, and nightmare reality breaks.",
    visualPromptModifier: "Surreal psychological horror aesthetic, sickly phosphor green and cold sodium lighting, chromatic aberration, analog CRT scanline glitches, unsettling depth distortions, claustrophobic dread.",
    palette: ["#021d14", "#064e3b", "#10b981", "#052e16"],
    sampleImageUrl: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=720&h=1280&q=80",
    defaultLighting: {
      brightness: -15,
      contrast: 30,
      exposure: -10,
      vignette: 55,
      colorTemp: -20,
      tintColor: "emerald",
      tintOpacity: 45,
      grain: 35,
    },
    defaultComposition: {
      framingPreset: "extreme_close_up",
      cameraMovement: "push_in",
      cameraOverlay: "golden_spiral",
    },
  },
  {
    id: "nordic_noir_minimalist",
    name: "Nordic Noir / Bleak Minimalist",
    category: "Thriller & Noir",
    tagline: "Desaturated slate blues, cold overcast, stark quiet tension",
    description: "Subtle muted tones, crisp natural overcast light, deep obsidian silhouettes, and quiet impending catastrophe.",
    visualPromptModifier: "Nordic Noir bleak minimalist cinematography, desaturated icy slate blues and muted gray tones, natural cold diffuse window light, stark negative space, quiet simmering dread, pristine 8k cinema still.",
    palette: ["#0f172a", "#334155", "#64748b", "#cbd5e1"],
    sampleImageUrl: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=720&h=1280&q=80",
    defaultLighting: {
      brightness: 0,
      contrast: 20,
      exposure: -5,
      vignette: 25,
      colorTemp: -40,
      tintColor: "cyan",
      tintOpacity: 20,
      grain: 15,
    },
    defaultComposition: {
      framingPreset: "medium_shot",
      cameraMovement: "pull_out",
      cameraOverlay: "rule_of_thirds",
    },
  },
  {
    id: "retro_80s_slasher",
    name: "Retro 80s Slasher / Grindhouse",
    category: "Horror & Suspense",
    tagline: "Rich 35mm grain, blood-red neon flares, vintage midnight tension",
    description: "Heavy contrast, crimson gels, warm amber streetlights, and vintage anamorphic lens distortion.",
    visualPromptModifier: "1980s retro horror grindhouse aesthetic, rich 35mm film grain, blood red neon backlight, deep black shadows, vintage Panavision lens flares, tactile midnight tension.",
    palette: ["#2a0404", "#7f1d1d", "#dc2626", "#fbbf24"],
    sampleImageUrl: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=720&h=1280&q=80",
    defaultLighting: {
      brightness: -10,
      contrast: 40,
      exposure: 5,
      vignette: 45,
      colorTemp: 25,
      tintColor: "crimson",
      tintOpacity: 40,
      grain: 50,
    },
    defaultComposition: {
      framingPreset: "low_angle",
      cameraMovement: "push_in",
      cameraOverlay: "rule_of_thirds",
    },
  },
  {
    id: "graphic_novel_stylized",
    name: "Dark Graphic Novel & Stylized Anime",
    category: "Stylized Cinema",
    tagline: "Heavy ink chiaroscuro, sharp rim lines, dynamic vertical angles",
    description: "Illustrative movie stills with heavy blacks, crisp graphic rim lighting, and exaggerated vertical perspective.",
    visualPromptModifier: "Dark anime and graphic novel cinematic still, heavy ink chiaroscuro cross-hatching, extreme dynamic vertical perspective, intense dramatic rim lighting, stylized emotional tension.",
    palette: ["#09090b", "#27272a", "#f59e0b", "#fafafa"],
    sampleImageUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=720&h=1280&q=80",
    defaultLighting: {
      brightness: 5,
      contrast: 45,
      exposure: 0,
      vignette: 30,
      colorTemp: 0,
      tintColor: "amber",
      tintOpacity: 20,
      grain: 10,
    },
    defaultComposition: {
      framingPreset: "dutch_tilt",
      cameraMovement: "whip_pan",
      cameraOverlay: "golden_spiral",
    },
  },
  {
    id: "a24_sunlit_dread",
    name: "A24 Folk Mystery / Sunlit Dread",
    category: "Stylized Cinema",
    tagline: "Bright high-key daylight horror, soft 16mm diffusion, pastoral terror",
    description: "Sun-drenched pastoral settings where horrors occur in broad daylight, warm golden hour palette, high tension.",
    visualPromptModifier: "A24 folk psychological horror aesthetic, deceptive high-key golden hour daylight, soft 16mm film diffusion, warm amber and sun-bleached linen palette, unsettling pastoral dread.",
    palette: ["#451a03", "#78350f", "#d97706", "#fef3c7"],
    sampleImageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=720&h=1280&q=80",
    defaultLighting: {
      brightness: 15,
      contrast: -10,
      exposure: 15,
      vignette: 20,
      colorTemp: 35,
      tintColor: "amber",
      tintOpacity: 30,
      grain: 25,
    },
    defaultComposition: {
      framingPreset: "close_up",
      cameraMovement: "static",
      cameraOverlay: "rule_of_thirds",
    },
  },
];

/**
 * Cleanly transforms an existing scene prompt into the new global style.
 * Strips obsolete style suffixes and appends the unified aesthetic and framing directives.
 */
export function transformPromptWithGlobalStyle(
  originalPrompt: string,
  visualAction: string,
  preset: StylePreset,
  customStylePrompt?: string
): string {
  // Extract narrative action core
  let baseNarrative = originalPrompt || visualAction;

  // Strip common legacy prompt prefixes if present
  baseNarrative = baseNarrative
    .replace(/^Vertical 9:16 cinematic storyboard still of\s+/i, "")
    .replace(/^Vertical 9:16 cinematic storyboard frame for a high-suspense Snapchat movie installation\.\s+/i, "")
    .replace(/^Vertical 9:16 cinematic storyboard still,\s+/i, "")
    .replace(/^Vertical 9:16 movie storyboard concept art thumbnail\.\s+/i, "");

  // Strip previous style endings (e.g., "Cinematic teal and amber...", "Visual Style: ...", "Production Quality: ...")
  baseNarrative = baseNarrative.split(/(?:Visual Style:|Cinematic teal and amber|Production Quality:|Teal & Amber|Blade Runner 2049|Nordic Noir|1980s retro horror)/i)[0].trim();

  // Remove trailing periods or commas
  baseNarrative = baseNarrative.replace(/[.,;]+$/, "").trim();

  const customText = customStylePrompt?.trim() ? ` ${customStylePrompt.trim()}.` : "";

  return `Vertical 9:16 cinematic storyboard still: ${baseNarrative}. Visual Cinematic Style: ${preset.name} (${preset.tagline}). ${preset.visualPromptModifier}${customText} Camera Framing: Strictly 9:16 vertical cinema framing. Production Quality: Masterclass cinema storyboard, color graded, photorealistic tension, 8k resolution look.`;
}

/**
 * Apply the selected global style preset across all scenes in a project
 */
export function applyGlobalStyleToProject(
  project: ProjectData,
  preset: StylePreset,
  options: {
    updatePrompts: boolean;
    updateLighting: boolean;
    updateComposition: boolean;
    customStylePrompt?: string;
  }
): ProjectData {
  const customPrompt = options.customStylePrompt !== undefined ? options.customStylePrompt : project.customStylePrompt;

  const updatedScenes = project.scenes.map((scene) => {
    let updatedPrompt = scene.imagePrompt;
    if (options.updatePrompts) {
      updatedPrompt = transformPromptWithGlobalStyle(
        scene.imagePrompt,
        scene.visualAction,
        preset,
        customPrompt
      );
    }

    const updatedLighting = options.updateLighting
      ? { ...preset.defaultLighting }
      : scene.lightingAdjustments;

    const updatedComposition = options.updateComposition
      ? {
          ...scene.compositionAdjustments,
          ...preset.defaultComposition,
        }
      : scene.compositionAdjustments;

    return {
      ...scene,
      imagePrompt: updatedPrompt,
      lightingAdjustments: updatedLighting,
      compositionAdjustments: updatedComposition,
    };
  });

  return {
    ...project,
    stylePreset: preset.name,
    visualTone: `${preset.name} - ${preset.tagline}`,
    customStylePrompt: customPrompt || "",
    scenes: updatedScenes,
    lastSavedAt: new Date().toISOString(),
    version: (project.version || 1) + 1,
  };
}
