import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { TorchButton } from './TorchButton';

const meta = {
  title: 'TorchButton',
  component: TorchButton,
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
    label: 'Turn flashlight on',
    on: false,
    onPress: () => {},
  },
} satisfies Meta<typeof TorchButton>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Flashlight off: an outlined icon. */
export const Off: Story = {};

/** Flashlight lit: a filled icon, announced as selected. */
export const On: Story = {
  args: { label: 'Turn flashlight off', on: true },
};
