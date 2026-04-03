import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { useGoals } from "../../state/GoalContext";
import { colors, gradients } from "../../theme/theme";
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
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerCard}>
          <Text style={styles.title}>Reports</Text>
          <Text style={styles.subtitle}>
            A quick visual summary of completion, workload, and the domains getting the
            most focus.
          </Text>
        </View>

        <View style={styles.grid}>
          <MetricCard label="Completed goals" value={`${completedGoals}`} tone={colors.success} />
          <MetricCard
            label="Outstanding goals"
            value={`${outstandingGoals}`}
            tone={colors.warning}
          />
          <MetricCard label="Completed tasks" value={`${completedTasks}`} tone={colors.info} />
          <MetricCard
            label="Average progress"
            value={`${averageGoalProgress}%`}
            tone={colors.accent}
          />
        </View>

        <View style={styles.row}>
          <SectionCard title="Task Status Breakdown" style={styles.halfCard}>
            <StatusBar label="In progress" value={statusBreakdown["in-progress"]} tone={colors.info} />
            <StatusBar label="Completed" value={statusBreakdown.completed} tone={colors.success} />
            <StatusBar label="Blocked" value={statusBreakdown.blocked} tone={colors.danger} />
            <StatusBar
              label="Not started"
              value={statusBreakdown["not-started"]}
              tone={colors.warning}
            />
          </SectionCard>

          <SectionCard title="Outstanding by Date" style={styles.halfCard}>
            <BreakdownRow label="Today / overdue" value={outstandingBuckets.today} />
            <BreakdownRow label="Next 7 days" value={outstandingBuckets.next7Days} />
            <BreakdownRow label="Next 14 days" value={outstandingBuckets.next14Days} />
            <BreakdownRow label="Beyond 14 days" value={outstandingBuckets.beyond14Days} />
          </SectionCard>
        </View>

        <View style={styles.row}>
          <SectionCard title="Top Tags" style={styles.halfCard}>
            {topTags.map((entry) => (
              <View key={entry.tag} style={styles.tagRow}>
                <Text style={styles.bodyText}>{entry.tag}</Text>
                <View style={styles.tagBarTrack}>
                  <View style={[styles.tagBarFill, { width: `${Math.min(entry.count * 18, 100)}%` }]} />
                </View>
                <Text style={styles.bodyText}>{entry.count}</Text>
              </View>
            ))}
          </SectionCard>

          <SectionCard title="Snapshot" style={styles.halfCard}>
            <Text style={styles.snapshotLead}>{outstandingTasks}</Text>
            <Text style={styles.bodyText}>open tasks remain across {goals.length} goals.</Text>
            <Text style={styles.snapshotNote}>
              {completedTasks} completed tasks recorded so far.
            </Text>
          </SectionCard>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MetricCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <View style={[styles.metricCard, { borderTopColor: tone }]}>
      <Text style={[styles.metricValue, { color: tone }]}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function SectionCard({
  title,
  style,
  children,
}: {
  title: string;
  style?: object;
  children: React.ReactNode;
}) {
  return (
    <View style={[styles.sectionCard, style]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

function BreakdownRow({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.breakdownRow}>
      <Text style={styles.bodyText}>{label}</Text>
      <Text style={styles.breakdownValue}>{value}</Text>
    </View>
  );
}

function StatusBar({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <View style={styles.statusRow}>
      <View style={styles.statusHeader}>
        <Text style={styles.bodyText}>{label}</Text>
        <Text style={styles.breakdownValue}>{value}</Text>
      </View>
      <View style={styles.statusTrack}>
        <View style={[styles.statusFill, { width: `${Math.min(value * 20, 100)}%`, backgroundColor: tone }]} />
      </View>
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metricCard: {
    minWidth: "47%",
    flexGrow: 1,
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.line,
    borderTopWidth: 4,
  },
  metricValue: {
    fontSize: 25,
    fontWeight: "800",
  },
  metricLabel: {
    color: colors.inkSoft,
    fontSize: 13,
    marginTop: 4,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  halfCard: {
    minWidth: "47%",
    flexGrow: 1,
  },
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: colors.line,
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: "800",
  },
  sectionContent: {
    gap: 12,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  bodyText: {
    color: colors.inkSoft,
    fontSize: 14,
  },
  breakdownValue: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "700",
  },
  statusRow: {
    gap: 6,
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statusTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: "#E7ECF7",
    overflow: "hidden",
  },
  statusFill: {
    height: "100%",
    borderRadius: 999,
  },
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  tagBarTrack: {
    flex: 1,
    height: 10,
    borderRadius: 999,
    backgroundColor: "#E7ECF7",
    overflow: "hidden",
  },
  tagBarFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 999,
  },
  snapshotLead: {
    color: colors.ink,
    fontSize: 38,
    fontWeight: "800",
  },
  snapshotNote: {
    color: colors.inkMuted,
    fontSize: 13,
    lineHeight: 20,
  },
});
