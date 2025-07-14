import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Colors } from "@/constants/Colors";
import { usePedometer } from "@/hooks/usePedometer";
import { AudioSystem } from "@/lib/audioSystem";
import { CameraView } from "expo-camera";

type SessionState = "idle" | "active" | "paused";

const StatCard = ({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) => (
  <View style={styles.statCard}>
    {icon}
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

export default function RunningScreen() {
  const { currentStepCount } = usePedometer();
  const [sessionState, setSessionState] = useState<SessionState>("idle");
  const [showCamera, setShowCamera] = useState(false);
  const audioSystem = useRef<AudioSystem>(AudioSystem.getInstance());

  // Session Data
  const [duration, setDuration] = useState(0);
  const [distance, setDistance] = useState(0);
  const [steps, setSteps] = useState(0);
  const [calories, setCalories] = useState(0);
  const [co2Saved, setCo2Saved] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [pace, setPace] = useState(0);

  // Tracking Refs and State
  const sessionTimer = useRef<any>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(
    null
  );
  const lastStepCount = useRef(0);
  const route = useRef<Location.LocationObject[]>([]);
  const [isGpsActive, setIsGpsActive] = useState(false);

  // Request permissions on mount
  useEffect(() => {
    (async () => {
      await Location.requestForegroundPermissionsAsync();
    })();
  }, []);

  // Initialize audio system
  useEffect(() => {
    audioSystem.current.initialize();
    return () => {
      audioSystem.current.cleanup();
    };
  }, []);

  // Main timer effect with audio feedback
  useEffect(() => {
    if (sessionState === "active") {
      startTimer();
      startLocationTracking();
      lastStepCount.current = currentStepCount;
      audioSystem.current.speakCoachingMessage(
        "Session started. Let's make a difference!"
      );
    } else if (sessionState === "paused") {
      stopTimer();
      stopLocationTracking();
      audioSystem.current.speakCoachingMessage(
        "Session paused. Take a breather!"
      );
    }
    return () => {
      stopTimer();
      stopLocationTracking();
    };
  }, [sessionState]);

  // Pedometer effect with achievements
  useEffect(() => {
    if (sessionState === "active") {
      const newSteps = currentStepCount - lastStepCount.current;
      if (newSteps > 0) {
        setSteps((prev) => prev + newSteps);
        setCalories((prev) => prev + newSteps * 0.04);
        setCo2Saved((prev) => prev + newSteps * 0.08);

        // Play achievement sounds for milestones
        if (steps + newSteps >= 1000 && steps < 1000) {
          audioSystem.current.playAchievementSound("steps");
          audioSystem.current.speakCoachingMessage(
            "Amazing! You've reached 1000 steps!"
          );
        }

        // Update activity level for adaptive feedback
        audioSystem.current.updateActivityLevel(newSteps, 1);
      }
      lastStepCount.current = currentStepCount;
    }
  }, [currentStepCount]);

  const startTimer = () => {
    if (sessionTimer.current) clearInterval(sessionTimer.current);
    sessionTimer.current = setInterval(() => setDuration((d) => d + 1), 1000);
  };

  const stopTimer = () => {
    if (sessionTimer.current) {
      clearInterval(sessionTimer.current);
      sessionTimer.current = null;
    }
  };

  const startLocationTracking = async () => {
    const { granted } = await Location.getForegroundPermissionsAsync();
    if (!granted) {
      Alert.alert("Permission Denied", "Enable location to track your run.");
      return;
    }
    setIsGpsActive(true);
    locationSubscription.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 1000,
        distanceInterval: 10,
      },
      (location) => {
        route.current.push(location);
        const newDistance = calculateRouteDistance(route.current);
        const newSpeed = location.coords.speed
          ? location.coords.speed * 3.6
          : 0; // m/s to km/h
        const newPace = newSpeed > 0 ? 60 / newSpeed : 0; // min/km
        setDistance(newDistance);
        setSpeed(newSpeed);
        setPace(newPace);
      }
    );
  };

  const stopLocationTracking = () => {
    setIsGpsActive(false);
    if (locationSubscription.current) {
      locationSubscription.current.remove();
    }
  };

  const haversineDistance = (
    coords1: Location.LocationObject["coords"],
    coords2: Location.LocationObject["coords"]
  ) => {
    const toRad = (x: number) => (x * Math.PI) / 180;
    const R = 6371; // Earth radius in km

    const dLat = toRad(coords2.latitude - coords1.latitude);
    const dLon = toRad(coords2.longitude - coords1.longitude);
    const lat1 = toRad(coords1.latitude);
    const lat2 = toRad(coords2.latitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const calculateRouteDistance = (
    currentRoute: Location.LocationObject[]
  ): number => {
    if (currentRoute.length < 2) return 0;
    let totalDistance = 0;
    for (let i = 1; i < currentRoute.length; i++) {
      const prevCoords = currentRoute[i - 1].coords;
      const currCoords = currentRoute[i].coords;
      totalDistance += haversineDistance(prevCoords, currCoords);
    }
    return totalDistance;
  };

  const handleMainButtonPress = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (sessionState === "active") {
      setSessionState("paused");
      // Play achievement sound if good progress was made
      if (steps > 500) {
        await audioSystem.current.playAchievementSound("goal");
      }
    } else {
      setSessionState("active");
      // Start ambient nature sounds for the session
      await audioSystem.current.playAmbientSound("nature");
    }
  };

  const formatDuration = (s: number) =>
    new Date(s * 1000).toISOString().slice(14, 19);
  const formatPace = (p: number) =>
    p > 0 ? new Date(p * 60 * 1000).toISOString().slice(14, 19) : "--:--";

  if (showCamera) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <CameraView style={StyleSheet.absoluteFill} facing="back" />
          <TouchableOpacity
            style={styles.closeCameraButton}
            onPress={() => {
              setShowCamera(false);
              audioSystem.current.playAmbientSound("stop");
            }}
          >
            <Ionicons name="close-circle" size={40} color="white" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={async () => {
              await audioSystem.current.playAmbientSound("stop");
              router.back();
            }}
          >
            <Ionicons name="close-circle" size={30} color={Colors.dark.gray} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ready to Run?</Text>
          <TouchableOpacity onPress={() => setShowCamera(true)}>
            <Ionicons
              name="camera-outline"
              size={30}
              color={Colors.dark.gray}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.topStats}>
          <View style={styles.topStat}>
            <Text style={styles.topStatValue}>{formatDuration(duration)}</Text>
            <Text style={styles.topStatLabel}>Duration</Text>
          </View>
          <View style={styles.topStat}>
            <Text style={styles.topStatValue}>{distance.toFixed(2)}</Text>
            <Text style={styles.topStatLabel}>km</Text>
          </View>
          <View style={styles.topStat}>
            <Text style={styles.topStatValue}>{formatPace(pace)}</Text>
            <Text style={styles.topStatLabel}>Pace</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            icon={<Ionicons name="footsteps" size={24} color="#34C759" />}
            value={steps.toString()}
            label="Steps"
          />
          <StatCard
            icon={<Ionicons name="flame" size={24} color="#FF9500" />}
            value={calories.toFixed(0)}
            label="Calories"
          />
          <StatCard
            icon={<Ionicons name="leaf" size={24} color="#5856D6" />}
            value={`${co2Saved.toFixed(0)}g`}
            label="CO₂ Saved"
          />
          <StatCard
            icon={<Ionicons name="speedometer" size={24} color="#007AFF" />}
            value={speed.toFixed(1)}
            label="km/h"
          />
        </View>

        <View style={styles.bottomControls}>
          <TouchableOpacity
            style={styles.playButton}
            onPress={handleMainButtonPress}
          >
            <Ionicons
              name={sessionState === "active" ? "pause" : "play"}
              size={40}
              color="white"
            />
          </TouchableOpacity>
          <View style={styles.gpsIndicator}>
            <Ionicons
              name="location-sharp"
              size={14}
              color={isGpsActive ? "#34C759" : Colors.dark.gray}
            />
            <Text style={styles.gpsText}>
              {isGpsActive ? "GPS Active" : "GPS Inactive"}
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#121212",
  },
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingTop: Platform.OS === "android" ? 25 : 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.dark.text,
  },
  topStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 30,
  },
  topStat: {
    alignItems: "center",
    width: "30%",
  },
  topStatValue: {
    fontSize: 42,
    fontWeight: "200",
    color: Colors.dark.text,
  },
  topStatLabel: {
    fontSize: 14,
    color: Colors.dark.gray,
    marginTop: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 20,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#1C1C1E",
    borderRadius: 18,
    padding: 20,
    alignItems: "center",
    marginBottom: 15,
  },
  statValue: {
    fontSize: 30,
    fontWeight: "600",
    color: Colors.dark.text,
    marginTop: 10,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.dark.gray,
    marginTop: 5,
  },
  bottomControls: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 50 : 30,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#34C759",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
  },
  gpsIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1C1C1E",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  gpsText: {
    color: Colors.dark.gray,
    marginLeft: 8,
    fontSize: 14,
  },
  closeCameraButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 40,
    left: 20,
    zIndex: 1,
  },
});
