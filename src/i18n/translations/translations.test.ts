import { translations } from './index';

describe('camera control translations', () => {
  it.each([
    ['en', 'Switch camera', 'Show mirror view', 'Show as others see you'],
    ['pt', 'Alternar câmera', 'Mostrar visão de espelho', 'Mostrar como os outros veem você'],
    ['es', 'Cambiar de cámara', 'Mostrar vista de espejo', 'Mostrar como te ven los demás'],
    ['ja', 'カメラを切り替える', 'ミラー表示にする', '他の人から見える向きで表示'],
  ] as const)(
    '%s has the switch-camera and mirror labels',
    (locale, switchCamera, mirror, others) => {
      expect(translations[locale]['camera.switchCamera']).toBe(switchCamera);
      expect(translations[locale]['camera.showMirrorView']).toBe(mirror);
      expect(translations[locale]['camera.showAsOthersSeeYou']).toBe(others);
    },
  );

  it('gives the two mirror states different labels in every locale', () => {
    for (const map of Object.values(translations)) {
      expect(map['camera.showMirrorView']).not.toBe(map['camera.showAsOthersSeeYou']);
    }
  });
});
