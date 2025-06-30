import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

// This is a placeholder for the real hook.
const usePedometer = () => ({
  currentStepCount: 5432,
  isPedometerAvailable: true,
});

// This is a placeholder for the real goal.
const dailyGoal = 10000;

export default function HomeScreen() {
  const { currentStepCount } = usePedometer();
  const progress = dailyGoal > 0 ? currentStepCount / dailyGoal : 0;

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
        <ThemedText style={styles.stepCount}>{currentStepCount}</ThemedText>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
        </View>
        <ThemedText>Goal: {dailyGoal} steps</ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Badges</ThemedText>
        <ThemedText>
          You&apos;ve earned the &quot;1,000 Steps&quot; badge! Keep it up!
        </ThemedText>
        {/* Placeholder for Badge components */}
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
});
