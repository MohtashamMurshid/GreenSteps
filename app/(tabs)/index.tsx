import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

import Badge from "@/components/Badge";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { usePedometer } from "@/hooks/usePedometer";
import {
  Badge as BadgeType,
  checkAndAwardBadges,
  getBadgesStatus,
} from "@/lib/gamification";
import { getStepGoal } from "@/lib/storage";

export default function HomeScreen() {
  const { currentStepCount, isPedometerAvailable } = usePedometer();
  const [dailyGoal, setDailyGoal] = useState(10000);
  const [badges, setBadges] = useState<BadgeType[]>([]);

  const progress =
    dailyGoal > 0 ? Math.min(currentStepCount / dailyGoal, 1) : 0;

  useEffect(() => {
    // Load daily goal from storage
    const loadGoal = async () => {
      const savedGoal = await getStepGoal();
      if (savedGoal) {
        setDailyGoal(savedGoal);
      }
    };

    // Load and update badges
    const updateBadges = async () => {
      if (currentStepCount > 0) {
        await checkAndAwardBadges(currentStepCount);
      }
      const badgeStatus = await getBadgesStatus();
      setBadges(badgeStatus);
    };

    loadGoal();
    updateBadges();
  }, [currentStepCount]);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Dashboard</ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Today&apos;s Steps</ThemedText>
        {isPedometerAvailable ? (
          <>
            <ThemedText style={styles.stepCount}>{currentStepCount}</ThemedText>
            <View style={styles.progressContainer}>
              <View
                style={[styles.progressBar, { width: `${progress * 100}%` }]}
              />
            </View>
            <ThemedText>Goal: {dailyGoal} steps</ThemedText>
            {progress >= 1 && (
              <ThemedText style={styles.goalCompleted}>
                🎉 Goal completed!
              </ThemedText>
            )}
          </>
        ) : (
          <ThemedText>Pedometer not available on this device</ThemedText>
        )}
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Badges</ThemedText>
        {badges.length > 0 ? (
          badges.map((badge) => <Badge key={badge.id} badge={badge} />)
        ) : (
          <ThemedText>
            No badges earned yet. Keep walking to unlock them!
          </ThemedText>
        )}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 16,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  stepCount: {
    fontSize: 48,
    fontWeight: "bold",
  },
  progressContainer: {
    height: 20,
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#4caf50",
  },
  goalCompleted: {
    color: "#4caf50",
    fontWeight: "bold",
    fontSize: 16,
  },
});
