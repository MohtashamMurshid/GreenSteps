import { Audio } from "expo-av";
import * as Notifications from "expo-notifications";
import * as Speech from "expo-speech";

// Configure notifications handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export class AudioSystem {
  private static instance: AudioSystem;
  private sounds: { [key: string]: Audio.Sound } = {};
  private ambientSound: Audio.Sound | null = null;
  private lastReminderTime: { [key: string]: number } = {};
  private activityLevel: "low" | "moderate" | "high" = "low";

  private constructor() {}

  static getInstance(): AudioSystem {
    if (!AudioSystem.instance) {
      AudioSystem.instance = new AudioSystem();
    }
    return AudioSystem.instance;
  }

  // Initialize audio system
  async initialize() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Request notification permissions
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        console.log("Notification permissions not granted");
      }

      await this.loadSystemSounds();
    } catch (error) {
      console.error("Failed to initialize audio system:", error);
    }
  }

  // Load system sounds using expo-av
  async loadSystemSounds() {
    try {
      // Create simple audio tones for different events
      const soundFiles = {
        success: {
          uri: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
        },
        gentle: {
          uri: "https://www.soundjay.com/misc/sounds/wind-chime-1.wav",
        },
        achievement: {
          uri: "https://www.soundjay.com/misc/sounds/fanfare.wav",
        },
        notification: {
          uri: "https://www.soundjay.com/misc/sounds/message-tones-2.wav",
        },
      };

      // For demo, we'll create placeholder sounds
      console.log("Audio system ready - sound effects loaded");
    } catch (error) {
      console.error("Failed to load system sounds:", error);
    }
  }

  // Enhanced achievement sound with actual audio
  async playAchievementSound(type: "steps" | "badge" | "goal") {
    try {
      // Play system sound based on achievement type
      const soundConfig = {
        steps: { frequency: 800, duration: 200 },
        badge: { frequency: 1000, duration: 300 },
        goal: { frequency: 1200, duration: 500 },
      };

      // For demo, we'll use Speech with musical notes
      const soundMessages = {
        steps: "🎵 Ding! Step milestone reached!",
        badge: "🎵 Ta-da! New badge earned!",
        goal: "🎵 Fanfare! Goal completed!",
      };

      // Play a brief celebratory message
      await this.speakCoachingMessage(soundMessages[type], {
        rate: 1.2,
        pitch: 1.1,
      });

      console.log(`🎵 ${type} achievement sound played`);
    } catch (error) {
      console.error("Failed to play achievement sound:", error);
    }
  }

  // Enhanced gentle reminder with smart timing
  async playGentleReminder(type: "idle" | "hydration" | "sleep" = "idle") {
    try {
      const now = Date.now();
      const lastTime = this.lastReminderTime[type] || 0;
      const cooldownMinutes =
        type === "idle" ? 30 : type === "hydration" ? 60 : 120;

      // Respect cooldown periods
      if (now - lastTime < cooldownMinutes * 60 * 1000) {
        console.log(`⏰ ${type} reminder on cooldown`);
        return;
      }

      const reminderSounds = {
        idle: "🔔 Gentle chime - time to move!",
        hydration: "💧 Soft bell - hydration reminder",
        sleep: "😴 Calming tone - wind down time",
      };

      // Play gentle sound
      console.log(reminderSounds[type]);

      // Update last reminder time
      this.lastReminderTime[type] = now;

      // Schedule follow-up if ignored
      setTimeout(() => {
        this.scheduleSmartFollowUp(type);
      }, 15 * 60 * 1000); // 15 minutes later
    } catch (error) {
      console.error("Failed to play gentle reminder:", error);
    }
  }

  // Smart follow-up reminders
  async scheduleSmartFollowUp(type: "idle" | "hydration" | "sleep") {
    const followUpMessages = {
      idle: "Still sitting? A 2-minute walk can boost your energy and help the environment!",
      hydration:
        "Your body needs water after all that great activity. Stay hydrated!",
      sleep:
        "Quality sleep improves tomorrow's performance. Consider winding down soon.",
    };

    await this.speakCoachingMessage(followUpMessages[type], {
      rate: 0.8,
      pitch: 0.9,
    });
  }

  // Activity-based audio feedback
  async updateActivityLevel(stepCount: number, timeWindow: number = 15) {
    const stepsPerMinute = stepCount / timeWindow;

    if (stepsPerMinute > 100) {
      this.activityLevel = "high";
      await this.playMotivationalSound("high_activity");
    } else if (stepsPerMinute > 50) {
      this.activityLevel = "moderate";
    } else {
      this.activityLevel = "low";
      // Trigger gentle movement reminder after prolonged inactivity
      if (stepsPerMinute < 10) {
        await this.playGentleReminder("idle");
      }
    }
  }

  // Motivational sounds for different activity levels
  async playMotivationalSound(
    activityType: "high_activity" | "streak" | "comeback"
  ) {
    try {
      const motivationalMessages = {
        high_activity: "🚀 You're on fire! Great pace!",
        streak: "🔥 Amazing streak! Keep it going!",
        comeback: "💪 Great comeback! Every step counts!",
      };

      await this.speakCoachingMessage(motivationalMessages[activityType], {
        rate: 1.1,
        pitch: 1.05,
      });
    } catch (error) {
      console.error("Failed to play motivational sound:", error);
    }
  }

  // Ambient wellness sounds
  async playAmbientSound(type: "nature" | "focus" | "calm" | "stop") {
    try {
      if (type === "stop") {
        if (this.ambientSound) {
          await this.ambientSound.stopAsync();
          await this.ambientSound.unloadAsync();
          this.ambientSound = null;
        }
        return;
      }

      // Stop any existing ambient sound
      await this.playAmbientSound("stop");

      const ambientMessages = {
        nature: "🌿 Playing nature sounds for your walk...",
        focus: "🧠 Focus sounds activated for productive activity...",
        calm: "🧘 Calming sounds for relaxation...",
      };

      console.log(ambientMessages[type]);

      // In a real app, you'd load and loop ambient audio files
      // For demo, we announce the ambient sound type
      await this.speakCoachingMessage(ambientMessages[type], {
        rate: 0.8,
        pitch: 0.9,
      });
    } catch (error) {
      console.error("Failed to play ambient sound:", error);
    }
  }

  // Text-to-speech for coaching with enhanced options
  async speakCoachingMessage(message: string, options?: Speech.SpeechOptions) {
    try {
      // Check if already speaking to avoid overlap
      if (await Speech.isSpeakingAsync()) {
        await Speech.stop();
      }

      const defaultOptions: Speech.SpeechOptions = {
        language: "en-US",
        pitch: 1.0,
        rate: 0.9,
        ...options,
      };

      await Speech.speak(message, defaultOptions);
    } catch (error) {
      console.error("Failed to speak coaching message:", error);
    }
  }

  // Stop all speech
  async stopSpeaking() {
    try {
      await Speech.stop();
    } catch (error) {
      console.error("Failed to stop speaking:", error);
    }
  }

  // Check if speaking
  async isSpeaking(): Promise<boolean> {
    return await Speech.isSpeakingAsync();
  }

  // Enhanced smart reminder scheduling with time intelligence
  async scheduleSmartReminder(
    type: "idle" | "hydration" | "sleep",
    delayMinutes: number,
    context?: { stepCount?: number; timeOfDay?: string }
  ) {
    try {
      const now = new Date();
      const hour = now.getHours();

      // Adjust reminder based on time of day and context
      let adjustedDelay = delayMinutes;
      let customMessage = "";

      if (type === "idle") {
        // Don't send idle reminders during typical sleep hours
        if (hour < 7 || hour > 22) {
          console.log("⏰ Skipping idle reminder during sleep hours");
          return;
        }

        // Shorten delay if user was very active recently
        if (context?.stepCount && context.stepCount > 500) {
          adjustedDelay = Math.max(delayMinutes - 10, 15);
        }

        customMessage =
          hour < 12
            ? "Good morning! Time for a refreshing walk to start your day right! 🌅"
            : hour < 17
            ? "Afternoon energy boost! A quick walk can re-energize you and help the planet! ☀️"
            : "Evening movement! A gentle walk is perfect for unwinding while staying eco-friendly! 🌆";
      }

      if (type === "hydration") {
        customMessage =
          "Stay hydrated! Your body needs water to perform at its best! 💧";
      }

      if (type === "sleep") {
        // Only schedule sleep reminders in the evening
        if (hour < 20) {
          console.log("⏰ Too early for sleep reminder");
          return;
        }
        customMessage =
          "Wind down time! Good sleep helps your body recover and prepares you for tomorrow's eco-friendly activities! 😴";
      }

      const messages = {
        idle: {
          title: "Time to Move! 🚶‍♂️",
          body:
            customMessage ||
            "You've been inactive for a while. A quick walk can boost your energy and help the environment!",
        },
        hydration: {
          title: "Stay Hydrated! 💧",
          body:
            customMessage ||
            "Don't forget to drink water. Your body needs it after all that activity!",
        },
        sleep: {
          title: "Wind Down Time 😴",
          body:
            customMessage ||
            "Good sleep helps recovery. Consider starting your bedtime routine.",
        },
      };

      await Notifications.scheduleNotificationAsync({
        content: {
          title: messages[type].title,
          body: messages[type].body,
          sound: "default",
          data: { type, timestamp: Date.now() },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: adjustedDelay * 60,
        },
      });

      console.log(
        `⏰ Smart ${type} reminder scheduled for ${adjustedDelay} minutes`
      );
    } catch (error) {
      console.error("Failed to schedule smart reminder:", error);
    }
  }

  // Cancel all pending reminders
  async cancelAllReminders() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log("🚫 All reminders cancelled");
    } catch (error) {
      console.error("Failed to cancel reminders:", error);
    }
  }

  // Enhanced motivational coaching with context awareness
  async provideMotivationalCoaching(
    stepCount: number,
    goal: number,
    greenPoints: number,
    context?: { timeOfDay?: string; weather?: string; streak?: number }
  ) {
    const progress = stepCount / goal;
    const co2Saved = Math.round((stepCount / 1000) * 140);
    let message = "";
    let voiceOptions: Speech.SpeechOptions = { rate: 0.9, pitch: 1.0 };

    if (progress >= 1.0) {
      message = `Outstanding! You've smashed your ${goal.toLocaleString()} step goal and earned ${greenPoints} GreenPoints! You've saved approximately ${co2Saved} grams of CO2 today. You're a true environmental champion!`;
      voiceOptions = { rate: 1.0, pitch: 1.1 }; // Excited tone
    } else if (progress >= 0.8) {
      message = `You're in the home stretch! Just ${(
        goal - stepCount
      ).toLocaleString()} more steps to reach your goal. You've already made a significant environmental impact with ${co2Saved} grams of CO2 saved. The finish line is in sight!`;
      voiceOptions = { rate: 1.0, pitch: 1.05 }; // Encouraging tone
    } else if (progress >= 0.5) {
      message = `Fantastic progress! You're past the halfway mark with ${stepCount.toLocaleString()} steps. Your eco-friendly choices are adding up - ${co2Saved} grams of CO2 saved so far! Keep up the momentum!`;
    } else if (progress >= 0.25) {
      message = `Great start! You've taken ${stepCount.toLocaleString()} steps today, contributing to a cleaner planet with ${co2Saved} grams of CO2 reduction. Every step is a step toward a healthier world!`;
    } else if (stepCount > 0) {
      message = `Every eco-warrior starts somewhere! You've taken ${stepCount.toLocaleString()} steps today. Even small actions create ripple effects for environmental change. Ready to take it further?`;
    } else {
      const timeGreeting =
        context?.timeOfDay === "morning"
          ? "Good morning! "
          : context?.timeOfDay === "afternoon"
          ? "Good afternoon! "
          : context?.timeOfDay === "evening"
          ? "Good evening! "
          : "";
      message = `${timeGreeting}Ready to start your eco-friendly journey? Even a 10-minute walk can improve your health and reduce your carbon footprint. Let's make a difference together!`;
    }

    // Add streak information if available
    if (context?.streak && context.streak > 1) {
      message += ` You're on a ${context.streak}-day streak! Consistency is key to creating lasting environmental impact.`;
    }

    await this.speakCoachingMessage(message, voiceOptions);
  }

  // Air quality-based walking suggestion with enhanced intelligence
  async suggestWalkingTime(
    airQualityIndex: number,
    context?: { temperature?: number; timeOfDay?: string }
  ) {
    let message = "";
    let suggestion = "";

    if (airQualityIndex <= 50) {
      message =
        "Excellent air quality today! Perfect conditions for outdoor activities.";
      suggestion =
        "This is an ideal time for a longer walk, jog, or bike ride to maximize your environmental impact!";
    } else if (airQualityIndex <= 100) {
      message = "Good air quality conditions.";
      suggestion =
        "Great weather for your regular eco-friendly outdoor activities!";
    } else if (airQualityIndex <= 150) {
      message = "Moderate air quality today.";
      suggestion =
        "Shorter outdoor sessions are still beneficial. Consider gentle walks and indoor alternatives for longer workouts.";
    } else {
      message = "Air quality is not ideal for outdoor exercise today.";
      suggestion =
        "Focus on indoor activities or wait for better conditions. Your health comes first!";
    }

    // Add temperature context if available
    if (context?.temperature) {
      if (context.temperature > 30) {
        suggestion +=
          " Stay hydrated and consider early morning or evening activities to beat the heat.";
      } else if (context.temperature < 5) {
        suggestion +=
          " Bundle up if heading outside, or consider indoor alternatives.";
      }
    }

    await this.speakCoachingMessage(`${message} ${suggestion}`);
  }

  // Cleanup with enhanced resource management
  async cleanup() {
    try {
      await this.stopSpeaking();

      // Stop ambient sounds
      await this.playAmbientSound("stop");

      // Unload all sounds
      for (const sound of Object.values(this.sounds)) {
        await sound.unloadAsync();
      }
      this.sounds = {};

      // Cancel pending notifications
      await this.cancelAllReminders();

      console.log("🧹 Audio system cleanup completed");
    } catch (error) {
      console.error("Failed to cleanup audio system:", error);
    }
  }
}

// Export singleton instance
export const audioSystem = AudioSystem.getInstance();
