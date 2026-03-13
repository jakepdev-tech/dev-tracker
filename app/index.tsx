import { Link } from "expo-router";
import { SafeAreaView, ScrollView, StyleSheet, Text } from "react-native";
import LearningItemCard from "../components/LearningItemCard";
import { mockGoals } from "../data/mockData";

export default function Index() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Dev Tracker</Text>
        <Text style={styles.subtitle}>
          Track certifications, projects, domain upskilling and technical goals.
        </Text>

        <Link href="/add" style={styles.addButton}>
          Add Learning Goal
        </Link>

        <Text style={styles.sectionTitle}>Current Goals</Text>

        {mockGoals.map((goal) => (
          <LearningItemCard key={goal.id} item={goal} />
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
  addButton: {
    backgroundColor: "#38bdf8",
    color: "#0f172a",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#f8fafc",
    marginTop: 8,
    marginBottom: 4,
  },
});