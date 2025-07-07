import { Dimensions, PixelRatio, Platform } from "react-native";
import { accessibility } from "./accessibility";
import { audioSystem } from "./audioSystem";

interface DeviceCapabilities {
  isLowEnd: boolean;
  memoryLevel: "low" | "medium" | "high";
  processingPower: "low" | "medium" | "high";
  screenDensity: number;
  platformOptimizations: {
    useNativeDriver: boolean;
    enableHardwareAcceleration: boolean;
    maxConcurrentAnimations: number;
    audioQuality: "low" | "medium" | "high";
  };
}

interface PerformanceMetrics {
  frameRate: number;
  memoryUsage: number;
  audioLatency: number;
  animationPerformance: number;
  lastUpdated: Date;
}

export class PerformanceManager {
  private static instance: PerformanceManager;
  private deviceCapabilities: DeviceCapabilities;
  private metrics: PerformanceMetrics;
  private animationQueue: {
    id: string;
    priority: number;
    callback: () => void;
  }[] = [];
  private activeAnimations: Set<string> = new Set();
  private performanceMonitorInterval: any = null;

  private constructor() {
    this.deviceCapabilities = this.detectDeviceCapabilities();
    this.metrics = {
      frameRate: 60,
      memoryUsage: 0,
      audioLatency: 0,
      animationPerformance: 100,
      lastUpdated: new Date(),
    };
  }

  static getInstance(): PerformanceManager {
    if (!PerformanceManager.instance) {
      PerformanceManager.instance = new PerformanceManager();
    }
    return PerformanceManager.instance;
  }

  // Initialize performance monitoring
  async initialize() {
    try {
      this.startPerformanceMonitoring();
      await this.optimizeForDevice();
      console.log("⚡ Performance manager initialized");
    } catch (error) {
      console.error("Failed to initialize performance manager:", error);
    }
  }

  // Detect device capabilities for optimization
  private detectDeviceCapabilities(): DeviceCapabilities {
    const { width, height } = Dimensions.get("window");
    const pixelDensity = PixelRatio.get();
    const screenSize = width * height;
    const totalPixels = screenSize * pixelDensity;

    // Estimate device performance based on screen size and platform
    const isLowEnd =
      totalPixels < 1000000 ||
      (Platform.OS === "android" && Platform.Version < 28);

    const memoryLevel: "low" | "medium" | "high" =
      totalPixels < 800000 ? "low" : totalPixels < 2000000 ? "medium" : "high";

    const processingPower: "low" | "medium" | "high" = isLowEnd
      ? "low"
      : memoryLevel === "low"
      ? "medium"
      : "high";

    return {
      isLowEnd,
      memoryLevel,
      processingPower,
      screenDensity: pixelDensity,
      platformOptimizations: {
        useNativeDriver: !isLowEnd,
        enableHardwareAcceleration: processingPower !== "low",
        maxConcurrentAnimations:
          processingPower === "high" ? 5 : processingPower === "medium" ? 3 : 2,
        audioQuality:
          memoryLevel === "high"
            ? "high"
            : memoryLevel === "medium"
            ? "medium"
            : "low",
      },
    };
  }

  // Optimize settings based on device capabilities
  private async optimizeForDevice() {
    const { platformOptimizations } = this.deviceCapabilities;

    // Optimize audio system
    if (platformOptimizations.audioQuality === "low") {
      console.log("⚡ Optimizing for low-end device: reducing audio quality");
    }

    // Adjust accessibility settings for performance
    const accessibilityConfig = accessibility.getConfig();
    if (this.deviceCapabilities.isLowEnd && !accessibilityConfig.reduceMotion) {
      console.log("⚡ Suggesting motion reduction for better performance");
    }
  }

  // Start monitoring performance metrics
  private startPerformanceMonitoring() {
    this.performanceMonitorInterval = setInterval(() => {
      this.updatePerformanceMetrics();
    }, 5000); // Update every 5 seconds
  }

