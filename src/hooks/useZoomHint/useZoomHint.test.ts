import { act, renderHook } from '@testing-library/react-native';
import { useHintStore } from '@/application/providers/HintStoreProvider';
import { ZOOM_HINT_DURATION_MS, useZoomHint } from './useZoomHint';

jest.mock('@/application/providers/HintStoreProvider', () => ({
  useHintStore: jest.fn(),
}));

const mockUseHintStore = jest.mocked(useHintStore);
const mockMarkSeen = jest.fn();

const store = (zoomHintSeen: boolean) => ({ zoomHintSeen, markZoomHintSeen: mockMarkSeen });

type Props = { ready: boolean; zoom: number };

const setup = (initial: Props = { ready: true, zoom: 0 }) =>
  renderHook(({ ready, zoom }: Props) => useZoomHint(ready, zoom), { initialProps: initial });

describe('useZoomHint', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    mockUseHintStore.mockReturnValue(store(false));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('lasts five seconds', () => {
    expect(ZOOM_HINT_DURATION_MS).toBe(5000);
  });

  it('is shown to a new user as soon as the screen is ready', () => {
    const { result } = setup();

    expect(result.current).toBe(true);
  });

  it('waits for the screen to be ready', () => {
    const { result, rerender } = setup({ ready: false, zoom: 0 });
    expect(result.current).toBe(false);

    rerender({ ready: true, zoom: 0 });

    expect(result.current).toBe(true);
  });

  it('is never shown to someone who has already seen it', () => {
    mockUseHintStore.mockReturnValue(store(true));

    const { result } = setup();

    expect(result.current).toBe(false);
    expect(mockMarkSeen).not.toHaveBeenCalled();
  });

  it('records the hint as seen when it appears, and not before', () => {
    const { rerender } = setup({ ready: false, zoom: 0 });
    expect(mockMarkSeen).not.toHaveBeenCalled();

    rerender({ ready: true, zoom: 0 });

    expect(mockMarkSeen).toHaveBeenCalledTimes(1);
  });

  it('records the hint as seen only once, however often the screen re-renders', () => {
    const { rerender } = setup();

    rerender({ ready: true, zoom: 0 });
    rerender({ ready: true, zoom: 0 });

    expect(mockMarkSeen).toHaveBeenCalledTimes(1);
  });

  it('stays up when recording it as seen flips the store, because the decision was taken at mount', () => {
    const { result, rerender } = setup();
    mockUseHintStore.mockReturnValue(store(true));

    rerender({ ready: true, zoom: 0 });

    expect(result.current).toBe(true);
  });

  it('goes away after five seconds, not a moment before', () => {
    const { result } = setup();

    act(() => {
      jest.advanceTimersByTime(ZOOM_HINT_DURATION_MS - 1);
    });
    expect(result.current).toBe(true);

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current).toBe(false);
  });

  it('starts counting when the screen becomes ready, not at mount', () => {
    const { result, rerender } = setup({ ready: false, zoom: 0 });
    act(() => {
      jest.advanceTimersByTime(10_000);
    });

    rerender({ ready: true, zoom: 0 });
    act(() => {
      jest.advanceTimersByTime(ZOOM_HINT_DURATION_MS - 1);
    });

    expect(result.current).toBe(true);
  });

  it('goes away as soon as the preview is zoomed', () => {
    const { result, rerender } = setup();

    rerender({ ready: true, zoom: 0.01 });

    expect(result.current).toBe(false);
  });

  it('stays up while the preview is not zoomed', () => {
    const { result, rerender } = setup();

    rerender({ ready: true, zoom: 0 });

    expect(result.current).toBe(true);
  });

  it('does not come back after being dismissed, even once zoom returns to zero', () => {
    const { result, rerender } = setup();
    rerender({ ready: true, zoom: 0.4 });

    rerender({ ready: true, zoom: 0 });
    act(() => {
      jest.advanceTimersByTime(ZOOM_HINT_DURATION_MS * 2);
    });

    expect(result.current).toBe(false);
  });

  it('does not come back after its time is up', () => {
    const { result, rerender } = setup();
    act(() => {
      jest.advanceTimersByTime(ZOOM_HINT_DURATION_MS);
    });

    rerender({ ready: true, zoom: 0 });

    expect(result.current).toBe(false);
  });

  it('cancels its timer when the screen goes away', () => {
    const { unmount } = setup();
    expect(jest.getTimerCount()).toBe(1);

    unmount();

    expect(jest.getTimerCount()).toBe(0);
  });

  it('starts no timer for someone who has seen it', () => {
    mockUseHintStore.mockReturnValue(store(true));

    setup();

    expect(jest.getTimerCount()).toBe(0);
  });
});
