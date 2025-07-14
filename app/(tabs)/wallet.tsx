import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { FontAwesome5 } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

const spendingHistory = [
  { date: "20/11/2023", type: "Cycling", amount: "22.10+", icon: "bicycle" },
  { date: "19/11/2023", type: "Cycling", amount: "19.34+", icon: "bicycle" },
  { date: "18/11/2023", type: "Running", amount: "6.90+", icon: "running" },
  {
    date: "17/11/2023",
    type: "Redeemed",
    amount: "820.1-",
    icon: "arrow-down",
  },
  {
    date: "16/11/2023",
    type: "Watching Ads",
    amount: "8.18+",
    icon: "tv",
  },
  { date: "15/11/2023", type: "Walking", amount: "31.49+", icon: "walking" },
  {
    date: "14/11/2023",
    type: "Watching Ads",
    amount: "28.90+",
    icon: "tv",
  },
];

export default function WalletScreen() {
  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Balance</Text>
          <FontAwesome5 name="leaf" size={24} color={Colors.dark.green} />
        </View>
        <View style={styles.balanceContainer}>
          <FontAwesome5
            name="filter"
            size={30}
            color={Colors.dark.text}
            style={{ transform: [{ rotate: "180deg" }] }}
          />
          <Text style={styles.balanceAmount}>410</Text>
        </View>

        <View style={styles.cardsContainer}>
          <View style={[styles.card, styles.spendCard]}>
            <Text style={styles.cardTitle}>Spend points / Redeem coupons</Text>
            <View style={styles.cardActions}>
              <Text style={styles.shopButtonText}>Shop</Text>
              <FontAwesome5 name="camera" size={20} color={Colors.dark.text} />
              <FontAwesome5 name="tag" size={20} color={Colors.dark.text} />
            </View>
          </View>
          <View style={[styles.card, styles.earnCard]}>
            <Text style={styles.cardTitle}>Earn more by watching videos</Text>
            <View style={styles.cardActions}>
              <Text style={styles.earnButtonText}>Earn more</Text>
              <FontAwesome5 name="gift" size={20} color={"#FFD700"} />
            </View>
          </View>
        </View>

        <View style={styles.historyContainer}>
          <Text style={styles.historyTitle}>Spending/Earning history</Text>
          <View style={styles.historyHeader}>
            <Text style={styles.historyHeaderText}>Date</Text>
            <Text style={styles.historyHeaderText}>Activity</Text>
            <FontAwesome5 name="filter" size={16} color={Colors.dark.text} />
          </View>
          {spendingHistory.map((item, index) => (
            <View key={index} style={styles.historyItem}>
              <Text style={styles.historyText}>{item.date}</Text>
              <FontAwesome5
                name={item.icon}
                size={16}
                color={Colors.dark.text}
              />
              <Text
                style={[
                  styles.historyAmount,
                  {
                    color: item.amount.includes("+")
                      ? Colors.dark.green
                      : Colors.dark.red,
                  },
                ]}
              >
                {item.amount}
              </Text>
            </View>
          ))}
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
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.dark.text,
    textAlign: "center",
    flex: 1,
    marginLeft: 24, // to balance the leaf icon
  },
  balanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  balanceAmount: {
    fontSize: 48,
    fontWeight: "bold",
    color: Colors.dark.text,
    marginLeft: 10,
  },
  cardsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  card: {
    backgroundColor: Colors.dark.card,
    borderRadius: 20,
    padding: 20,
    width: "48%",
    height: 150,
    justifyContent: "space-between",
  },
  spendCard: {
    //
  },
  earnCard: {
    //
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.dark.text,
  },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 15,
    padding: 10,
    marginTop: 10,
  },
  shopButtonText: {
    color: Colors.dark.text,
    fontWeight: "bold",
  },
  earnButtonText: {
    color: Colors.dark.text,
    fontWeight: "bold",
  },
  historyContainer: {
    backgroundColor: Colors.dark.card,
    borderRadius: 20,
    padding: 20,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.dark.text,
    marginBottom: 20,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.gray,
    alignItems: "center",
  },
  historyHeaderText: {
    color: Colors.dark.gray,
    fontSize: 14,
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
  },
  historyText: {
    color: Colors.dark.text,
    fontSize: 14,
  },
  historyAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
