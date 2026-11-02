import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { MirrorToggleButton } from './MirrorToggleButton';

const meta = {
  title: 'MirrorToggleButton',
  component: MirrorToggleButton,
  decorators: [
    (Story: React.ComponentType) => (
      <View
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#444' }}
      >
        <Story />
      </View>
    ),
  ],
  args: {
    label: 'Show as others see you',
    selected: false,
    onPress: () => {},
  },
} satisfies Meta<typeof MirrorToggleButton>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Mirror view showing; pressing switches to the view other people have. */
export const Default: Story = {};

/** Flipped away from the mirror view; pressing switches back. */
export const Selected: Story = {
  args: {
    label: 'Show mirror view',
    selected: true,
  },
};
