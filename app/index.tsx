import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import LearningItemCard from "../components/LearningItemCard";
import { mockItems } from "../data/mockData";

export default function Index() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Dev Tracker</Text>
        <Text style={styles.subtitle}>
          Track certifications, courses, reading and projects.
        </Text>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>This Week</Text>
          <Text style={styles.summaryText}>3 active learning items</Text>
          <Text style={styles.summaryText}>1 project in progress</Text>
        </View>

        <Text style={styles.sectionTitle}>Current Items</Text>

  {mockItems.map((item) => (
  <LearningItemCard key={item.id} item={item} />
))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  content: {
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#f8fafc",
    marginTop: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#cbd5e1",
    marginBottom: 8,
  },
  summaryCard: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#f8fafc",
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: "#cbd5e1",
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#f8fafc",
    marginTop: 8,
    marginBottom: 4,
  },
  itemCard: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 16,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#f8fafc",
    marginBottom: 8,
  },
  itemMeta: {
    fontSize: 14,
    color: "#cbd5e1",
    marginBottom: 2,
  },
});