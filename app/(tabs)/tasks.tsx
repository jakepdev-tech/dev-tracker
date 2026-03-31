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
import { GoalTask } from "../../types/learning";
import { getAllTags } from "../../utils/progress";

const STATUSES: (GoalTask["status"] | "all")[] = [
  "all",
  "not-started",
  "in-progress",
  "blocked",
  "completed",
];

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
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Tasks</Text>
        <Text style={styles.subtitle}>
          Review every task across your goals, including evidence and due dates.
        </Text>

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search tasks or tags"
          placeholderTextColor="#64748b"
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
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <Text style={styles.status}>{task.status.replace("-", " ")}</Text>
                </View>
                <Text style={styles.goalLabel}>{goal?.title ?? "Unknown goal"}</Text>
                <Text style={styles.meta}>
                  {task.progress}% progress • {task.weight}% weight
                </Text>
                {task.targetDate ? (
                  <Text style={styles.meta}>Target {task.targetDate}</Text>
                ) : null}
                {task.evidence ? (
                  <Text style={styles.evidence}>Evidence: {task.evidence}</Text>
                ) : null}
                {task.tags.length > 0 ? (
                  <Text style={styles.meta}>Tags: {task.tags.join(", ")}</Text>
                ) : null}
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
    backgroundColor: "#0f172a",
  },
  content: {
    padding: 18,
    gap: 14,
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
  searchInput: {
    backgroundColor: "#14213d",
    color: "#f8fafc",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#223154",
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
  },
  chip: {
    color: "#cbd5e1",
    backgroundColor: "#16233f",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    overflow: "hidden",
    textTransform: "capitalize",
  },
  chipSelected: {
    backgroundColor: "#2563eb",
    color: "#f8fafc",
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
  status: {
    color: "#60a5fa",
    fontSize: 13,
    textTransform: "capitalize",
  },
  goalLabel: {
    color: "#cbd5e1",
    fontSize: 14,
    fontWeight: "600",
  },
  meta: {
    color: "#94a3b8",
    fontSize: 13,
  },
  evidence: {
    color: "#cbd5e1",
    fontSize: 13,
  },
  emptyText: {
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 8,
  },
});
