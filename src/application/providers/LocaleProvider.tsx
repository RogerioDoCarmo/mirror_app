import React, { createContext, useContext } from 'react';
import type { ILocalePort } from '@/core/ports/LocalePort';
import { useExpoLocalization } from '@/adapters/expo-localization/ExpoLocalizationAdapter';

const LocaleContext = createContext<ILocalePort | null>(null);

/** Props accepted by {@link LocaleProvider}. */
export type LocaleProviderProps = {
  /** Subtree that can consume the locale port via {@link useLocale}. */
  children: React.ReactNode;
};

/**
 * Provides the locale and translation function to the React subtree via context.
 *
 * Wrap the application root with this component so that any descendant can
 * call {@link useLocale} to access the active locale and translate strings
 * without coupling to `expo-localization` directly.
 *
 * In unit tests, mock the adapter module
 * (`@/adapters/expo-localization/ExpoLocalizationAdapter`) and render a
 * `LocaleProvider` around the component under test.
 */
export function LocaleProvider({ children }: LocaleProviderProps) {
  const value = useExpoLocalization();
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

/**
 * Returns the {@link ILocalePort} provided by the nearest
 * {@link LocaleProvider} ancestor.
 *
 * Throws if called outside of a `LocaleProvider` tree.
 */
export function useLocale(): ILocalePort {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useLocale must be used inside a <LocaleProvider>');
  }
  return ctx;
}
