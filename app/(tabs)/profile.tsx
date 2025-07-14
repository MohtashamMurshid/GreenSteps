import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";

interface InfoFieldProps {
  label: string;
  value: string;
  onEdit?: () => void;
}

const InfoField = ({ label, value, onEdit }: InfoFieldProps) => (
  <View style={styles.infoField}>
    <View>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <ThemedText style={styles.value}>{value}</ThemedText>
    </View>
    {onEdit && (
      <TouchableOpacity onPress={onEdit} style={styles.editButton}>
        <ThemedText style={styles.editText}>Edit</ThemedText>
      </TouchableOpacity>
    )}
  </View>
);

interface GoalFieldProps {
  icon: string;
  label: string;
  value: string | number;
}

const GoalField = ({ icon, label, value }: GoalFieldProps) => (
  <View style={styles.goalField}>
    <Ionicons
      name={icon as any}
      size={24}
      color="#fff"
      style={styles.goalIcon}
    />
    <View>
      <ThemedText style={styles.goalLabel}>{label}</ThemedText>
      <ThemedText style={styles.goalValue}>{value}</ThemedText>
    </View>
  </View>
);

export default function ProfileScreen() {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require("../../assets/images/adaptive-icon.png")}
          style={styles.profileImage}
        />
        <ThemedText style={styles.profileTitle}>Profile</ThemedText>
      </View>

      <View style={styles.content}>
        <InfoField label="Full Name" value="AYAAN IZHAR" onEdit={() => {}} />
        <InfoField
          label="Email"
          value="0360951@sd.taylors.edu.my"
          onEdit={() => {}}
        />
        <InfoField
          label="Phone Number"
          value="+60 123829278"
          onEdit={() => {}}
        />
        <InfoField label="Password" value="**************" onEdit={() => {}} />

        <View style={styles.personalInfoSection}>
          <ThemedText style={styles.sectionTitle}>Personal Info</ThemedText>
          <View style={styles.goalsContainer}>
            <View style={styles.goalRow}>
              <GoalField icon="body-outline" label="Height" value="178 cm" />
              <GoalField
                icon="fitness-outline"
                label="Activity"
                value="Average"
              />
            </View>
            <View style={styles.goalRow}>
              <GoalField
                icon="flame-outline"
                label="Calorie goal"
                value="500"
              />
              <GoalField
                icon="footsteps-outline"
                label="Steps goal"
                value="8000"
              />
            </View>
          </View>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1C1C1E",
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  profileTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  infoField: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#2C2C2E",
    borderRadius: 15,
    padding: 16,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
  },
  editButton: {
    padding: 8,
  },
  editText: {
    color: "#0A84FF",
    fontSize: 16,
  },
  personalInfoSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  goalsContainer: {
    gap: 12,
  },
  goalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  goalField: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2C2C2E",
    borderRadius: 15,
    padding: 16,
    gap: 12,
  },
  goalIcon: {
    backgroundColor: "#3A3A3C",
    padding: 8,
    borderRadius: 8,
  },
  goalLabel: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 4,
  },
  goalValue: {
    fontSize: 16,
    fontWeight: "500",
  },
});
