/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const gradientStart = "#f8fffe"; // light mint/white
const gradientEnd = "#2D5A5A"; // deep teal/green
const cardGradientStart = "#4ECDC4"; // bright teal
const cardGradientEnd = "#44A08D"; // rich green
const accentColor = "#26D0CE"; // cyan-teal
const mainText = "#fff";
const secondaryText = "#B8E6E1";

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
    text: "#FFFFFF",
    background: "#121212",
    card: "rgba(58, 58, 60, 0.7)",
    cardOpaque: "#3A3A3C",
    tint: accentColor,
    icon: "#FFFFFF",
    tabIconDefault: "#8A8A8E",
    tabIconSelected: accentColor,
    red: "#FF453A",
    green: "#32D74B",
    black: "#1C1C1E",
    gray: "#8E8E93",
    backgroundGradientStart: "#3A3A3A",
    backgroundGradientEnd: "#1A1A1A",
    cardRedStart: "#E57373",
    cardRedEnd: "#D32F2F",
    cardGreenStart: "#81C784",
    cardGreenEnd: "#4CAF50",
    primary: "#3A86F7",
  },
};
