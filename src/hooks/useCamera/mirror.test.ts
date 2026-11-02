import { isNaturallyMirrored, needsExtraFlip } from './mirror';

describe('isNaturallyMirrored', () => {
  it('is true for the front camera', () => {
    expect(isNaturallyMirrored('front')).toBe(true);
  });

  it('is false for the back camera', () => {
    expect(isNaturallyMirrored('back')).toBe(false);
  });
});

describe('needsExtraFlip', () => {
  it.each([
    ['front', true, false],
    ['front', false, true],
    ['back', false, false],
    ['back', true, true],
  ] as const)('facing %s with showMirrored %s -> flip %s', (facing, showMirrored, expected) => {
    expect(needsExtraFlip(facing, showMirrored)).toBe(expected);
  });
});
