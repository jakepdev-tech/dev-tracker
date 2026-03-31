import { Link } from "expo-router";
import { useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import LearningItemCard from "../../components/LearningItemCard";
import { useGoals } from "../../state/GoalContext";
import { GoalSortOption, LearningGoal } from "../../types/learning";
import {
  calculateGoalProgress,
  getAllTags,
  getGoalTasks,
  sortGoals,
} from "../../utils/progress";

const STATUSES: (LearningGoal["status"] | "all")[] = [
  "all",
  "planned",
  "in-progress",
  "blocked",
  "completed",
];

const SORT_OPTIONS: GoalSortOption[] = [
  "updated-desc",
  "target-asc",
  "progress-desc",
  "title-asc",
];

export default function DashboardScreen() {
  const { goals, tasks, hydrated } = useGoals();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof STATUSES)[number]>("all");
  const [tagFilter, setTagFilter] = useState("all");
  const [sortOption, setSortOption] = useState<GoalSortOption>("updated-desc");

  const tags = useMemo(() => ["all", ...getAllTags(goals, tasks)], [goals, tasks]);

  const filteredGoals = useMemo(() => {
    const loweredQuery = query.trim().toLowerCase();

    return sortGoals(goals, tasks, sortOption).filter((goal) => {
      const matchesQuery =
        !loweredQuery ||
        goal.title.toLowerCase().includes(loweredQuery) ||
        goal.description?.toLowerCase().includes(loweredQuery) ||
        goal.tags.some((tag) => tag.toLowerCase().includes(loweredQuery));

      const matchesStatus =
        statusFilter === "all" ? true : goal.status === statusFilter;
      const matchesTag = tagFilter === "all" ? true : goal.tags.includes(tagFilter);

      return matchesQuery && matchesStatus && matchesTag;
    });
  }, [goals, query, sortOption, statusFilter, tagFilter, tasks]);

  const summary = useMemo(() => {
    const completedGoals = goals.filter((goal) => goal.status === "completed").length;
    const inFlightGoals = goals.filter((goal) => goal.status === "in-progress").length;
    const totalTasks = tasks.length;

    return { completedGoals, inFlightGoals, totalTasks };
  }, [goals, tasks.length]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.title}>Dev Tracker</Text>
          <Text style={styles.subtitle}>
            Track goals, weighted tasks, evidence, and domain progress from Expo Go.
          </Text>
          <Link href="/goal-form" style={styles.primaryButton}>
            Add Goal
          </Link>
        </View>

        <View style={styles.summaryRow}>
          <StatCard label="Goals" value={String(goals.length)} />
          <StatCard label="In Progress" value={String(summary.inFlightGoals)} />
          <StatCard label="Completed" value={String(summary.completedGoals)} />
          <StatCard label="Tasks" value={String(summary.totalTasks)} />
        </View>

        <View style={styles.filters}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search titles, descriptions, tags"
            placeholderTextColor="#64748b"
            style={styles.searchInput}
          />

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterRow}>
              {STATUSES.map((status) => (
                <FilterChip
                  key={status}
                  label={status}
                  selected={statusFilter === status}
                  onPress={() => setStatusFilter(status)}
                />
              ))}
            </View>
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterRow}>
              {tags.map((tag) => (
                <FilterChip
                  key={tag}
                  label={tag}
                  selected={tagFilter === tag}
                  onPress={() => setTagFilter(tag)}
                />
              ))}
            </View>
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterRow}>
              {SORT_OPTIONS.map((option) => (
                <FilterChip
                  key={option}
                  label={option}
                  selected={sortOption === option}
                  onPress={() => setSortOption(option)}
                />
              ))}
            </View>
          </ScrollView>
        </View>

        {!hydrated ? (
          <Text style={styles.helperText}>Loading saved data...</Text>
        ) : null}

        {filteredGoals.map((goal) => (
          <LearningItemCard
            key={goal.id}
            goal={goal}
            progress={calculateGoalProgress(tasks, goal.id)}
            taskCount={getGoalTasks(tasks, goal.id).length}
          />
        ))}

        {filteredGoals.length === 0 ? (
          <Text style={styles.helperText}>No goals match your current filters.</Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function FilterChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Text onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}>
      {label.replace("-", " ")}
    </Text>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
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
  hero: {
    backgroundColor: "#14213d",
    borderRadius: 24,
    padding: 20,
    gap: 10,
  },
  title: {
    color: "#f8fafc",
    fontSize: 30,
    fontWeight: "800",
  },
  subtitle: {
    color: "#cbd5e1",
    fontSize: 15,
    lineHeight: 22,
  },
  primaryButton: {
    backgroundColor: "#60a5fa",
    color: "#0f172a",
    paddingVertical: 12,
    borderRadius: 14,
    textAlign: "center",
    fontWeight: "700",
    marginTop: 6,
  },
  summaryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statCard: {
    flexGrow: 1,
    minWidth: "47%",
    backgroundColor: "#14213d",
    borderRadius: 18,
    padding: 16,
    gap: 4,
  },
  statValue: {
    color: "#f8fafc",
    fontSize: 24,
    fontWeight: "800",
  },
  statLabel: {
    color: "#94a3b8",
    fontSize: 13,
  },
  filters: {
    gap: 10,
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
  helperText: {
    color: "#94a3b8",
    fontSize: 14,
    textAlign: "center",
    marginTop: 4,
  },
});
