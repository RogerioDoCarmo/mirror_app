import { act, renderHook } from '@testing-library/react-native';
import { File } from 'expo-file-system';
import { useExpoFileHintStore } from './ExpoFileHintStoreAdapter';

/** Names of the marker files that exist, and of those whose writes fail. */
const mockExisting = new Set<string>();
const mockWriteFails = new Set<string>();
/** Names of the marker files whose `exists` getter throws. */
const mockReadFails = new Set<string>();
/** Names of the marker files that were written, in order. */
const mockCreated: string[] = [];
const mockCreateOptions: unknown[] = [];

jest.mock('expo-file-system', () => ({
  Paths: { document: 'DOC_DIR' },
  File: jest.fn().mockImplementation((_dir: string, name: string) => ({
    get exists() {
      if (mockReadFails.has(name)) throw new Error('storage unavailable');
      return mockExisting.has(name);
    },
    create: (options: unknown) => {
      if (mockWriteFails.has(name)) throw new Error('disk full');
      mockCreated.push(name);
      mockCreateOptions.push(options);
    },
  })),
}));

const mockFile = jest.mocked(File);

describe('useExpoFileHintStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockExisting.clear();
    mockWriteFails.clear();
    mockReadFails.clear();
    mockCreated.length = 0;
    mockCreateOptions.length = 0;
  });

  describe('zoom hint', () => {
    it('reports the hint as not seen when the marker file does not exist', () => {
      const { result } = renderHook(() => useExpoFileHintStore());

      expect(result.current.zoomHintSeen).toBe(false);
    });

    it('reports the hint as seen when the marker file exists', () => {
      mockExisting.add('zoom-hint-seen');

      const { result } = renderHook(() => useExpoFileHintStore());

      expect(result.current.zoomHintSeen).toBe(true);
    });

    it('looks for the marker in the document directory', () => {
      renderHook(() => useExpoFileHintStore());

      expect(mockFile).toHaveBeenCalledWith('DOC_DIR', 'zoom-hint-seen');
    });

    it('counts an unreadable file system as seen, so the hint never nags', () => {
      mockReadFails.add('zoom-hint-seen');

      const { result } = renderHook(() => useExpoFileHintStore());

      expect(result.current.zoomHintSeen).toBe(true);
    });

    it('writes the marker, overwriting any earlier one, and reports the hint as seen', () => {
      const { result } = renderHook(() => useExpoFileHintStore());

      act(() => {
        result.current.markZoomHintSeen();
      });

      expect(mockCreated).toEqual(['zoom-hint-seen']);
      expect(mockCreateOptions).toEqual([{ overwrite: true }]);
      expect(result.current.zoomHintSeen).toBe(true);
    });

    it('still reports the hint as seen when the marker cannot be written', () => {
      mockWriteFails.add('zoom-hint-seen');
      const { result } = renderHook(() => useExpoFileHintStore());

      expect(() => {
        act(() => {
          result.current.markZoomHintSeen();
        });
      }).not.toThrow();

      expect(result.current.zoomHintSeen).toBe(true);
    });

    it('keeps markZoomHintSeen stable across renders', () => {
      const { result, rerender } = renderHook(() => useExpoFileHintStore());
      const first = result.current.markZoomHintSeen;

      rerender({});

      expect(result.current.markZoomHintSeen).toBe(first);
    });
  });

  describe('flip hint', () => {
    it('reports the hint as not seen when its marker file does not exist', () => {
      const { result } = renderHook(() => useExpoFileHintStore());

      expect(result.current.flipHintSeen).toBe(false);
    });

    it('reports the hint as seen when its marker file exists', () => {
      mockExisting.add('flip-hint-seen');

      const { result } = renderHook(() => useExpoFileHintStore());

      expect(result.current.flipHintSeen).toBe(true);
    });

    it('looks for its own marker in the document directory', () => {
      renderHook(() => useExpoFileHintStore());

      expect(mockFile).toHaveBeenCalledWith('DOC_DIR', 'flip-hint-seen');
    });

    it('counts an unreadable file system as seen, so the hint never nags', () => {
      mockReadFails.add('flip-hint-seen');

      const { result } = renderHook(() => useExpoFileHintStore());

      expect(result.current.flipHintSeen).toBe(true);
    });

    it('writes the marker, overwriting any earlier one, and reports the hint as seen', () => {
      const { result } = renderHook(() => useExpoFileHintStore());

      act(() => {
        result.current.markFlipHintSeen();
      });

      expect(mockCreated).toEqual(['flip-hint-seen']);
      expect(mockCreateOptions).toEqual([{ overwrite: true }]);
      expect(result.current.flipHintSeen).toBe(true);
    });

    it('still reports the hint as seen when the marker cannot be written', () => {
      mockWriteFails.add('flip-hint-seen');
      const { result } = renderHook(() => useExpoFileHintStore());

      expect(() => {
        act(() => {
          result.current.markFlipHintSeen();
        });
      }).not.toThrow();

      expect(result.current.flipHintSeen).toBe(true);
    });

    it('keeps markFlipHintSeen stable across renders', () => {
      const { result, rerender } = renderHook(() => useExpoFileHintStore());
      const first = result.current.markFlipHintSeen;

      rerender({});

      expect(result.current.markFlipHintSeen).toBe(first);
    });
  });

  describe('the two hints', () => {
    it('are remembered separately: someone who has seen the zoom hint is still owed the flip hint', () => {
      mockExisting.add('zoom-hint-seen');

      const { result } = renderHook(() => useExpoFileHintStore());

      expect(result.current.zoomHintSeen).toBe(true);
      expect(result.current.flipHintSeen).toBe(false);
    });

    it('record one without the other', () => {
      const { result } = renderHook(() => useExpoFileHintStore());

      act(() => {
        result.current.markFlipHintSeen();
      });

      expect(result.current.flipHintSeen).toBe(true);
      expect(result.current.zoomHintSeen).toBe(false);
      expect(mockCreated).toEqual(['flip-hint-seen']);
    });

    it('read the markers once, not on every render', () => {
      const { rerender } = renderHook(() => useExpoFileHintStore());
      const readsAfterMount = mockFile.mock.calls.length;

      rerender({});
      rerender({});

      expect(mockFile.mock.calls.length).toBe(readsAfterMount);
      expect(readsAfterMount).toBe(2);
    });
  });
});
