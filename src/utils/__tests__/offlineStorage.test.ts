import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { saveProjectLocally } from '../offlineStorage';
import { ProjectData } from '../../types';

describe('offlineStorage', () => {
  describe('saveProjectLocally', () => {
    let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const localStorageMock = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        length: 0,
        key: vi.fn(),
      };
      vi.stubGlobal('localStorage', localStorageMock);
    });

    afterEach(() => {
      vi.restoreAllMocks();
      vi.unstubAllGlobals();
    });

    it('should catch error when localStorage.setItem throws', () => {
      const mockError = new Error('Storage quota exceeded');
      vi.spyOn(localStorage, 'setItem').mockImplementationOnce(() => {
        throw mockError;
      });

      const mockProject = { id: 'test-project', version: 1 } as ProjectData;

      // The call should not throw an error because it's caught
      expect(() => saveProjectLocally(mockProject)).not.toThrow();

      // It should log the error
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to save project locally:',
        mockError
      );
    });
  });
});
