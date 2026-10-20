import { describe, it, expect } from "vitest";
import { generateCSV } from "../exportUtils";
import { ProjectData } from "../../types";

describe("exportUtils", () => {
  describe("generateCSV", () => {
    it("should correctly escape nested quotes and handle commas in string fields", () => {
      const mockProject: ProjectData = {
        id: "test-project",
        title: "Test Project",
        logline: "A test project",
        genre: "Test",
        visualTone: "Test",
        targetPlatform: "Snapchat",
        stylePreset: "cinematic",
        customStylePrompt: "",
        selectedImageSize: "2K",
        selectedAspectRatio: "9:16",
        characters: [],
        scenes: [
          {
            id: "scene-1",
            beatNumber: 1,
            timecode: "00:00 - 00:10",
            duration: "10s",
            title: 'Scene "with quotes" and, commas',
            visualAction: 'Action "with quotes" and, commas',
            dialogue: 'Dialogue "with quotes" and, commas',
            soundEffects: 'SFX "with quotes" and, commas',
            cameraSetup: 'Camera "with quotes" and, commas',
            lighting: 'Lighting "with quotes" and, commas',
            suspenseScore: 8,
            cliffhangerHook: 'Hook "with quotes" and, commas',
            charactersInScene: ["Char 1", "Char 2"],
            imagePrompt: "",
            imageSize: "2K",
            aspectRatio: "9:16",
            lightingAdjustments: {
              brightness: 0,
              contrast: 0,
              exposure: 0,
              vignette: 0,
              colorTemp: 0,
              tintColor: "none",
              tintOpacity: 0,
              grain: 0,
            },
            compositionAdjustments: {
              scale: 1,
              panX: 0,
              panY: 0,
              framingPreset: "medium_shot",
              cameraOverlay: "none",
              cameraMovement: "static",
            },
            status: "draft",
          },
        ],
        lastSavedAt: new Date().toISOString(),
        version: 1,
      };

      const csvContent = generateCSV(mockProject);
      const rows = csvContent.split("\n");
      expect(rows.length).toBeGreaterThan(1);

      const dataRow = rows[1];

      // Expected formatting:
      // "Title" -> "Scene ""with quotes"" and, commas"
      expect(dataRow).toContain('"Scene ""with quotes"" and, commas"');
      expect(dataRow).toContain('"Action ""with quotes"" and, commas"');
      expect(dataRow).toContain('"Camera ""with quotes"" and, commas"');
      expect(dataRow).toContain('"Lighting ""with quotes"" and, commas"');
      expect(dataRow).toContain('"Char 1, Char 2"');
      expect(dataRow).toContain('"Dialogue ""with quotes"" and, commas"');
      expect(dataRow).toContain('"SFX ""with quotes"" and, commas"');
      expect(dataRow).toContain('"Hook ""with quotes"" and, commas"');
    });
  });
});
