import { usePedometer } from "@/hooks/usePedometer";
import { audioSystem } from "@/lib/audioSystem";
import { calculateCO2Saved, updateDailyProgress } from "@/lib/gamification";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { RunningCamera } from "./RunningCamera";
import { ThemedText } from "./ThemedText";

const { width, height } = Dimensions.get("window");

interface WorkoutSessionProps {
  onSessionEnd?: (sessionData: WorkoutSessionData) => void;
  onClose?: () => void;
}

export interface WorkoutSessionData {
  duration: number; // seconds
  distance: number; // kilometers
  steps: number;
  pace: number; // minutes per km
  calories: number;
  co2Saved: number; // grams
  averageSpeed: number; // km/h
  route: {
    latitude: number;
    longitude: number;
    timestamp: Date;
    elevation?: number;
  }[];
  photos: string[];
  videos: string[];
  activityType: "running" | "walking" | "cycling";
}

type SessionState = "idle" | "active" | "paused" | "finished";

export const WorkoutSession: React.FC<WorkoutSessionProps> = ({
  onSessionEnd,
  onClose,
}) => {
  const { currentStepCount } = usePedometer();
  const [sessionState, setSessionState] = useState<SessionState>("idle");
  const [sessionData, setSessionData] = useState<WorkoutSessionData>({
    duration: 0,
    distance: 0,
    steps: 0,
    pace: 0,
    calories: 0,
    co2Saved: 0,
    averageSpeed: 0,
    route: [],
    photos: [],
    videos: [],
    activityType: "running",
  });

  const [showCamera, setShowCamera] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [lastStepCount, setLastStepCount] = useState(0);
  const [locationSubscription, setLocationSubscription] =
    useState<Location.LocationSubscription | null>(null);
  const [isTrackingLocation, setIsTrackingLocation] = useState(false);

  // Animation refs
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const sessionTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    startPulseAnimation();
    return () => {
      stopSession();
    };
  }, []);

  useEffect(() => {
    if (sessionState === "active") {
      startTimer();
      startLocationTracking();
    } else {
      stopTimer();
      stopLocationTracking();
    }

    return () => {
      stopTimer();
      stopLocationTracking();
    };
  }, [sessionState]);

  useEffect(() => {
    if (sessionState === "active" && currentStepCount > lastStepCount) {
      const newSteps = currentStepCount - lastStepCount;
      updateSessionSteps(newSteps);
    }
  }, [currentStepCount, sessionState]);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startTimer = () => {
    sessionTimer.current = setInterval(() => {
      setSessionData((prev) => ({
        ...prev,
        duration: prev.duration + 1,
      }));
    }, 1000);
  };

  const stopTimer = () => {
    if (sessionTimer.current) {
      clearInterval(sessionTimer.current);
      sessionTimer.current = null;
    }
  };

  const startLocationTracking = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission denied",
          "Location access is required for workout tracking"
        );
        return;
      }

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 2000, // Update every 2 seconds
          distanceInterval: 5, // Update every 5 meters
        },
        (location) => {
          const newPoint = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            timestamp: new Date(),
            elevation: location.coords.altitude || undefined,
          };

          setSessionData((prev) => {
            const newRoute = [...prev.route, newPoint];
            const newDistance = calculateRouteDistance(newRoute);
            const newPace = calculatePace(newDistance, prev.duration);
            const newSpeed = calculateSpeed(newDistance, prev.duration);

            return {
              ...prev,
              route: newRoute,
              distance: newDistance,
              pace: newPace,
              averageSpeed: newSpeed,
            };
          });
        }
      );

      setLocationSubscription(subscription);
      setIsTrackingLocation(true);
    } catch (error) {
      console.error("Error starting location tracking:", error);
      Alert.alert("Error", "Failed to start location tracking");
    }
  };

  const stopLocationTracking = () => {
    if (locationSubscription) {
      locationSubscription.remove();
      setLocationSubscription(null);
    }
    setIsTrackingLocation(false);
  };

  const calculateRouteDistance = (
    route: { latitude: number; longitude: number }[]
  ) => {
    if (route.length < 2) return 0;

    let totalDistance = 0;
    for (let i = 1; i < route.length; i++) {
      const prev = route[i - 1];
      const curr = route[i];

      // Haversine formula
      const R = 6371; // Earth's radius in km
      const dLat = ((curr.latitude - prev.latitude) * Math.PI) / 180;
      const dLon = ((curr.longitude - prev.longitude) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((prev.latitude * Math.PI) / 180) *
          Math.cos((curr.latitude * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      totalDistance += R * c;
    }

    return totalDistance;
  };

  const calculatePace = (distance: number, duration: number) => {
    if (distance === 0) return 0;
    return duration / 60 / distance; // minutes per km
  };

  const calculateSpeed = (distance: number, duration: number) => {
    if (duration === 0) return 0;
    return distance / (duration / 3600); // km/h
  };

  const calculateCalories = (
    steps: number,
    duration: number,
    weight: number = 70
  ) => {
    // Rough calculation: 0.04 calories per step + duration factor
    const stepCalories = steps * 0.04;
    const timeCalories = (duration / 60) * 8; // 8 calories per minute of activity
    return Math.round(stepCalories + timeCalories);
  };

  const updateSessionSteps = (newSteps: number) => {
    setSessionData((prev) => {
      const totalSteps = prev.steps + newSteps;
      const calories = calculateCalories(totalSteps, prev.duration);
      const co2Saved = calculateCO2Saved(totalSteps);

      return {
        ...prev,
        steps: totalSteps,
        calories,
        co2Saved,
      };
    });
  };

  const startSession = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await audioSystem.playMotivationalSound("high_activity");

      setStartTime(new Date());
      setLastStepCount(currentStepCount);
      setSessionState("active");

      // Provide audio coaching
      await audioSystem.speakCoachingMessage(
        "Workout started! Let's make this an amazing eco-friendly session!"
      );
    } catch (error) {
      console.error("Error starting session:", error);
    }
  };

  const pauseSession = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setSessionState("paused");

      await audioSystem.speakCoachingMessage("Workout paused. Take your time!");
    } catch (error) {
      console.error("Error pausing session:", error);
    }
  };

  const resumeSession = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setSessionState("active");

      await audioSystem.speakCoachingMessage(
        "Back to action! You've got this!"
      );
    } catch (error) {
      console.error("Error resuming session:", error);
    }
  };

  const stopSession = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setSessionState("finished");

      // Save progress to storage
      await updateDailyProgress(sessionData.steps);

      // Provide completion feedback
      await audioSystem.playAchievementSound("steps");
      await audioSystem.speakCoachingMessage(
        `Amazing workout! You completed ${sessionData.distance.toFixed(
          2
        )} kilometers and saved ${sessionData.co2Saved}g of CO2!`
      );

      onSessionEnd?.(sessionData);
    } catch (error) {
      console.error("Error stopping session:", error);
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const formatPace = (pace: number): string => {
    const minutes = Math.floor(pace);
    const seconds = Math.round((pace - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handlePhotoTaken = (photoUri: string) => {
    setSessionData((prev) => ({
      ...prev,
      photos: [...prev.photos, photoUri],
    }));
  };

  const handleVideoRecorded = (videoUri: string) => {
    setSessionData((prev) => ({
      ...prev,
      videos: [...prev.videos, videoUri],
    }));
  };

  const getSessionColor = () => {
    switch (sessionState) {
      case "active":
        return "#4CAF50";
      case "paused":
        return "#FF9800";
      case "finished":
        return "#2196F3";
      default:
        return "#757575";
    }
  };

  const getMainActionButton = () => {
    console.log("getMainActionButton called with sessionState:", sessionState);
    switch (sessionState) {
      case "idle":
        console.log("Rendering idle (start) button");
        return (
          <Animated.View
            style={[
              styles.actionButtonContainer,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#4CAF50" }]}
              onPress={startSession}
            >
              <Ionicons name="play" size={32} color="white" />
            </TouchableOpacity>
          </Animated.View>
        );
      case "active":
        return (
          <View style={styles.activeControls}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#FF9800" }]}
              onPress={pauseSession}
            >
              <Ionicons name="pause" size={32} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#f44336" }]}
              onPress={stopSession}
            >
              <Ionicons name="stop" size={32} color="white" />
            </TouchableOpacity>
          </View>
        );
      case "paused":
        return (
          <View style={styles.pausedControls}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#4CAF50" }]}
              onPress={resumeSession}
            >
              <Ionicons name="play" size={32} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#f44336" }]}
              onPress={stopSession}
            >
              <Ionicons name="stop" size={32} color="white" />
            </TouchableOpacity>
          </View>
        );
      case "finished":
        return (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#2196F3" }]}
            onPress={onClose}
          >
            <Ionicons name="checkmark" size={32} color="white" />
          </TouchableOpacity>
        );
    }
  };

  return (
    <LinearGradient
      colors={["#1a1a2e", "#16213e", "#0f3460"]}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>
          {sessionState === "idle"
            ? "Ready to Run?"
            : sessionState === "active"
            ? "Running"
            : sessionState === "paused"
            ? "Paused"
            : "Completed"}
        </ThemedText>
        <TouchableOpacity
          style={styles.cameraButton}
          onPress={() => {
            // Only toggle camera when session is active to prevent audio triggers
            console.log(
              "Camera button pressed, sessionState:",
              sessionState,
              "showCamera:",
              showCamera
            );
            if (sessionState === "active") {
              setShowCamera(!showCamera);
              console.log("Camera toggled to:", !showCamera);
            } else {
              console.log("Cannot open camera - session not active");
            }
          }}
          disabled={sessionState !== "active"}
        >
          <Ionicons
            name="camera"
            size={24}
            color={sessionState === "active" ? "white" : "#666"}
          />
        </TouchableOpacity>
      </View>

      {/* Stats Display */}
      <View style={styles.statsContainer}>
        <View style={styles.primaryStats}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>
              {formatDuration(sessionData.duration)}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Duration</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>
              {sessionData.distance.toFixed(2)}
            </ThemedText>
            <ThemedText style={styles.statLabel}>km</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>
              {sessionData.pace > 0 ? formatPace(sessionData.pace) : "--:--"}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Pace</ThemedText>
          </View>
        </View>

        <View style={styles.secondaryStats}>
          <View style={styles.statCard}>
            <Ionicons name="footsteps" size={24} color="#4CAF50" />
            <ThemedText style={styles.cardValue}>
              {sessionData.steps.toLocaleString()}
            </ThemedText>
            <ThemedText style={styles.cardLabel}>Steps</ThemedText>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="flame" size={24} color="#FF5722" />
            <ThemedText style={styles.cardValue}>
              {sessionData.calories}
            </ThemedText>
            <ThemedText style={styles.cardLabel}>Calories</ThemedText>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="leaf" size={24} color="#8BC34A" />
            <ThemedText style={styles.cardValue}>
              {sessionData.co2Saved}g
            </ThemedText>
            <ThemedText style={styles.cardLabel}>CO₂ Saved</ThemedText>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="speedometer" size={24} color="#2196F3" />
            <ThemedText style={styles.cardValue}>
              {sessionData.averageSpeed.toFixed(1)}
            </ThemedText>
            <ThemedText style={styles.cardLabel}>km/h</ThemedText>
          </View>
        </View>
      </View>

      {/* Action Controls */}
      <View style={styles.controlsContainer}>{getMainActionButton()}</View>

      {/* Status Indicators */}
      <View style={styles.statusContainer}>
        <View
          style={[
            styles.statusIndicator,
            { backgroundColor: getSessionColor() },
          ]}
        >
          <Ionicons
            name={isTrackingLocation ? "location" : "location-outline"}
            size={16}
            color="white"
          />
          <ThemedText style={styles.statusText}>
            {isTrackingLocation ? "GPS Active" : "GPS Inactive"}
          </ThemedText>
        </View>

        {sessionData.photos.length > 0 && (
          <View style={styles.statusIndicator}>
            <Ionicons name="camera" size={16} color="white" />
            <ThemedText style={styles.statusText}>
              {sessionData.photos.length} Photos
            </ThemedText>
          </View>
        )}

        {sessionData.videos.length > 0 && (
          <View style={styles.statusIndicator}>
            <Ionicons name="videocam" size={16} color="white" />
            <ThemedText style={styles.statusText}>
              {sessionData.videos.length} Videos
            </ThemedText>
          </View>
        )}
      </View>

      {/* Camera Overlay */}
      {(() => {
        console.log(
          "Camera overlay check - showCamera:",
          showCamera,
          "sessionState:",
          sessionState
        );
        return (
          showCamera &&
          sessionState === "active" && (
            <RunningCamera
              isActive={showCamera}
              onPhotoTaken={handlePhotoTaken}
              onVideoRecorded={handleVideoRecorded}
              onClose={() => {
                console.log("Camera closing");
                setShowCamera(false);
              }}
              activityData={{
                steps: sessionData.steps,
                distance: sessionData.distance,
                pace: sessionData.pace,
                duration: sessionData.duration,
              }}
            />
          )
        );
      })()}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  cameraButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  statsContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  primaryStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 40,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
  },
  statLabel: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    marginTop: 5,
  },
  secondaryStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    width: "48%",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 15,
    padding: 15,
    alignItems: "center",
    marginBottom: 15,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginTop: 5,
  },
  cardLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },
  controlsContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  actionButtonContainer: {
    alignItems: "center",
  },
  actionButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  activeControls: {
    flexDirection: "row",
    gap: 30,
  },
  pausedControls: {
    flexDirection: "row",
    gap: 30,
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    marginBottom: 30,
    gap: 10,
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusText: {
    fontSize: 12,
    color: "white",
    marginLeft: 5,
  },
});
