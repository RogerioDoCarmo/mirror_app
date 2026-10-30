import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { ZoomHint } from './ZoomHint';

const meta = {
  title: 'ZoomHint',
  component: ZoomHint,
  decorators: [
    (Story: React.ComponentType) => (
      <View style={{ flex: 1, backgroundColor: '#444' }}>
        <Story />
      </View>
    ),
  ],
  args: {
    label: 'Pinch to zoom',
  },
} satisfies Meta<typeof ZoomHint>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The hint centred over a mid-grey backdrop standing in for a camera frame. */
export const Default: Story = {};
