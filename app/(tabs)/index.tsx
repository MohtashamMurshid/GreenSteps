import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
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
          Dashboard
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
          Community
        </ThemedText>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === "map" && styles.activeTab]}
        onPress={() => setActiveTab("map")}
      >
        <ThemedText
          style={[styles.tabText, activeTab === "map" && styles.activeTabText]}
        >
          Routes
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
          Health
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
        <ThemedView
          style={[
            styles.headerContainer,
            { backgroundColor: "transparent", elevation: 0, shadowOpacity: 0 },
          ]}
        >
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

        {/* Motivational Message and Quick Actions */}
        {motivationalMessage ? (
          <ThemedView style={styles.messageSection}>
            <ThemedText style={styles.motivationalText}>
              {motivationalMessage}
            </ThemedText>
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={speakMotivationalMessage}
              >
                <ThemedText style={styles.actionButtonText}>
                  🔊 Hear Coaching
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.runningButton]}
                onPress={() => router.push("/running")}
              >
                <ThemedText
                  style={[styles.actionButtonText, styles.runningButtonText]}
                >
                  🏃‍♀️ Start Running
                </ThemedText>
              </TouchableOpacity>
            </View>
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

        {/* Quick Action Buttons - Always Visible */}
        <ThemedView style={styles.quickActionsSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Quick Actions
          </ThemedText>
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity
              style={[styles.quickActionButton, styles.runningQuickButton]}
              onPress={() => router.push("/running")}
            >
              <ThemedText style={styles.quickActionIcon}>🏃‍♀️</ThemedText>
              <ThemedText style={styles.quickActionText}>
                Start Running
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionButton, styles.coachingQuickButton]}
              onPress={speakMotivationalMessage}
            >
              <ThemedText style={styles.quickActionIcon}>🔊</ThemedText>
              <ThemedText style={styles.quickActionText}>
                Hear Coaching
              </ThemedText>
            </TouchableOpacity>
          </View>
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
    <LinearGradient colors={["#b2f0ff", "#005fa3"]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: "transparent" }}>
        {/* Content */}
        <View style={styles.contentContainer}>{renderContent()}</View>
        {/* Floating Camera Button */}
        <TouchableOpacity
          style={styles.floatingCameraButton}
          onPress={() => {
            console.log("📸 Camera button pressed - navigating to /running");
            try {
              router.navigate("/running");
            } catch (error) {
              console.error("Navigation error:", error);
              // Fallback
              router.push("../running");
            }
          }}
        >
          <ThemedText style={styles.floatingCameraIcon}>📸</ThemedText>
        </TouchableOpacity>

        {/* Bottom Tab Navigation */}
        <View style={styles.bottomTabNavigation}>{renderTabNavigation()}</View>
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
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  contentContainer: {
    flex: 1,
  },
  tabNavigation: {
    flexDirection: "row",
    flex: 1,
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    marginHorizontal: 6,
    borderRadius: 22,
    backgroundColor: "transparent",
    minWidth: 0,
    minHeight: 44,
    position: "relative",
  },
  activeTab: {
    backgroundColor: "#00eaff",
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 10,
    minWidth: 70,
    minHeight: 36,
    maxWidth: 110,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#00eaff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
  tabText: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    color: "#fff",
    marginLeft: 0,
    opacity: 1,
    flexShrink: 1,
    flexGrow: 1,
    flexBasis: "auto",
    includeFontPadding: false,
    textAlignVertical: "center",
    maxWidth: 80,
    overflow: "hidden",
  },
  activeTabText: {
    color: "#005fa3",
    opacity: 1,
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
    backgroundColor: "transparent",
    elevation: 0,
    shadowOpacity: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#fff",
  },
  section: {
    marginBottom: 20,
    backgroundColor: "transparent",
    borderRadius: 15,
    padding: 16,
    overflow: "hidden",
  },
  sectionGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 15,
  },
  quickStatsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  statCard: {
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    minWidth: 80,
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  statCardGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 10,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
    textAlign: "center",
    color: "#b2e0ff",
  },
  sectionTitle: {
    marginBottom: 15,
    textAlign: "center",
    color: "#fff",
  },
  progressWrapper: {
    padding: 20,
    borderRadius: 15,
    backgroundColor: "transparent",
    overflow: "hidden",
  },
  progressGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 15,
  },
  messageSection: {
    marginBottom: 20,
    padding: 20,
    borderRadius: 15,
    backgroundColor: "transparent",
    alignItems: "center",
    overflow: "hidden",
  },
  messageGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 15,
  },
  motivationalText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "500",
    color: "#fff",
  },
  speakButton: {
    fontSize: 14,
    color: "#00eaff",
    padding: 8,
    borderRadius: 5,
    backgroundColor: "rgba(0,234,255,0.2)",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    gap: 15,
    marginTop: 10,
    justifyContent: "center",
    flexWrap: "wrap",
  },
  actionButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "rgba(0,234,255,0.2)",
    borderWidth: 1,
    borderColor: "#00eaff",
  },
  actionButtonText: {
    fontSize: 14,
    color: "#00eaff",
    fontWeight: "500",
  },
  runningButton: {
    backgroundColor: "rgba(76, 175, 80, 0.2)",
    borderColor: "#4CAF50",
  },
  runningButtonText: {
    color: "#4CAF50",
  },
  quickActionsSection: {
    marginBottom: 20,
    backgroundColor: "transparent",
    borderRadius: 15,
    padding: 16,
    overflow: "hidden",
  },
  quickActionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: 15,
  },
  quickActionButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  runningQuickButton: {
    borderColor: "#4CAF50",
    backgroundColor: "rgba(76, 175, 80, 0.2)",
  },
  coachingQuickButton: {
    borderColor: "#00eaff",
    backgroundColor: "rgba(0,234,255,0.2)",
  },
  quickActionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
  },
  floatingCameraButton: {
    position: "absolute",
    right: 20,
    bottom: 120,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowColor: "#000",
    zIndex: 100,
  },
  floatingCameraIcon: {
    fontSize: 24,
    color: "#fff",
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
    color: "#00eaff",
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
    backgroundColor: "transparent",
    overflow: "hidden",
  },
  unavailableGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 15,
  },
  unavailableText: {
    fontSize: 16,
    color: "#00eaff",
    textAlign: "center",
  },
  noBadgesContainer: {
    alignItems: "center",
    padding: 20,
    borderRadius: 15,
    backgroundColor: "transparent",
    overflow: "hidden",
  },
  noBadgesGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 15,
  },
  noBadgesText: {
    fontSize: 16,
    color: "#00eaff",
    textAlign: "center",
  },
  loadingContainer: {
    alignItems: "center",
    padding: 20,
    borderRadius: 15,
    backgroundColor: "transparent",
    overflow: "hidden",
  },
  loadingGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 15,
  },
  loadingText: {
    fontSize: 16,
    color: "#00eaff",
    textAlign: "center",
  },
  bottomSpacing: {
    height: 80,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  bottomTabNavigation: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#005fa3",
    paddingBottom: 18,
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    zIndex: 10,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 12,
  },
});
