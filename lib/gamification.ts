import { getBadges, saveBadges } from "./storage";

export type Badge = {
  id: string;
  name: string;
  description: string;
  achieved: boolean;
};

const allBadges: Badge[] = [
  {
    id: "1k_steps",
    name: "1,000 Steps",
    description: "Walk 1,000 steps in a day.",
    achieved: false,
  },
  {
    id: "5k_steps",
    name: "5,000 Steps",
    description: "Walk 5,000 steps in a day.",
    achieved: false,
  },
  {
    id: "10k_steps",
    name: "10,000 Steps",
    description: "Walk 10,000 steps in a day.",
    achieved: false,
  },
];

export const checkAndAwardBadges = async (stepCount: number) => {
  const awardedBadges = await getBadges();
  const newBadges: string[] = [];

  if (stepCount >= 1000 && !awardedBadges.includes("1k_steps")) {
    newBadges.push("1k_steps");
  }
  if (stepCount >= 5000 && !awardedBadges.includes("5k_steps")) {
    newBadges.push("5k_steps");
  }
  if (stepCount >= 10000 && !awardedBadges.includes("10k_steps")) {
    newBadges.push("10k_steps");
  }

  if (newBadges.length > 0) {
    const updatedBadges = [...awardedBadges, ...newBadges];
    await saveBadges(updatedBadges);
    // Here you might want to trigger a notification about the new badge
    console.log("Awarded new badges:", newBadges);
  }

  return newBadges;
};

export const getBadgesStatus = async (): Promise<Badge[]> => {
  const awardedBadges = await getBadges();
  return allBadges.map((badge) => ({
    ...badge,
    achieved: awardedBadges.includes(badge.id),
  }));
};
