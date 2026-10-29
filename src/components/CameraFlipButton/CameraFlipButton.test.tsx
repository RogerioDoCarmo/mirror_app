import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { CameraFlipButton } from './CameraFlipButton';

describe('CameraFlipButton', () => {
  it('is a button named by the label', () => {
    render(<CameraFlipButton label="Switch camera" onPress={() => {}} />);

    expect(screen.getByRole('button', { name: 'Switch camera' })).toBeTruthy();
  });

  it('defaults its testID to camera-flip-button', () => {
    render(<CameraFlipButton label="Switch camera" onPress={() => {}} />);

    expect(screen.getByTestId('camera-flip-button')).toBeTruthy();
  });

  it('applies a custom testID', () => {
    render(<CameraFlipButton label="Switch camera" onPress={() => {}} testID="custom-flip" />);

    expect(screen.getByTestId('custom-flip')).toBeTruthy();
  });

  it('shows the circular-arrow glyph', () => {
    render(<CameraFlipButton label="Switch camera" onPress={() => {}} />);

    expect(screen.getByText('↻', { includeHiddenElements: true })).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    render(<CameraFlipButton label="Switch camera" onPress={onPress} />);

    fireEvent.press(screen.getByTestId('camera-flip-button'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('declares no selected state, as it is a plain action', () => {
    render(<CameraFlipButton label="Switch camera" onPress={() => {}} />);

    expect(screen.getByTestId('camera-flip-button')).not.toHaveProp('accessibilityState', {
      selected: false,
    });
  });
});
