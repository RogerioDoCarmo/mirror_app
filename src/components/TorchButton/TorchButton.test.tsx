import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { TorchButton } from './TorchButton';

describe('TorchButton', () => {
  it('is a button named by the label', () => {
    render(<TorchButton label="Turn flashlight on" on={false} onPress={() => {}} />);

    expect(screen.getByRole('button', { name: 'Turn flashlight on' })).toBeTruthy();
  });

  it('defaults its testID to torch-button', () => {
    render(<TorchButton label="Turn flashlight on" on={false} onPress={() => {}} />);

    expect(screen.getByTestId('torch-button')).toBeTruthy();
  });

  it('applies a custom testID', () => {
    render(
      <TorchButton
        label="Turn flashlight on"
        on={false}
        onPress={() => {}}
        testID="custom-torch"
      />,
    );

    expect(screen.getByTestId('custom-torch')).toBeTruthy();
  });

  it('shows an outlined flashlight while it is off', () => {
    render(<TorchButton label="Turn flashlight on" on={false} onPress={() => {}} />);

    expect(screen.getByText('flashlight-outline', { includeHiddenElements: true })).toBeTruthy();
    expect(screen.queryByText('flashlight', { includeHiddenElements: true })).toBeNull();
  });

  it('shows a filled flashlight while it is lit', () => {
    render(<TorchButton label="Turn flashlight off" on onPress={() => {}} />);

    expect(screen.getByText('flashlight', { includeHiddenElements: true })).toBeTruthy();
    expect(screen.queryByText('flashlight-outline', { includeHiddenElements: true })).toBeNull();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    render(<TorchButton label="Turn flashlight on" on={false} onPress={onPress} />);

    fireEvent.press(screen.getByTestId('torch-button'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('reports selected=true to assistive technology while lit', () => {
    render(<TorchButton label="Turn flashlight off" on onPress={() => {}} />);

    expect(screen.getByTestId('torch-button')).toHaveProp('accessibilityState', {
      selected: true,
    });
    expect(screen.getByTestId('torch-button')).toBeSelected();
  });

  it('reports selected=false to assistive technology while off', () => {
    render(<TorchButton label="Turn flashlight on" on={false} onPress={() => {}} />);

    expect(screen.getByTestId('torch-button')).toHaveProp('accessibilityState', {
      selected: false,
    });
    expect(screen.getByTestId('torch-button')).not.toBeSelected();
  });
});
