import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { StyleSheet } from "react-native";

export function TabBarBackground() {
  return (
    <BlurView tint="dark" intensity={100} style={StyleSheet.absoluteFill} />
  );
}

export function useBottomTabOverflow() {
  return useBottomTabBarHeight();
}
