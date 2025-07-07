import AsyncStorage from "@react-native-async-storage/async-storage";

const GOAL_KEY = "user_step_goal";
const BADGES_KEY = "user_badges";
const GREENPOINTS_KEY = "user_greenpoints";
const DAILY_STATS_KEY = "daily_stats";

export const saveStepGoal = async (goal: number) => {
  try {
    await AsyncStorage.setItem(GOAL_KEY, JSON.stringify(goal));
  } catch (e) {
    console.error("Failed to save step goal.", e);
  }
};

export const getStepGoal = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(GOAL_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error("Failed to fetch step goal.", e);
    return null;
  }
};

export const saveBadges = async (badges: string[]) => {
  try {
    await AsyncStorage.setItem(BADGES_KEY, JSON.stringify(badges));
  } catch (e) {
    console.error("Failed to save badges.", e);
  }
};

export const getBadges = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(BADGES_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error("Failed to fetch badges.", e);
    return [];
  }
};

// GreenPoints functions
export const saveGreenPoints = async (points: number) => {
  try {
    await AsyncStorage.setItem(GREENPOINTS_KEY, JSON.stringify(points));
  } catch (e) {
    console.error("Failed to save GreenPoints.", e);
  }
};

export const getGreenPoints = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(GREENPOINTS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : 0;
  } catch (e) {
    console.error("Failed to fetch GreenPoints.", e);
    return 0;
  }
};

export const addGreenPoints = async (pointsToAdd: number) => {
  try {
    const currentPoints = await getGreenPoints();
    const newTotal = currentPoints + pointsToAdd;
    await saveGreenPoints(newTotal);
    return newTotal;
  } catch (e) {
    console.error("Failed to add GreenPoints.", e);
    return 0;
  }
};

// Daily stats for CO2 tracking
export interface DailyStats {
  date: string;
  steps: number;
  co2Saved: number; // in grams
  distance: number; // in kilometers
  greenPoints: number;
}

export const saveDailyStats = async (stats: DailyStats) => {
  try {
    const existingStats = await getDailyStats();
    const updatedStats = {
      ...existingStats,
      [stats.date]: stats,
    };
    await AsyncStorage.setItem(DAILY_STATS_KEY, JSON.stringify(updatedStats));
  } catch (e) {
    console.error("Failed to save daily stats.", e);
  }
};

export const getDailyStats = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(DAILY_STATS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : {};
  } catch (e) {
    console.error("Failed to fetch daily stats.", e);
    return {};
  }
};

export const getTodayStats = async () => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const allStats = await getDailyStats();
    return (
      allStats[today] || {
        date: today,
        steps: 0,
        co2Saved: 0,
        distance: 0,
        greenPoints: 0,
      }
    );
  } catch (e) {
    console.error("Failed to fetch today's stats.", e);
    return {
      date: new Date().toISOString().split("T")[0],
      steps: 0,
      co2Saved: 0,
      distance: 0,
      greenPoints: 0,
    };
  }
};
