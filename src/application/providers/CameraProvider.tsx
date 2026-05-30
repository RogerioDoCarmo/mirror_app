import React, { createContext, useContext } from 'react';
import type { ICameraPermissionPort } from '@/core/ports/CameraPermissionPort';
import { useExpoCameraPermission } from '@/adapters/expo-camera/ExpoCameraPermissionAdapter';

const CameraPermissionContext = createContext<ICameraPermissionPort | null>(null);

/** Props accepted by {@link CameraProvider}. */
export type CameraProviderProps = {
  /** Subtree that can consume the camera permission port via {@link useCameraPermission}. */
  children: React.ReactNode;
};

/**
 * Provides the camera permission port to the React subtree via context.
 *
 * Wrap the application root with this component so that any descendant can
 * call {@link useCameraPermission} to access the live camera permission state
 * without coupling to `expo-camera` directly.
 *
 * In unit tests, mock the adapter module
 * (`@/adapters/expo-camera/ExpoCameraPermissionAdapter`) and render a
 * `CameraProvider` around the component under test.
 */
export function CameraProvider({ children }: CameraProviderProps) {
  const value = useExpoCameraPermission();
  return (
    <CameraPermissionContext.Provider value={value}>{children}</CameraPermissionContext.Provider>
  );
}

/**
 * Returns the {@link ICameraPermissionPort} provided by the nearest
 * {@link CameraProvider} ancestor.
 *
 * Throws if called outside of a `CameraProvider` tree.
 */
export function useCameraPermission(): ICameraPermissionPort {
  const ctx = useContext(CameraPermissionContext);
  if (!ctx) {
    throw new Error('useCameraPermission must be used inside a <CameraProvider>');
  }
  return ctx;
}
