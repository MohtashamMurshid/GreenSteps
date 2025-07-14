import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { audioSystem } from "@/lib/audioSystem";

const InfoCard = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: any;
}) => (
  <BlurView intensity={30} tint="dark" style={[styles.card, style]}>
    {children}
  </BlurView>
);

const DailyRewardsCard = () => (
  <InfoCard>
    <View style={styles.cardContent}>
      <View>
        <ThemedText style={styles.cardTitle}>Daily Rewards</ThemedText>
        <ThemedText style={styles.cardSubtitle}>Earn points</ThemedText>
      </View>
      <TouchableOpacity style={styles.claimButton}>
        <MaterialIcons name="play-arrow" size={16} color="white" />
        <Text style={styles.claimButtonText}>Claim</Text>
      </TouchableOpacity>
    </View>
  </InfoCard>
);

const InviteCard = () => (
  <InfoCard>
    <View style={styles.cardContent}>
      <ThemedText style={styles.cardTitle}>
        Invite a friend, get 5 points !
      </ThemedText>
      <TouchableOpacity style={styles.getButton}>
        <Text style={styles.getButtonText}>Get</Text>
        <FontAwesome5
          name="coins"
          size={12}
          color="gold"
          style={{ marginHorizontal: 2 }}
        />
        <Text style={styles.getButtonText}>5</Text>
      </TouchableOpacity>
    </View>
  </InfoCard>
);

const BoostCard = () => {
  const handlePress = async () => {
    await audioSystem.provideMotivationalCoaching(0, 10000, 1230);
  };

  return (
    <InfoCard>
      <View style={styles.cardContent}>
        <ThemedText style={styles.cardTitle}>
          Boost 2x <FontAwesome5 name="rocket" size={16} color="#FF9500" />
        </ThemedText>
        <TouchableOpacity style={styles.claimButton} onPress={handlePress}>
          <MaterialIcons name="play-arrow" size={16} color="white" />
          <Text style={styles.claimButtonText}>Claim</Text>
        </TouchableOpacity>
      </View>
    </InfoCard>
  );
};

export default function HomeScreen() {
  const [greenPoints, setGreenPoints] = useState(1230);

  useEffect(() => {
    audioSystem.initialize();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <FontAwesome5 name="walking" size={28} color={Colors.dark.text} />
          <View style={styles.pointsContainer}>
            <ThemedText style={styles.pointsText}>Points</ThemedText>
            <FontAwesome5 name="coins" size={16} color="gold" />
            <ThemedText style={styles.pointsValue}>{greenPoints}</ThemedText>
          </View>
        </View>

        <View style={styles.stepsContainer}>
          <ThemedText style={styles.stepsCount}>- - -</ThemedText>
          <ThemedText style={styles.stepsToday}>STEPS TODAY</ThemedText>
        </View>

        <InviteCard />
        <DailyRewardsCard />
        <BoostCard />
      </ScrollView>
      <View style={styles.cyclingTab}>
        <Text style={styles.cyclingTabText}>CYCLING</Text>
      </View>
      <TouchableOpacity
        style={styles.cameraButton}
        onPress={() => router.push("/running")}
      >
        <MaterialIcons name="photo-camera" size={32} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.black,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 150,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 50,
  },
  pointsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pointsText: {
    fontSize: 18,
    color: Colors.dark.gray,
  },
  pointsValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.dark.text,
  },
  stepsContainer: {
    alignItems: "center",
    marginBottom: 50,
  },
  stepsCount: {
    fontSize: 88,
    fontWeight: "200",
    color: Colors.dark.text,
    letterSpacing: 4,
  },
  stepsToday: {
    fontSize: 16,
    color: Colors.dark.gray,
    marginTop: 10,
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  card: {
    borderRadius: 22,
    overflow: "hidden",
    marginBottom: 16,
    padding: 22,
    backgroundColor: "rgba(30, 30, 30, 0.5)",
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 50,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.dark.text,
  },
  cardSubtitle: {
    fontSize: 16,
    color: Colors.dark.gray,
    marginTop: 4,
  },
  claimButton: {
    backgroundColor: "black",
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  claimButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  getButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "black",
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 25,
  },
  getButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  cyclingTab: {
    position: "absolute",
    left: -30,
    top: "28%",
    backgroundColor: Colors.dark.cardOpaque,
    transform: [{ rotate: "-90deg" }],
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  cyclingTabText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  cameraButton: {
    position: "absolute",
    bottom: 100,
    alignSelf: "center",
    backgroundColor: "black",
    borderRadius: 40,
    width: 70,
    height: 70,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.2)",
  },
});
