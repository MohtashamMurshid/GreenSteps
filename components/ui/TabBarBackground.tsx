import React from "react";
import { View } from "react-native";

export function TabBarBackground() {
  // A simple view for Android and web, matching the dark theme
  return <View style={{ flex: 1, backgroundColor: "rgba(28, 28, 30, 0.9)" }} />;
}

export function useBottomTabOverflow() {
  return 0;
}
