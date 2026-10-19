import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  saveProjectLocally,
  loadProjectLocally,
  queuePendingSync,
  getPendingSyncCount,
  clearPendingSyncQueue,
  syncProjectToCloud,
} from './offlineStorage';
import { ProjectData } from '../types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

vi.stubGlobal('localStorage', localStorageMock);

// Mock fetch
const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

beforeEach(() => {
  localStorageMock.clear();
  vi.clearAllMocks();
});

const mockProjectData: ProjectData = {
  id: "test-project-id",
  title: "Test Project",
  logline: "A test logline",
  genre: "Sci-Fi",
  visualTone: "Dark",
  targetPlatform: "TikTok",
  stylePreset: "cyberpunk",
  customStylePrompt: "",
  selectedImageSize: "1K",
  selectedAspectRatio: "9:16",
  characters: [],
  scenes: [],
  lastSavedAt: "2023-01-01T00:00:00.000Z",
  version: 1,
};

describe('offlineStorage', () => {
  describe('saveProjectLocally', () => {
    it('should save the project to localStorage', () => {
      saveProjectLocally(mockProjectData);

      expect(localStorage.setItem).toHaveBeenCalled();
      const args = (localStorage.setItem as any).mock.calls[0];
      const savedKey = args[0];
      const savedDataStr = args[1];

      expect(savedKey).toBeTruthy();
      expect(savedDataStr).toBeTruthy();

      const savedData = JSON.parse(savedDataStr);
      expect(savedData.id).toBe(mockProjectData.id);
    });

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('QuotaExceededError');
      });
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      saveProjectLocally(mockProjectData);

      expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to save project locally:", expect.any(Error));

      consoleErrorSpy.mockRestore();
    });
  });

  describe('loadProjectLocally', () => {
    it('should load the project from localStorage when data exists', () => {
      saveProjectLocally(mockProjectData);
      const args = (localStorage.setItem as any).mock.calls[0];
      const savedKey = args[0];

      // Clear mocks so we can check getItem cleanly
      vi.clearAllMocks();

      const loadedData = loadProjectLocally();

      expect(localStorage.getItem).toHaveBeenCalledWith(savedKey);
      expect(loadedData?.id).toEqual(mockProjectData.id);
    });

    it('should return null when no data exists', () => {
      const loadedData = loadProjectLocally();
      expect(loadedData).toBeNull();
    });

    it('should handle JSON.parse errors gracefully', () => {
      saveProjectLocally(mockProjectData);
      const args = (localStorage.setItem as any).mock.calls[0];
      const savedKey = args[0];

      localStorageMock.setItem(savedKey, 'invalid json');
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const loadedData = loadProjectLocally();

      expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to load project locally:", expect.any(Error));
      expect(loadedData).toBeNull();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Sync Queue functions', () => {
    const mockAction = {
      type: 'CLOUD_SAVE',
      payload: { projectId: 'test-id' },
      timestamp: '2023-01-01T00:00:00.000Z',
    };

    describe('queuePendingSync', () => {
      it('should queue an action', () => {
        queuePendingSync(mockAction);

        expect(localStorage.setItem).toHaveBeenCalled();
        const args = (localStorage.setItem as any).mock.calls[0];
        const savedQueue = JSON.parse(args[1] || '[]');
        expect(savedQueue).toHaveLength(1);
        expect(savedQueue[0]).toEqual(mockAction);
      });
    });

    describe('getPendingSyncCount', () => {
      it('should return 0 when queue is empty', () => {
        expect(getPendingSyncCount()).toBe(0);
      });

      it('should return the correct count when queue has items', () => {
        queuePendingSync(mockAction);
        queuePendingSync(mockAction);
        expect(getPendingSyncCount()).toBe(2);
      });
    });

    describe('clearPendingSyncQueue', () => {
      it('should remove the sync queue from localStorage', () => {
        queuePendingSync(mockAction);
        const args = (localStorage.setItem as any).mock.calls[0];
        const queueKey = args[0];

        clearPendingSyncQueue();

        expect(localStorage.removeItem).toHaveBeenCalledWith(queueKey);
      });
    });
  });

  describe('syncProjectToCloud', () => {
    it('should return true and clear queue on successful sync', async () => {
      fetchMock.mockResolvedValueOnce({ ok: true });

      const result = await syncProjectToCloud(mockProjectData);

      expect(fetchMock).toHaveBeenCalledWith('/api/cloud-sync/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: mockProjectData.id,
          projectData: mockProjectData,
          user: 'Director',
        }),
      });
      expect(result).toBe(true);
      expect(getPendingSyncCount()).toBe(0);
    });

    it('should queue sync and return false if fetch resolves with !ok', async () => {
      fetchMock.mockResolvedValueOnce({ ok: false });
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await syncProjectToCloud(mockProjectData);

      expect(result).toBe(false);
      expect(consoleWarnSpy).toHaveBeenCalledWith("Cloud sync failed, queued for offline recovery:", expect.any(Error));
      expect(getPendingSyncCount()).toBe(1);

      consoleWarnSpy.mockRestore();
    });

    it('should queue sync and return false if fetch throws', async () => {
      fetchMock.mockRejectedValueOnce(new Error('Network error'));
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await syncProjectToCloud(mockProjectData);

      expect(result).toBe(false);
      expect(consoleWarnSpy).toHaveBeenCalledWith("Cloud sync failed, queued for offline recovery:", expect.any(Error));
      expect(getPendingSyncCount()).toBe(1);

      consoleWarnSpy.mockRestore();
    });
  });
});
