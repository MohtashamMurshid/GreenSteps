import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Dimensions,
  FlatList,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedText } from "./ThemedText";

const { width, height } = Dimensions.get("window");

interface ActivityMedia {
  uri: string;
  type: "photo" | "video";
  timestamp: Date;
  activityData?: {
    steps: number;
    distance: number;
    duration: number;
  };
}

interface ActivityPhotoGalleryProps {
  media: ActivityMedia[];
  onClose?: () => void;
  visible: boolean;
}

export const ActivityPhotoGallery: React.FC<ActivityPhotoGalleryProps> = ({
  media,
  onClose,
  visible,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const renderMediaItem = ({
    item,
    index,
  }: {
    item: ActivityMedia;
    index: number;
  }) => {
    const isSelected = index === selectedIndex;

    return (
      <TouchableOpacity
        style={[
          styles.thumbnailContainer,
          isSelected && styles.selectedThumbnail,
        ]}
        onPress={() => setSelectedIndex(index)}
      >
        <Image
          source={{ uri: item.uri }}
          style={styles.thumbnail}
          contentFit="cover"
        />
        {item.type === "video" && (
          <View style={styles.videoIndicator}>
            <Ionicons name="play" size={16} color="white" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!visible || media.length === 0) return null;

  const selectedMedia = media[selectedIndex];

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent>
      <LinearGradient
        colors={["#1a1a2e", "#16213e", "#0f3460"]}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>
            Activity Gallery ({selectedIndex + 1}/{media.length})
          </ThemedText>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="share" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="download" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Media Display */}
        <View style={styles.mediaContainer}>
          <Image
            source={{ uri: selectedMedia.uri }}
            style={styles.mainImage}
            contentFit="contain"
          />

          {selectedMedia.type === "video" && (
            <TouchableOpacity style={styles.playButton}>
              <Ionicons name="play" size={48} color="white" />
            </TouchableOpacity>
          )}

          {/* Media Info Overlay */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.8)"]}
            style={styles.infoOverlay}
          >
            <View style={styles.mediaInfo}>
              <ThemedText style={styles.mediaDate}>
                {formatDate(selectedMedia.timestamp)}
              </ThemedText>

              {selectedMedia.activityData && (
                <View style={styles.activityStats}>
                  <View style={styles.statItem}>
                    <Ionicons name="footsteps" size={16} color="#4CAF50" />
                    <ThemedText style={styles.statText}>
                      {selectedMedia.activityData.steps.toLocaleString()} steps
                    </ThemedText>
                  </View>
                  <View style={styles.statItem}>
                    <Ionicons name="location" size={16} color="#2196F3" />
                    <ThemedText style={styles.statText}>
                      {selectedMedia.activityData.distance.toFixed(2)} km
                    </ThemedText>
                  </View>
                  <View style={styles.statItem}>
                    <Ionicons name="time" size={16} color="#FF9800" />
                    <ThemedText style={styles.statText}>
                      {formatDuration(selectedMedia.activityData.duration)}
                    </ThemedText>
                  </View>
                </View>
              )}
            </View>
          </LinearGradient>
        </View>

        {/* Navigation Controls */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity
            style={[
              styles.navButton,
              selectedIndex === 0 && styles.disabledButton,
            ]}
            onPress={() => setSelectedIndex(Math.max(0, selectedIndex - 1))}
            disabled={selectedIndex === 0}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={selectedIndex === 0 ? "#666" : "white"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navButton,
              selectedIndex === media.length - 1 && styles.disabledButton,
            ]}
            onPress={() =>
              setSelectedIndex(Math.min(media.length - 1, selectedIndex + 1))
            }
            disabled={selectedIndex === media.length - 1}
          >
            <Ionicons
              name="chevron-forward"
              size={24}
              color={selectedIndex === media.length - 1 ? "#666" : "white"}
            />
          </TouchableOpacity>
        </View>

        {/* Thumbnail Strip */}
        <View style={styles.thumbnailStrip}>
          <FlatList
            data={media}
            renderItem={renderMediaItem}
            keyExtractor={(item, index) => `${item.uri}-${index}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbnailList}
            getItemLayout={(data, index) => ({
              length: 80,
              offset: 80 * index,
              index,
            })}
            initialScrollIndex={selectedIndex}
          />
        </View>
      </LinearGradient>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    flex: 1,
    textAlign: "center",
  },
  headerActions: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  mediaContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  mainImage: {
    width: width,
    height: height * 0.6,
  },
  playButton: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  infoOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    justifyContent: "flex-end",
  },
  mediaInfo: {
    padding: 20,
  },
  mediaDate: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 10,
  },
  activityStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  statText: {
    fontSize: 12,
    color: "white",
  },
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  navButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  thumbnailStrip: {
    height: 100,
    backgroundColor: "rgba(0,0,0,0.3)",
    paddingVertical: 10,
  },
  thumbnailList: {
    paddingHorizontal: 10,
  },
  thumbnailContainer: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginHorizontal: 5,
    overflow: "hidden",
    position: "relative",
  },
  selectedThumbnail: {
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  videoIndicator: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
});
