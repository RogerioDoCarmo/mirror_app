import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Button } from './Button';

describe('Button', () => {
  it('renders the label', () => {
    render(<Button label="Grant Permission" onPress={() => {}} />);

    expect(screen.getByText('Grant Permission')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    render(<Button label="Grant Permission" onPress={onPress} />);

    fireEvent.press(screen.getByText('Grant Permission'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    render(<Button label="Grant Permission" onPress={onPress} disabled />);

    fireEvent.press(screen.getByText('Grant Permission'));

    expect(onPress).not.toHaveBeenCalled();
  });

  it('renders with reduced opacity when disabled', () => {
    render(<Button label="Grant Permission" onPress={() => {}} disabled />);

    const button = screen.getByTestId('app-button');
    expect(button.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ opacity: 0.4 })]),
    );
  });

  it('applies the testID prop', () => {
    render(<Button label="Grant Permission" onPress={() => {}} testID="custom-btn" />);

    expect(screen.getByTestId('custom-btn')).toBeTruthy();
  });
});
