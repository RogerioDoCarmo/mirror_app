import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { ZoomHint } from './ZoomHint';

describe('ZoomHint', () => {
  it('shows the label it is given', () => {
    render(<ZoomHint label="Pinch to zoom" />);

    expect(screen.getByText('Pinch to zoom')).toBeTruthy();
  });

  it('can be found by its testID', () => {
    render(<ZoomHint label="Pinch to zoom" />);

    expect(screen.getByTestId('zoom-hint')).toBeTruthy();
  });

  it('never takes touches, so a pinch on top of it reaches the camera underneath', () => {
    render(<ZoomHint label="Pinch to zoom" />);

    expect(screen.getByTestId('zoom-hint')).toHaveProp('pointerEvents', 'none');
  });

  it('stays in the native hierarchy so E2E drivers can find it', () => {
    render(<ZoomHint label="Pinch to zoom" />);

    expect(screen.getByTestId('zoom-hint')).toHaveProp('collapsable', false);
  });

  it('is announced politely by screen readers', () => {
    render(<ZoomHint label="Pinch to zoom" />);

    expect(screen.getByTestId('zoom-hint')).toHaveProp('accessibilityLiveRegion', 'polite');
  });

  it('covers the preview and centres the label', () => {
    render(<ZoomHint label="Pinch to zoom" />);

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

  it('draws an expand icon next to the label, hidden from assistive technology', () => {
    render(<ZoomHint label="Pinch to zoom" />);

    const query = { includeHiddenElements: true };
    expect(screen.getByText('expand-outline', query)).toHaveProp('importantForAccessibility', 'no');
    expect(screen.getByText('expand-outline', query)).toHaveProp(
      'accessibilityElementsHidden',
      true,
    );
    expect(screen.getByText('expand-outline', query)).toHaveProp('color', '#fff');
    expect(screen.getByText('expand-outline', query)).toHaveProp('size', 24);
  });

  it('uses a dark translucent pill and white text so it reads over any frame', () => {
    render(<ZoomHint label="Pinch to zoom" />);

    expect(screen.getByText('Pinch to zoom')).toHaveStyle({ color: '#fff' });
    expect(screen.getByTestId('zoom-hint-pill')).toHaveStyle({
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
    });
  });

  it('keeps the icon and the label a comfortable distance apart inside a rounded pill', () => {
    render(<ZoomHint label="Pinch to zoom" />);

    expect(screen.getByTestId('zoom-hint-pill')).toHaveStyle({
      gap: 10,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 28,
    });
    expect(screen.getByText('Pinch to zoom')).toHaveStyle({ fontSize: 16, fontWeight: '600' });
  });
});
