import { Link } from "expo-router";
import { SafeAreaView, ScrollView, StyleSheet, Text } from "react-native";
import LearningItemCard from "../components/LearningItemCard";
import { useGoals } from "../state/GoalContext";
import { colors } from "../theme/theme";
import { calculateProgress } from "../utils/progress";

export default function Index() {
  const { goals, activities } = useGoals();

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

        {goals.map((goal) => {
          const progress = calculateProgress(activities, goal.id);

          return (
            <LearningItemCard
              key={goal.id}
              item={goal}
              progress={progress}
            />
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.textPrimary,
    marginTop: 12,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: colors.primary,
    color: colors.textPrimary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.textPrimary,
    marginTop: 8,
    marginBottom: 4,
  },
});