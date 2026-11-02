import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Hint } from './Hint';

const renderHint = (props: Partial<React.ComponentProps<typeof Hint>> = {}) =>
  render(<Hint label="Pinch to zoom" icon="expand-outline" testID="zoom-hint" {...props} />);

describe('Hint', () => {
  it('shows the label it is given', () => {
    renderHint();

    expect(screen.getByText('Pinch to zoom')).toBeTruthy();
  });

  it('can be found by the testID it is given, and names its pill after it', () => {
    renderHint({ testID: 'flip-hint' });

    expect(screen.getByTestId('flip-hint')).toBeTruthy();
    expect(screen.getByTestId('flip-hint-pill')).toBeTruthy();
    expect(screen.queryByTestId('zoom-hint')).toBeNull();
  });

  it('never takes touches, so a pinch on top of it reaches the camera underneath', () => {
    renderHint();

    expect(screen.getByTestId('zoom-hint')).toHaveProp('pointerEvents', 'none');
  });

  it('stays in the native hierarchy so E2E drivers can find it', () => {
    renderHint();

    expect(screen.getByTestId('zoom-hint')).toHaveProp('collapsable', false);
  });

  it('is announced politely by screen readers', () => {
    renderHint();

    expect(screen.getByTestId('zoom-hint')).toHaveProp('accessibilityLiveRegion', 'polite');
  });

  it('covers the preview and centres the label', () => {
    renderHint();

    expect(screen.getByTestId('zoom-hint')).toHaveStyle({
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      alignItems: 'center',
      justifyContent: 'center',
    });
  });

  it('draws the icon it is given next to the label, hidden from assistive technology', () => {
    renderHint({ icon: 'swap-horizontal' });

    const query = { includeHiddenElements: true };
    expect(screen.getByText('swap-horizontal', query)).toHaveProp(
      'importantForAccessibility',
      'no',
    );
    expect(screen.getByText('swap-horizontal', query)).toHaveProp(
      'accessibilityElementsHidden',
      true,
    );
    expect(screen.getByText('swap-horizontal', query)).toHaveProp('color', '#fff');
    expect(screen.getByText('swap-horizontal', query)).toHaveProp('size', 24);
  });

  it('uses a dark translucent pill and white text so it reads over any frame', () => {
    renderHint();

    expect(screen.getByText('Pinch to zoom')).toHaveStyle({ color: '#fff' });
    expect(screen.getByTestId('zoom-hint-pill')).toHaveStyle({
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
    });
  });

  it('keeps the icon and the label a comfortable distance apart inside a rounded pill', () => {
    renderHint();

    expect(screen.getByTestId('zoom-hint-pill')).toHaveStyle({
      gap: 10,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 28,
    });
    expect(screen.getByText('Pinch to zoom')).toHaveStyle({ fontSize: 16, fontWeight: '600' });
  });
});
