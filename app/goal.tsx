import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useRouter } from "expo-router";
import React from "react";
import { Button, StyleSheet, TextInput } from "react-native";

export default function GoalScreen() {
  const router = useRouter();
  const [goal, setGoal] = React.useState("");

  const handleSetGoal = () => {
    // Here we would save the goal to local storage
    console.log("Step goal:", goal);
    // Navigate to the main app
    router.replace("/(tabs)");
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Set Your Daily Step Goal</ThemedText>
      <TextInput
        style={styles.input}
        onChangeText={setGoal}
        value={goal}
        placeholder="e.g., 10000"
        keyboardType="numeric"
      />
      <Button title="Set Goal and Start" onPress={handleSetGoal} />
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
  input: {
    height: 40,
    width: "80%",
    borderColor: "gray",
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
});
