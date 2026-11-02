import React from 'react';
import { act, renderHook } from '@testing-library/react-native';
import * as fc from 'fast-check';
import { useExpoCameraPermission } from '@/adapters/expo-camera/ExpoCameraPermissionAdapter';
import { CameraProvider } from '@/application/providers/CameraProvider';
import { useCamera } from './useCamera';

jest.mock('@/adapters/expo-camera/ExpoCameraPermissionAdapter', () => ({
  useExpoCameraPermission: jest.fn(),
}));

const mockUseExpoCameraPermission = jest.mocked(useExpoCameraPermission);

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(CameraProvider, null, children);

describe('useCamera — facing and mirror property tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseExpoCameraPermission.mockReturnValue({
      permission: null,
      requestPermission: jest.fn(),
    });
  });

  it('is back-facing after an odd number of switches and front-facing after an even number', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 12 }), (switches) => {
        const { result, unmount } = renderHook(() => useCamera(), { wrapper });

        for (let i = 0; i < switches; i++) {
          act(() => {
            result.current.toggleFacing();
          });
        }

        expect(result.current.facing).toBe(switches % 2 === 0 ? 'front' : 'back');

        unmount();
      }),
    );
  });

  it('flips the preview exactly when the mirror toggle was pressed an odd number of times', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 6 }),
        fc.integer({ min: 0, max: 6 }),
        (switches, mirrorToggles) => {
          const { result, unmount } = renderHook(() => useCamera(), { wrapper });

          for (let i = 0; i < switches; i++) {
            act(() => {
              result.current.toggleFacing();
            });
          }
          // Switching camera resets the mirror choice, so only these toggles count.
          for (let i = 0; i < mirrorToggles; i++) {
            act(() => {
              result.current.toggleMirrored();
            });
          }

          expect(result.current.previewFlipped).toBe(mirrorToggles % 2 === 1);
          expect(result.current.zoom).toBe(0);

          unmount();
        },
      ),
    );
  });
});
