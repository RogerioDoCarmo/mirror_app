/**
 * Empty stub used by the Metro resolver when EXPO_PUBLIC_STORYBOOK_ENABLED is
 * not 'true'.  Metro must resolve every require() it encounters at bundle time,
 * even those inside dead-code branches that Babel DCE has not yet eliminated.
 * Redirecting .rnstorybook imports here prevents the Storybook dependency tree
 * from being included in non-Storybook builds.
 */
module.exports = {};
