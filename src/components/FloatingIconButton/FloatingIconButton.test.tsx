import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { FloatingIconButton } from './FloatingIconButton';

const renderButton = (props: Partial<React.ComponentProps<typeof FloatingIconButton>> = {}) =>
  render(
    <FloatingIconButton
      icon="flashlight"
      label="Do it"
      onPress={() => {}}
      testID="floating"
      {...props}
    />,
  );

describe('FloatingIconButton', () => {
  it('exposes itself as a button with the given accessible name', () => {
    renderButton();

    expect(screen.getByTestId('floating')).toHaveProp('accessibilityRole', 'button');
    expect(screen.getByTestId('floating')).toHaveProp('accessibilityLabel', 'Do it');
  });

  it('can be found by its role and name', () => {
    renderButton();

    expect(screen.getByRole('button', { name: 'Do it' })).toBeTruthy();
  });

  it('draws the icon it is given', () => {
    renderButton({ icon: 'swap-horizontal' });

    expect(screen.getByText('swap-horizontal', { includeHiddenElements: true })).toBeTruthy();
  });

  it('draws a 26 point vector icon, centred inside the disc', () => {
    renderButton();

    expect(screen.getByText('flashlight', { includeHiddenElements: true })).toHaveProp('size', 26);
    expect(screen.getByTestId('floating')).toHaveStyle({
      alignItems: 'center',
      justifyContent: 'center',
    });
  });

  it('hides the decorative icon from assistive technology', () => {
    renderButton();

    expect(screen.getByText('flashlight', { includeHiddenElements: true })).toHaveProp(
      'importantForAccessibility',
      'no',
    );
    expect(screen.getByText('flashlight', { includeHiddenElements: true })).toHaveProp(
      'accessibilityElementsHidden',
      true,
    );
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    renderButton({ onPress });

    fireEvent.press(screen.getByTestId('floating'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('is a 48 x 48 round target, above the 44 x 44 minimum', () => {
    renderButton();

    expect(screen.getByTestId('floating')).toHaveStyle({
      width: 48,
      height: 48,
      borderRadius: 24,
    });
  });

  it('uses a dark translucent disc and a white icon for contrast over the preview', () => {
    renderButton();

    expect(screen.getByTestId('floating')).toHaveStyle({
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.7)',
    });
    expect(screen.getByText('flashlight', { includeHiddenElements: true })).toHaveProp(
      'color',
      '#fff',
    );
  });

  it('declares no selected state unless asked to', () => {
    renderButton();

    expect(screen.getByTestId('floating')).not.toBeSelected();
  });

  it('exposes selected=true to assistive technology', () => {
    renderButton({ selected: true });

    expect(screen.getByTestId('floating')).toHaveProp('accessibilityState', { selected: true });
    expect(screen.getByTestId('floating')).toBeSelected();
  });

  it('exposes selected=false to assistive technology', () => {
    renderButton({ selected: false });

    expect(screen.getByTestId('floating')).toHaveProp('accessibilityState', { selected: false });
    expect(screen.getByTestId('floating')).not.toBeSelected();
  });

  it('dims while pressed and is opaque at rest', () => {
    renderButton();
    expect(screen.getByTestId('floating')).not.toHaveStyle({ opacity: 0.6 });

    // A finger going down starts Pressability's responder handshake, which
    // flips the Pressable's `pressed` state.
    fireEvent(screen.getByTestId('floating'), 'responderGrant', {
      currentTarget: { measure: () => {} },
      persist: () => {},
      nativeEvent: { touches: [], changedTouches: [], identifier: 1, timestamp: 0 },
    });

    expect(screen.getByTestId('floating')).toHaveStyle({ opacity: 0.6 });
  });
});
