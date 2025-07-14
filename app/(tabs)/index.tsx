import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Colors } from "@/constants/Colors";
import { audioSystem } from "@/lib/audioSystem";

const InfoCard = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: any;
}) => <View style={[styles.card, style]}>{children}</View>;

const DailyRewardsCard = () => (
  <InfoCard>
    <View style={styles.cardContent}>
      <View>
        <Text style={styles.cardTitle}>Daily Rewards</Text>
        <Text style={styles.cardSubtitle}>Earn points</Text>
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
      <Text style={styles.cardTitle}>Inivte a friend, get 5 points !</Text>
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
        <Text style={styles.cardTitle}>
          Boost 2x <FontAwesome5 name="rocket" size={16} color="#FF9500" />
        </Text>
        <TouchableOpacity style={styles.claimButton} onPress={handlePress}>
          <MaterialIcons name="play-arrow" size={16} color="white" />
          <Text style={styles.claimButtonText}>Claim</Text>
        </TouchableOpacity>
      </View>
    </InfoCard>
  );
};

const StartRunningButton = () => {
  const handleStartRunning = () => {
    router.push("/running");
  };

  return (
    <TouchableOpacity
      style={styles.startRunningButton}
      onPress={handleStartRunning}
    >
      <FontAwesome5 name="play" size={20} color="black" />
      <Text style={styles.startRunningText}>Start Running</Text>
    </TouchableOpacity>
  );
};

export default function HomeScreen() {
  const [greenPoints, setGreenPoints] = useState(1230);
  const [stepsToday, setStepsToday] = useState(8432);

  useEffect(() => {
    audioSystem.initialize();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <FontAwesome5 name="walking" size={28} color={Colors.dark.text} />
          <View style={styles.pointsContainer}>
            <Text style={styles.pointsText}>Points</Text>
            <FontAwesome5 name="filter" size={16} color={Colors.dark.text} />
            <Text style={styles.pointsValue}>{greenPoints}</Text>
          </View>
        </View>

        <View style={styles.stepsContainer}>
          <Text style={styles.stepsCount}>{stepsToday.toLocaleString()}</Text>
          <Text style={styles.stepsToday}>steps today</Text>
        </View>

        <StartRunningButton />

        <InviteCard />
        <DailyRewardsCard />
        <BoostCard />
      </ScrollView>
      <View style={styles.cyclingTab}>
        <Text style={styles.cyclingTabText}>{"<<"}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.black,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 150,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  pointsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pointsText: {
    fontSize: 16,
    color: "#888888",
  },
  pointsValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  stepsContainer: {
    alignItems: "center",
    marginTop: 100,
    marginBottom: 80,
  },
  stepsCount: {
    fontSize: 88,
    fontWeight: "300",
    color: "#FFFFFF",
    letterSpacing: 2,
    textAlign: "center",
  },
  stepsToday: {
    fontSize: 16,
    color: "#888888",
    marginTop: 10,
    letterSpacing: 2,
    textAlign: "center",
  },
  card: {
    marginBottom: 16,
    padding: 22,
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
    color: "#FFFFFF",
  },
  cardSubtitle: {
    fontSize: 16,
    color: "#888888",
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
  startRunningButton: {
    backgroundColor: "#00FFA3",
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 40,
    marginBottom: 40,
    alignSelf: "center",
    minWidth: 200,
  },
  startRunningText: {
    color: "black",
    fontWeight: "bold",
    fontSize: 18,
  },
  cyclingTab: {
    position: "absolute",
    left: -20,
    top: "28%",
    backgroundColor: Colors.dark.cardOpaque,
    transform: [{ rotate: "-90deg" }],
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    alignItems: "center",
  },
  cyclingTabText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: -2,
  },
});
