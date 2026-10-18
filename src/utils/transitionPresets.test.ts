import { describe, it, expect } from 'vitest';
import { applyTransitionToAllScenes } from './transitionPresets';
import { SceneBeat, BeatTransition } from '../types';

describe('applyTransitionToAllScenes', () => {
  const mockTransition: BeatTransition = {
    type: 'fade_to_black',
    durationSeconds: 1.0,
  };

  const createMockScene = (id: string): SceneBeat => ({
    id,
    beatNumber: 1,
    timecode: '00:00 - 00:10',
    duration: '10s',
    title: 'Test Scene',
    visualAction: 'Test Action',
    dialogue: 'Test Dialogue',
    soundEffects: 'Test SFX',
    cameraSetup: 'Test Camera',
    lighting: 'Test Lighting',
    suspenseScore: 5,
    cliffhangerHook: 'Test Hook',
    charactersInScene: [],
    imagePrompt: 'Test Prompt',
    imageSize: '1K',
    aspectRatio: '16:9',
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
      framingPreset: 'medium_shot',
      cameraOverlay: 'none',
      cameraMovement: 'static',
    },
    status: 'draft',
  });

  it('should return an empty array when given an empty array', () => {
    const scenes: SceneBeat[] = [];
    const result = applyTransitionToAllScenes(scenes, mockTransition);
    expect(result).toEqual([]);
  });

  it('should return a single scene with undefined transitionToNext', () => {
    const scenes: SceneBeat[] = [createMockScene('1')];
    const result = applyTransitionToAllScenes(scenes, mockTransition);

    expect(result.length).toBe(1);
    expect(result[0].transitionToNext).toBeUndefined();
  });

  it('should apply transition to all scenes except the last one', () => {
    const scenes: SceneBeat[] = [
      createMockScene('1'),
      createMockScene('2'),
      createMockScene('3'),
    ];

    const result = applyTransitionToAllScenes(scenes, mockTransition);

    expect(result.length).toBe(3);

    // First scene should have the transition
    expect(result[0].transitionToNext).toEqual(mockTransition);
    // Ensure it's a new object (shallow copy at least)
    if (result[0].transitionToNext) {
      expect(result[0].transitionToNext).not.toBe(mockTransition);
    }

    // Second scene should have the transition
    expect(result[1].transitionToNext).toEqual(mockTransition);

    // Last scene should NOT have the transition
    expect(result[2].transitionToNext).toBeUndefined();
  });
});
