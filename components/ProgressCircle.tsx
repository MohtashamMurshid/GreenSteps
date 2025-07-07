import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import Svg, { Circle, G } from "react-native-svg";
import { ThemedText } from "./ThemedText";

interface ProgressCircleProps {
  progress: number; // 0 to 1
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  title?: string;
  subtitle?: string;
  showPercentage?: boolean;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const ProgressCircle: React.FC<ProgressCircleProps> = ({
  progress,
  size = 120,
  strokeWidth = 8,
  color = "#4CAF50",
  backgroundColor = "#E0E0E0",
  title,
  subtitle,
  showPercentage = false,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: progress,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={backgroundColor}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </G>
      </Svg>

      <View style={styles.textContainer}>
        {showPercentage && (
          <ThemedText style={[styles.percentage, { color }]}>
            {Math.round(progress * 100)}%
          </ThemedText>
        )}
        {title && (
          <ThemedText style={styles.title} numberOfLines={1}>
            {title}
          </ThemedText>
        )}
        {subtitle && (
          <ThemedText style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </ThemedText>
        )}
      </View>
    </View>
  );
};

// Multi-circle progress component for dashboard
interface MultiProgressCircleProps {
  progressData: {
    label: string;
    progress: number;
    color: string;
    value?: string;
  }[];
  size?: number;
}

export const MultiProgressCircle: React.FC<MultiProgressCircleProps> = ({
  progressData,
  size = 100,
}) => {
  return (
    <View style={styles.multiContainer}>
      {progressData.map((item, index) => (
        <View key={index} style={styles.progressItem}>
          <ProgressCircle
            progress={item.progress}
            size={size}
            color={item.color}
            title={item.value || `${Math.round(item.progress * 100)}%`}
            subtitle={item.label}
            strokeWidth={6}
          />
        </View>
      ))}
    </View>
  );
};

// Animated achievement circle for celebrations
interface AchievementCircleProps {
  visible: boolean;
  type: "goal" | "badge" | "milestone";
  size?: number;
}

export const AchievementCircle: React.FC<AchievementCircleProps> = ({
  visible,
  type,
  size = 150,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      rotateAnim.setValue(0);
    }
  }, [visible]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const getIcon = () => {
    switch (type) {
      case "goal":
        return "🎯";
      case "badge":
        return "🏆";
      case "milestone":
        return "⭐";
      default:
        return "✨";
    }
  };

  const getColor = () => {
    switch (type) {
      case "goal":
        return "#4CAF50";
      case "badge":
        return "#FF9800";
      case "milestone":
        return "#2196F3";
      default:
        return "#9C27B0";
    }
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.achievementContainer,
        {
          width: size,
          height: size,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <Animated.View
        style={[
          styles.achievementCircle,
          {
            backgroundColor: getColor(),
            transform: [{ rotate }],
          },
        ]}
      >
        <ThemedText style={styles.achievementIcon}>{getIcon()}</ThemedText>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  svg: {
    position: "absolute",
  },
  textContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  percentage: {
    fontSize: 18,
    fontWeight: "bold",
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 2,
  },
  subtitle: {
    fontSize: 10,
    opacity: 0.7,
    textAlign: "center",
    marginTop: 1,
  },
  multiContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    flexWrap: "wrap",
  },
  progressItem: {
    margin: 10,
  },
  achievementContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  achievementCircle: {
    width: "100%",
    height: "100%",
    borderRadius: 1000,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  achievementIcon: {
    fontSize: 40,
    color: "white",
  },
});
