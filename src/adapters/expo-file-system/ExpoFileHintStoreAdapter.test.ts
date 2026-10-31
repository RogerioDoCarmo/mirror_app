import { act, renderHook } from '@testing-library/react-native';
import { File } from 'expo-file-system';
import { useExpoFileHintStore } from './ExpoFileHintStoreAdapter';

const mockCreate = jest.fn();
let mockExists = false;
let mockReadThrows = false;

jest.mock('expo-file-system', () => ({
  Paths: { document: 'DOC_DIR' },
  File: jest.fn().mockImplementation(() => ({
    get exists() {
      if (mockReadThrows) throw new Error('storage unavailable');
      return mockExists;
    },
    create: (...args: unknown[]) => mockCreate(...args) as unknown,
  })),
}));

const mockFile = jest.mocked(File);

describe('useExpoFileHintStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockExists = false;
    mockReadThrows = false;
    mockCreate.mockReset();
  });

  it('reports the hint as not seen when the marker file does not exist', () => {
    const { result } = renderHook(() => useExpoFileHintStore());

    expect(result.current.zoomHintSeen).toBe(false);
  });

  it('reports the hint as seen when the marker file exists', () => {
    mockExists = true;

    const { result } = renderHook(() => useExpoFileHintStore());

    expect(result.current.zoomHintSeen).toBe(true);
  });

  it('looks for the marker in the document directory', () => {
    renderHook(() => useExpoFileHintStore());

    expect(mockFile).toHaveBeenCalledWith('DOC_DIR', 'zoom-hint-seen');
  });

  it('counts an unreadable file system as seen, so the hint never nags', () => {
    mockReadThrows = true;

    const { result } = renderHook(() => useExpoFileHintStore());

    expect(result.current.zoomHintSeen).toBe(true);
  });

  it('writes the marker, overwriting any earlier one, and reports the hint as seen', () => {
    const { result } = renderHook(() => useExpoFileHintStore());

    act(() => {
      result.current.markZoomHintSeen();
    });

    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockCreate).toHaveBeenCalledWith({ overwrite: true });
    expect(result.current.zoomHintSeen).toBe(true);
  });

  it('still reports the hint as seen when the marker cannot be written', () => {
    mockCreate.mockImplementation(() => {
      throw new Error('disk full');
    });
    const { result } = renderHook(() => useExpoFileHintStore());

    expect(() => {
      act(() => {
        result.current.markZoomHintSeen();
      });
    }).not.toThrow();

    expect(result.current.zoomHintSeen).toBe(true);
  });

  it('reads the marker once, not on every render', () => {
    const { rerender } = renderHook(() => useExpoFileHintStore());
    const readsAfterMount = mockFile.mock.calls.length;

    rerender({});
    rerender({});

    expect(mockFile.mock.calls.length).toBe(readsAfterMount);
  });

  it('keeps markZoomHintSeen stable across renders', () => {
    const { result, rerender } = renderHook(() => useExpoFileHintStore());
    const first = result.current.markZoomHintSeen;

    rerender({});

    expect(result.current.markZoomHintSeen).toBe(first);
  });
});
