import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { MirrorToggleButton } from './MirrorToggleButton';

describe('MirrorToggleButton', () => {
  it('is a button named by the label', () => {
    render(<MirrorToggleButton label="Show mirror view" selected={false} onPress={() => {}} />);

    expect(screen.getByRole('button', { name: 'Show mirror view' })).toBeTruthy();
  });

  it('defaults its testID to mirror-toggle-button', () => {
    render(<MirrorToggleButton label="Show mirror view" selected={false} onPress={() => {}} />);

    expect(screen.getByTestId('mirror-toggle-button')).toBeTruthy();
  });

  it('applies a custom testID', () => {
    render(
      <MirrorToggleButton
        label="Show mirror view"
        selected={false}
        onPress={() => {}}
        testID="custom-mirror"
      />,
    );

    expect(screen.getByTestId('custom-mirror')).toBeTruthy();
  });

  it('shows the left-right arrows icon', () => {
    render(<MirrorToggleButton label="Show mirror view" selected={false} onPress={() => {}} />);

    expect(screen.getByText('swap-horizontal', { includeHiddenElements: true })).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    render(<MirrorToggleButton label="Show mirror view" selected={false} onPress={onPress} />);

    fireEvent.press(screen.getByTestId('mirror-toggle-button'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('reports selected=true to assistive technology', () => {
    render(<MirrorToggleButton label="Show mirror view" selected onPress={() => {}} />);

    expect(screen.getByTestId('mirror-toggle-button')).toHaveProp('accessibilityState', {
      selected: true,
    });
    expect(screen.getByTestId('mirror-toggle-button')).toBeSelected();
  });

  it('reports selected=false to assistive technology', () => {
    render(<MirrorToggleButton label="Show mirror view" selected={false} onPress={() => {}} />);

    expect(screen.getByTestId('mirror-toggle-button')).toHaveProp('accessibilityState', {
      selected: false,
    });
    expect(screen.getByTestId('mirror-toggle-button')).not.toBeSelected();
  });
});
