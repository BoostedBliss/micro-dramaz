import { describe, it, expect } from "vitest";
import { generateEDL, generateCSV } from "./exportUtils";
import { ProjectData, SceneBeat } from "../types";

const mockScene1: SceneBeat = {
  id: "scene-1",
  beatNumber: 1,
  timecode: "00:00 - 00:10",
  duration: "10s",
  title: "Opening Scene",
  visualAction: "Camera pans across the empty room.",
  dialogue: "Hello? Is anyone there?",
  soundEffects: "Eerie wind blowing.",
  cameraSetup: "Wide shot",
  lighting: "Dimly lit",
  suspenseScore: 8,
  cliffhangerHook: "A shadow moves in the corner.",
  charactersInScene: ["char-1"],
  imagePrompt: "Empty room dim lighting",
  imageSize: "2K",
  aspectRatio: "9:16",
  lightingAdjustments: {
    brightness: 0, contrast: 0, exposure: 0, vignette: 0, colorTemp: 0,
    tintColor: "none", tintOpacity: 0, grain: 0
  },
  compositionAdjustments: {
    scale: 1, panX: 0, panY: 0, framingPreset: "wide_shot" as any,
    cameraOverlay: "none", cameraMovement: "static"
  },
  status: "draft",
  transitionToNext: {
    type: "fade_to_black",
    durationSeconds: 1.0,
    soundEffect: "Whoosh"
  }
};

const mockScene2: SceneBeat = {
  id: "scene-2",
  beatNumber: 2,
  timecode: "00:10 - 00:20",
  duration: "10s",
  title: "The Encounter",
  visualAction: 'Character sees a "ghost" in the mirror.',
  dialogue: "",
  soundEffects: "Loud crash",
  cameraSetup: "Close up",
  lighting: "High contrast",
  suspenseScore: 10,
  cliffhangerHook: "The ghost points at the character.",
  charactersInScene: ["char-1", "char-2"],
  imagePrompt: "Ghost in mirror",
  imageSize: "2K",
  aspectRatio: "9:16",
  lightingAdjustments: {
    brightness: 0, contrast: 0, exposure: 0, vignette: 0, colorTemp: 0,
    tintColor: "none", tintOpacity: 0, grain: 0
  },
  compositionAdjustments: {
    scale: 1, panX: 0, panY: 0, framingPreset: "close_up",
    cameraOverlay: "none", cameraMovement: "static"
  },
  status: "draft"
};

const mockProject: ProjectData = {
  id: "proj-1",
  title: "Test Project",
  logline: "A test project for unit tests.",
  genre: "Horror",
  visualTone: "Dark",
  targetPlatform: "Snapchat",
  stylePreset: "default",
  customStylePrompt: "",
  selectedImageSize: "2K",
  selectedAspectRatio: "9:16",
  characters: [],
  scenes: [mockScene1, mockScene2],
  lastSavedAt: new Date().toISOString(),
  version: 1
};

describe("exportUtils", () => {
  describe("generateEDL", () => {
    it("should generate a valid EDL string with correct timecodes", () => {
      const edl = generateEDL(mockProject);

      expect(edl).toContain("TITLE: TEST PROJECT");
      expect(edl).toContain("FCM: NON-DROP FRAME");

      // Scene 1
      expect(edl).toContain("001  AX       V     D        00:00:00:00 00:00:10:00 00:00:00:00 00:00:10:00");
      expect(edl).toContain("* FROM CLIP: SCENE_1_Opening_Scene");
      expect(edl).toContain("* CAMERA: Wide shot");
      expect(edl).toContain("* LIGHTING: Dimly lit");
      expect(edl).toContain("* SUSPENSE SCORE: 8/10 | CLIFFHANGER: A shadow moves in the corner.");
      expect(edl).toContain("* 10S BREAK EFFECT: FADE TO BLACK (DIP TO BLACK) (1s) | AUDIO: Whoosh");
      expect(edl).toContain("* DIALOGUE: Hello? Is anyone there?");

      // Scene 2 (End of movie, no transition)
      expect(edl).toContain("002  AX       V     D        00:00:10:00 00:00:20:00 00:00:10:00 00:00:20:00");
      expect(edl).toContain("* FROM CLIP: SCENE_2_The_Encounter");
      expect(edl).toContain("* CAMERA: Close up");
      expect(edl).toContain("* LIGHTING: High contrast");
      expect(edl).toContain("* SUSPENSE SCORE: 10/10 | CLIFFHANGER: The ghost points at the character.");

      // We check that scene 2 does NOT have a transition.
      // We use a regex or specific split check since `not.toContain("* 10S BREAK EFFECT")` fails
      // if it matched the *first* scene's transition effect in the full `edl` string.
      const scene2Edl = edl.split("002  AX")[1];
      expect(scene2Edl).not.toContain("* 10S BREAK EFFECT");
      expect(edl).toContain("* DIALOGUE: N/A");
    });
  });

  describe("generateCSV", () => {
    it("should generate a valid CSV string with correctly escaped quotes", () => {
      const csv = generateCSV(mockProject);
      const lines = csv.split("\n");

      // Check headers
      expect(lines[0]).toContain("Beat #,Timecode,Duration,Beat Title,Visual Action,Camera Setup,Lighting Notes,Characters,Dialogue,Audio / SFX,Suspense Score (1-10),10s Cliffhanger Hook,10s Break Transition,Transition Duration (s),Transition SFX Cue,Resolution,Status");

      // Scene 1 (has transition)
      expect(lines[1]).toContain('1,"00:00 - 00:10","10s","Opening Scene","Camera pans across the empty room.","Wide shot","Dimly lit","char-1","Hello? Is anyone there?","Eerie wind blowing.",8,"A shadow moves in the corner.","Fade to Black (Dip to Black)",1,"Whoosh",2K,draft');

      // Scene 2 (no transition, quotes escaped)
      expect(lines[2]).toContain('2,"00:10 - 00:20","10s","The Encounter","Character sees a ""ghost"" in the mirror.","Close up","High contrast","char-1, char-2","","Loud crash",10,"The ghost points at the character.","End of Movie",0,"",2K,draft');
    });
  });
});
