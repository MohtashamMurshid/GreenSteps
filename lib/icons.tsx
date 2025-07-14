import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import React from "react";

export interface IconProps {
  size?: number;
  color?: string;
  style?: any;
}

// Icon mapping for common emojis used in the app
export const AppIcons = {
  // Nature & Environment
  leaf: (props: IconProps) => <Ionicons name="leaf" {...props} />,
  earth: (props: IconProps) => <Ionicons name="earth" {...props} />,
  tree: (props: IconProps) => <MaterialCommunityIcons name="tree" {...props} />,
  recycle: (props: IconProps) => (
    <MaterialCommunityIcons name="recycle" {...props} />
  ),
  flower: (props: IconProps) => (
    <MaterialCommunityIcons name="flower" {...props} />
  ),

  // Fitness & Activity
  run: (props: IconProps) => <Ionicons name="walk" {...props} />,
  runner: (props: IconProps) => (
    <MaterialIcons name="directions-run" {...props} />
  ),
  walk: (props: IconProps) => <MaterialCommunityIcons name="walk" {...props} />,
  footsteps: (props: IconProps) => (
    <MaterialCommunityIcons name="shoe-print" {...props} />
  ),
  fitness: (props: IconProps) => (
    <MaterialIcons name="fitness-center" {...props} />
  ),

  // Goals & Achievements
  target: (props: IconProps) => (
    <MaterialCommunityIcons name="target" {...props} />
  ),
  trophy: (props: IconProps) => <Ionicons name="trophy" {...props} />,
  medal: (props: IconProps) => (
    <MaterialCommunityIcons name="medal" {...props} />
  ),
  star: (props: IconProps) => <Ionicons name="star" {...props} />,
  fire: (props: IconProps) => <Ionicons name="flame" {...props} />,
  crown: (props: IconProps) => (
    <MaterialCommunityIcons name="crown" {...props} />
  ),

  // Rankings
  first: (props: IconProps) => (
    <MaterialCommunityIcons name="numeric-1-circle" {...props} />
  ),
  second: (props: IconProps) => (
    <MaterialCommunityIcons name="numeric-2-circle" {...props} />
  ),
  third: (props: IconProps) => (
    <MaterialCommunityIcons name="numeric-3-circle" {...props} />
  ),

  // UI Elements
  celebration: (props: IconProps) => (
    <MaterialCommunityIcons name="party-popper" {...props} />
  ),
  chart: (props: IconProps) => <Ionicons name="bar-chart" {...props} />,
  stats: (props: IconProps) => <Ionicons name="stats-chart" {...props} />,
  people: (props: IconProps) => <Ionicons name="people" {...props} />,

  // Health & Wellness
  heart: (props: IconProps) => <Ionicons name="heart" {...props} />,
  sleep: (props: IconProps) => (
    <MaterialCommunityIcons name="sleep" {...props} />
  ),
  water: (props: IconProps) => <Ionicons name="water" {...props} />,
  moon: (props: IconProps) => <Ionicons name="moon" {...props} />,

  // Audio & Sound
  volume: (props: IconProps) => <Ionicons name="volume-high" {...props} />,
  speaker: (props: IconProps) => (
    <MaterialCommunityIcons name="speaker" {...props} />
  ),

  // Camera & Media
  camera: (props: IconProps) => <Ionicons name="camera" {...props} />,
  video: (props: IconProps) => <Ionicons name="videocam" {...props} />,

  // Maps & Navigation
  map: (props: IconProps) => <Ionicons name="map" {...props} />,
  satellite: (props: IconProps) => (
    <MaterialCommunityIcons name="satellite-variant" {...props} />
  ),

  // Energy & Power
  bolt: (props: IconProps) => <Ionicons name="flash" {...props} />,
  energy: (props: IconProps) => (
    <MaterialCommunityIcons name="lightning-bolt" {...props} />
  ),

  // Progress & Growth
  trending: (props: IconProps) => <Ionicons name="trending-up" {...props} />,
  growth: (props: IconProps) => (
    <MaterialCommunityIcons name="chart-line" {...props} />
  ),

  // Baby/Beginner
  baby: (props: IconProps) => (
    <MaterialCommunityIcons name="baby-face" {...props} />
  ),

  // Strength
  strong: (props: IconProps) => (
    <MaterialCommunityIcons name="arm-flex" {...props} />
  ),
};

// Helper function to get icon by name
export const getIcon = (name: keyof typeof AppIcons, props: IconProps = {}) => {
  const IconComponent = AppIcons[name];
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return <Ionicons name="help-circle" {...props} />;
  }
  return IconComponent(props);
};

// Default props for consistency
export const defaultIconProps = {
  size: 24,
  color: "#26D0CE", // Default to our accent color
};
