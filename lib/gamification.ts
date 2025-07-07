import {
  addGreenPoints,
  DailyStats,
  getBadges,
  getTodayStats,
  saveBadges,
  saveDailyStats,
} from "./storage";

export interface Badge {
  id: string;
  name: string;
  description: string;
  achieved: boolean;
  icon?: string;
  greenPointsReward?: number;
}

const allBadges: Badge[] = [
  {
    id: "first_steps",
    name: "First Steps",
    description: "Take your first 100 steps with GreenSteps.",
    achieved: false,
    icon: "👶",
    greenPointsReward: 10,
  },
  {
    id: "1k_steps",
    name: "1,000 Steps",
    description: "Walk 1,000 steps in a day.",
    achieved: false,
    icon: "🚶",
    greenPointsReward: 25,
  },
  {
    id: "5k_steps",
    name: "5,000 Steps",
    description: "Walk 5,000 steps in a day.",
    achieved: false,
    icon: "🏃",
    greenPointsReward: 50,
  },
  {
    id: "10k_steps",
    name: "10,000 Steps",
    description: "Walk 10,000 steps in a day.",
    achieved: false,
    icon: "💪",
    greenPointsReward: 100,
  },
  {
    id: "eco_warrior",
    name: "Eco Warrior",
    description: "Save 500g of CO₂ in a single day.",
    achieved: false,
    icon: "🌍",
    greenPointsReward: 75,
  },
  {
    id: "week_streak",
    name: "Week Streak",
    description: "Reach your daily goal for 7 consecutive days.",
    achieved: false,
    icon: "🔥",
    greenPointsReward: 200,
  },
  {
    id: "green_champion",
    name: "Green Champion",
    description: "Earn 1,000 GreenPoints total.",
    achieved: false,
    icon: "🏆",
    greenPointsReward: 250,
  },
];

export const calculateCO2Saved = (steps: number): number => {
  // Calculate CO2 saved based on steps
  // Assumption: 1000 steps ≈ 0.8 km walking ≈ 140g CO2 saved vs driving
  const distanceKm = (steps / 1000) * 0.8;
  const co2SavedGrams = distanceKm * 175; // 175g CO2 per km saved by walking instead of driving
  return Math.round(co2SavedGrams);
};

export const calculateGreenPoints = (
  steps: number,
  co2Saved: number
): number => {
  // Calculate GreenPoints based on activity
  const stepPoints = Math.floor(steps / 100); // 1 point per 100 steps
  const ecoPoints = Math.floor(co2Saved / 10); // 1 point per 10g CO2 saved
  return stepPoints + ecoPoints;
};

export const updateDailyProgress = async (
  stepCount: number
): Promise<DailyStats> => {
  const today = new Date().toISOString().split("T")[0];
  const co2Saved = calculateCO2Saved(stepCount);
  const greenPointsEarned = calculateGreenPoints(stepCount, co2Saved);
  const distance = (stepCount / 1000) * 0.8; // rough calculation in km

  const todayStats: DailyStats = {
    date: today,
    steps: stepCount,
    co2Saved,
    distance,
    greenPoints: greenPointsEarned,
  };

  await saveDailyStats(todayStats);
  return todayStats;
};

export const checkAndAwardBadges = async (
  stepCount: number
): Promise<Badge[]> => {
  const awardedBadges = await getBadges();
  const newBadges: Badge[] = [];
  const todayStats = await getTodayStats();

  // Check step-based badges
  if (stepCount >= 100 && !awardedBadges.includes("first_steps")) {
    const badge = allBadges.find((b) => b.id === "first_steps")!;
    newBadges.push(badge);
  }

  if (stepCount >= 1000 && !awardedBadges.includes("1k_steps")) {
    const badge = allBadges.find((b) => b.id === "1k_steps")!;
    newBadges.push(badge);
  }

  if (stepCount >= 5000 && !awardedBadges.includes("5k_steps")) {
    const badge = allBadges.find((b) => b.id === "5k_steps")!;
    newBadges.push(badge);
  }

  if (stepCount >= 10000 && !awardedBadges.includes("10k_steps")) {
    const badge = allBadges.find((b) => b.id === "10k_steps")!;
    newBadges.push(badge);
  }

  // Check environmental badges
  if (todayStats.co2Saved >= 500 && !awardedBadges.includes("eco_warrior")) {
    const badge = allBadges.find((b) => b.id === "eco_warrior")!;
    newBadges.push(badge);
  }

  // Award GreenPoints for new badges and save them
  if (newBadges.length > 0) {
    const updatedBadges = [...awardedBadges, ...newBadges.map((b) => b.id)];
    await saveBadges(updatedBadges);

    // Award GreenPoints for each new badge
    for (const badge of newBadges) {
      if (badge.greenPointsReward) {
        await addGreenPoints(badge.greenPointsReward);
      }
    }

    console.log(
      "Awarded new badges:",
      newBadges.map((b) => b.name)
    );
  }

  return newBadges;
};

