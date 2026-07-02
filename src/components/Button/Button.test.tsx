import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Button } from './Button';

describe('Button', () => {
  it('renders the label', () => {
    render(<Button label="Continue" onPress={() => {}} />);

    expect(screen.getByText('Continue')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    render(<Button label="Continue" onPress={onPress} />);

    fireEvent.press(screen.getByText('Continue'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    render(<Button label="Continue" onPress={onPress} disabled />);

    fireEvent.press(screen.getByText('Continue'));

    expect(onPress).not.toHaveBeenCalled();
  });

  it('renders with reduced opacity when disabled', () => {
    render(<Button label="Continue" onPress={() => {}} disabled />);

    expect(screen.getByTestId('app-button')).toHaveStyle({ opacity: 0.4 });
  });

  it('applies the testID prop', () => {
    render(<Button label="Continue" onPress={() => {}} testID="custom-btn" />);

    expect(screen.getByTestId('custom-btn')).toBeTruthy();
  });
});
