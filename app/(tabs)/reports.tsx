import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { useGoals } from "../../state/GoalContext";
import {
  calculateGoalProgress,
  getOutstandingTaskBuckets,
  getTaskStatusBreakdown,
  getTopTags,
} from "../../utils/progress";

export default function ReportsScreen() {
  const { goals, tasks } = useGoals();

  const completedGoals = goals.filter((goal) => goal.status === "completed").length;
  const outstandingGoals = goals.length - completedGoals;
  const completedTasks = tasks.filter((task) => task.status === "completed").length;
  const outstandingTasks = tasks.length - completedTasks;
  const statusBreakdown = getTaskStatusBreakdown(tasks);
  const outstandingBuckets = getOutstandingTaskBuckets(tasks, new Date());
  const topTags = getTopTags(goals, tasks);
  const averageGoalProgress =
    goals.length === 0
      ? 0
      : Math.round(
          goals.reduce((sum, goal) => sum + calculateGoalProgress(tasks, goal.id), 0) /
            goals.length
        );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Reports</Text>
        <Text style={styles.subtitle}>
          A simple operational view of what is complete, what is outstanding, and
          where your effort is concentrated.
        </Text>

        <View style={styles.grid}>
          <ReportCard label="Completed goals" value={`${completedGoals}`} tone="#22c55e" />
          <ReportCard label="Outstanding goals" value={`${outstandingGoals}`} tone="#f59e0b" />
          <ReportCard label="Completed tasks" value={`${completedTasks}`} tone="#60a5fa" />
          <ReportCard
            label="Average goal progress"
            value={`${averageGoalProgress}%`}
            tone="#a78bfa"
          />
        </View>

        <SectionCard title="Task Status Breakdown">
          <BreakdownRow label="Not started" value={statusBreakdown["not-started"]} />
          <BreakdownRow label="In progress" value={statusBreakdown["in-progress"]} />
          <BreakdownRow label="Blocked" value={statusBreakdown.blocked} />
          <BreakdownRow label="Completed" value={statusBreakdown.completed} />
        </SectionCard>

        <SectionCard title="Outstanding Tasks by Target Date">
          <BreakdownRow label="Today or overdue" value={outstandingBuckets.today} />
          <BreakdownRow label="Next 7 days" value={outstandingBuckets.next7Days} />
          <BreakdownRow label="Next 14 days" value={outstandingBuckets.next14Days} />
          <BreakdownRow label="Beyond 14 days" value={outstandingBuckets.beyond14Days} />
        </SectionCard>

        <SectionCard title="Top Tags">
          {topTags.map((entry) => (
            <View key={entry.tag} style={styles.tagRow}>
              <Text style={styles.bodyText}>{entry.tag}</Text>
              <View style={styles.tagBarTrack}>
                <View style={[styles.tagBarFill, { width: `${entry.count * 12}%` }]} />
              </View>
              <Text style={styles.bodyText}>{entry.count}</Text>
            </View>
          ))}
        </SectionCard>

        <SectionCard title="Snapshot">
          <Text style={styles.bodyText}>
            {completedTasks} of {tasks.length} tasks completed and {outstandingTasks} still
            open across {goals.length} goals.
          </Text>
        </SectionCard>
      </ScrollView>
    </SafeAreaView>
  );
}

function ReportCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <View style={[styles.reportCard, { borderColor: tone }]}>
      <Text style={[styles.reportValue, { color: tone }]}>{value}</Text>
      <Text style={styles.reportLabel}>{label}</Text>
    </View>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

function BreakdownRow({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.breakdownRow}>
      <Text style={styles.bodyText}>{label}</Text>
      <Text style={styles.bodyText}>{value}</Text>
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  reportCard: {
    minWidth: "47%",
    flexGrow: 1,
    backgroundColor: "#14213d",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
  },
  reportValue: {
    fontSize: 24,
    fontWeight: "800",
  },
  reportLabel: {
    color: "#94a3b8",
    fontSize: 13,
    marginTop: 4,
  },
  sectionCard: {
    backgroundColor: "#14213d",
    borderRadius: 18,
    padding: 16,
    gap: 10,
  },
  sectionTitle: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "700",
  },
  sectionContent: {
    gap: 10,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  bodyText: {
    color: "#cbd5e1",
    fontSize: 14,
  },
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  tagBarTrack: {
    flex: 1,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#273759",
    overflow: "hidden",
  },
  tagBarFill: {
    height: "100%",
    backgroundColor: "#60a5fa",
    borderRadius: 999,
  },
});
