import { Link, Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { useGoals } from "../../state/GoalContext";
import {
  calculateGoalProgress,
  calculateTaskWeightTotal,
  getGoalTasks,
} from "../../utils/progress";

export default function GoalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getGoalById, tasks, deleteGoal } = useGoals();

  const goal = getGoalById(id);

  if (!goal) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.notFound}>Goal not found.</Text>
      </SafeAreaView>
    );
  }

  const goalTasks = getGoalTasks(tasks, goal.id);
  const progress = calculateGoalProgress(tasks, goal.id);
  const totalWeight = calculateTaskWeightTotal(tasks, goal.id);

  function confirmDelete() {
    Alert.alert(
      "Delete goal",
      "This will permanently remove the goal and all of its tasks from local storage.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteGoal(goal.id);
            router.replace("/(tabs)");
          },
        },
      ]
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: goal.title }} />
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.heroCard}>
            <Text style={styles.title}>{goal.title}</Text>
            <Text style={styles.subtitle}>{goal.description ?? "No description yet."}</Text>
            <View style={styles.metaRow}>
              <Meta label="Type" value={goal.type} />
              <Meta label="Status" value={goal.status} />
              <Meta label="Progress" value={`${progress}%`} />
              <Meta label="Task weight" value={`${totalWeight}%`} />
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.tags}>Tags: {goal.tags.join(", ") || "None"}</Text>
            <Text style={styles.notes}>{goal.notes ?? "No notes yet."}</Text>
          </View>

          <View style={styles.actions}>
            <Link
              href={{
                pathname: "/goal-form",
                params: { id: goal.id },
              }}
              style={styles.primaryButton}
            >
              Edit Goal
            </Link>
            <Text onPress={confirmDelete} style={styles.deleteButton}>
              Delete Goal
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Tasks</Text>

          {goalTasks.map((task) => (
            <View key={task.id} style={styles.taskCard}>
              <View style={styles.taskHeader}>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <Text style={styles.taskStatus}>{task.status.replace("-", " ")}</Text>
              </View>
              {task.details ? <Text style={styles.taskBody}>{task.details}</Text> : null}
              <Text style={styles.taskMeta}>
                {task.progress}% progress • {task.weight}% of goal
              </Text>
              {task.targetDate ? (
                <Text style={styles.taskMeta}>Target {task.targetDate}</Text>
              ) : null}
              {task.evidence ? (
                <Text style={styles.taskBody}>Evidence: {task.evidence}</Text>
              ) : null}
              {task.tags.length > 0 ? (
                <Text style={styles.taskMeta}>Tags: {task.tags.join(", ")}</Text>
              ) : null}
            </View>
          ))}

          {goalTasks.length === 0 ? (
            <Text style={styles.emptyText}>No tasks yet. Edit the goal to add them.</Text>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaCard}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  content: {
    padding: 18,
    gap: 16,
  },
  heroCard: {
    backgroundColor: "#14213d",
    borderRadius: 22,
    padding: 18,
    gap: 12,
  },
  title: {
    color: "#f8fafc",
    fontSize: 28,
    fontWeight: "800",
  },
  subtitle: {
    color: "#cbd5e1",
    fontSize: 15,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metaCard: {
    minWidth: "47%",
    flexGrow: 1,
    backgroundColor: "#101a31",
    borderRadius: 14,
    padding: 12,
    gap: 4,
  },
  metaLabel: {
    color: "#94a3b8",
    fontSize: 12,
  },
  metaValue: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  progressTrack: {
    height: 10,
    backgroundColor: "#273759",
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#60a5fa",
    borderRadius: 999,
  },
  tags: {
    color: "#cbd5e1",
    fontSize: 14,
  },
  notes: {
    color: "#94a3b8",
    fontSize: 14,
    lineHeight: 21,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#60a5fa",
    color: "#0f172a",
    paddingVertical: 13,
    textAlign: "center",
    borderRadius: 14,
    fontWeight: "800",
  },
  deleteButton: {
    color: "#f87171",
    fontWeight: "700",
  },
  sectionTitle: {
    color: "#f8fafc",
    fontSize: 22,
    fontWeight: "800",
  },
  taskCard: {
    backgroundColor: "#14213d",
    borderRadius: 18,
    padding: 16,
    gap: 6,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  taskTitle: {
    flex: 1,
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "700",
  },
  taskStatus: {
    color: "#60a5fa",
    fontSize: 13,
    textTransform: "capitalize",
  },
  taskBody: {
    color: "#cbd5e1",
    fontSize: 14,
    lineHeight: 20,
  },
  taskMeta: {
    color: "#94a3b8",
    fontSize: 13,
  },
  emptyText: {
    color: "#94a3b8",
    fontSize: 14,
    textAlign: "center",
  },
  notFound: {
    color: "#f8fafc",
    textAlign: "center",
    marginTop: 40,
  },
});
