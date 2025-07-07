import { audioSystem } from "@/lib/audioSystem";
import * as Notifications from "expo-notifications";
import React, { useEffect, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Switch,
    TouchableOpacity,
    View,
} from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

interface ReminderSettings {
  hydration: {
    enabled: boolean;
    interval: number; // minutes
    startTime: string; // HH:MM
    endTime: string; // HH:MM
    lastReminder?: Date;
  };
  sleep: {
    enabled: boolean;
    bedtimeReminder: string; // HH:MM
    windDownDuration: number; // minutes before bedtime
    lastReminder?: Date;
  };
  movement: {
    enabled: boolean;
    interval: number; // minutes of inactivity
    lastReminder?: Date;
  };
}

interface HealthRemindersProps {
  userActivityLevel?: "low" | "moderate" | "high";
  currentStepCount?: number;
}

export const HealthReminders: React.FC<HealthRemindersProps> = ({
  userActivityLevel = "moderate",
  currentStepCount = 0,
}) => {
  const [settings, setSettings] = useState<ReminderSettings>({
    hydration: {
      enabled: true,
      interval: 90, // Every 90 minutes
      startTime: "08:00",
      endTime: "22:00",
    },
    sleep: {
      enabled: true,
      bedtimeReminder: "22:00",
      windDownDuration: 30, // 30 minutes before bedtime
    },
    movement: {
      enabled: true,
      interval: 45, // Every 45 minutes of inactivity
    },
  });

  const [nextReminders, setNextReminders] = useState<{
    hydration?: Date;
    sleep?: Date;
    movement?: Date;
  }>({});

  const [todayStats, setTodayStats] = useState({
    waterIntake: 0, // glasses of water
    sleepQuality: 0, // 1-5 rating
    activeHours: 0, // hours of activity
  });

  useEffect(() => {
    scheduleAllReminders();
    loadTodayStats();
  }, [settings]);

  const loadTodayStats = () => {
    // In a real app, load from storage
    setTodayStats({
      waterIntake: 4,
      sleepQuality: 4,
      activeHours: 6,
    });
  };

  const scheduleAllReminders = async () => {
    if (settings.hydration.enabled) {
      await scheduleHydrationReminders();
    }
    if (settings.sleep.enabled) {
      await scheduleSleepReminders();
    }
    if (settings.movement.enabled) {
      await scheduleMovementReminders();
    }
  };

  const scheduleHydrationReminders = async () => {
    try {
      const now = new Date();
      const [startHour, startMin] = settings.hydration.startTime
        .split(":")
        .map(Number);
      const [endHour, endMin] = settings.hydration.endTime
        .split(":")
        .map(Number);

      const startTime = new Date();
      startTime.setHours(startHour, startMin, 0, 0);

      const endTime = new Date();
      endTime.setHours(endHour, endMin, 0, 0);

      // Don't schedule if outside active hours
      if (now < startTime || now > endTime) {
        return;
      }

      // Calculate next reminder time
      const nextReminderTime = new Date(
        now.getTime() + settings.hydration.interval * 60 * 1000
      );

      // Don't schedule if past end time
      if (nextReminderTime > endTime) {
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "💧 Hydration Reminder",
          body: getHydrationMessage(),
          sound: "default",
          data: { type: "hydration" },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: settings.hydration.interval * 60,
        },
      });

      setNextReminders((prev) => ({
        ...prev,
        hydration: nextReminderTime,
      }));

      console.log(
        `💧 Hydration reminder scheduled for ${nextReminderTime.toLocaleTimeString()}`
      );
    } catch (error) {
      console.error("Failed to schedule hydration reminder:", error);
    }
  };

  const scheduleSleepReminders = async () => {
    try {
      const now = new Date();
      const [bedHour, bedMin] = settings.sleep.bedtimeReminder
        .split(":")
        .map(Number);

      const bedtimeTonight = new Date();
      bedtimeTonight.setHours(bedHour, bedMin, 0, 0);

      // If bedtime has passed today, schedule for tomorrow
      if (bedtimeTonight <= now) {
        bedtimeTonight.setDate(bedtimeTonight.getDate() + 1);
      }

      // Schedule wind-down reminder
      const windDownTime = new Date(
        bedtimeTonight.getTime() - settings.sleep.windDownDuration * 60 * 1000
      );

      if (windDownTime > now) {
        const windDownDelay = (windDownTime.getTime() - now.getTime()) / 1000;

        await Notifications.scheduleNotificationAsync({
          content: {
            title: "😴 Wind Down Time",
            body: getSleepMessage("winddown"),
            sound: "default",
            data: { type: "sleep", subtype: "winddown" },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: windDownDelay,
          },
        });

        console.log(
          `😴 Wind down reminder scheduled for ${windDownTime.toLocaleTimeString()}`
        );
      }

      // Schedule bedtime reminder
      const bedtimeDelay = (bedtimeTonight.getTime() - now.getTime()) / 1000;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🌙 Bedtime Reminder",
          body: getSleepMessage("bedtime"),
          sound: "default",
          data: { type: "sleep", subtype: "bedtime" },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: bedtimeDelay,
        },
      });

      setNextReminders((prev) => ({
        ...prev,
        sleep: bedtimeTonight,
      }));

      console.log(
        `🌙 Bedtime reminder scheduled for ${bedtimeTonight.toLocaleTimeString()}`
      );
    } catch (error) {
      console.error("Failed to schedule sleep reminder:", error);
    }
  };

  const scheduleMovementReminders = async () => {
    try {
      const now = new Date();
      const hour = now.getHours();

      // Don't schedule movement reminders during sleep hours
      if (hour < 7 || hour > 22) {
        return;
      }

      const nextMovementTime = new Date(
        now.getTime() + settings.movement.interval * 60 * 1000
      );

      await audioSystem.scheduleSmartReminder(
        "idle",
        settings.movement.interval,
        {
          stepCount: currentStepCount,
          timeOfDay:
            hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening",
        }
      );

      setNextReminders((prev) => ({
        ...prev,
        movement: nextMovementTime,
      }));

      console.log(
        `🚶 Movement reminder scheduled for ${nextMovementTime.toLocaleTimeString()}`
      );
    } catch (error) {
      console.error("Failed to schedule movement reminder:", error);
    }
  };

  const getHydrationMessage = (): string => {
    const messages = [
      "Time to hydrate! Your body needs water to perform at its best 💧",
      "Stay refreshed! A glass of water helps maintain your energy levels ✨",
      "Hydration checkpoint! Keep your body happy and healthy 🌊",
      "Water break time! Your cells are thanking you in advance 💙",
      "Refresh and recharge! A little water goes a long way 🏃‍♂️",
    ];

    // Adjust message based on activity level
    if (userActivityLevel === "high") {
      return "Great workout! Time to replenish with some water 💦";
    }

    if (todayStats.waterIntake < 4) {
      return "You're doing great! Let's keep up the hydration momentum 💧";
    }

    return messages[Math.floor(Math.random() * messages.length)];
  };

  const getSleepMessage = (type: "winddown" | "bedtime"): string => {
    if (type === "winddown") {
      return "Start winding down for better sleep quality. Maybe dim the lights and put away screens? 😌";
    }

    const bedtimeMessages = [
      "Time for bed! Quality sleep helps your body recover and prepares you for tomorrow's activities 🌙",
      "Sweet dreams! Good rest makes tomorrow's eco-friendly adventures even better 😴",
      "Bedtime reminder: Your body repairs itself during sleep. Give it the rest it deserves! 💤",
      "Time to recharge! Tomorrow's environmental impact depends on tonight's good sleep 🌟",
    ];

    return bedtimeMessages[Math.floor(Math.random() * bedtimeMessages.length)];
  };

  const handleHydrationLog = async () => {
    setTodayStats((prev) => ({
      ...prev,
      waterIntake: prev.waterIntake + 1,
    }));

    // Play encouraging audio
    await audioSystem.speakCoachingMessage(
      "Great! You just hydrated. Your body is thanking you! 💧",
      { rate: 1.1, pitch: 1.05 }
    );
  };

  const handleSleepQualityUpdate = async (quality: number) => {
    setTodayStats((prev) => ({
      ...prev,
      sleepQuality: quality,
    }));

    const qualityMessages = {
      1: "Let's work on better sleep tonight. Quality rest improves everything! 😴",
      2: "Room for improvement! Try winding down earlier tonight 🌙",
      3: "Not bad! Small adjustments can make big improvements 💤",
      4: "Great sleep! You're giving your body what it needs 🌟",
      5: "Excellent! You're mastering the art of quality sleep 👑",
    };

    await audioSystem.speakCoachingMessage(
      qualityMessages[quality as keyof typeof qualityMessages]
    );
  };

  const updateSetting = (
    category: keyof ReminderSettings,
    key: string,
    value: any
  ) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  const testReminder = async (type: "hydration" | "sleep" | "movement") => {
    switch (type) {
      case "hydration":
        await audioSystem.speakCoachingMessage(getHydrationMessage());
        break;
      case "sleep":
        await audioSystem.speakCoachingMessage(getSleepMessage("bedtime"));
        break;
      case "movement":
        await audioSystem.playGentleReminder("idle");
        break;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.section}>
        <ThemedView style={[styles.section, { backgroundColor: 'transparent', shadowColor: 'transparent', elevation: 0 }]}>
          <ThemedText type="title" style={styles.title}>
            Health & Wellness Reminders
          </ThemedText>

          {/* Today's Stats */}
          <ThemedView style={styles.statsContainer}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Today's Health Stats
            </ThemedText>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <ThemedText style={styles.statNumber}>
                  {todayStats.waterIntake}
                </ThemedText>
                <ThemedText style={styles.statLabel}>Glasses</ThemedText>
                <TouchableOpacity
                  style={styles.logButton}
                  onPress={handleHydrationLog}
                >
                  <ThemedText style={styles.logButtonText}>+1</ThemedText>
                </TouchableOpacity>
              </View>
              <View style={styles.statCard}>
                <ThemedText style={styles.statNumber}>
                  {todayStats.sleepQuality}/5
                </ThemedText>
                <ThemedText style={styles.statLabel}> Sleep Quality</ThemedText>
              </View>
              <View style={styles.statCard}>
                <ThemedText style={styles.statNumber}>
                  {todayStats.activeHours}h
                </ThemedText>
                <ThemedText style={styles.statLabel}>🚶 Active Hours</ThemedText>
              </View>
            </View>
          </ThemedView>

          {/* Hydration Settings */}
          <ThemedView style={styles.reminderSection}>
            <View style={styles.reminderHeader}>
              <ThemedText type="subtitle">Hydration Reminders</ThemedText>
              <Switch
                value={settings.hydration.enabled}
                onValueChange={(value) =>
                  updateSetting("hydration", "enabled", value)
                }
                trackColor={{ false: "#767577", true: "#4CAF50" }}
              />
            </View>

            {settings.hydration.enabled && (
              <View style={styles.settingsContent}>
                <View style={styles.settingRow}>
                  <ThemedText>
                    Interval: {settings.hydration.interval} minutes
                  </ThemedText>
                  <View style={styles.intervalButtons}>
                    <TouchableOpacity
                      style={styles.intervalButton}
                      onPress={() =>
                        updateSetting(
                          "hydration",
                          "interval",
                          Math.max(30, settings.hydration.interval - 15)
                        )
                      }
                    >
                      <ThemedText style={styles.intervalButtonText}>-</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.intervalButton}
                      onPress={() =>
                        updateSetting(
                          "hydration",
                          "interval",
                          Math.min(180, settings.hydration.interval + 15)
                        )
                      }
                    >
                      <ThemedText style={styles.intervalButtonText}>+</ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.testButton}
                  onPress={() => testReminder("hydration")}
                >
                  <ThemedText style={styles.testButtonText}>
                    Test Reminder
                  </ThemedText>
                </TouchableOpacity>

                {nextReminders.hydration && (
                  <ThemedText style={styles.nextReminderText}>
                    Next: {nextReminders.hydration.toLocaleTimeString()}
                  </ThemedText>
                )}
              </View>
            )}
          </ThemedView>

          {/* Sleep Settings */}
          <ThemedView style={styles.reminderSection}>
            <View style={styles.reminderHeader}>
              <ThemedText type="subtitle">Sleep Reminders</ThemedText>
              <Switch
                value={settings.sleep.enabled}
                onValueChange={(value) =>
                  updateSetting("sleep", "enabled", value)
                }
                trackColor={{ false: "#767577", true: "#4CAF50" }}
              />
            </View>

            {settings.sleep.enabled && (
              <View style={styles.settingsContent}>
                <View style={styles.settingRow}>
                  <ThemedText>
                    Bedtime: {settings.sleep.bedtimeReminder}
                  </ThemedText>
                </View>

                <View style={styles.settingRow}>
                  <ThemedText>
                    Wind down: {settings.sleep.windDownDuration} min before
                  </ThemedText>
                </View>

                <View style={styles.sleepQualityContainer}>
                  <ThemedText style={styles.sleepQualityLabel}>
                    Rate last night's sleep:
                  </ThemedText>
                  <View style={styles.ratingButtons}>
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <TouchableOpacity
                        key={rating}
                        style={[
                          styles.ratingButton,
                          todayStats.sleepQuality === rating &&
                            styles.ratingButtonActive,
                        ]}
                        onPress={() => handleSleepQualityUpdate(rating)}
                      >
                        <ThemedText style={styles.ratingButtonText}>
                          {rating}
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.testButton}
                  onPress={() => testReminder("sleep")}
                >
                  <ThemedText style={styles.testButtonText}>
                    Test Reminder
                  </ThemedText>
                </TouchableOpacity>

                {nextReminders.sleep && (
                  <ThemedText style={styles.nextReminderText}>
                    Next bedtime: {nextReminders.sleep.toLocaleTimeString()}
                  </ThemedText>
                )}
              </View>
            )}
          </ThemedView>

          {/* Movement Settings */}
          <ThemedView style={styles.reminderSection}>
            <View style={styles.reminderHeader}>
              <ThemedText type="subtitle">Movement Reminders</ThemedText>
              <Switch
                value={settings.movement.enabled}
                onValueChange={(value) =>
                  updateSetting("movement", "enabled", value)
                }
                trackColor={{ false: "#767577", true: "#4CAF50" }}
              />
            </View>

            {settings.movement.enabled && (
              <View style={styles.settingsContent}>
                <View style={styles.settingRow}>
                  <ThemedText>
                    Idle time: {settings.movement.interval} minutes
                  </ThemedText>
                  <View style={styles.intervalButtons}>
                    <TouchableOpacity
                      style={styles.intervalButton}
                      onPress={() =>
                        updateSetting(
                          "movement",
                          "interval",
                          Math.max(15, settings.movement.interval - 15)
                        )
                      }
                    >
                      <ThemedText style={styles.intervalButtonText}>-</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.intervalButton}
                      onPress={() =>
                        updateSetting(
                          "movement",
                          "interval",
                          Math.min(120, settings.movement.interval + 15)
                        )
                      }
                    >
                      <ThemedText style={styles.intervalButtonText}>+</ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.testButton}
                  onPress={() => testReminder("movement")}
                >
                  <ThemedText style={styles.testButtonText}>
                    Test Reminder
                  </ThemedText>
                </TouchableOpacity>

                {nextReminders.movement && (
                  <ThemedText style={styles.nextReminderText}>
                    Next: {nextReminders.movement.toLocaleTimeString()}
                  </ThemedText>
                )}
              </View>
            )}
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: 16,
  },
  section: {
    padding: 20,
    backgroundColor: 'transparent',
    shadowColor: 'transparent',
    elevation: 0,
  },
  title: {
    textAlign: "center",
    marginBottom: 20,
    color: '#fff',
  },
  statsContainer: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 15,
    backgroundColor: 'rgba(33, 150, 243, 0.10)',
  },
  sectionTitle: {
    marginBottom: 15,
    textAlign: "center",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statCard: {
    alignItems: "center",
    padding: 10,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
    color: '#fff',
  },
  logButton: {
    marginTop: 8,
    backgroundColor: '#274472',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  logButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  reminderSection: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 15,
    backgroundColor: 'rgba(79, 195, 247, 0.10)',
  },
  reminderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  settingsContent: {
    marginTop: 10,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  intervalButtons: {
    flexDirection: "row",
    gap: 10,
  },
  intervalButton: {
    backgroundColor: '#4FC3F7',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  intervalButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  testButton: {
    backgroundColor: "#FF9800",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: "center",
    marginVertical: 10,
  },
  testButtonText: {
    color: "white",
    fontWeight: "600",
  },
  nextReminderText: {
    textAlign: "center",
    fontSize: 12,
    opacity: 0.7,
    fontStyle: "italic",
  },
  sleepQualityContainer: {
    marginVertical: 10,
  },
  sleepQualityLabel: {
    marginBottom: 10,
    textAlign: "center",
  },
  ratingButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  ratingButton: {
    backgroundColor: "#E0E0E0",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  ratingButtonActive: {
    backgroundColor: '#4FC3F7',
  },
  ratingButtonText: {
    fontWeight: "600",
    color: "white",
  },
});
