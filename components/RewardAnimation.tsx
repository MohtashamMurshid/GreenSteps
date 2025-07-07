import { LinearGradient } from 'expo-linear-gradient';
import LottieView from "lottie-react-native";
import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

interface RewardAnimationProps {
  visible: boolean;
  type: "greenpoints" | "badge" | "goal";
  points?: number;
  message?: string;
  onComplete?: () => void;
}

const { width, height } = Dimensions.get("window");

export const RewardAnimation: React.FC<RewardAnimationProps> = ({
  visible,
  type,
  points,
  message,
  onComplete,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const lottieRef = useRef<LottieView>(null);

  useEffect(() => {
    if (visible) {
      // Start animation sequence
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();

      // Play Lottie animation
      if (lottieRef.current) {
        lottieRef.current.play();
      }

      // Auto hide after 3 seconds (increased for Lottie)
      const timer = setTimeout(() => {
        hideAnimation();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideAnimation = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.5,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onComplete) onComplete();
    });
  };

  const getLottieSource = () => {
    // For now, we'll return undefined and use fallback animations
    // In a real app, you'd load these from JSON files
    try {
      switch (type) {
        case "greenpoints":
          // return require("../assets/animations/greenpoints.json");
          return undefined; // Use fallback for now
        case "badge":
          // return require("../assets/animations/badge.json");
          return undefined; // Use fallback for now
        case "goal":
          // return require("../assets/animations/goal.json");
          return undefined; // Use fallback for now
        default:
          return undefined;
      }
    } catch (error) {
      console.log("Lottie animation file not found, using fallback");
      return undefined;
    }
  };

  const getIcon = () => {
    switch (type) {
      case "greenpoints":
        return "🌱";
      case "badge":
        return "🏆";
      case "goal":
        return "🎯";
      default:
        return "✨";
    }
  };

  const getMessage = () => {
    if (message) return message;

    switch (type) {
      case "greenpoints":
        return `+${points || 0} GreenPoints!`;
      case "badge":
        return "New Badge Earned!";
      case "goal":
        return "Goal Completed!";
      default:
        return "Great job!";
    }
  };

  const getContainerStyle = () => {
    switch (type) {
      case "greenpoints":
        return [styles.content, styles.greenpointsContent];
      case "badge":
        return [styles.content, styles.badgeContent];
      case "goal":
        return [styles.content, styles.goalContent];
      default:
        return styles.content;
    }
  };

  if (!visible) return null;

  return (
    <LinearGradient colors={['#162447', '#1f4068']} style={styles.overlay}>
      <Animated.View
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
          },
        ]}
      >
        <ThemedView style={getContainerStyle()}>
          {/* Lottie Animation or Fallback */}
          <View style={styles.lottieContainer}>
            {getLottieSource() ? (
              <LottieView
                ref={lottieRef}
                style={styles.lottieAnimation}
                source={getLottieSource()}
                autoPlay={false}
                loop={false}
                speed={1.2}
              />
            ) : (
              <ThemedText style={styles.iconFallback}>{getIcon()}</ThemedText>
            )}
          </View>

          <ThemedText type="title" style={styles.message}>
            {getMessage()}
          </ThemedText>

          {type === "greenpoints" && (
            <ThemedText style={styles.subtitle}>
              Keep it up! Every step counts! 🌍
            </ThemedText>
          )}

          {type === "badge" && (
            <ThemedText style={styles.subtitle}>
              You&apos;re making a difference! 🌟
            </ThemedText>
          )}

          {type === "goal" && (
            <ThemedText style={styles.subtitle}>
              Amazing achievement! 🎉
            </ThemedText>
          )}

          {/* Particle effect overlay */}
          <View style={styles.particleOverlay}>
            <ThemedText style={styles.particle}>✨</ThemedText>
            <ThemedText style={styles.particle}>🌟</ThemedText>
            <ThemedText style={styles.particle}>💫</ThemedText>
          </View>
        </ThemedView>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  container: {
    margin: 20,
  },
  content: {
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    minWidth: width * 0.7,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
    position: "relative",
  },
  greenpointsContent: {
    backgroundColor: '#1976D2', // blue
  },
  badgeContent: {
    backgroundColor: '#1565C0', // blue
  },
  goalContent: {
    backgroundColor: '#4FC3F7', // blue accent
  },
  lottieContainer: {
    position: "relative",
    marginBottom: 10,
  },
  lottieAnimation: {
    width: 80,
    height: 80,
  },
  fallbackIcon: {
    position: "absolute",
    top: 16,
    left: 16,
    fontSize: 48,
    opacity: 0, // Hidden by default, show if Lottie fails
  },
  iconFallback: {
    fontSize: 48,
    marginBottom: 10,
  },
  message: {
    color: "white",
    textAlign: "center",
    marginBottom: 8,
    fontSize: 24,
    fontWeight: "bold",
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    fontSize: 16,
  },
  particleOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: "none",
  },
  particle: {
    position: "absolute",
    fontSize: 20,
    color: "rgba(255, 255, 255, 0.8)",
  },
});
