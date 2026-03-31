import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LearningGoal } from "../types/learning";

type Props = {
  goal: LearningGoal;
  progress: number;
  taskCount: number;
};

function statusColor(status: LearningGoal["status"]) {
  switch (status) {
    case "completed":
      return "#22c55e";
    case "blocked":
      return "#ef4444";
    case "in-progress":
      return "#3b82f6";
    default:
      return "#f59e0b";
  }
}

export default function LearningItemCard({ goal, progress, taskCount }: Props) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/goal/[id]" as const,
          params: { id: goal.id },
        })
      }
      style={styles.card}
    >
      <View style={styles.headerRow}>
        <Text style={styles.title}>{goal.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColor(goal.status) }]}>
          <Text style={styles.statusText}>{goal.status.replace("-", " ")}</Text>
        </View>
      </View>

      {goal.description ? (
        <Text numberOfLines={2} style={styles.description}>
          {goal.description}
        </Text>
      ) : null}

      <View style={styles.metaRow}>
        <Text style={styles.meta}>{goal.type}</Text>
        <Text style={styles.meta}>{taskCount} tasks</Text>
        <Text style={styles.meta}>
          {goal.targetDate ? `Target ${goal.targetDate}` : "No target date"}
        </Text>
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.progressText}>{progress}% complete</Text>
        <Text style={styles.tags}>{goal.tags.slice(0, 3).join(" • ")}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#14213d",
    borderRadius: 20,
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: "#223154",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
  },
  title: {
    flex: 1,
    color: "#f8fafc",
    fontSize: 19,
    fontWeight: "700",
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusText: {
    color: "#f8fafc",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  description: {
    color: "#cbd5e1",
    fontSize: 14,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  meta: {
    color: "#94a3b8",
    fontSize: 13,
  },
  progressBar: {
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
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  progressText: {
    color: "#f8fafc",
    fontSize: 13,
    fontWeight: "700",
  },
  tags: {
    flex: 1,
    textAlign: "right",
    color: "#94a3b8",
    fontSize: 13,
  },
});
