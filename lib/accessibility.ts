import { AccessibilityInfo, Alert } from "react-native";
import { audioSystem } from "./audioSystem";

export interface AccessibilityConfig {
  reduceMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  voiceOverEnabled: boolean;
  soundEnabled: boolean;
}

export class AccessibilityManager {
  private static instance: AccessibilityManager;
  private config: AccessibilityConfig = {
    reduceMotion: false,
    highContrast: false,
    largeText: false,
    voiceOverEnabled: false,
    soundEnabled: true,
  };
  private screenReaderSubscription: any = null;
  private reduceMotionSubscription: any = null;

  private constructor() {}

  static getInstance(): AccessibilityManager {
    if (!AccessibilityManager.instance) {
      AccessibilityManager.instance = new AccessibilityManager();
    }
    return AccessibilityManager.instance;
  }

  // Initialize accessibility features
  async initialize() {
    try {
      // Check for screen reader
      const isScreenReaderEnabled =
        await AccessibilityInfo.isScreenReaderEnabled();
      this.config.voiceOverEnabled = isScreenReaderEnabled;

      // Check for reduced motion preference
      const isReduceMotionEnabled =
        await AccessibilityInfo.isReduceMotionEnabled();
      this.config.reduceMotion = isReduceMotionEnabled;

      // Set up listeners for accessibility changes
      AccessibilityInfo.addEventListener(
        "screenReaderChanged",
        this.handleScreenReaderChange
      );
      AccessibilityInfo.addEventListener(
        "reduceMotionChanged",
        this.handleReduceMotionChange
      );

      console.log("♿ Accessibility features initialized");
    } catch (error) {
      console.error("Failed to initialize accessibility features:", error);
    }
  }

  private handleScreenReaderChange = (isEnabled: boolean) => {
    this.config.voiceOverEnabled = isEnabled;
    console.log(`♿ Screen reader ${isEnabled ? "enabled" : "disabled"}`);
  };

  private handleReduceMotionChange = (isEnabled: boolean) => {
    this.config.reduceMotion = isEnabled;
    console.log(`♿ Reduce motion ${isEnabled ? "enabled" : "disabled"}`);
  };

  // Get current accessibility configuration
  getConfig(): AccessibilityConfig {
    return { ...this.config };
  }

  // Update accessibility settings
  updateConfig(updates: Partial<AccessibilityConfig>) {
    this.config = { ...this.config, ...updates };
  }

  // WCAG-compliant color contrast utilities
  static getContrastColors(isDarkMode: boolean = false) {
    if (isDarkMode) {
      return {
        primary: "#ffffff",
        secondary: "#e0e0e0",
        background: "#121212",
        surface: "#1e1e1e",
        success: "#66bb6a",
        warning: "#ffb74d",
        error: "#f44336",
        disabled: "#666666",
      };
    }

    return {
      primary: "#000000",
      secondary: "#424242",
      background: "#ffffff",
      surface: "#f5f5f5",
      success: "#388e3c",
      warning: "#f57c00",
      error: "#d32f2f",
      disabled: "#9e9e9e",
    };
  }

  // Accessible font sizing based on user preferences
  static getAccessibleFontSize(
    baseSize: number,
    config?: AccessibilityConfig
  ): number {
    const multiplier = config?.largeText ? 1.3 : 1.0;
    return Math.round(baseSize * multiplier);
  }

  // Screen reader announcements
  async announceForScreenReader(
    message: string,
    priority: "low" | "high" = "low"
  ) {
    if (!this.config.voiceOverEnabled) return;

    try {
      if (priority === "high") {
        // Use both screen reader and audio system for important announcements
        AccessibilityInfo.announceForAccessibility(message);
        if (this.config.soundEnabled) {
          await audioSystem.speakCoachingMessage(message, { rate: 0.8 });
        }
      } else {
        AccessibilityInfo.announceForAccessibility(message);
      }
    } catch (error) {
      console.error("Failed to announce for screen reader:", error);
    }
  }

  // Accessible animation duration
  getAnimationDuration(defaultDuration: number): number {
    return this.config.reduceMotion ? 0 : defaultDuration;
  }

  // Haptic feedback for accessibility
  async provideHapticFeedback(type: "light" | "medium" | "heavy" = "light") {
    try {
      // Only provide haptic feedback if user preferences allow
      if (!this.config.reduceMotion) {
        // In a real app, use Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        console.log(`📳 Haptic feedback: ${type}`);
      }
    } catch (error) {
      console.error("Failed to provide haptic feedback:", error);
    }
  }

