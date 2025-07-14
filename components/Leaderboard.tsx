import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { getIcon } from "@/lib/icons";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

const { width } = Dimensions.get("window");

interface LeaderboardUser {
  id: string;
  name: string;
  steps: number;
  co2Saved: number;
  greenPoints: number;
  streak: number;
  avatar?: string;
  rank: number;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  target: number;
  currentProgress: number;
  endDate: Date;
  participants: number;
  reward: string;
  type: "steps" | "co2" | "consistency";
}

interface LeaderboardProps {
  currentUser?: {
    id: string;
    steps: number;
    co2Saved: number;
    greenPoints: number;
  };
  timeFrame?: "daily" | "weekly" | "monthly";
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  currentUser,
  timeFrame = "weekly",
}) => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [activeChallenges, setActiveChallenges] = useState<Challenge[]>([]);
  const [selectedTab, setSelectedTab] = useState<"rankings" | "challenges">(
    "rankings"
  );
  const [animatedValues] = useState(() =>
    Array.from({ length: 10 }, () => new Animated.Value(0))
  );

  useEffect(() => {
    loadLeaderboardData();
    loadActiveChallenges();
    animateEntries();
  }, [timeFrame]);

  const loadLeaderboardData = () => {
    // Mock data - in real app, fetch from API
    const mockData: LeaderboardUser[] = [
      {
        id: "1",
        name: "EcoChampion2024",
        steps: 15420,
        co2Saved: 2167,
        greenPoints: 1840,
        streak: 12,
        rank: 1,
      },
      {
        id: "2",
        name: "GreenWalker",
        steps: 14890,
        co2Saved: 2093,
        greenPoints: 1780,
        streak: 8,
        rank: 2,
      },
      {
        id: "3",
        name: "PlanetSaver",
        steps: 14235,
        co2Saved: 2001,
        greenPoints: 1695,
        streak: 15,
        rank: 3,
      },
      {
        id: "4",
        name: "ClimateHero",
        steps: 13678,
        co2Saved: 1923,
        greenPoints: 1620,
        streak: 5,
        rank: 4,
      },
      {
        id: "5",
        name: "EcoWarrior",
        steps: 13245,
        co2Saved: 1862,
        greenPoints: 1580,
        streak: 9,
        rank: 5,
      },
    ];

    // Add current user if provided and not already in list
    if (currentUser && !mockData.find((u) => u.id === currentUser.id)) {
      const userRank = mockData.length + 1;
      mockData.push({
        id: currentUser.id,
        name: "You",
        steps: currentUser.steps,
        co2Saved: currentUser.co2Saved,
        greenPoints: currentUser.greenPoints,
        streak: 3,
        rank: userRank,
      });
    }

    setLeaderboardData(mockData);
  };

  const loadActiveChallenges = () => {
    const now = new Date();
    const challenges: Challenge[] = [
      {
        id: "1",
        title: "Green Week Challenge",
        description: "Walk 70,000 steps this week for the planet!",
        target: 70000,
        currentProgress: 45230,
        endDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days
        participants: 1247,
        reward: "500 Bonus GreenPoints + Eco Badge",
        type: "steps",
      },
      {
        id: "2",
        title: "Carbon Crusher",
        description: "Save 3kg of CO2 through eco-friendly transport",
        target: 3000,
        currentProgress: 1876,
        endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days
        participants: 892,
        reward: "Climate Champion Badge",
        type: "co2",
      },
      {
        id: "3",
        title: "Consistency King",
        description: "Maintain your daily goal streak for 14 days",
        target: 14,
        currentProgress: 8,
        endDate: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000), // 6 days
        participants: 567,
        reward: "1000 GreenPoints + Dedication Badge",
        type: "consistency",
      },
    ];

    setActiveChallenges(challenges);
  };

  const animateEntries = () => {
    // Reset animations
    animatedValues.forEach((anim) => anim.setValue(0));

    // Stagger the animations
    const animations = animatedValues.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 300,
        delay: index * 100,
        useNativeDriver: true,
      })
    );

    Animated.stagger(100, animations).start();
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return getIcon("first", { size: 20, color: "#FFD700" });
      case 2:
        return getIcon("second", { size: 20, color: "#C0C0C0" });
      case 3:
        return getIcon("third", { size: 20, color: "#CD7F32" });
      default:
        return `#${rank}`;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 0.8) return "#4CAF50";
    if (progress >= 0.5) return "#FF9800";
    return "#2196F3";
  };

  const formatTimeRemaining = (endDate: Date): string => {
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();

    if (diff <= 0) return "Ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const CountdownTimer: React.FC<{ endDate: Date }> = ({ endDate }) => {
    const [timeLeft, setTimeLeft] = useState(formatTimeRemaining(endDate));
    const scaleAnim = useState(new Animated.Value(1))[0];

    useEffect(() => {
      const interval = setInterval(() => {
        setTimeLeft(formatTimeRemaining(endDate));

        // Pulse animation every second
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start();
      }, 1000);

      return () => clearInterval(interval);
    }, [endDate]);

    return (
      <Animated.View
        style={[
          styles.countdownContainer,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <ThemedText style={styles.countdownText}>⏰ {timeLeft}</ThemedText>
      </Animated.View>
    );
  };

  const renderLeaderboardItem = (user: LeaderboardUser, index: number) => {
    const animatedStyle = {
      opacity: animatedValues[index],
      transform: [
        {
          translateX: animatedValues[index].interpolate({
            inputRange: [0, 1],
            outputRange: [50, 0],
          }),
        },
      ],
    };

    const isCurrentUser = currentUser && user.id === currentUser.id;

    return (
      <Animated.View
        key={user.id}
        style={[styles.leaderboardItem, animatedStyle]}
      >
        <ThemedView
          style={[styles.userCard, isCurrentUser && styles.currentUserCard]}
        >
          <View style={styles.rankSection}>
            <ThemedText style={styles.rankText}>
              {getRankIcon(user.rank)}
            </ThemedText>
            {user.streak > 0 && (
              <View style={styles.streakContainer}>
                {getIcon("fire", { size: 16, color: "#FF4500" })}
                <ThemedText style={styles.streakText}>{user.streak}</ThemedText>
              </View>
            )}
          </View>

          <View style={styles.userInfo}>
            <ThemedText style={styles.userName}>{user.name}</ThemedText>
            <View style={styles.statsRow}>
              <ThemedText style={styles.statText}>
                {getIcon("footsteps", { size: 14, color: "#26D0CE" })}{" "}
                {user.steps.toLocaleString()}
              </ThemedText>
              <ThemedText style={styles.statText}>
                {getIcon("leaf", { size: 14, color: "#26D0CE" })}{" "}
                {user.greenPoints}
              </ThemedText>
              <ThemedText style={styles.statText}>
                💨 {user.co2Saved}g
              </ThemedText>
            </View>
          </View>
        </ThemedView>
      </Animated.View>
    );
  };

  const renderChallenge = (challenge: Challenge, index: number) => {
    const progress = challenge.currentProgress / challenge.target;
    const progressColor = getProgressColor(progress);

    return (
      <View key={challenge.id} style={styles.challengeCard}>
        <View style={styles.challengeHeader}>
          <ThemedText style={styles.challengeTitle}>
            {challenge.title}
          </ThemedText>
          <CountdownTimer endDate={challenge.endDate} />
        </View>

        <ThemedText style={styles.challengeDescription}>
          {challenge.description}
        </ThemedText>

        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(progress * 100, 100)}%`,
                  backgroundColor: progressColor,
                },
              ]}
            />
          </View>
          <ThemedText style={styles.progressText}>
            {challenge.currentProgress.toLocaleString()} /{" "}
            {challenge.target.toLocaleString()}
            {challenge.type === "steps" && " steps"}
            {challenge.type === "co2" && "g CO₂"}
            {challenge.type === "consistency" && " days"}
          </ThemedText>
        </View>

        <View style={styles.challengeFooter}>
          <ThemedText style={styles.participantsText}>
            {getIcon("people", { size: 14, color: "#26D0CE" })}{" "}
            {challenge.participants} participants
          </ThemedText>
          <ThemedText style={styles.rewardText}>
            {getIcon("trophy", { size: 14, color: "#FFD700" })}{" "}
            {challenge.reward}
          </ThemedText>
        </View>
      </View>
    );
  };

  return (
    <LinearGradient colors={["#00c6fb", "#0072c6"]} style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === "rankings" && styles.activeTab]}
          onPress={() => setSelectedTab("rankings")}
        >
          <ThemedText
            style={[
              styles.tabText,
              selectedTab === "rankings" && styles.activeTabText,
            ]}
          >
            {getIcon("trophy", { size: 16, color: "#FFD700" })} Rankings
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === "challenges" && styles.activeTab]}
          onPress={() => setSelectedTab("challenges")}
        >
          <ThemedText
            style={[
              styles.tabText,
              selectedTab === "challenges" && styles.activeTabText,
            ]}
          >
            {getIcon("target", { size: 16, color: "#26D0CE" })} Challenges
          </ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedTab === "rankings" ? (
          <View>
            <ThemedText style={styles.sectionTitle}>
              {timeFrame.charAt(0).toUpperCase() + timeFrame.slice(1)}{" "}
              Leaderboard
            </ThemedText>
            {leaderboardData.map(renderLeaderboardItem)}
          </View>
        ) : (
          <View>
            <ThemedText style={styles.sectionTitle}>
              Active Community Challenges
            </ThemedText>
            {activeChallenges.map(renderChallenge)}
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 20,
    backgroundColor: "#1A2639",
    borderRadius: 25,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#4FC3F7",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
  },
  activeTabText: {
    color: "white",
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  leaderboardItem: {
    marginBottom: 10,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 15,
    backgroundColor: "rgba(33, 150, 243, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(33, 150, 243, 0.18)",
  },
  currentUserCard: {
    backgroundColor: "rgba(33, 150, 243, 0.25)",
    borderColor: "#4FC3F7",
  },
  rankSection: {
    alignItems: "center",
    marginRight: 15,
    minWidth: 50,
  },
  rankText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  streakText: {
    fontSize: 12,
    marginTop: 4,
  },
  streakContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#fff",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statText: {
    fontSize: 12,
    opacity: 0.8,
    color: "#fff",
  },
  challengeCard: {
    padding: 20,
    borderRadius: 15,
    backgroundColor: "rgba(79, 195, 247, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(79, 195, 247, 0.18)",
    marginBottom: 15,
  },
  challengeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
  },
  countdownContainer: {
    backgroundColor: "rgba(79, 195, 247, 0.18)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  countdownText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4FC3F7",
  },
  challengeDescription: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 15,
  },
  progressSection: {
    marginBottom: 15,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    marginBottom: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    textAlign: "center",
    fontWeight: "600",
  },
  challengeFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  participantsText: {
    fontSize: 12,
    opacity: 0.7,
  },
  rewardText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4FC3F7",
  },
  leaderboardCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
});
