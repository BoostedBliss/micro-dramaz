import { describe, it, expect } from 'vitest';
import { transformPromptWithGlobalStyle, applyGlobalStyleToProject, GLOBAL_STYLE_PRESETS } from './stylePresets';
import { ProjectData } from '../types';

describe('transformPromptWithGlobalStyle', () => {
  const preset = GLOBAL_STYLE_PRESETS[0]; // Cinematic Dark Thriller

  it('transforms a simple prompt', () => {
    const result = transformPromptWithGlobalStyle('A man walking down a street', 'man walking', preset);
    expect(result).toBe(`Vertical 9:16 cinematic storyboard still: A man walking down a street. Visual Cinematic Style: ${preset.name} (${preset.tagline}). ${preset.visualPromptModifier} Camera Framing: Strictly 9:16 vertical cinema framing. Production Quality: Masterclass cinema storyboard, color graded, photorealistic tension, 8k resolution look.`);
  });

  it('strips legacy prefixes', () => {
    const result = transformPromptWithGlobalStyle('Vertical 9:16 cinematic storyboard still of A man walking down a street', 'man walking', preset);
    expect(result).toBe(`Vertical 9:16 cinematic storyboard still: A man walking down a street. Visual Cinematic Style: ${preset.name} (${preset.tagline}). ${preset.visualPromptModifier} Camera Framing: Strictly 9:16 vertical cinema framing. Production Quality: Masterclass cinema storyboard, color graded, photorealistic tension, 8k resolution look.`);
  });

  it('strips legacy suffixes', () => {
    const result = transformPromptWithGlobalStyle('A man walking down a street. Visual Style: something old', 'man walking', preset);
    expect(result).toBe(`Vertical 9:16 cinematic storyboard still: A man walking down a street. Visual Cinematic Style: ${preset.name} (${preset.tagline}). ${preset.visualPromptModifier} Camera Framing: Strictly 9:16 vertical cinema framing. Production Quality: Masterclass cinema storyboard, color graded, photorealistic tension, 8k resolution look.`);
  });

  it('adds custom style prompt', () => {
    const result = transformPromptWithGlobalStyle('A man walking down a street', 'man walking', preset, 'With neon lights');
    expect(result).toBe(`Vertical 9:16 cinematic storyboard still: A man walking down a street. Visual Cinematic Style: ${preset.name} (${preset.tagline}). ${preset.visualPromptModifier} With neon lights. Camera Framing: Strictly 9:16 vertical cinema framing. Production Quality: Masterclass cinema storyboard, color graded, photorealistic tension, 8k resolution look.`);
  });

  it('uses visual action if prompt is empty', () => {
    const result = transformPromptWithGlobalStyle('', 'A man walking down a street', preset);
    expect(result).toBe(`Vertical 9:16 cinematic storyboard still: A man walking down a street. Visual Cinematic Style: ${preset.name} (${preset.tagline}). ${preset.visualPromptModifier} Camera Framing: Strictly 9:16 vertical cinema framing. Production Quality: Masterclass cinema storyboard, color graded, photorealistic tension, 8k resolution look.`);
  });
});

describe('applyGlobalStyleToProject', () => {
  const preset = GLOBAL_STYLE_PRESETS[0];

  const mockProject: ProjectData = {
    id: '1',
    title: 'Test',
    logline: '',
    genre: '',
    visualTone: '',
    targetPlatform: '',
    stylePreset: '',
    customStylePrompt: '',
    selectedImageSize: '1K',
    selectedAspectRatio: '9:16',
    characters: [],
    scenes: [
      {
        id: 'scene1',
        beatNumber: 1,
        timecode: '',
        duration: '',
        title: '',
        visualAction: 'walking',
        dialogue: '',
        soundEffects: '',
        cameraSetup: '',
        lighting: '',
        suspenseScore: 1,
        cliffhangerHook: '',
        charactersInScene: [],
        imagePrompt: 'A man walking',
        imageSize: '1K',
        aspectRatio: '9:16',
        lightingAdjustments: {
          brightness: 0,
          contrast: 0,
          exposure: 0,
          vignette: 0,
          colorTemp: 0,
          tintColor: 'none',
          tintOpacity: 0,
          grain: 0,
        },
        compositionAdjustments: {
          scale: 1,
          panX: 0,
          panY: 0,
          framingPreset: 'custom',
          cameraOverlay: 'none',
          cameraMovement: 'static',
        },
        status: 'draft',
      }
    ],
    lastSavedAt: '',
    version: 1,
  };

  it('updates everything when all options are true', () => {
    const result = applyGlobalStyleToProject(mockProject, preset, {
      updatePrompts: true,
      updateLighting: true,
      updateComposition: true,
    });

    expect(result.stylePreset).toBe(preset.name);
    expect(result.visualTone).toBe(`${preset.name} - ${preset.tagline}`);
    expect(result.scenes[0].imagePrompt).toContain(preset.visualPromptModifier);
    expect(result.scenes[0].lightingAdjustments).toEqual(preset.defaultLighting);
    expect(result.scenes[0].compositionAdjustments).toMatchObject(preset.defaultComposition);
  });

  it('preserves existing values when update options are false', () => {
    const result = applyGlobalStyleToProject(mockProject, preset, {
      updatePrompts: false,
      updateLighting: false,
      updateComposition: false,
    });

    expect(result.stylePreset).toBe(preset.name);
    expect(result.scenes[0].imagePrompt).toBe('A man walking');
    expect(result.scenes[0].lightingAdjustments).toEqual(mockProject.scenes[0].lightingAdjustments);
    expect(result.scenes[0].compositionAdjustments).toEqual(mockProject.scenes[0].compositionAdjustments);
  });

  it('uses provided custom prompt', () => {
    const result = applyGlobalStyleToProject(mockProject, preset, {
      updatePrompts: true,
      updateLighting: false,
      updateComposition: false,
      customStylePrompt: 'Make it scary',
    });

    expect(result.customStylePrompt).toBe('Make it scary');
    expect(result.scenes[0].imagePrompt).toContain('Make it scary');
  });

  it('uses existing custom prompt if not provided in options', () => {
    const projectWithPrompt = { ...mockProject, customStylePrompt: 'Existing prompt' };
    const result = applyGlobalStyleToProject(projectWithPrompt, preset, {
      updatePrompts: true,
      updateLighting: false,
      updateComposition: false,
    });

    expect(result.customStylePrompt).toBe('Existing prompt');
    expect(result.scenes[0].imagePrompt).toContain('Existing prompt');
  });
});
