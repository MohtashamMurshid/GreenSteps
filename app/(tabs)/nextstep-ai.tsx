import { EcoMap } from "@/components/EcoMap";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { FontAwesome5 } from "@expo/vector-icons";
import React from "react";
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BarChart, LineChart, ProgressChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

const chartConfig = {
  backgroundGradientFrom: Colors.dark.card,
  backgroundGradientFromOpacity: 1,
  backgroundGradientTo: Colors.dark.card,
  backgroundGradientToOpacity: 1,
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.5,
  useShadowColorFromDataset: false,
};

const heartRateData = {
  labels: ["", "", "", "", "", ""],
  datasets: [
    {
      data: [60, 62, 65, 63, 66, 68, 66],
      color: (opacity = 1) => `rgba(255, 70, 86, ${opacity})`,
      strokeWidth: 3,
    },
  ],
};

const caloriesData = {
  labels: ["", "", "", "", "", "", "", "", "", ""],
  datasets: [
    {
      data: [
        10, 20, 15, 30, 25, 40, 35, 50, 45, 60, 55, 70, 65, 80, 75, 90, 85, 100,
      ],
    },
  ],
};

export default function NextStepAIScreen() {
  const hydrationData = {
    labels: ["Hydration"], // optional
    data: [0.67],
  };
  const [showMap, setShowMap] = React.useState(false);

  return (
    <ThemedView style={styles.container}>
      <Modal
        visible={showMap}
        animationType="slide"
        onRequestClose={() => setShowMap(false)}
      >
        <View style={{ flex: 1, backgroundColor: Colors.dark.background }}>
          <TouchableOpacity
            style={{ position: "absolute", top: 50, right: 30, zIndex: 10 }}
            onPress={() => setShowMap(false)}
          >
            <FontAwesome5
              name="times-circle"
              size={36}
              color={Colors.dark.text}
            />
          </TouchableOpacity>
          <EcoMap showCurrentLocation trackingEnabled showEcoStats />
        </View>
      </Modal>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <FontAwesome5 name="chevron-left" size={24} color="white" />
          <View>
            <Text style={styles.headerTitle}>NextStep AI</Text>
            <Text style={styles.headerSubtitle}>Body metric</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
            <TouchableOpacity onPress={() => setShowMap(true)}>
              <FontAwesome5 name="map-marked-alt" size={24} color="white" />
            </TouchableOpacity>
            <FontAwesome5 name="bell" size={24} color="white" />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Hydration</Text>
          <View style={styles.hydrationContainer}>
            <ProgressChart
              data={hydrationData}
              width={150}
              height={150}
              strokeWidth={16}
              radius={55}
              chartConfig={{
                ...chartConfig,
                backgroundGradientFrom: Colors.dark.cardOpaque,
                backgroundGradientTo: Colors.dark.cardOpaque,
                color: (opacity = 1, _index) => {
                  return `rgba(0, 199, 255, ${opacity})`;
                },
              }}
              hideLegend
              style={styles.progressChart}
            />
            <Text style={styles.hydrationPercentage}>67%</Text>
          </View>
          <View style={styles.hydrationInfo}>
            <Text style={{ color: Colors.dark.text }}>Dehydration 20%</Text>
            <Text style={{ color: Colors.dark.text }}>Intake 45oz</Text>
          </View>
          <View style={styles.suggestionBox}>
            <Text style={styles.suggestionText}>
              Suggestion: You should be more hydrated
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.caloriesHeader}>
            <Text style={styles.cardTitle}>Calories</Text>
            <Text style={{ color: Colors.dark.text }}>200/500</Text>
          </View>
          <BarChart
            data={caloriesData}
            width={screenWidth - 80}
            height={220}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1, index) => {
                const i = index || 0;
                if (caloriesData.datasets[0].data[i] > 80) {
                  return `rgba(50, 215, 75, ${opacity})`;
                }
                return `rgba(255, 165, 0, ${opacity})`;
              },
            }}
            withHorizontalLabels={false}
            withInnerLines={false}
            showBarTops={false}
            fromZero
            style={styles.barChart}
          />
          <View style={styles.calorieGoalContainer}>
            <Text style={{ color: Colors.dark.text }}>Set calorie goal</Text>
            <View style={styles.calorieControl}>
              <FontAwesome5 name="plus-circle" size={24} color="white" />
              <Text style={styles.calorieGoal}>700</Text>
              <FontAwesome5 name="minus-circle" size={24} color="white" />
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.caloriesHeader}>
            <Text style={styles.cardTitle}>Heart Rate</Text>
            <Text style={{ color: Colors.dark.text }}>66 bpm</Text>
          </View>
          <LineChart
            data={heartRateData}
            width={screenWidth - 80}
            height={180}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => `rgba(255, 70, 86, ${opacity})`,
              propsForDots: {
                r: "0",
              },
            }}
            bezier
            withInnerLines={false}
            withOuterLines={false}
            withHorizontalLabels={false}
            withVerticalLabels={false}
            style={styles.lineChart}
          />
          <View style={styles.suggestionBox}>
            <Text style={styles.suggestionText}>
              Suggestion: Make sure to control your breath while jogging
            </Text>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: Colors.dark.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.dark.gray,
    textAlign: "center",
  },
  card: {
    backgroundColor: Colors.dark.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: Colors.dark.text,
  },
  hydrationContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  progressChart: {
    //
  },
  hydrationPercentage: {
    position: "absolute",
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.dark.text,
  },
  hydrationInfo: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 15,
  },
  suggestionBox: {
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 15,
    padding: 15,
    marginTop: 15,
  },
  suggestionText: {
    textAlign: "center",
    color: Colors.dark.text,
  },
  caloriesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  barChart: {
    alignSelf: "center",
  },
  calorieGoalContainer: {
    alignItems: "center",
    marginTop: 15,
  },
  calorieControl: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "60%",
    marginTop: 10,
  },
  calorieGoal: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.dark.text,
  },
  lineChart: {
    alignSelf: "center",
  },
});
