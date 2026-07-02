import React from 'react';
import { Text, View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { PermissionGate } from './PermissionGate';

const meta = {
  title: 'PermissionGate',
  component: PermissionGate,
  args: {
    onRequest: () => {},
    onOpenSettings: () => {},
    children: (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#fff', fontSize: 16 }}>Camera view goes here</Text>
      </View>
    ),
  },
} satisfies Meta<typeof PermissionGate>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Permission not yet resolved — shows the loading indicator. */
export const Loading: Story = {
  args: {
    permission: null,
  },
};

/** Permission denied but the OS will still show the system prompt. */
export const DeniedCanAsk: Story = {
  name: 'Denied — Can Ask Again',
  args: {
    permission: { granted: false, canAskAgain: true },
  },
};

/** Permission permanently denied — user must go to device Settings. */
export const DeniedBlocked: Story = {
  name: 'Denied — Blocked (Open Settings)',
  args: {
    permission: { granted: false, canAskAgain: false },
  },
};

/** Permission granted — children are rendered. */
export const Granted: Story = {
  args: {
    permission: { granted: true, canAskAgain: true },
  },
};