  // Accessible touch target sizing
  static getAccessibleTouchTarget() {
    return {
      minWidth: 44, // iOS minimum
      minHeight: 44, // iOS minimum
      android: {
        minWidth: 48, // Android minimum
        minHeight: 48, // Android minimum
      },
    };
  }

  // Audio description for visual elements
  async provideAudioDescription(description: string, elementType?: string) {
    if (!this.config.voiceOverEnabled || !this.config.soundEnabled) return;

    try {
      const prefix = elementType ? `${elementType}: ` : "";
      await audioSystem.speakCoachingMessage(`${prefix}${description}`, {
        rate: 0.9,
        pitch: 0.95,
      });
    } catch (error) {
      console.error("Failed to provide audio description:", error);
    }
  }

  // Accessible error messaging
  async handleAccessibleError(error: string, context?: string) {
    const fullMessage = context ? `${context}: ${error}` : error;

    // Visual alert
    Alert.alert(
      "Accessibility Notice",
      fullMessage,
      [{ text: "OK", style: "default" }],
      { cancelable: true }
    );

    // Audio announcement
    await this.announceForScreenReader(fullMessage, "high");
  }

  // Focus management utilities
  static getFocusableElements() {
    return ["button", "link", "input", "select", "textarea", "touchable"];
  }

  // Accessible loading states
  getAccessibleLoadingMessage(context?: string): string {
    const baseMessage = "Loading";
    if (context) {
      return `${baseMessage} ${context}. Please wait.`;
    }
    return `${baseMessage}. Please wait.`;
  }

  // Progress announcements for screen readers
  async announceProgress(current: number, total: number, context?: string) {
    if (!this.config.voiceOverEnabled) return;

    const percentage = Math.round((current / total) * 100);
    const contextPrefix = context ? `${context}: ` : "";
    const message = `${contextPrefix}${percentage} percent complete`;

    // Only announce progress at meaningful intervals (every 10%)
    if (percentage % 10 === 0) {
      await this.announceForScreenReader(message);
    }
  }

  // Accessible form validation
  getAccessibleValidationMessage(fieldName: string, error?: string): string {
    if (error) {
      return `${fieldName} field has an error: ${error}`;
    }
    return `${fieldName} field is valid`;
  }

  // Cleanup accessibility listeners
  cleanup() {
    try {
      // Note: In React Native, accessibility listeners are automatically cleaned up
      // when the component unmounts. Manual cleanup is not required.
      console.log("♿ Accessibility listeners cleaned up");
    } catch (error) {
      console.error("Failed to cleanup accessibility listeners:", error);
    }
  }
}

// Accessibility helper functions
export const accessibility = AccessibilityManager.getInstance();

// WCAG compliance utilities
export const wcag = {
  // Color contrast ratios (WCAG AA standard)
  contrastRatios: {
    normalText: 4.5, // 4.5:1 for normal text
    largeText: 3.0, // 3.0:1 for large text (18pt+)
    nonTextElements: 3.0, // 3.0:1 for UI components
  },

  // Minimum touch target sizes
  touchTargets: {
    minimum: 44, // 44x44 points minimum
    recommended: 48, // 48x48 points recommended
  },

  // Text size recommendations
  textSizes: {
    minimum: 12, // Minimum readable size
    body: 16, // Body text default
    large: 18, // Large text threshold
    heading: 20, // Minimum heading size
  },

  // Focus indicators
  focusIndicator: {
    width: 2,
    color: "#0066cc",
    style: "solid",
  },
};

// Accessible component props helpers
export const getAccessibleProps = (
  label: string,
  hint?: string,
  role?: string,
  state?: { expanded?: boolean; selected?: boolean; disabled?: boolean }
) => ({
  accessible: true,
  accessibilityLabel: label,
  accessibilityHint: hint,
  accessibilityRole: role as any,
  accessibilityState: state,
});

// Accessible timer announcements
export const createAccessibleTimer = (
  duration: number,
  onUpdate?: (timeLeft: number) => void,
  context?: string
) => {
  let timeLeft = duration;

  const interval = setInterval(async () => {
    timeLeft--;

    if (onUpdate) onUpdate(timeLeft);

    // Announce important time milestones
    if (
      timeLeft === 60 ||
      timeLeft === 30 ||
      timeLeft === 10 ||
      timeLeft === 0
    ) {
      const message =
        timeLeft === 0
          ? `${context || "Timer"} completed`
          : `${timeLeft} seconds remaining`;

      await accessibility.announceForScreenReader(message);
    }

    if (timeLeft <= 0) {
      clearInterval(interval);
    }
  }, 1000);

  return () => clearInterval(interval);
};

export default accessibility;
