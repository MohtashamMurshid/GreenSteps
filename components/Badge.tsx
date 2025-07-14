import { Badge as BadgeType } from "@/lib/gamification";
import { getIcon } from "@/lib/icons";
import React from "react";
import { StyleSheet, View } from "react-native";
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
      <View style={styles.header}>
        {badge.icon &&
          getIcon(badge.icon as any, {
            size: 24,
            color: badge.achieved ? "#26D0CE" : "#666",
          })}
        <ThemedText style={styles.name}>{badge.name}</ThemedText>
      </View>
      <ThemedText style={styles.description}>{badge.description}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#2D5A5A",
    backgroundColor: "#4ECDC4",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  name: {
    fontWeight: "bold",
    color: "#2D5A5A",
  },
  description: {
    color: "#2D5A5A",
  },
});
