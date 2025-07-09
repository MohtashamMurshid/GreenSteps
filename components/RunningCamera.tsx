import { Ionicons } from "@expo/vector-icons";
import {
  CameraType,
  CameraView,
  FlashMode,
  useCameraPermissions,
} from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import * as MediaLibrary from "expo-media-library";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

const { width, height } = Dimensions.get("window");

interface RunningCameraProps {
  isActive: boolean;
  onPhotoTaken?: (photo: string) => void;
  onVideoRecorded?: (video: string) => void;
  onClose?: () => void;
  activityData?: {
    steps: number;
    distance: number;
    pace: number;
    duration: number;
  };
}

export const RunningCamera: React.FC<RunningCameraProps> = ({
  isActive,
  onPhotoTaken,
  onVideoRecorded,
  onClose,
  activityData,
}) => {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [mediaLibraryPermission, requestMediaLibraryPermission] =
    MediaLibrary.usePermissions();
  const [facing, setFacing] = useState<CameraType>("back");
  const [flash, setFlash] = useState<FlashMode>("off");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [mode, setMode] = useState<"photo" | "video">("photo");
  const [recentMedia, setRecentMedia] = useState<string[]>([]);

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const recordingAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

      // Start recording animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(recordingAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(recordingAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      setRecordingDuration(0);
      recordingAnim.stopAnimation();
      recordingAnim.setValue(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  useEffect(() => {
    // Pulse animation for capture button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <ThemedView style={styles.permissionContainer}>
        <ThemedText style={styles.permissionText}>
          Camera access is required to capture your running moments
        </ThemedText>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const toggleFlash = () => {
    setFlash((current) => {
      switch (current) {
        case "off":
          return "on";
        case "on":
          return "auto";
        case "auto":
          return "off";
        default:
          return "off";
      }
    });
  };

  const takePhoto = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        exif: true,
        additionalExif: {
          steps: activityData?.steps || 0,
          distance: activityData?.distance || 0,
          pace: activityData?.pace || 0,
          duration: activityData?.duration || 0,
        },
      });

      if (photo) {
        // Save to media library
        if (mediaLibraryPermission?.granted) {
          await MediaLibrary.saveToLibraryAsync(photo.uri);
        }

        // Create activity-enhanced photo
        const enhancedPhoto = await createActivityPhoto(photo.uri);
        setRecentMedia((prev) => [enhancedPhoto, ...prev.slice(0, 4)]);
        onPhotoTaken?.(enhancedPhoto);

        // Show success feedback
        showSuccessFeedback("Photo captured!");
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo. Please try again.");
    }
  };

  const startVideoRecording = async () => {
    if (!cameraRef.current || isRecording) return;

    try {
      setIsRecording(true);
      const video = await cameraRef.current.recordAsync({
        maxDuration: 60, // 1 minute max
      });

      if (video) {
        // Save to media library
        if (mediaLibraryPermission?.granted) {
          await MediaLibrary.saveToLibraryAsync(video.uri);
        }

        setRecentMedia((prev) => [video.uri, ...prev.slice(0, 4)]);
        onVideoRecorded?.(video.uri);
        showSuccessFeedback("Video recorded!");
      }
    } catch (error) {
      console.error("Error recording video:", error);
      Alert.alert("Error", "Failed to record video. Please try again.");
    } finally {
      setIsRecording(false);
    }
  };

  const stopVideoRecording = () => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
    }
  };

  const createActivityPhoto = async (photoUri: string): Promise<string> => {
    // In a real implementation, you would overlay activity data on the photo
    // For now, we'll return the original photo URI
    return photoUri;
  };

  const showSuccessFeedback = (message: string) => {
    // Simple alert for now - could be replaced with toast or custom animation
    Alert.alert("Success", message);
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCapturePress = () => {
    if (mode === "photo") {
      takePhoto();
    } else {
      if (isRecording) {
        stopVideoRecording();
      } else {
        startVideoRecording();
      }
    }
  };

  console.log(
    "RunningCamera render - isActive:",
    isActive,
    "permission:",
    permission?.granted
  );

  if (!isActive) {
    console.log("RunningCamera: not active, returning null");
    return null;
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        flash={flash}
      >
        {/* Top Controls */}
        <LinearGradient
          colors={["rgba(0,0,0,0.7)", "transparent"]}
          style={styles.topGradient}
        >
          <View style={styles.topControls}>
            <TouchableOpacity style={styles.controlButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>

            <View style={styles.topCenterControls}>
              {isRecording && (
                <View style={styles.recordingIndicator}>
                  <Animated.View
                    style={[styles.recordingDot, { opacity: recordingAnim }]}
                  />
                  <Text style={styles.recordingText}>
                    REC {formatDuration(recordingDuration)}
                  </Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={toggleFlash}
            >
              <Ionicons
                name={
                  flash === "off"
                    ? "flash-off"
                    : flash === "on"
                    ? "flash"
                    : "flash-outline"
                }
                size={24}
                color="white"
              />
            </TouchableOpacity>
          </View>

          {/* Activity Data Overlay */}
          {activityData && (
            <View style={styles.activityOverlay}>
              <View style={styles.activityStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {activityData.steps.toLocaleString()}
                  </Text>
                  <Text style={styles.statLabel}>Steps</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {activityData.distance.toFixed(2)}km
                  </Text>
                  <Text style={styles.statLabel}>Distance</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {formatDuration(activityData.duration)}
                  </Text>
                  <Text style={styles.statLabel}>Time</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {activityData.pace.toFixed(1)}
                  </Text>
                  <Text style={styles.statLabel}>Pace</Text>
                </View>
              </View>
            </View>
          )}
        </LinearGradient>

        {/* Bottom Controls */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.7)"]}
          style={styles.bottomGradient}
        >
          <View style={styles.bottomControls}>
            {/* Recent Media Preview */}
            <View style={styles.recentMediaContainer}>
              {recentMedia.length > 0 && (
                <TouchableOpacity style={styles.recentMediaButton}>
                  <Text style={styles.recentMediaText}>
                    {recentMedia.length}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Capture Button */}
            <Animated.View
              style={[
                styles.captureButtonContainer,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.captureButton,
                  mode === "video" && isRecording && styles.recordingButton,
                ]}
                onPress={handleCapturePress}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.captureButtonInner,
                    mode === "video" &&
                      isRecording &&
                      styles.recordingButtonInner,
                  ]}
                />
              </TouchableOpacity>
            </Animated.View>

            {/* Camera Controls */}
            <View style={styles.cameraControls}>
              {/* Mode Switch */}
              <TouchableOpacity
                style={styles.modeButton}
                onPress={() => setMode(mode === "photo" ? "video" : "photo")}
              >
                <Ionicons
                  name={mode === "photo" ? "camera" : "videocam"}
                  size={24}
                  color="white"
                />
              </TouchableOpacity>

              {/* Flip Camera */}
              <TouchableOpacity
                style={styles.controlButton}
                onPress={toggleCameraFacing}
              >
                <Ionicons name="camera-reverse" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  camera: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  permissionText: {
    textAlign: "center",
    fontSize: 16,
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  topGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    paddingTop: 40,
  },
  topControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  topCenterControls: {
    flex: 1,
    alignItems: "center",
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  recordingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,0,0,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "red",
    marginRight: 8,
  },
  recordingText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  activityOverlay: {
    marginTop: 10,
    paddingHorizontal: 20,
  },
  activityStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 20,
    paddingVertical: 10,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  statLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    marginTop: 2,
  },
  bottomGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    justifyContent: "flex-end",
  },
  bottomControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  recentMediaContainer: {
    width: 60,
    alignItems: "center",
  },
  recentMediaButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  recentMediaText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  captureButtonContainer: {
    alignItems: "center",
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.3)",
  },
  recordingButton: {
    backgroundColor: "red",
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "white",
  },
  recordingButtonInner: {
    width: 30,
    height: 30,
    borderRadius: 4,
    backgroundColor: "white",
  },
  cameraControls: {
    width: 60,
    alignItems: "center",
    gap: 15,
  },
  modeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
});
