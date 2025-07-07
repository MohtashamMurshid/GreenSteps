/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const gradientStart = '#b2f0ff'; // light blue
const gradientEnd = '#005fa3'; // deep blue
const cardGradientStart = '#00c6fb'; // bright blue
const cardGradientEnd = '#0072c6'; // rich blue
const accentColor = '#00eaff'; // cyan
const mainText = '#fff';
const secondaryText = '#b2e0ff';

export const Colors = {
  light: {
    text: mainText,
    background: gradientStart,
    tint: accentColor,
    icon: accentColor,
    tabIconDefault: cardGradientEnd,
    tabIconSelected: accentColor,
  },
  dark: {
    text: mainText,
    background: gradientEnd,
    tint: accentColor,
    icon: accentColor,
    tabIconDefault: cardGradientEnd,
    tabIconSelected: accentColor,
    cardGradientStart,
    cardGradientEnd,
    secondaryText,
  },
};
