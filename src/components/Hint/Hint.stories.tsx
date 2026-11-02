import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { Hint } from './Hint';

const meta = {
  title: 'Hint',
  component: Hint,
  decorators: [
    (Story: React.ComponentType) => (
      <View style={{ flex: 1, backgroundColor: '#444' }}>
        <Story />
      </View>
    ),
  ],
  args: {
    label: 'Pinch to zoom',
    icon: 'expand-outline',
    testID: 'zoom-hint',
  },
} satisfies Meta<typeof Hint>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The pinch-to-zoom tip centred over a mid-grey backdrop standing in for a camera frame. */
export const Zoom: Story = {};

/** The tip that points new users to the button showing the view other people have of them. */
export const Flip: Story = {
  args: {
    label: 'Tap to see yourself as others do',
    icon: 'swap-horizontal',
    testID: 'flip-hint',
  },
};
