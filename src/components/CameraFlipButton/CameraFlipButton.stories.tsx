import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { CameraFlipButton } from './CameraFlipButton';

const meta = {
  title: 'CameraFlipButton',
  component: CameraFlipButton,
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
    label: 'Switch camera',
    onPress: () => {},
  },
} satisfies Meta<typeof CameraFlipButton>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Default interactive state over a mid-grey backdrop standing in for a camera frame. */
export const Default: Story = {};