  // Update performance metrics
  private updatePerformanceMetrics() {
    // In a real app, you would measure actual frame rate and memory usage
    // For demo, we'll simulate realistic metrics
    const currentTime = Date.now();
    const frameDrops =
      this.activeAnimations.size >
      this.deviceCapabilities.platformOptimizations.maxConcurrentAnimations
        ? 10
        : 0;

    this.metrics = {
      frameRate: Math.max(30, 60 - frameDrops),
      memoryUsage: Math.min(80, 30 + this.activeAnimations.size * 5),
      audioLatency: this.deviceCapabilities.isLowEnd ? 150 : 50,
      animationPerformance: Math.max(50, 100 - this.activeAnimations.size * 10),
      lastUpdated: new Date(),
    };

    // Log performance warnings
    if (this.metrics.frameRate < 45) {
      console.warn("⚠️ Low frame rate detected:", this.metrics.frameRate);
    }
    if (this.metrics.memoryUsage > 70) {
      console.warn("⚠️ High memory usage:", this.metrics.memoryUsage + "%");
    }
  }

  // Get optimized animation configuration
  getOptimizedAnimationConfig(baseConfig: any) {
    const { platformOptimizations } = this.deviceCapabilities;
    const accessibilityConfig = accessibility.getConfig();

    return {
      ...baseConfig,
      useNativeDriver:
        platformOptimizations.useNativeDriver &&
        !accessibilityConfig.reduceMotion,
      duration: accessibilityConfig.reduceMotion
        ? 0
        : this.deviceCapabilities.isLowEnd
        ? baseConfig.duration * 0.7
        : baseConfig.duration,
      enableHardwareAcceleration:
        platformOptimizations.enableHardwareAcceleration,
    };
  }

  // Queue animation with priority management
  queueAnimation(id: string, priority: number, animationCallback: () => void) {
    // Remove existing animation with same ID
    this.animationQueue = this.animationQueue.filter((anim) => anim.id !== id);

    // Add new animation
    this.animationQueue.push({ id, priority, callback: animationCallback });

    // Sort by priority (higher numbers = higher priority)
    this.animationQueue.sort((a, b) => b.priority - a.priority);

    this.processAnimationQueue();
  }

  // Process animation queue based on device capabilities
  private processAnimationQueue() {
    const { maxConcurrentAnimations } =
      this.deviceCapabilities.platformOptimizations;
    const availableSlots = maxConcurrentAnimations - this.activeAnimations.size;

    if (availableSlots > 0 && this.animationQueue.length > 0) {
      const animationsToStart = this.animationQueue.splice(0, availableSlots);

      animationsToStart.forEach(({ id, callback }) => {
        this.activeAnimations.add(id);

        try {
          callback();
        } catch (error) {
          console.error("Animation execution failed:", error);
        }
      });
    }
  }

  // Mark animation as completed
  completeAnimation(id: string) {
    this.activeAnimations.delete(id);
    this.processAnimationQueue(); // Process any queued animations
  }

  // Get optimized audio settings
  getOptimizedAudioConfig() {
    const { audioQuality } = this.deviceCapabilities.platformOptimizations;

    return {
      quality: audioQuality,
      maxConcurrentSounds: this.deviceCapabilities.isLowEnd ? 2 : 4,
      enableSpatialAudio: audioQuality === "high",
      compressionLevel: audioQuality === "low" ? "high" : "medium",
    };
  }

  // Optimize chart rendering
  getOptimizedChartConfig(baseConfig: any) {
    return {
      ...baseConfig,
      animationDuration: this.deviceCapabilities.isLowEnd
        ? 0
        : baseConfig.animationDuration || 1000,
      dataPointSize:
        this.deviceCapabilities.screenDensity > 2
          ? baseConfig.dataPointSize || 4
          : 3,
      strokeWidth:
        this.deviceCapabilities.screenDensity > 2
          ? baseConfig.strokeWidth || 2
          : 1,
      enableSmoothing: !this.deviceCapabilities.isLowEnd,
    };
  }

  // Memory management for images and assets
  shouldPreloadAssets(): boolean {
    return (
      this.deviceCapabilities.memoryLevel === "high" &&
      this.metrics.memoryUsage < 50
    );
  }

