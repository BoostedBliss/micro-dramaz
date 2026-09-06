export type ImageResolution = "1K" | "2K" | "4K";
export type AspectRatioType = "9:16" | "16:9" | "1:1" | "4:3";

export interface Character {
  id: string;
  name: string;
  age: string;
  role: string;
  appearanceDescription: string;
  signatureWardrobe: string;
  colorPalette: string;
  referenceImageUrl?: string;
  isActive: boolean;
}

export interface LightingSettings {
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  exposure: number; // -100 to 100
  vignette: number; // 0 to 100
  colorTemp: number; // -100 (cool) to 100 (warm)
  tintColor: "none" | "cyan" | "crimson" | "amber" | "emerald" | "purple";
  tintOpacity: number; // 0 to 100
  grain: number; // 0 to 100
}

export interface CompositionSettings {
  scale: number; // 1 to 2
  panX: number; // -50 to 50
  panY: number; // -50 to 50
  framingPreset:
    | "extreme_close_up"
    | "close_up"
    | "medium_shot"
    | "low_angle"
    | "high_angle"
    | "dutch_tilt"
    | "custom";
  cameraOverlay: "none" | "rule_of_thirds" | "golden_spiral" | "snapchat_ui" | "director_crosshair";
  cameraMovement: "push_in" | "pull_out" | "whip_pan" | "tilt_down" | "snap_zoom" | "static";
}

export type TransitionType =
  | "fade_to_black"
  | "cross_dissolve"
  | "slide_in"
  | "glitch_flash"
  | "whip_pan"
  | "snap_cut"
  | "zoom_in"
  | "fade_to_white";

export interface BeatTransition {
  type: TransitionType;
  durationSeconds: number; // e.g., 0.5s
  soundEffect?: string;
  notes?: string;
}

export interface SceneBeat {
  id: string;
  beatNumber: number;
  timecode: string; // "00:00 - 00:10"
  duration: string; // "10s"
  title: string;
  visualAction: string;
  dialogue: string;
  soundEffects: string;
  cameraSetup: string;
  lighting: string;
  suspenseScore: number; // 1-10
  cliffhangerHook: string;
  charactersInScene: string[];
  imagePrompt: string;
  generatedImageUrl?: string;
  placeholderThumbnailUrl?: string;
  isGenerating?: boolean;
  imageSize: ImageResolution;
  aspectRatio: AspectRatioType;
  modelUsed?: string;
  lightingAdjustments: LightingSettings;
  compositionAdjustments: CompositionSettings;
  directorNotes?: string;
  status: "draft" | "generated" | "edited" | "approved";
  transitionToNext?: BeatTransition;
}

export interface ProjectData {
  id: string;
  title: string;
  logline: string;
  genre: string;
  visualTone: string;
  targetPlatform: string;
  stylePreset: string;
  customStylePrompt: string;
  defaultTransition?: BeatTransition;
  selectedImageSize: ImageResolution;
  selectedAspectRatio: AspectRatioType;
  characters: Character[];
  scenes: SceneBeat[];
  lastSavedAt: string;
  version: number;
}

export type AssistantRole =
  | "director"
  | "script_doctor"
  | "cinematographer"
  | "character_artist";

export type AssistantModel =
  | "gemini-3.1-pro-preview"
  | "gemini-3.5-flash"
  | "gemini-3.1-flash-lite";

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: string;
  modelUsed?: string;
  assistantRole?: AssistantRole;
}

export interface CloudSyncState {
  isOnline: boolean;
  syncStatus: "synced" | "syncing" | "offline" | "pending_sync" | "error";
  lastSyncedAt: string;
  pendingChangesCount: number;
  activeTeamMembers: Array<{
    name: string;
    role: string;
    avatarBg: string;
    currentAction: string;
  }>;
}
