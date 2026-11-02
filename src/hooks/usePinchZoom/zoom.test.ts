import {
  MAX_ZOOM,
  MIN_ZOOM,
  PINCH_SENSITIVITY,
  clampZoom,
  distanceBetween,
  pinchScale,
  zoomFromPinchScale,
} from './zoom';

describe('zoom constants', () => {
  it('spans the 0..1 range the camera view accepts', () => {
    expect(MIN_ZOOM).toBe(0);
    expect(MAX_ZOOM).toBe(1);
  });

  it('adds half of the zoom range per unit of pinch scale', () => {
    expect(PINCH_SENSITIVITY).toBe(0.5);
  });
});

describe('clampZoom', () => {
  it.each([
    [-5, 0],
    [-0.0001, 0],
    [0, 0],
    [0.25, 0.25],
    [0.999, 0.999],
    [1, 1],
    [1.0001, 1],
    [42, 1],
  ])('clamps %p to %p', (input, expected) => {
    expect(clampZoom(input)).toBe(expected);
  });
});

describe('zoomFromPinchScale', () => {
  it('returns the base zoom unchanged at scale 1', () => {
    expect(zoomFromPinchScale(0.3, 1)).toBeCloseTo(0.3, 10);
  });

  it('zooms in when the fingers spread apart', () => {
    expect(zoomFromPinchScale(0, 1.5)).toBeCloseTo(0.25, 10);
    expect(zoomFromPinchScale(0.2, 2)).toBeCloseTo(0.7, 10);
  });

  it('zooms out when the fingers pinch together', () => {
    expect(zoomFromPinchScale(0.8, 0.6)).toBeCloseTo(0.6, 10);
  });

  it('stops at the maximum zoom', () => {
    expect(zoomFromPinchScale(0.9, 3)).toBe(1);
  });

  it('stops at the minimum zoom', () => {
    expect(zoomFromPinchScale(0.1, 0.2)).toBe(0);
  });

  it('is cumulative across gestures when the previous result is used as the base', () => {
    const afterFirst = zoomFromPinchScale(0, 1.4);
    const afterSecond = zoomFromPinchScale(afterFirst, 1.4);

    expect(afterFirst).toBeCloseTo(0.2, 10);
    expect(afterSecond).toBeCloseTo(0.4, 10);
  });
});

describe('distanceBetween', () => {
  it('is the straight-line distance between the two touches', () => {
    expect(distanceBetween({ pageX: 0, pageY: 0 }, { pageX: 3, pageY: 4 })).toBe(5);
  });

  it('does not depend on which touch comes first', () => {
    expect(distanceBetween({ pageX: 10, pageY: 2 }, { pageX: 4, pageY: 10 })).toBe(10);
    expect(distanceBetween({ pageX: 4, pageY: 10 }, { pageX: 10, pageY: 2 })).toBe(10);
  });

  it('is 0 for coincident touches', () => {
    expect(distanceBetween({ pageX: 7, pageY: 7 }, { pageX: 7, pageY: 7 })).toBe(0);
  });
});

describe('pinchScale', () => {
  it('is the ratio of the current distance to the starting distance', () => {
    expect(pinchScale(100, 250)).toBe(2.5);
    expect(pinchScale(200, 50)).toBe(0.25);
  });

  it('is 1 when the fingers have not moved', () => {
    expect(pinchScale(120, 120)).toBe(1);
  });

  it('is 1 when the starting distance is zero, instead of Infinity', () => {
    expect(pinchScale(0, 100)).toBe(1);
  });
});