  // Optimize Lottie animations
  getOptimizedLottieConfig() {
    return {
      renderMode: this.deviceCapabilities.isLowEnd ? "software" : "hardware",
      cacheComposition: this.deviceCapabilities.memoryLevel !== "low",
      speed: this.deviceCapabilities.isLowEnd ? 0.8 : 1.0,
      enableMergePathsFeature: !this.deviceCapabilities.isLowEnd,
    };
  }

  // Optimize map rendering
  getOptimizedMapConfig() {
    return {
      showsBuildings: !this.deviceCapabilities.isLowEnd,
      showsTraffic: this.deviceCapabilities.processingPower === "high",
      followUserLocation: true,
      showsUserLocation: true,
      userLocationUpdateInterval: this.deviceCapabilities.isLowEnd
        ? 10000
        : 5000, // ms
      mapPadding: this.deviceCapabilities.screenDensity > 2 ? 20 : 10,
    };
  }

  // Performance-aware notification scheduling
  getOptimizedNotificationConfig() {
    return {
      batchNotifications: this.deviceCapabilities.isLowEnd,
      maxNotificationsPerHour:
        this.deviceCapabilities.processingPower === "low" ? 2 : 4,
      enableRichNotifications: this.deviceCapabilities.memoryLevel !== "low",
      soundEnabled: this.metrics.memoryUsage < 60,
    };
  }

  // Get current performance metrics
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  // Get device capabilities
  getDeviceCapabilities(): DeviceCapabilities {
    return { ...this.deviceCapabilities };
  }

  // Force garbage collection (when possible)
  async performCleanup() {
    try {
      // Clear completed animations
      this.activeAnimations.clear();
      this.animationQueue = [];

      // Request audio system cleanup
      await audioSystem.cleanup();

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      console.log("🧹 Performance cleanup completed");
    } catch (error) {
      console.error("Performance cleanup failed:", error);
    }
  }

  // Adaptive quality adjustment
  adjustQualityBasedOnPerformance() {
    if (this.metrics.frameRate < 30) {
      // Reduce quality settings
      console.log("⚡ Reducing quality settings due to low frame rate");
      return {
        reduceAnimations: true,
        lowerAudioQuality: true,
        simplifyCharts: true,
      };
    }

    if (this.metrics.memoryUsage > 75) {
      // Reduce memory usage
      console.log("⚡ Reducing memory usage");
      return {
        clearImageCache: true,
        reduceConcurrentAnimations: true,
        disablePreloading: true,
      };
    }

    return {
      reduceAnimations: false,
      lowerAudioQuality: false,
      simplifyCharts: false,
      clearImageCache: false,
      reduceConcurrentAnimations: false,
      disablePreloading: false,
    };
  }

  // Cleanup and stop monitoring
  cleanup() {
    if (this.performanceMonitorInterval) {
      clearInterval(this.performanceMonitorInterval);
      this.performanceMonitorInterval = null;
    }
    this.activeAnimations.clear();
    this.animationQueue = [];
    console.log("⚡ Performance manager cleaned up");
  }
}

// Export singleton instance
export const performanceManager = PerformanceManager.getInstance();

// Utility functions for performance optimization
export const withPerformanceOptimization = (animationConfig: any) => {
  return performanceManager.getOptimizedAnimationConfig(animationConfig);
};

export const withAudioOptimization = () => {
  return performanceManager.getOptimizedAudioConfig();
};

export const withChartOptimization = (chartConfig: any) => {
  return performanceManager.getOptimizedChartConfig(chartConfig);
};

// Performance monitoring hook for React components
export const usePerformanceMonitoring = (componentName: string) => {
  const startTime = Date.now();

  return {
    markRenderComplete: () => {
      const renderTime = Date.now() - startTime;
      if (renderTime > 100) {
        console.warn(
          `⚠️ Slow render detected in ${componentName}: ${renderTime}ms`
        );
      }
    },
    queueAnimation: (id: string, priority: number, callback: () => void) => {
      performanceManager.queueAnimation(
        `${componentName}-${id}`,
        priority,
        callback
      );
    },
    completeAnimation: (id: string) => {
      performanceManager.completeAnimation(`${componentName}-${id}`);
    },
  };
};

export default performanceManager;
