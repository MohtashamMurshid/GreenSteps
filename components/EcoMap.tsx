import { getIcon } from "@/lib/icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, {
  Callout,
  LatLng,
  Marker,
  Polyline,
  Region,
} from "react-native-maps";
import { ThemedText } from "./ThemedText";

const { width, height } = Dimensions.get("window");

interface PathPoint {
  latitude: number;
  longitude: number;
  timestamp: Date;
  speed?: number;
  activity?: "walking" | "cycling" | "running";
}

interface EcoMapProps {
  showCurrentLocation?: boolean;
  trackingEnabled?: boolean;
  showEcoStats?: boolean;
  onPathUpdate?: (path: PathPoint[]) => void;
}

export const EcoMap: React.FC<EcoMapProps> = ({
  showCurrentLocation = true,
  trackingEnabled = false,
  showEcoStats = true,
  onPathUpdate,
}) => {
  const [region, setRegion] = useState<Region>({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const [currentLocation, setCurrentLocation] = useState<LatLng | null>(null);
  const [pathPoints, setPathPoints] = useState<PathPoint[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [locationSubscription, setLocationSubscription] =
    useState<Location.LocationSubscription | null>(null);
  const [mapType, setMapType] = useState<"standard" | "satellite">("standard");
  const [showTrafficLayer, setShowTrafficLayer] = useState(false);

  // Mock eco-friendly locations
  const [ecoLocations] = useState([
    {
      id: "1",
      coordinate: { latitude: 37.78825, longitude: -122.4324 },
      title: "Eco Charging Station",
      description: "Electric vehicle charging point",
      type: "charging",
      icon: "bolt",
    },
    {
      id: "2",
      coordinate: { latitude: 37.79025, longitude: -122.4354 },
      title: "Bike Share Station",
      description: "Sustainable transport hub",
      type: "bike",
      icon: "fitness",
    },
    {
      id: "3",
      coordinate: { latitude: 37.78625, longitude: -122.4284 },
      title: "Green Park",
      description: "Perfect for eco-friendly walks",
      type: "park",
      icon: "tree",
    },
    {
      id: "4",
      coordinate: { latitude: 37.78925, longitude: -122.4364 },
      title: "Recycling Center",
      description: "Drop off recyclables here",
      type: "recycling",
      icon: "recycle",
    },
  ]);

  useEffect(() => {
    requestLocationPermission();

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Location Permission",
          "Please enable location access to use the map features"
        );
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const currentPos = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setCurrentLocation(currentPos);
      setRegion({
        ...currentPos,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } catch (error) {
      console.error("Error getting location permission:", error);
    }
  };

  const startTracking = async () => {
    if (!currentLocation) {
      Alert.alert("Location Error", "Unable to get current location");
      return;
    }

    try {
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 10, // Update every 10 meters
        },
        (location) => {
          const newPoint: PathPoint = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            timestamp: new Date(),
            speed: location.coords.speed || undefined,
            activity: determineActivity(location.coords.speed || 0),
          };

          setPathPoints((prev) => {
            const updated = [...prev, newPoint];
            if (onPathUpdate) {
              onPathUpdate(updated);
            }
            return updated;
          });

          setCurrentLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      );

      setLocationSubscription(subscription);
      setIsTracking(true);
    } catch (error) {
      console.error("Error starting location tracking:", error);
      Alert.alert("Tracking Error", "Unable to start location tracking");
    }
  };

  const stopTracking = () => {
    if (locationSubscription) {
      locationSubscription.remove();
      setLocationSubscription(null);
    }
    setIsTracking(false);
  };

  const determineActivity = (
    speed: number
  ): "walking" | "cycling" | "running" => {
    if (speed < 2) return "walking";
    if (speed < 8) return "running";
    return "cycling";
  };

  const clearPath = () => {
    setPathPoints([]);
    if (onPathUpdate) {
      onPathUpdate([]);
    }
  };

  const getPathColor = () => {
    // Different colors for different activities
    if (pathPoints.length === 0) return "#4CAF50";

    const lastActivity = pathPoints[pathPoints.length - 1]?.activity;
    switch (lastActivity) {
      case "walking":
        return "#4CAF50"; // Green
      case "running":
        return "#FF9800"; // Orange
      case "cycling":
        return "#2196F3"; // Blue
      default:
        return "#4CAF50";
    }
  };

  const calculateStats = () => {
    if (pathPoints.length < 2) {
      return { distance: 0, co2Saved: 0, duration: 0 };
    }

    let totalDistance = 0;

    for (let i = 1; i < pathPoints.length; i++) {
      const prev = pathPoints[i - 1];
      const curr = pathPoints[i];

      // Calculate distance using Haversine formula
      const R = 6371e3; // Earth's radius in meters
      const φ1 = (prev.latitude * Math.PI) / 180;
      const φ2 = (curr.latitude * Math.PI) / 180;
      const Δφ = ((curr.latitude - prev.latitude) * Math.PI) / 180;
      const Δλ = ((curr.longitude - prev.longitude) * Math.PI) / 180;

      const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      totalDistance += R * c;
    }

    const duration =
      pathPoints.length > 0
        ? (pathPoints[pathPoints.length - 1].timestamp.getTime() -
            pathPoints[0].timestamp.getTime()) /
          1000 /
          60
        : 0;

    // Calculate CO2 saved (assuming alternative was driving)
    const co2SavedGrams = (totalDistance / 1000) * 175; // 175g CO2 per km saved

    return {
      distance: totalDistance / 1000, // km
      co2Saved: Math.round(co2SavedGrams),
      duration: Math.round(duration),
    };
  };

  const stats = calculateStats();

  const getMapStyle = () => {
    return mapType === "satellite"
      ? []
      : [
          {
            featureType: "poi.business",
            stylers: [{ visibility: "off" }],
          },
          {
            featureType: "transit",
            stylers: [{ visibility: "simplified" }],
          },
        ];
  };

  return (
    <LinearGradient colors={["#2D5A5A", "#1A4040"]} style={styles.container}>
      {/* Map Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[styles.controlButton, isTracking && styles.trackingButton]}
          onPress={isTracking ? stopTracking : startTracking}
          disabled={!trackingEnabled}
        >
          <View style={styles.controlIconContainer}>
            {isTracking
              ? getIcon("run", { size: 16, color: "#fff" })
              : getIcon("walk", { size: 16, color: "#fff" })}
            <ThemedText style={styles.controlButtonText}>
              {isTracking ? "Stop" : "Start"}
            </ThemedText>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={clearPath}>
          <View style={styles.controlIconContainer}>
            {getIcon("recycle", { size: 16, color: "#fff" })}
            <ThemedText style={styles.controlButtonText}>Clear</ThemedText>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={() =>
            setMapType(mapType === "standard" ? "satellite" : "standard")
          }
        >
          <View style={styles.controlIconContainer}>
            {mapType === "standard"
              ? getIcon("satellite", { size: 16, color: "#fff" })
              : getIcon("map", { size: 16, color: "#fff" })}
            <ThemedText style={styles.controlButtonText}>
              {mapType === "standard" ? "Satellite" : "Standard"}
            </ThemedText>
          </View>
        </TouchableOpacity>
      </View>

      {/* Map View */}
      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        mapType={mapType}
        showsUserLocation={showCurrentLocation}
        showsMyLocationButton={true}
        showsTraffic={showTrafficLayer}
        customMapStyle={getMapStyle()}
      >
        {/* Path Polyline */}
        {pathPoints.length > 1 && (
          <Polyline
            coordinates={pathPoints.map((point) => ({
              latitude: point.latitude,
              longitude: point.longitude,
            }))}
            strokeColor={getPathColor()}
            strokeWidth={4}
            lineDashPattern={[5, 5]}
          />
        )}

        {/* Start Point Marker */}
        {pathPoints.length > 0 && (
          <Marker
            coordinate={pathPoints[0]}
            title="Start"
            description="Journey began here"
            pinColor="green"
          />
        )}

        {/* End Point Marker */}
        {pathPoints.length > 1 && (
          <Marker
            coordinate={pathPoints[pathPoints.length - 1]}
            title="Current Position"
            description="You are here"
            pinColor="red"
          />
        )}

        {/* Eco-Friendly Locations */}
        {ecoLocations.map((location) => (
          <Marker
            key={location.id}
            coordinate={location.coordinate}
            title={location.title}
            description={location.description}
          >
            <View style={styles.customMarker}>
              <ThemedText style={styles.markerIcon}>
                {getIcon(location.icon as any, { size: 20 })}
              </ThemedText>
            </View>
            <Callout>
              <View style={styles.calloutContainer}>
                <ThemedText style={styles.calloutTitle}>
                  {location.title}
                </ThemedText>
                <ThemedText style={styles.calloutDescription}>
                  {location.description}
                </ThemedText>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Stats Panel */}
      {showEcoStats && pathPoints.length > 0 && (
        <View style={styles.statsPanel}>
          <ThemedText style={styles.statsTitle}>
            {getIcon("leaf", { size: 16, color: "#26D0CE" })} Journey Stats
          </ThemedText>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>
                {stats.distance.toFixed(2)} km
              </ThemedText>
              <ThemedText style={styles.statLabel}>Distance</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>
                {stats.co2Saved}g
              </ThemedText>
              <ThemedText style={styles.statLabel}>CO₂ Saved</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>
                {stats.duration}min
              </ThemedText>
              <ThemedText style={styles.statLabel}>Duration</ThemedText>
            </View>
          </View>
          <ThemedText style={styles.activityIndicator}>
            Current:{" "}
            {pathPoints[pathPoints.length - 1]?.activity || "stationary"}
            {getPathColor() === "#4CAF50" &&
              getIcon("walk", { size: 16, color: "#4CAF50" })}
            {getPathColor() === "#FF9800" &&
              getIcon("runner", { size: 16, color: "#FF9800" })}
            {getPathColor() === "#2196F3" &&
              getIcon("fitness", { size: 16, color: "#2196F3" })}
          </ThemedText>
        </View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  controlsContainer: {
    position: "absolute",
    top: 50,
    left: 10,
    right: 10,
    flexDirection: "row",
    justifyContent: "space-around",
    zIndex: 1,
  },
  controlButton: {
    backgroundColor: "rgba(33, 150, 243, 0.9)",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  trackingButton: {
    backgroundColor: "rgba(79, 195, 247, 0.9)",
  },
  controlButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 12,
  },
  map: {
    width: width,
    height: height * 0.7,
  },
  customMarker: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  markerIcon: {
    fontSize: 20,
    textAlign: "center",
  },
  calloutContainer: {
    padding: 10,
    minWidth: 120,
  },
  calloutTitle: {
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 4,
  },
  calloutDescription: {
    fontSize: 12,
    opacity: 0.8,
  },
  statsPanel: {
    position: "absolute",
    bottom: 20,
    left: 10,
    right: 10,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: 15,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  statLabel: {
    fontSize: 10,
    opacity: 0.7,
    marginTop: 2,
    color: "#fff",
  },
  activityIndicator: {
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
    color: "#FF9800",
  },
  controlIconContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});
