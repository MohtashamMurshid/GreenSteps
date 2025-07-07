import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import Badge from "@/components/Badge";
import { EcoMap } from "@/components/EcoMap";
import { HealthReminders } from "@/components/HealthReminders";
import { Leaderboard } from "@/components/Leaderboard";
import {
  MultiProgressCircle,
  ProgressCircle,
} from "@/components/ProgressCircle";
import { ProgressDashboard } from "@/components/ProgressDashboard";
import { RewardAnimation } from "@/components/RewardAnimation";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { usePedometer } from "@/hooks/usePedometer";
import { audioSystem } from "@/lib/audioSystem";
import {
  Achievement,
  Badge as BadgeType,
  calculateCO2Saved,
  getBadgesStatus,
  getMotivationalMessage,
  processAchievements,
  updateDailyProgress,
} from "@/lib/gamification";
import { getGreenPoints, getStepGoal } from "@/lib/storage";

type TabType = "dashboard" | "leaderboard" | "map" | "health";

export default function HomeScreen() {
  const { currentStepCount, isPedometerAvailable } = usePedometer();
  const [dailyGoal, setDailyGoal] = useState(10000);
  const [badges, setBadges] = useState<BadgeType[]>([]);
  const [greenPoints, setGreenPoints] = useState(0);
  const [showRewardAnimation, setShowRewardAnimation] = useState(false);
  const [currentAchievement, setCurrentAchievement] =
    useState<Achievement | null>(null);
  const [co2Saved, setCO2Saved] = useState(0);
  const [motivationalMessage, setMotivationalMessage] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");

  const progress =
    dailyGoal > 0 ? Math.min(currentStepCount / dailyGoal, 1) : 0;

  useEffect(() => {
    initializeApp();
  }, []);

  useEffect(() => {
    if (currentStepCount > 0) {
      handleStepUpdate();
    }
  }, [currentStepCount]);

  const initializeApp = async () => {
    try {
      // Initialize audio system
      await audioSystem.initialize();

      // Load saved data
      const savedGoal = await getStepGoal();
      if (savedGoal) {
        setDailyGoal(savedGoal);
      }

      const points = await getGreenPoints();
      setGreenPoints(points);

      await updateBadges();
    } catch (error) {
      console.error("Failed to initialize app:", error);
    }
  };

  const handleStepUpdate = async () => {
    try {
      // Update daily progress and save stats
      await updateDailyProgress(currentStepCount);

      // Calculate CO2 saved
      const co2 = calculateCO2Saved(currentStepCount);
      setCO2Saved(co2);

      // Update motivational message
      const message = getMotivationalMessage(currentStepCount, dailyGoal);
      setMotivationalMessage(message);

      // Check for achievements
      const achievements = await processAchievements(
        currentStepCount,
        dailyGoal
      );

      if (achievements.length > 0) {
        // Show first achievement
        const achievement = achievements[0];
        setCurrentAchievement(achievement);
        setShowRewardAnimation(true);

        // Play achievement sound
        await audioSystem.playAchievementSound(
          achievement.type === "badge"
            ? "badge"
            : achievement.type === "goal"
            ? "goal"
            : "steps"
        );

        // Speak achievement if it's a major milestone
        if (achievement.type === "goal" || achievement.type === "badge") {
          await audioSystem.speakCoachingMessage(
            `${achievement.title}! ${achievement.message}`
          );
        }
      }

      // Update badges
      await updateBadges();

      // Update GreenPoints
      const updatedPoints = await getGreenPoints();
      setGreenPoints(updatedPoints);

      // Update activity level in audio system
      await audioSystem.updateActivityLevel(currentStepCount);
    } catch (error) {
      console.error("Failed to handle step update:", error);
    }
  };

  const updateBadges = async () => {
    const badgeStatus = await getBadgesStatus();
    setBadges(badgeStatus);
  };

  const onRewardAnimationComplete = () => {
    setShowRewardAnimation(false);
    setCurrentAchievement(null);
  };

  const speakMotivationalMessage = async () => {
    try {
      const now = new Date();
      const hour = now.getHours();
      const timeOfDay =
        hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";

      await audioSystem.provideMotivationalCoaching(
        currentStepCount,
        dailyGoal,
        greenPoints,
        { timeOfDay }
      );
    } catch (error) {
      console.error("Failed to speak motivational message:", error);
    }
  };

  const renderTabNavigation = () => (
    <View style={styles.tabNavigation}>
      <TouchableOpacity
        style={[styles.tab, activeTab === "dashboard" && styles.activeTab]}
        onPress={() => setActiveTab("dashboard")}
      >
        <ThemedText
          style={[
            styles.tabText,
            activeTab === "dashboard" && styles.activeTabText,
          ]}
        >
          📊 Dashboard
        </ThemedText>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === "leaderboard" && styles.activeTab]}
        onPress={() => setActiveTab("leaderboard")}
      >
        <ThemedText
          style={[
            styles.tabText,
            activeTab === "leaderboard" && styles.activeTabText,
          ]}
        >
          🏆 Community
        </ThemedText>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === "map" && styles.activeTab]}
        onPress={() => setActiveTab("map")}
      >
        <ThemedText
          style={[styles.tabText, activeTab === "map" && styles.activeTabText]}
        >
          🗺️ Routes
        </ThemedText>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === "health" && styles.activeTab]}
        onPress={() => setActiveTab("health")}
      >
        <ThemedText
          style={[
            styles.tabText,
            activeTab === "health" && styles.activeTabText,
          ]}
        >
          🏥 Health
        </ThemedText>
      </TouchableOpacity>
    </View>
  );

  const renderDashboardContent = () => {
    // Progress data for multi-circle display
    const progressData = [
      {
        label: "Daily Goal",
        progress: progress,
        color: "#4CAF50",
        value: `${Math.round(progress * 100)}%`,
      },
      {
        label: "CO₂ Saved",
        progress: Math.min(co2Saved / 500, 1), // 500g daily target
        color: "#2196F3",
        value: `${co2Saved}g`,
      },
      {
        label: "Points",
        progress: Math.min(greenPoints / 1000, 1), // 1000 points milestone
        color: "#FF9800",
        value: `${greenPoints}`,
      },
    ];

    return (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <ThemedView style={styles.headerContainer}>
          <ThemedText type="title" style={styles.title}>
            GreenSteps Dashboard
          </ThemedText>
        </ThemedView>

        {/* Quick Stats Section */}
        <ThemedView style={styles.section}>
          <View style={styles.quickStatsContainer}>
            <View style={styles.statCard}>
              <ThemedText style={styles.statNumber}>
                {currentStepCount.toLocaleString()}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Steps Today</ThemedText>
            </View>
            <View style={styles.statCard}>
              <ThemedText style={styles.statNumber}>{greenPoints}</ThemedText>
              <ThemedText style={styles.statLabel}>🌱 GreenPoints</ThemedText>
            </View>
            <View style={styles.statCard}>
              <ThemedText style={styles.statNumber}>{co2Saved}g</ThemedText>
              <ThemedText style={styles.statLabel}>CO₂ Saved</ThemedText>
            </View>
          </View>
        </ThemedView>

        {/* Multi Progress Circles */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Today&apos;s Progress
          </ThemedText>
          <View style={styles.progressWrapper}>
            <MultiProgressCircle progressData={progressData} />
          </View>
        </ThemedView>

        {/* Motivational Message */}
        {motivationalMessage ? (
          <ThemedView style={styles.messageSection}>
            <ThemedText style={styles.motivationalText}>
              {motivationalMessage}
            </ThemedText>
            <ThemedText
              style={styles.speakButton}
              onPress={speakMotivationalMessage}
            >
              🔊 Hear Coaching
            </ThemedText>
          </ThemedView>
        ) : null}

        {/* Main Step Progress */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Step Progress
          </ThemedText>
          {isPedometerAvailable ? (
            <View style={styles.stepProgressContent}>
              <View style={styles.progressContainer}>
                <ProgressCircle
                  progress={progress}
                  size={200}
                  title={currentStepCount.toLocaleString()}
                  subtitle={`Goal: ${dailyGoal.toLocaleString()}`}
                  showPercentage={true}
                />
              </View>
              {progress >= 1 && (
                <ThemedText style={styles.goalCompleted}>
                  🎉 Goal completed! Amazing work!
                </ThemedText>
              )}
            </View>
          ) : (
            <View style={styles.unavailableContainer}>
              <ThemedText style={styles.unavailableText}>
                Pedometer not available on this device
              </ThemedText>
            </View>
          )}
        </ThemedView>

        {/* Enhanced Progress Dashboard */}
        <ThemedView style={styles.section}>
          <ProgressDashboard
            currentStepCount={currentStepCount}
            dailyGoal={dailyGoal}
          />
        </ThemedView>

        {/* Badges Section */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Achievements
          </ThemedText>
          {badges.length > 0 ? (
            <View style={styles.badgesContent}>
              {badges.filter((badge) => badge.achieved).length > 0 ? (
                <View style={styles.badgesContainer}>
                  {badges
                    .filter((badge) => badge.achieved)
                    .map((badge) => (
                      <Badge key={badge.id} badge={badge} />
                    ))}
                </View>
              ) : (
                <View style={styles.noBadgesContainer}>
                  <ThemedText style={styles.noBadgesText}>
                    No badges earned yet. Keep walking to unlock them!
                  </ThemedText>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.loadingContainer}>
              <ThemedText style={styles.loadingText}>
                Loading achievements...
              </ThemedText>
            </View>
          )}
        </ThemedView>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return renderDashboardContent();
      case "leaderboard":
        return (
          <Leaderboard
            currentUser={{
              id: "current-user",
              steps: currentStepCount,
              co2Saved: co2Saved,
              greenPoints: greenPoints,
            }}
            timeFrame="weekly"
          />
        );
      case "map":
        return (
          <EcoMap
            showCurrentLocation={true}
            trackingEnabled={true}
            showEcoStats={true}
            onPathUpdate={(path) => {
              console.log("Path updated:", path.length, "points");
            }}
          />
        );
      case "health":
        return (
          <HealthReminders
            userActivityLevel={
              currentStepCount > 8000
                ? "high"
                : currentStepCount > 4000
                ? "moderate"
                : "low"
            }
            currentStepCount={currentStepCount}
          />
        );
      default:
        return renderDashboardContent();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Tab Navigation */}
      {renderTabNavigation()}

      {/* Content */}
      <View style={styles.contentContainer}>{renderContent()}</View>

      {/* Reward Animation Overlay */}
      <RewardAnimation
        visible={showRewardAnimation}
        type={
          currentAchievement?.type === "badge"
            ? "badge"
            : currentAchievement?.type === "goal"
            ? "goal"
            : "greenpoints"
        }
        points={currentAchievement?.greenPoints}
        message={currentAchievement?.title}
        onComplete={onRewardAnimationComplete}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5", // Light background for the whole screen
  },
  contentContainer: {
    flex: 1,
  },
  tabNavigation: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    paddingVertical: 10,
    paddingHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 15,
    alignItems: "center",
    marginHorizontal: 2,
  },
  activeTab: {
    backgroundColor: "#4CAF50",
  },
  tabText: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  activeTabText: {
    color: "white",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 80, // Add padding at the bottom for the reward animation
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },
  section: {
    marginBottom: 20,
  },
  quickStatsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  statCard: {
    alignItems: "center",
    padding: 15,
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    borderRadius: 10,
    minWidth: 80,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
    textAlign: "center",
  },
  sectionTitle: {
    marginBottom: 15,
    textAlign: "center",
  },
  progressWrapper: {
    padding: 20,
    borderRadius: 15,
    backgroundColor: "#e0f2f7", // Light blue background
  },
  messageSection: {
    marginBottom: 20,
    padding: 20,
    borderRadius: 15,
    backgroundColor: "rgba(33, 150, 243, 0.1)",
    alignItems: "center",
  },
  motivationalText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "500",
  },
  speakButton: {
    fontSize: 14,
    color: "#2196F3",
    padding: 8,
    borderRadius: 5,
    backgroundColor: "rgba(33, 150, 243, 0.2)",
  },
  stepProgressContent: {
    alignItems: "center",
  },
  progressContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  goalCompleted: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4CAF50",
    textAlign: "center",
    marginTop: 10,
  },
  badgesContent: {
    alignItems: "center",
  },
  badgesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 10,
    justifyContent: "center",
  },
  unavailableContainer: {
    alignItems: "center",
    padding: 20,
    borderRadius: 15,
    backgroundColor: "rgba(255, 152, 0, 0.1)", // Orange background
  },
  unavailableText: {
    fontSize: 16,
    color: "#FF9800",
    textAlign: "center",
  },
  noBadgesContainer: {
    alignItems: "center",
    padding: 20,
    borderRadius: 15,
    backgroundColor: "rgba(255, 152, 0, 0.1)", // Orange background
  },
  noBadgesText: {
    fontSize: 16,
    color: "#FF9800",
    textAlign: "center",
  },
  loadingContainer: {
    alignItems: "center",
    padding: 20,
    borderRadius: 15,
    backgroundColor: "rgba(33, 150, 243, 0.1)", // Blue background
  },
  loadingText: {
    fontSize: 16,
    color: "#2196F3",
    textAlign: "center",
  },
  bottomSpacing: {
    height: 80, // Space for the reward animation
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
