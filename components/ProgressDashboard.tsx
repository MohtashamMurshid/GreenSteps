import { DailyStats, getDailyStats, getGreenPoints } from "@/lib/storage";
import React, { useEffect, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, View } from "react-native";
import {
  BarChart,
  LineChart,
  PieChart,
  ProgressChart,
} from "react-native-chart-kit";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

const { width } = Dimensions.get("window");

interface ProgressDashboardProps {
  currentStepCount: number;
  dailyGoal: number;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  currentStepCount,
  dailyGoal,
}) => {
  const [weeklyData, setWeeklyData] = useState<DailyStats[]>([]);
  const [totalGreenPoints, setTotalGreenPoints] = useState(0);
  const [todayCO2Saved, setTodayCO2Saved] = useState(0);
  const [monthlyData, setMonthlyData] = useState<DailyStats[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, [currentStepCount]);

  const loadDashboardData = async () => {
    try {
      // Load GreenPoints
      const points = await getGreenPoints();
      setTotalGreenPoints(points);

      // Load weekly data for charts
      const allStats = await getDailyStats();
      const last7Days = getLast7Days();
      const weekData = last7Days.map((date) => {
        return (
          allStats[date] || {
            date,
            steps: 0,
            co2Saved: 0,
            distance: 0,
            greenPoints: 0,
          }
        );
      });
      setWeeklyData(weekData);

      // Load monthly data for charts
      const last30Days = getLast30Days();
      const monthData = last30Days.map((date) => {
        return (
          allStats[date] || {
            date,
            steps: 0,
            co2Saved: 0,
            distance: 0,
            greenPoints: 0,
          }
        );
      });
      setMonthlyData(monthData);

      // Calculate today's CO2 saved
      const today = new Date().toISOString().split("T")[0];
      const todayStats = allStats[today];
      if (todayStats) {
        setTodayCO2Saved(todayStats.co2Saved);
      } else {
        // Calculate CO2 saved from current steps
        const co2 = calculateCO2Saved(currentStepCount);
        setTodayCO2Saved(co2);
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    }
  };

  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split("T")[0]);
    }
    return days;
  };

  const getLast30Days = () => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split("T")[0]);
    }
    return days;
  };

  const calculateCO2Saved = (steps: number) => {
    // Rough calculation: 1000 steps ≈ 0.8 km walking ≈ 140g CO2 saved vs driving
    const distanceKm = (steps / 1000) * 0.8;
    const co2SavedGrams = distanceKm * 175; // 175g CO2 per km saved
    return Math.round(co2SavedGrams);
  };

  // Progress calculations
  const stepProgress = Math.min(currentStepCount / dailyGoal, 1);
  const weeklyAverage =
    weeklyData.length > 0
      ? weeklyData.reduce((sum, day) => sum + day.steps, 0) / weeklyData.length
      : 0;

  const weeklyStats = weeklyData.reduce(
    (acc, day) => ({
      totalSteps: acc.totalSteps + day.steps,
      totalCO2: acc.totalCO2 + day.co2Saved,
      totalPoints: acc.totalPoints + day.greenPoints,
    }),
    { totalSteps: 0, totalCO2: 0, totalPoints: 0 }
  );

  // Chart configurations
  const chartConfig = {
    backgroundGradientFrom: "#1E2923",
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: "#08130D",
    backgroundGradientToOpacity: 0.5,
    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  const stepChartData = {
    labels: weeklyData.map((day) => {
      const date = new Date(day.date);
      return date.toLocaleDateString("en", { weekday: "short" });
    }),
    datasets: [
      {
        data: weeklyData.map((day) => day.steps),
        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const co2ChartData = {
    labels: weeklyData.map((day) => {
      const date = new Date(day.date);
      return date.toLocaleDateString("en", { weekday: "short" });
    }),
    datasets: [
      {
        data: weeklyData.map((day) => day.co2Saved),
        color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const progressData = {
    labels: ["Steps", "Weekly Avg", "CO₂ Goal"],
    data: [
      stepProgress,
      Math.min(weeklyAverage / dailyGoal, 1),
      Math.min(todayCO2Saved / 500, 1), // 500g daily CO2 goal
    ],
  };

  // Bar chart data for weekly steps
  const barChartData = {
    labels: weeklyData.map((day) => {
      const date = new Date(day.date);
      return date.toLocaleDateString("en", { weekday: "short" });
    }),
    datasets: [
      {
        data: weeklyData.map((day) => day.steps),
      },
    ],
  };

  // Pie chart data for daily goal progress
  const pieChartData = [
    {
      name: "Completed",
      population: Math.min(currentStepCount, dailyGoal),
      color: "#4CAF50",
      legendFontColor: "#7F7F7F",
      legendFontSize: 15,
    },
    {
      name: "Remaining",
      population: Math.max(0, dailyGoal - currentStepCount),
      color: "#E0E0E0",
      legendFontColor: "#7F7F7F",
      legendFontSize: 15,
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Enhanced Stats Summary */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          📊 Today&apos;s Progress
        </ThemedText>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>
              {currentStepCount.toLocaleString()}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Steps</ThemedText>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.min(stepProgress * 100, 100)}%` },
                ]}
              />
            </View>
          </View>

          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>
              {totalGreenPoints}
            </ThemedText>
            <ThemedText style={styles.statLabel}>🌱 GreenPoints</ThemedText>
          </View>

          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>{todayCO2Saved}g</ThemedText>
            <ThemedText style={styles.statLabel}>CO₂ Saved</ThemedText>
          </View>
        </View>

        {/* Daily Goal Pie Chart */}
        <View style={styles.chartContainer}>
          <ThemedText style={styles.chartTitle}>Daily Goal Progress</ThemedText>
          {pieChartData[0].population > 0 || pieChartData[1].population > 0 ? (
            <PieChart
              data={pieChartData}
              width={width - 80}
              height={200}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          ) : null}
          <ThemedText style={styles.pieChartNote}>
            {Math.round(stepProgress * 100)}% Complete
          </ThemedText>
        </View>
      </ThemedView>

      {/* Weekly Bar Chart */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          📈 Weekly Steps Comparison
        </ThemedText>

        {weeklyData.length > 0 && weeklyData.some((d) => d.steps > 0) && (
          <View style={styles.chartContainer}>
            <BarChart
              data={barChartData}
              width={width - 40}
              height={250}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={{
                ...chartConfig,
                decimalPlaces: 0,
              }}
              verticalLabelRotation={0}
              showValuesOnTopOfBars={true}
              style={styles.chart}
            />
            <ThemedText style={styles.chartNote}>
              Weekly Average: {Math.round(weeklyAverage).toLocaleString()} steps
            </ThemedText>
          </View>
        )}
      </ThemedView>

      {/* Monthly Trend Line Chart */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          📊 Monthly Activity Trend
        </ThemedText>

        {monthlyData.length > 0 && monthlyData.some((d) => d.steps > 0) && (
          <View style={styles.chartContainer}>
            <LineChart
              data={{
                labels: monthlyData
                  .filter((_, index) => index % 5 === 0) // Show every 5th label to avoid crowding
                  .map((day) => {
                    const date = new Date(day.date);
                    return date.getDate().toString();
                  }),
                datasets: [
                  {
                    data: monthlyData.map((day) => day.steps),
                    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                    strokeWidth: 2,
                  },
                ],
              }}
              width={width - 40}
              height={250}
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
              }}
              bezier
              style={styles.chart}
            />
            <ThemedText style={styles.chartNote}>
              30-day activity pattern
            </ThemedText>
          </View>
        )}
      </ThemedView>

      {/* Progress Overview */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          📊 Progress Overview
        </ThemedText>
        {weeklyData.length > 0 && (
          <ProgressChart
            data={progressData}
            width={width - 40}
            height={180}
            strokeWidth={16}
            radius={32}
            chartConfig={chartConfig}
            hideLegend={false}
            style={styles.chart}
          />
        )}
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Environmental Impact
        </ThemedText>
        {weeklyData.length > 0 &&
          co2ChartData.datasets[0].data.some((val) => val > 0) && (
            <LineChart
              data={co2ChartData}
              width={width - 40}
              height={200}
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
              }}
              bezier
              style={styles.chart}
            />
          )}
        <ThemedText style={styles.chartNote}>
          Total CO₂ saved this week: {weeklyStats.totalCO2}g
        </ThemedText>
        <ThemedText style={styles.chartNote}>
          Total steps this week: {weeklyStats.totalSteps.toLocaleString()}
        </ThemedText>
      </ThemedView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    margin: 20,
    padding: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    marginBottom: 15,
    fontWeight: "bold",
    fontSize: 18,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  progressBar: {
    width: 60,
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    marginTop: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 2,
  },
  chartContainer: {
    alignItems: "center",
    marginVertical: 10,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "center",
  },
  pieChartNote: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
    color: "#4CAF50",
    marginTop: -20,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  chartNote: {
    textAlign: "center",
    fontSize: 12,
    opacity: 0.7,
    marginTop: 10,
  },
});
