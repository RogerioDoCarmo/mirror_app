import * as fc from 'fast-check';
import { clampZoom, distanceBetween, pinchScale, zoomFromPinchScale } from './zoom';

const zoomArb = fc.double({ min: 0, max: 1, noNaN: true });
const scaleArb = fc.double({ min: 0, max: 10, noNaN: true });

describe('clampZoom — property tests', () => {
  it('always lands within [0, 1]', () => {
    fc.assert(
      fc.property(fc.double({ noNaN: true }), (value) => {
        const result = clampZoom(value);

        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThanOrEqual(1);
      }),
    );
  });

  it('leaves values already within [0, 1] untouched', () => {
    fc.assert(
      fc.property(zoomArb, (value) => {
        expect(clampZoom(value)).toBe(value);
      }),
    );
  });

  it('is idempotent', () => {
    fc.assert(
      fc.property(fc.double({ noNaN: true }), (value) => {
        expect(clampZoom(clampZoom(value))).toBe(clampZoom(value));
      }),
    );
  });
});

describe('zoomFromPinchScale — property tests', () => {
  it('always lands within [0, 1] for any base zoom and scale', () => {
    fc.assert(
      fc.property(zoomArb, scaleArb, (base, scale) => {
        const result = zoomFromPinchScale(base, scale);

        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThanOrEqual(1);
      }),
    );
  });

  it('is the identity at scale 1', () => {
    fc.assert(
      fc.property(zoomArb, (base) => {
        expect(zoomFromPinchScale(base, 1)).toBe(base);
      }),
    );
  });

  it('is monotonic: a larger scale never gives a smaller zoom', () => {
    fc.assert(
      fc.property(zoomArb, scaleArb, scaleArb, (base, a, b) => {
        const [low, high] = a <= b ? [a, b] : [b, a];

        expect(zoomFromPinchScale(base, low)).toBeLessThanOrEqual(zoomFromPinchScale(base, high));
      }),
    );
  });

  it('never zooms out when spreading (scale >= 1) nor in when pinching (scale <= 1)', () => {
    fc.assert(
      fc.property(zoomArb, fc.double({ min: 1, max: 10, noNaN: true }), (base, scale) => {
        expect(zoomFromPinchScale(base, scale)).toBeGreaterThanOrEqual(base);
      }),
    );
    fc.assert(
      fc.property(zoomArb, fc.double({ min: 0, max: 1, noNaN: true }), (base, scale) => {
        expect(zoomFromPinchScale(base, scale)).toBeLessThanOrEqual(base);
      }),
    );
  });
});

describe('distanceBetween — property tests', () => {
  const pointArb = fc.record({
    pageX: fc.double({ min: -5000, max: 5000, noNaN: true }),
    pageY: fc.double({ min: -5000, max: 5000, noNaN: true }),
  });

  it('is never negative', () => {
    fc.assert(
      fc.property(pointArb, pointArb, (a, b) => {
        expect(distanceBetween(a, b)).toBeGreaterThanOrEqual(0);
      }),
    );
  });

  it('is symmetric', () => {
    fc.assert(
      fc.property(pointArb, pointArb, (a, b) => {
        expect(distanceBetween(a, b)).toBe(distanceBetween(b, a));
      }),
    );
  });

  it('is 0 from a point to itself', () => {
    fc.assert(
      fc.property(pointArb, (a) => {
        expect(distanceBetween(a, a)).toBe(0);
      }),
    );
  });
});

describe('pinchScale — property tests', () => {
  it('is 1 whenever the fingers have not moved', () => {
    fc.assert(
      fc.property(fc.double({ min: 0.001, max: 5000, noNaN: true }), (d) => {
        expect(pinchScale(d, d)).toBe(1);
      }),
    );
  });

  it('is finite and never negative for any distances', () => {
    fc.assert(
      fc.property(
        // Fingers are either exactly coincident or at least a point apart.
        fc.oneof(fc.constant(0), fc.double({ min: 1, max: 5000, noNaN: true })),
        fc.double({ min: 0, max: 5000, noNaN: true }),
        (start, now) => {
          const scale = pinchScale(start, now);

          expect(Number.isFinite(scale)).toBe(true);
          expect(scale).toBeGreaterThanOrEqual(0);
        },
      ),
    );
  });
});
