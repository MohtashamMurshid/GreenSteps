import {
  WorkoutSession,
  WorkoutSessionData,
} from "@/components/WorkoutSession";
import { audioSystem } from "@/lib/audioSystem";
import { processAchievements, updateDailyProgress } from "@/lib/gamification";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import { SafeAreaView, StyleSheet } from "react-native";

export default function RunningScreen() {
  const [isSessionActive, setIsSessionActive] = useState(false);

  console.log("🏃 RunningScreen component loaded!");

  const handleSessionEnd = async (sessionData: WorkoutSessionData) => {
    try {
      // Update daily progress
      await updateDailyProgress(sessionData.steps);

      // Check for achievements
      await processAchievements(sessionData.steps, 10000); // assuming 10k goal

      // Play completion sound
      await audioSystem.playAchievementSound("goal");

      // Navigate back to home with session data
      router.push({
        pathname: "/(tabs)",
        params: {
          sessionCompleted: "true",
          sessionData: JSON.stringify({
            duration: sessionData.duration,
            distance: sessionData.distance,
            steps: sessionData.steps,
            calories: sessionData.calories,
            co2Saved: sessionData.co2Saved,
          }),
        },
      });
    } catch (error) {
      console.error("Error handling session end:", error);
      router.push("/(tabs)");
    }
  };

  const handleClose = () => {
    router.push("/(tabs)");
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#1a1a2e", "#16213e", "#0f3460"]}
        style={styles.gradient}
      >
        <WorkoutSession onSessionEnd={handleSessionEnd} onClose={handleClose} />
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
  gradient: {
    flex: 1,
  },
});
