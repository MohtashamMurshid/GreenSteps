import { Badge as BadgeType } from "@/lib/gamification";
import React from "react";
import { StyleSheet } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

type BadgeProps = {
  badge: BadgeType;
};

export default function Badge({ badge }: BadgeProps) {
  return (
    <ThemedView
      style={[styles.container, { opacity: badge.achieved ? 1 : 0.5 }]}
    >
      <ThemedText style={styles.name}>{badge.name}</ThemedText>
      <ThemedText>{badge.description}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  name: {
    fontWeight: "bold",
    marginBottom: 4,
  },
});
