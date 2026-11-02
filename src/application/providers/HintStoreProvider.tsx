import React, { createContext, useContext } from 'react';
import type { IHintStorePort } from '@/core/ports/HintStorePort';
import { useExpoFileHintStore } from '@/adapters/expo-file-system/ExpoFileHintStoreAdapter';

const HintStoreContext = createContext<IHintStorePort | null>(null);

/** Props accepted by {@link HintStoreProvider}. */
export type HintStoreProviderProps = {
  /** Subtree that can consume the hint store port via {@link useHintStore}. */
  children: React.ReactNode;
};

/**
 * Provides the hint store port to the React subtree via context.
 *
 * Wrap the application root with this component so that any descendant can
 * call {@link useHintStore} to learn whether a one-time hint was already shown,
 * without coupling to `expo-file-system` directly.
 *
 * In unit tests, mock the adapter module
 * (`@/adapters/expo-file-system/ExpoFileHintStoreAdapter`) and render a
 * `HintStoreProvider` around the component under test.
 */
export function HintStoreProvider({ children }: Readonly<HintStoreProviderProps>) {
  const value = useExpoFileHintStore();
  return <HintStoreContext.Provider value={value}>{children}</HintStoreContext.Provider>;
}

/**
 * Returns the {@link IHintStorePort} provided by the nearest
 * {@link HintStoreProvider} ancestor.
 *
 * Throws if called outside of a `HintStoreProvider` tree.
 */
export function useHintStore(): IHintStorePort {
  const ctx = useContext(HintStoreContext);
  if (!ctx) {
    throw new Error('useHintStore must be used inside a <HintStoreProvider>');
  }
  return ctx;
}
