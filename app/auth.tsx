import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Link } from "expo-router";
import React from "react";
import { Button, StyleSheet, Text, TextInput } from "react-native";

export default function AuthScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Sign Up or Log In</ThemedText>
      <ThemedText>Enter your details below to continue.</ThemedText>
      <TextInput placeholder="Email" style={styles.input} />
      <TextInput placeholder="Password" style={styles.input} secureTextEntry />
      <Button title="Sign Up" onPress={() => {}} />
      <Text>or</Text>
      <Button title="Log In" onPress={() => {}} />
      <Link href="/goal" asChild>
        <Button title="Continue (temp)" />
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
  input: {
    height: 40,
    width: "80%",
    borderColor: "gray",
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
});
