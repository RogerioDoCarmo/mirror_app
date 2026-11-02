import * as fc from 'fast-check';
import { isNaturallyMirrored, needsExtraFlip } from './mirror';

const facingArb = fc.constantFrom('front' as const, 'back' as const);

describe('needsExtraFlip — property tests', () => {
  it('flips exactly when the wanted look differs from the natural look of the camera', () => {
    fc.assert(
      fc.property(facingArb, fc.boolean(), (facing, showMirrored) => {
        expect(needsExtraFlip(facing, showMirrored)).toBe(
          showMirrored !== isNaturallyMirrored(facing),
        );
      }),
    );
  });

  it('never flips when the user keeps the natural look of the camera', () => {
    fc.assert(
      fc.property(facingArb, (facing) => {
        expect(needsExtraFlip(facing, isNaturallyMirrored(facing))).toBe(false);
      }),
    );
  });

  it('always flips once the choice is inverted, for either camera', () => {
    fc.assert(
      fc.property(facingArb, (facing) => {
        expect(needsExtraFlip(facing, !isNaturallyMirrored(facing))).toBe(true);
      }),
    );
  });
});
