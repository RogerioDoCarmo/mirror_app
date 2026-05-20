import { useCallback, useRef, useState } from 'react';
import { useCameraPermissions } from 'expo-camera';
import type { CameraView, PermissionResponse } from 'expo-camera';

export type UseCameraReturn = {
  permission: PermissionResponse | null;
  requestPermission: () => Promise<PermissionResponse>;
  cameraRef: React.RefObject<CameraView | null>;
  isReady: boolean;
  onCameraReady: () => void;
};

export function useCamera(): UseCameraReturn {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Stryker disable ArrayDeclaration -- equivalent mutant: a static string literal dep never changes, so [] and ["value"] behave identically
  const onCameraReady = useCallback(() => {
    setIsReady(true);
  }, []);
  // Stryker restore ArrayDeclaration

  return { permission, requestPermission, cameraRef, isReady, onCameraReady };
}
