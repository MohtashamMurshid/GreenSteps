import { FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Colors } from "@/constants/Colors";

interface VoucherCardProps {
  title: string;
  cost: number;
  iconName: string;
  gradientColors: [string, string];
}

const VoucherCard = ({
  title,
  cost,
  iconName,
  gradientColors,
}: VoucherCardProps) => (
  <LinearGradient colors={gradientColors} style={styles.card}>
    <View style={styles.cardHeader}>
      <Text style={styles.cardTitle}>{title}</Text>
      <FontAwesome5 name={iconName} size={30} color="white" />
    </View>
    <TouchableOpacity style={styles.claimButton}>
      <Text style={styles.claimButtonText}>Claim</Text>
      <FontAwesome5
        name="coins"
        size={12}
        color="yellow"
        style={{ marginLeft: 5 }}
      />
      <Text style={styles.claimButtonText}> {cost}</Text>
    </TouchableOpacity>
  </LinearGradient>
);

export default function VouchersScreen() {
  const vouchers: VoucherCardProps[] = [
    {
      title: "H & M - 20 rm",
      cost: 820,
      iconName: "tshirt",
      gradientColors: [Colors.dark.cardRedStart, Colors.dark.cardRedEnd],
    },
    {
      title: "Pull & bear coupon - 20 rm",
      cost: 1800,
      iconName: "tshirt",
      gradientColors: ["#4c4c4c", "#2c2c2c"],
    },
    {
      title: "Jaya Groccers - 10rm",
      cost: 1000,
      iconName: "shopping-basket",
      gradientColors: [Colors.dark.cardGreenStart, Colors.dark.cardGreenEnd],
    },
    {
      title: "Donate - 0.01rm",
      cost: 10,
      iconName: "hand-holding-heart",
      gradientColors: ["#4c4c4c", "#2c2c2c"],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <FontAwesome5 name="percentage" size={32} color="white" />
          <TouchableOpacity style={styles.shopButton}>
            <Text style={styles.shopButtonText}>Shop</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.pointsText}>Points: 1230</Text>

        {vouchers.map((voucher, index) => (
          <VoucherCard key={index} {...voucher} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  shopButton: {
    backgroundColor: Colors.dark.cardOpaque,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 15,
  },
  shopButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  pointsText: {
    fontSize: 18,
    color: Colors.dark.gray,
    marginBottom: 20,
    alignSelf: "flex-end",
  },
  card: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 30,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    maxWidth: "70%",
  },
  claimButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "black",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    alignSelf: "center",
  },
  claimButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
