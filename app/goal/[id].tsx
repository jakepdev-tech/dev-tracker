import { Link, Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { useGoals } from "../../state/GoalContext";
import { colors, gradients } from "../../theme/theme";
import {
  calculateGoalProgress,
  calculateTaskWeightTotal,
  getGoalTasks,
} from "../../utils/progress";

function statusTheme(status: string) {
  switch (status) {
    case "completed":
      return { background: "#E6F6EC", text: colors.success };
    case "blocked":
      return { background: "#FDEBEA", text: colors.danger };
    case "in-progress":
      return { background: "#E8F1FF", text: colors.info };
    default:
      return { background: "#FFF4DE", text: colors.warning };
  }
}

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
  const goalStatusTheme = statusTheme(goal.status);

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
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.heroCard}>
            <Text style={styles.title}>{goal.title}</Text>
            <View style={[styles.goalBadge, { backgroundColor: goalStatusTheme.background }]}>
              <Text style={[styles.goalBadgeText, { color: goalStatusTheme.text }]}>
                {goal.status.replace("-", " ")}
              </Text>
            </View>
            <Text style={styles.subtitle}>{goal.description ?? "No description yet."}</Text>
            <View style={styles.progressRow}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
              <Text style={styles.progressLabel}>{progress}%</Text>
            </View>
            <Text style={styles.tags}>{goal.tags.join(" • ") || "No tags"}</Text>
          </View>

          <View style={styles.metaRow}>
            <Meta label="Type" value={goal.type} />
            <Meta label="Progress" value={`${progress}%`} />
            <Meta label="Task weight" value={`${totalWeight}%`} />
            <Meta label="Target" value={goal.targetDate ?? "None"} />
          </View>

          <View style={styles.notesCard}>
            <Text style={styles.sectionTitle}>Notes</Text>
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

          <Text style={styles.sectionTitle}>Activities</Text>

          {goalTasks.map((task) => {
            const theme = statusTheme(task.status);

            return (
              <View key={task.id} style={styles.taskCard}>
                <View style={styles.taskHeader}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <Text style={[styles.taskStatus, { color: theme.text }]}>
                    {task.status.replace("-", " ")}
                  </Text>
                </View>
                {task.details ? <Text style={styles.taskBody}>{task.details}</Text> : null}
                <View style={styles.taskProgressRow}>
                  <View style={styles.taskProgressTrack}>
                    <View
                      style={[
                        styles.taskProgressFill,
                        { width: `${task.progress}%`, backgroundColor: theme.text },
                      ]}
                    />
                  </View>
                  <Text style={styles.taskMeta}>{task.progress}%</Text>
                </View>
                <Text style={styles.taskMeta}>{task.weight}% of goal</Text>
                {task.targetDate ? <Text style={styles.taskMeta}>Target {task.targetDate}</Text> : null}
                {task.evidence ? <Text style={styles.taskBody}>Evidence: {task.evidence}</Text> : null}
                {task.tags.length > 0 ? <Text style={styles.taskMeta}>Tags: {task.tags.join(", ")}</Text> : null}
              </View>
            );
          })}

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
    backgroundColor: colors.page,
  },
  content: {
    padding: 18,
    gap: 16,
    paddingBottom: 32,
  },
  heroCard: {
    backgroundColor: gradients.headerBottom,
    borderRadius: 28,
    padding: 20,
    gap: 10,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 29,
    fontWeight: "800",
  },
  goalBadge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  goalBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  subtitle: {
    color: "#D7E2F8",
    fontSize: 15,
    lineHeight: 22,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 4,
  },
  progressTrack: {
    flex: 1,
    height: 10,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.success,
    borderRadius: 999,
  },
  progressLabel: {
    width: 38,
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "right",
  },
  tags: {
    color: "#D7E2F8",
    fontSize: 13,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metaCard: {
    minWidth: "47%",
    flexGrow: 1,
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 4,
  },
  metaLabel: {
    color: colors.inkSoft,
    fontSize: 12,
    fontWeight: "600",
  },
  metaValue: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "800",
    textTransform: "capitalize",
  },
  notesCard: {
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 10,
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 21,
    fontWeight: "800",
  },
  notes: {
    color: colors.inkSoft,
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
    backgroundColor: colors.primary,
    color: "#FFFFFF",
    paddingVertical: 13,
    textAlign: "center",
    borderRadius: 16,
    fontWeight: "800",
  },
  deleteButton: {
    color: colors.danger,
    fontWeight: "700",
  },
  taskCard: {
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.line,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  taskTitle: {
    flex: 1,
    color: colors.ink,
    fontSize: 16,
    fontWeight: "800",
  },
  taskStatus: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  taskBody: {
    color: colors.inkSoft,
    fontSize: 14,
    lineHeight: 20,
  },
  taskProgressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  taskProgressTrack: {
    flex: 1,
    height: 9,
    backgroundColor: "#E7ECF7",
    borderRadius: 999,
    overflow: "hidden",
  },
  taskProgressFill: {
    height: "100%",
    borderRadius: 999,
  },
  taskMeta: {
    color: colors.inkSoft,
    fontSize: 13,
  },
  emptyText: {
    color: colors.inkSoft,
    fontSize: 14,
    textAlign: "center",
  },
  notFound: {
    color: colors.ink,
    textAlign: "center",
    marginTop: 40,
  },
});
