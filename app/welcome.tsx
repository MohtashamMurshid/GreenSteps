import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Link } from "expo-router";
import React from "react";
import { Button, StyleSheet } from "react-native";

export default function WelcomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Welcome to GreenSteps!</ThemedText>
      <ThemedText>
        Your journey to a healthier planet and a healthier you starts here.
      </ThemedText>
      <Link href="/auth" asChild>
        <Button title="Get Started" />
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    gap: 16,
  },
});
