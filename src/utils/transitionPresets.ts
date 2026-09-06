import { TransitionType, BeatTransition, SceneBeat } from "../types";

export interface TransitionPresetInfo {
  type: TransitionType;
  name: string;
  shortName: string;
  description: string;
  visualCue: string;
  defaultDuration: number; // in seconds
  recommendedSoundEffect: string;
  edlCode: string; // C = cut, D = dissolve, W = wipe
  badgeColor: string;
}

export const TRANSITION_PRESETS: TransitionPresetInfo[] = [
  {
    type: "fade_to_black",
    name: "Fade to Black (Dip to Black)",
    shortName: "Fade to Black",
    description: "Classic cliffhanger blackout break. Fades outgoing scene to total darkness before revealing next beat.",
    visualCue: "Screen dims completely to black, heightening mystery and pacing.",
    defaultDuration: 0.6,
    recommendedSoundEffect: "Deep bass rumble / heartbeat silence drop",
    edlCode: "D",
    badgeColor: "bg-neutral-800 text-neutral-300 border-neutral-700",
  },
  {
    type: "cross_dissolve",
    name: "Cross Dissolve",
    shortName: "Cross Dissolve",
    description: "Smooth visual bleed between consecutive 10-second installments. Overlaps outgoing and incoming imagery.",
    visualCue: "Frames gently morph and dissolve into one another.",
    defaultDuration: 0.5,
    recommendedSoundEffect: "Subtle ambient riser / musical swell",
    edlCode: "D",
    badgeColor: "bg-blue-950/70 text-blue-300 border-blue-800/60",
  },
  {
    type: "slide_in",
    name: "Slide In (Snapchat Swipe)",
    shortName: "Slide In / Swipe",
    description: "Native vertical mobile gesture aesthetic. Next 10-second scene slides in from the right edge with inertia.",
    visualCue: "Dynamic horizontal push matching mobile story progression.",
    defaultDuration: 0.35,
    recommendedSoundEffect: "Tactile air swoosh / digital screen swipe click",
    edlCode: "W",
    badgeColor: "bg-amber-950/70 text-amber-300 border-amber-800/60",
  },
  {
    type: "glitch_flash",
    name: "Digital Glitch & Static Tear",
    shortName: "Glitch Flash",
    description: "High-tension surveillance or psychological static interference with RGB chromatic split.",
    visualCue: "Screen flickers with digital scanlines and distorted horizontal slice.",
    defaultDuration: 0.4,
    recommendedSoundEffect: "Electric static crackle / modem sync glitch",
    edlCode: "D",
    badgeColor: "bg-fuchsia-950/70 text-fuchsia-300 border-fuchsia-800/60",
  },
  {
    type: "whip_pan",
    name: "Whip Pan (Kinetic Blur)",
    shortName: "Whip Pan",
    description: "High-speed camera swivel creating dynamic directional blur between camera setups.",
    visualCue: "Instant horizontal motion-blur snap simulating fast camera whip.",
    defaultDuration: 0.3,
    recommendedSoundEffect: "Fast aggressive whoosh / camera mechanical pan",
    edlCode: "W",
    badgeColor: "bg-emerald-950/70 text-emerald-300 border-emerald-800/60",
  },
  {
    type: "snap_cut",
    name: "Hard Snap Cut (0s Jump)",
    shortName: "Snap Cut",
    description: "Instantaneous, abrupt transition with zero delay. Creates jarring shock and immediate cliffhanger impact.",
    visualCue: "Single-frame immediate jump between consecutive visual compositions.",
    defaultDuration: 0.1,
    recommendedSoundEffect: "Sudden sharp impact / unexpected cutoff",
    edlCode: "C",
    badgeColor: "bg-red-950/70 text-red-300 border-red-800/60",
  },
  {
    type: "fade_to_white",
    name: "Flash to White (Exposure Burst)",
    shortName: "Flash to White",
    description: "Sudden high-key exposure bloom or muzzle flash flare that blows out to white before the next beat.",
    visualCue: "Blinding white light bloom simulating strobe or explosion.",
    defaultDuration: 0.45,
    recommendedSoundEffect: "High-frequency ringing flash / shockwave burst",
    edlCode: "D",
    badgeColor: "bg-yellow-950/70 text-yellow-300 border-yellow-800/60",
  },
  {
    type: "zoom_in",
    name: "Zoom Push (Snap Zoom)",
    shortName: "Zoom Push",
    description: "Rapid optical crash zoom pushing aggressively into the center of the frame into the next scene.",
    visualCue: "Accelerated scale surge pushing viewer forward into the suspense.",
    defaultDuration: 0.35,
    recommendedSoundEffect: "Rising suction woosh / tense pneumatic push",
    edlCode: "W",
    badgeColor: "bg-purple-950/70 text-purple-300 border-purple-800/60",
  },
];

export const DEFAULT_BEAT_TRANSITION: BeatTransition = {
  type: "fade_to_black",
  durationSeconds: 0.6,
  soundEffect: "Deep bass rumble / heartbeat silence drop",
};

export function getTransitionMeta(type?: TransitionType): TransitionPresetInfo {
  const found = TRANSITION_PRESETS.find((p) => p.type === type);
  return found || TRANSITION_PRESETS[0];
}

export function applyTransitionToAllScenes(
  scenes: SceneBeat[],
  transition: BeatTransition
): SceneBeat[] {
  return scenes.map((scene, idx) => {
    // Last scene doesn't need transition to next
    if (idx === scenes.length - 1) {
      return {
        ...scene,
        transitionToNext: undefined,
      };
    }
    return {
      ...scene,
      transitionToNext: { ...transition },
    };
  });
}
