import * as mockReact from 'react';
import type { TextProps } from 'react-native';
import { Text as MockText } from 'react-native';

// RNTL v13+ extends Jest matchers automatically — no explicit import needed.

// The vector-icon font is not loaded under Jest, so the real Ionicons draws
// nothing. Render the glyph's *name* as text instead, which lets tests tell the
// icons apart (`getByText('flashlight')`) without depending on the font.
jest.mock('@expo/vector-icons/Ionicons', () => ({
  __esModule: true,
  default: ({ name, ...props }: TextProps & { name: string }) =>
    mockReact.createElement(MockText, props, name),
}));
