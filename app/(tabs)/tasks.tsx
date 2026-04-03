import { Link } from "expo-router";
import { useMemo, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useGoals } from "../../state/GoalContext";
import { colors, gradients } from "../../theme/theme";
import { GoalTask } from "../../types/learning";
import { getAllTags } from "../../utils/progress";

const STATUSES: (GoalTask["status"] | "all")[] = [
  "all",
  "not-started",
  "in-progress",
  "blocked",
  "completed",
];

function statusTone(status: GoalTask["status"]) {
  switch (status) {
    case "completed":
      return colors.success;
    case "blocked":
      return colors.danger;
    case "in-progress":
      return colors.info;
    default:
      return colors.warning;
  }
}

export default function TasksScreen() {
  const { goals, tasks } = useGoals();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof STATUSES)[number]>("all");
  const [tagFilter, setTagFilter] = useState("all");

  const tags = useMemo(() => ["all", ...getAllTags(goals, tasks)], [goals, tasks]);

  const visibleTasks = useMemo(() => {
    const loweredQuery = query.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesQuery =
        !loweredQuery ||
        task.title.toLowerCase().includes(loweredQuery) ||
        task.details?.toLowerCase().includes(loweredQuery) ||
        task.tags.some((tag) => tag.toLowerCase().includes(loweredQuery));

      const matchesStatus =
        statusFilter === "all" ? true : task.status === statusFilter;
      const matchesTag = tagFilter === "all" ? true : task.tags.includes(tagFilter);

      return matchesQuery && matchesStatus && matchesTag;
    });
  }, [query, statusFilter, tagFilter, tasks]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerCard}>
          <Text style={styles.title}>Tasks</Text>
          <Text style={styles.subtitle}>
            Review every task across your goals, including evidence, dates, and
            weighting.
          </Text>
        </View>

        <View style={styles.filterPanel}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search tasks or tags"
            placeholderTextColor={colors.inkMuted}
            style={styles.searchInput}
          />

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterRow}>
              {STATUSES.map((status) => (
                <Text
                  key={status}
                  onPress={() => setStatusFilter(status)}
                  style={[styles.chip, statusFilter === status && styles.chipSelected]}
                >
                  {status.replace("-", " ")}
                </Text>
              ))}
            </View>
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterRow}>
              {tags.map((tag) => (
                <Text
                  key={tag}
                  onPress={() => setTagFilter(tag)}
                  style={[styles.chip, tagFilter === tag && styles.chipSelected]}
                >
                  {tag}
                </Text>
              ))}
            </View>
          </ScrollView>
        </View>

        {visibleTasks.map((task) => {
          const goal = goals.find((item) => item.id === task.goalId);

          return (
            <Link
              key={task.id}
              href={{
                pathname: "/goal/[id]",
                params: { id: task.goalId },
              }}
              asChild
            >
              <Pressable style={styles.taskCard}>
                <View style={styles.taskHeader}>
                  <View style={styles.taskHeaderText}>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    <Text style={styles.goalLabel}>{goal?.title ?? "Unknown goal"}</Text>
                  </View>
                  <Text style={[styles.status, { color: statusTone(task.status) }]}>
                    {task.status.replace("-", " ")}
                  </Text>
                </View>

                <View style={styles.progressRow}>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${task.progress}%`, backgroundColor: statusTone(task.status) },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressLabel}>{task.progress}%</Text>
                </View>

                <Text style={styles.meta}>{task.weight}% of goal</Text>
                {task.targetDate ? <Text style={styles.meta}>Target {task.targetDate}</Text> : null}
                {task.evidence ? <Text style={styles.evidence}>Evidence: {task.evidence}</Text> : null}
                {task.tags.length > 0 ? <Text style={styles.meta}>Tags: {task.tags.join(", ")}</Text> : null}
              </Pressable>
            </Link>
          );
        })}

        {visibleTasks.length === 0 ? (
          <Text style={styles.emptyText}>No tasks match your current filters.</Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.page,
  },
  content: {
    padding: 18,
    gap: 14,
    paddingBottom: 32,
  },
  headerCard: {
    backgroundColor: gradients.headerBottom,
    borderRadius: 28,
    padding: 20,
    gap: 8,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
  },
  subtitle: {
    color: "#D7E2F8",
    fontSize: 15,
    lineHeight: 22,
  },
  filterPanel: {
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.line,
  },
  searchInput: {
    backgroundColor: colors.cardMuted,
    color: colors.ink,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.line,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
  },
  chip: {
    color: colors.inkSoft,
    backgroundColor: colors.cardMuted,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    overflow: "hidden",
    textTransform: "capitalize",
  },
  chipSelected: {
    backgroundColor: colors.primaryLight,
    color: colors.primaryDark,
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
  taskHeaderText: {
    flex: 1,
    gap: 4,
  },
  taskTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: "800",
  },
  goalLabel: {
    color: colors.inkSoft,
    fontSize: 14,
    fontWeight: "600",
  },
  status: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 4,
  },
  progressTrack: {
    flex: 1,
    height: 10,
    borderRadius: 999,
    backgroundColor: "#E7ECF7",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
  progressLabel: {
    color: colors.inkSoft,
    fontSize: 13,
    fontWeight: "700",
    width: 34,
    textAlign: "right",
  },
  meta: {
    color: colors.inkSoft,
    fontSize: 13,
  },
  evidence: {
    color: colors.ink,
    fontSize: 13,
    lineHeight: 19,
  },
  emptyText: {
    color: colors.inkSoft,
    textAlign: "center",
    marginTop: 8,
  },
});
