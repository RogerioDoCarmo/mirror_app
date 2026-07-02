import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { Button } from './Button';

const meta = {
  title: 'Button',
  component: Button,
  decorators: [
    (Story: React.ComponentType) => (
      <View
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' }}
      >
        <Story />
      </View>
    ),
  ],
  args: {
    label: 'Continue',
    onPress: () => {},
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Default interactive state. */
export const Default: Story = {};

/** Disabled — press is suppressed and opacity is reduced. */
export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
