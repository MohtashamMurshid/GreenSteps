import AsyncStorage from "@react-native-async-storage/async-storage";

const GOAL_KEY = "user_step_goal";
const BADGES_KEY = "user_badges";

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
