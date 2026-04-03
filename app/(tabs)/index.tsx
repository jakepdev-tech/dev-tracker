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
import { colors, gradients } from "../../theme/theme";
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
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.heroBackdrop} />
          <Text style={styles.eyebrow}>Technical Development</Text>
          <Text style={styles.title}>Dev Tracker</Text>
          <Text style={styles.subtitle}>
            Track your goals, task weighting, evidence, and delivery progress in one
            place.
          </Text>
          <Link href="/goal-form" style={styles.primaryButton}>
            + Add Goal
          </Link>
        </View>

        <View style={styles.summaryRow}>
          <StatCard label="Goals" value={String(goals.length)} />
          <StatCard label="In Progress" value={String(summary.inFlightGoals)} />
          <StatCard label="Completed" value={String(summary.completedGoals)} />
          <StatCard label="Tasks" value={String(summary.totalTasks)} />
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Filters</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search titles, descriptions, tags"
            placeholderTextColor={colors.inkMuted}
            style={styles.searchInput}
          />

          <FilterSection label="Status">
            {STATUSES.map((status) => (
              <FilterChip
                key={status}
                label={status}
                selected={statusFilter === status}
                onPress={() => setStatusFilter(status)}
              />
            ))}
          </FilterSection>

          <FilterSection label="Tags">
            {tags.map((tag) => (
              <FilterChip
                key={tag}
                label={tag}
                selected={tagFilter === tag}
                onPress={() => setTagFilter(tag)}
              />
            ))}
          </FilterSection>

          <FilterSection label="Sort">
            {SORT_OPTIONS.map((option) => (
              <FilterChip
                key={option}
                label={option}
                selected={sortOption === option}
                onPress={() => setSortOption(option)}
              />
            ))}
          </FilterSection>
        </View>

        {!hydrated ? <Text style={styles.helperText}>Loading saved data...</Text> : null}

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

function FilterSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.filterSection}>
      <Text style={styles.filterLabel}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.filterRow}>{children}</View>
      </ScrollView>
    </View>
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
    backgroundColor: colors.page,
  },
  content: {
    padding: 18,
    gap: 16,
    paddingBottom: 36,
  },
  hero: {
    backgroundColor: gradients.headerBottom,
    borderRadius: 30,
    padding: 22,
    gap: 10,
    overflow: "hidden",
  },
  heroBackdrop: {
    position: "absolute",
    top: -40,
    right: -10,
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  eyebrow: {
    color: "#D6E3FF",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 31,
    fontWeight: "800",
  },
  subtitle: {
    color: "#D7E2F8",
    fontSize: 15,
    lineHeight: 22,
    maxWidth: "92%",
  },
  primaryButton: {
    alignSelf: "flex-start",
    backgroundColor: colors.primary,
    color: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 16,
    textAlign: "center",
    fontWeight: "700",
    marginTop: 8,
  },
  summaryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statCard: {
    flexGrow: 1,
    minWidth: "47%",
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.line,
  },
  statValue: {
    color: colors.ink,
    fontSize: 26,
    fontWeight: "800",
  },
  statLabel: {
    color: colors.inkSoft,
    fontSize: 13,
    marginTop: 4,
  },
  panel: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: colors.line,
  },
  panelTitle: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: "800",
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
  filterSection: {
    gap: 8,
  },
  filterLabel: {
    color: colors.inkSoft,
    fontSize: 13,
    fontWeight: "700",
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
  helperText: {
    color: colors.inkSoft,
    fontSize: 14,
    textAlign: "center",
    marginTop: 4,
  },
});
