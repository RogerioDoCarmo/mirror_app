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

  const onCameraReady = useCallback(() => {
    setIsReady(true);
  }, []);

  return { permission, requestPermission, cameraRef, isReady, onCameraReady };
}