export const getBadgesStatus = async (): Promise<Badge[]> => {
  const awardedBadgeIds = await getBadges();
  return allBadges.map((badge) => ({
    ...badge,
    achieved: awardedBadgeIds.includes(badge.id),
  }));
};

export const getNextMilestone = (
  currentSteps: number
): { steps: number; badge?: Badge } => {
  const stepMilestones = [100, 1000, 5000, 10000, 15000, 20000];
  const nextStepMilestone = stepMilestones.find(
    (milestone) => milestone > currentSteps
  );

  if (nextStepMilestone) {
    const badge = allBadges.find(
      (b) =>
        (b.id === "first_steps" && nextStepMilestone === 100) ||
        (b.id === "1k_steps" && nextStepMilestone === 1000) ||
        (b.id === "5k_steps" && nextStepMilestone === 5000) ||
        (b.id === "10k_steps" && nextStepMilestone === 10000)
    );

    return { steps: nextStepMilestone, badge };
  }

  return { steps: currentSteps };
};

export const getWeeklyStreak = async (): Promise<number> => {
  // This would require more complex logic to track consecutive days
  // For now, return 0 as placeholder
  return 0;
};

export const getMotivationalMessage = (
  stepCount: number,
  goal: number
): string => {
  const progress = stepCount / goal;

  if (progress >= 1.0) {
    return "🎉 Goal crushed! You're an eco-champion today!";
  } else if (progress >= 0.8) {
    return "🔥 So close! Every step counts for our planet!";
  } else if (progress >= 0.5) {
    return "💪 Halfway there! Keep making a difference!";
  } else if (progress >= 0.25) {
    return "🌱 Great start! Small steps, big impact!";
  } else {
    return "🚀 Ready to start your green journey?";
  }
};

// Achievement types for animations
export type AchievementType = "badge" | "goal" | "milestone" | "streak";

export interface Achievement {
  type: AchievementType;
  title: string;
  message: string;
  greenPoints?: number;
  badge?: Badge;
}

export const processAchievements = async (
  stepCount: number,
  dailyGoal: number
): Promise<Achievement[]> => {
  const achievements: Achievement[] = [];

  // Check for new badges
  const newBadges = await checkAndAwardBadges(stepCount);
  for (const badge of newBadges) {
    achievements.push({
      type: "badge",
      title: `New Badge: ${badge.name}`,
      message: badge.description,
      greenPoints: badge.greenPointsReward,
      badge,
    });
  }

  // Check for goal completion
  if (stepCount >= dailyGoal) {
    const goalPoints = calculateGreenPoints(
      stepCount,
      calculateCO2Saved(stepCount)
    );
    achievements.push({
      type: "goal",
      title: "Daily Goal Achieved!",
      message: `Congratulations! You've reached your ${dailyGoal.toLocaleString()} step goal!`,
      greenPoints: goalPoints,
    });
  }

  // Check for milestones
  const milestone = getNextMilestone(stepCount - 1); // Check if we just passed a milestone
  if (milestone.badge && stepCount >= milestone.steps) {
    achievements.push({
      type: "milestone",
      title: `${milestone.steps.toLocaleString()} Steps!`,
      message: `You've reached a major milestone!`,
    });
  }

  return achievements;
};
