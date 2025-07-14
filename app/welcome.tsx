import { getIcon } from "@/lib/icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      {/* Top curved section - light */}
      <View style={styles.topSection}>
        <View style={styles.decorativeIcons}>
          <View style={styles.iconLeft}>
            {getIcon("walk", { size: 32, color: "#2D5A5A" })}
          </View>
          <View style={styles.iconRight}>
            {getIcon("walk", { size: 28, color: "#2D5A5A" })}
          </View>
        </View>

        <View style={styles.centerIcon}>
          {getIcon("runner", { size: 48, color: "#2D5A5A" })}
        </View>
      </View>

      {/* Bottom curved section - dark green */}
      <LinearGradient
        colors={["#2D5A5A", "#1A4040"]}
        style={styles.bottomSection}
      >
        <View style={styles.contentContainer}>
          <Text style={styles.title}>GreenSteps !</Text>
          <Text style={styles.subtitle}>The earth is in your hands..</Text>

          <Link href="/auth" asChild>
            <TouchableOpacity style={styles.registerButton}>
              <Text style={styles.buttonText}>Register</Text>
              <View style={styles.buttonIcon}>
                {getIcon("runner", { size: 20, color: "#2D5A5A" })}
              </View>
            </TouchableOpacity>
          </Link>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fffe",
  },
  topSection: {
    flex: 1,
    backgroundColor: "#f8fffe",
    position: "relative",
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
  },
  decorativeIcons: {
    position: "absolute",
    top: 120,
    left: 0,
    right: 0,
    height: 200,
  },
  iconLeft: {
    position: "absolute",
    top: 60,
    left: 40,
  },
  iconRight: {
    position: "absolute",
    top: 20,
    right: 50,
  },
  centerIcon: {
    position: "absolute",
    bottom: 60,
    left: "50%",
    marginLeft: -24, // Half of icon size
  },
  bottomSection: {
    flex: 1,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    marginTop: -60,
    paddingTop: 80,
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#B8E6E1",
    marginBottom: 60,
    textAlign: "center",
  },
  registerButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2D5A5A",
  },
  buttonIcon: {
    // Icon styling handled by getIcon
  },
});
