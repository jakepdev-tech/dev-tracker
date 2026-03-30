import { useLocalSearchParams } from "expo-router";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { useGoals } from "../../state/GoalContext";
import { calculateProgress } from "../../utils/progress";

export default function GoalDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { goals, activities, toggleActivity } = useGoals();

  const goal = goals.find((g) => g.id === id);
  const goalActivities = activities.filter((a) => a.goalId === id);

  if (!goal) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Goal not found</Text>
      </SafeAreaView>
    );
  }

  const progress = calculateProgress(activities, goal.id);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{goal.title}</Text>
        <Text style={styles.meta}>Progress: {progress}%</Text>

        <Text style={styles.section}>Activities</Text>

        {goalActivities.map((activity) => (
          <Pressable
            key={activity.id}
            style={styles.activity}
            onPress={() => toggleActivity(activity.id)}
          >
            <Text style={styles.activityText}>
              {activity.status === "completed" ? "✅" : "⬜"} {activity.title}
            </Text>
          </Pressable>
        ))}
      </View>
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
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#f8fafc",
  },
  meta: {
    color: "#cbd5e1",
  },
  section: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "600",
    color: "#f8fafc",
  },
  activity: {
    padding: 10,
    backgroundColor: "#1e293b",
    borderRadius: 8,
  },
  activityText: {
    color: "#f8fafc",
  },
});