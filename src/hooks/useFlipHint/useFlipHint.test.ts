import { act, renderHook } from '@testing-library/react-native';
import { useHintStore } from '@/application/providers/HintStoreProvider';
import { FLIP_HINT_DURATION_MS, useFlipHint } from './useFlipHint';

jest.mock('@/application/providers/HintStoreProvider', () => ({
  useHintStore: jest.fn(),
}));

const mockUseHintStore = jest.mocked(useHintStore);
const mockMarkSeen = jest.fn();
const mockMarkZoomSeen = jest.fn();

const store = (flipHintSeen: boolean) => ({
  zoomHintSeen: true,
  markZoomHintSeen: mockMarkZoomSeen,
  flipHintSeen,
  markFlipHintSeen: mockMarkSeen,
});

type Props = { ready: boolean; blocked: boolean };

const setup = (initial: Props = { ready: true, blocked: false }) =>
  renderHook(({ ready, blocked }: Props) => useFlipHint(ready, blocked), {
    initialProps: initial,
  });

describe('useFlipHint', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    mockUseHintStore.mockReturnValue(store(false));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('lasts five seconds', () => {
    expect(FLIP_HINT_DURATION_MS).toBe(5000);
  });

  it('is shown to someone who has not seen it as soon as the screen is ready', () => {
    const { result } = setup();

    expect(result.current.visible).toBe(true);
  });

  it('waits for the screen to be ready', () => {
    const { result, rerender } = setup({ ready: false, blocked: false });
    expect(result.current.visible).toBe(false);

    rerender({ ready: true, blocked: false });

    expect(result.current.visible).toBe(true);
  });

  it('is never shown to someone who has already seen it', () => {
    mockUseHintStore.mockReturnValue(store(true));

    const { result } = setup();

    expect(result.current.visible).toBe(false);
    expect(mockMarkSeen).not.toHaveBeenCalled();
  });

  it('records the hint as seen when it appears, and not before', () => {
    const { rerender } = setup({ ready: false, blocked: false });
    expect(mockMarkSeen).not.toHaveBeenCalled();

    rerender({ ready: true, blocked: false });

    expect(mockMarkSeen).toHaveBeenCalledTimes(1);
  });

  it('records the hint as seen only once, however often the screen re-renders', () => {
    const { rerender } = setup();

    rerender({ ready: true, blocked: false });
    rerender({ ready: true, blocked: false });

    expect(mockMarkSeen).toHaveBeenCalledTimes(1);
  });

  it('never touches the zoom hint marker', () => {
    setup();

    expect(mockMarkZoomSeen).not.toHaveBeenCalled();
  });

  it('stays up when recording it as seen flips the store, because the decision was taken at mount', () => {
    const { result, rerender } = setup();
    mockUseHintStore.mockReturnValue(store(true));

    rerender({ ready: true, blocked: false });

    expect(result.current.visible).toBe(true);
  });

  describe('sharing the screen with another hint', () => {
    it('waits while another hint is on screen, and records nothing yet', () => {
      const { result } = setup({ ready: true, blocked: true });

      expect(result.current.visible).toBe(false);
      expect(mockMarkSeen).not.toHaveBeenCalled();
      expect(jest.getTimerCount()).toBe(0);
    });

    it('appears the moment the other hint goes away', () => {
      const { result, rerender } = setup({ ready: true, blocked: true });

      rerender({ ready: true, blocked: false });

      expect(result.current.visible).toBe(true);
      expect(mockMarkSeen).toHaveBeenCalledTimes(1);
    });

    it('starts counting when it appears, not while it waits', () => {
      const { result, rerender } = setup({ ready: true, blocked: true });
      act(() => {
        jest.advanceTimersByTime(10_000);
      });

      rerender({ ready: true, blocked: false });
      act(() => {
        jest.advanceTimersByTime(FLIP_HINT_DURATION_MS - 1);
      });

      expect(result.current.visible).toBe(true);
    });

    it('does not come back when the other hint turns up again later', () => {
      const { result, rerender } = setup();
      act(() => {
        jest.advanceTimersByTime(FLIP_HINT_DURATION_MS);
      });

      rerender({ ready: true, blocked: true });
      rerender({ ready: true, blocked: false });

      expect(result.current.visible).toBe(false);
    });
  });

  describe('going away', () => {
    it('goes away after five seconds, not a moment before', () => {
      const { result } = setup();

      act(() => {
        jest.advanceTimersByTime(FLIP_HINT_DURATION_MS - 1);
      });
      expect(result.current.visible).toBe(true);

      act(() => {
        jest.advanceTimersByTime(1);
      });
      expect(result.current.visible).toBe(false);
    });

    it('starts counting when the screen becomes ready, not at mount', () => {
      const { result, rerender } = setup({ ready: false, blocked: false });
      act(() => {
        jest.advanceTimersByTime(10_000);
      });

      rerender({ ready: true, blocked: false });
      act(() => {
        jest.advanceTimersByTime(FLIP_HINT_DURATION_MS - 1);
      });

      expect(result.current.visible).toBe(true);
    });

    it('goes away as soon as the user presses the flip button', () => {
      const { result } = setup();

      act(() => {
        result.current.dismiss();
      });

      expect(result.current.visible).toBe(false);
    });

    it('does not come back after being dismissed', () => {
      const { result, rerender } = setup();
      act(() => {
        result.current.dismiss();
      });

      rerender({ ready: true, blocked: false });
      act(() => {
        jest.advanceTimersByTime(FLIP_HINT_DURATION_MS * 2);
      });

      expect(result.current.visible).toBe(false);
    });

    it('does not come back after its time is up', () => {
      const { result, rerender } = setup();
      act(() => {
        jest.advanceTimersByTime(FLIP_HINT_DURATION_MS);
      });

      rerender({ ready: true, blocked: false });

      expect(result.current.visible).toBe(false);
    });

    it('cancels its timer when it is dismissed', () => {
      const { result } = setup();
      expect(jest.getTimerCount()).toBe(1);

      act(() => {
        result.current.dismiss();
      });

      expect(jest.getTimerCount()).toBe(0);
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

  describe('dismiss', () => {
    it('does not record the hint a second time once it has been on screen', () => {
      const { result } = setup();
      expect(mockMarkSeen).toHaveBeenCalledTimes(1);

      act(() => {
        result.current.dismiss();
      });

      expect(mockMarkSeen).toHaveBeenCalledTimes(1);
    });

    it('records the hint as seen when the button is pressed before the hint ever appeared', () => {
      const { result } = setup({ ready: true, blocked: true });

      act(() => {
        result.current.dismiss();
      });

      expect(mockMarkSeen).toHaveBeenCalledTimes(1);
    });

    it('keeps a hint that was dismissed while it waited from appearing afterwards', () => {
      const { result, rerender } = setup({ ready: true, blocked: true });
      act(() => {
        result.current.dismiss();
      });

      rerender({ ready: true, blocked: false });

      expect(result.current.visible).toBe(false);
      expect(mockMarkSeen).toHaveBeenCalledTimes(1);
    });

    it('records nothing for someone who has already seen the hint', () => {
      mockUseHintStore.mockReturnValue(store(true));
      const { result } = setup();

      act(() => {
        result.current.dismiss();
      });

      expect(mockMarkSeen).not.toHaveBeenCalled();
    });

    it('does not rewrite the marker on every later press once the hint is gone', () => {
      const { result } = setup({ ready: true, blocked: true });
      act(() => {
        result.current.dismiss();
      });

      act(() => {
        result.current.dismiss();
        result.current.dismiss();
      });

      expect(mockMarkSeen).toHaveBeenCalledTimes(1);
    });

    it('does not rewrite the marker when the button is pressed after the hint timed out', () => {
      const { result } = setup();
      act(() => {
        jest.advanceTimersByTime(FLIP_HINT_DURATION_MS);
      });

      act(() => {
        result.current.dismiss();
      });

      expect(mockMarkSeen).toHaveBeenCalledTimes(1);
    });
  });
});
