import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/theme";
import { LearningGoal } from "../types/learning";

type Props = {
  goal: LearningGoal;
  progress: number;
  taskCount: number;
};

function statusTheme(status: LearningGoal["status"]) {
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

export default function LearningItemCard({ goal, progress, taskCount }: Props) {
  const router = useRouter();
  const theme = statusTheme(goal.status);

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
        <View style={styles.headerText}>
          <Text style={styles.title}>{goal.title}</Text>
          {goal.description ? (
            <Text numberOfLines={2} style={styles.description}>
              {goal.description}
            </Text>
          ) : null}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: theme.background }]}>
          <Text style={[styles.statusText, { color: theme.text }]}>
            {goal.status.replace("-", " ")}
          </Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.meta}>{goal.type}</Text>
        <Text style={styles.meta}>{taskCount} tasks</Text>
        <Text style={styles.meta}>
          {goal.targetDate ? `Target ${goal.targetDate}` : "No target date"}
        </Text>
      </View>

      <View style={styles.progressShell}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>{progress}%</Text>
      </View>

      {goal.tags.length > 0 ? (
        <Text style={styles.tags}>{goal.tags.slice(0, 4).join("  •  ")}</Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: colors.line,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  headerText: {
    flex: 1,
    gap: 6,
  },
  title: {
    color: colors.ink,
    fontSize: 19,
    fontWeight: "800",
  },
  description: {
    color: colors.inkSoft,
    fontSize: 14,
    lineHeight: 20,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  meta: {
    color: colors.inkMuted,
    fontSize: 13,
    textTransform: "capitalize",
  },
  progressShell: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 10,
    backgroundColor: "#E7ECF7",
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.success,
    borderRadius: 999,
  },
  progressText: {
    width: 38,
    textAlign: "right",
    color: colors.inkSoft,
    fontSize: 13,
    fontWeight: "700",
  },
  tags: {
    color: colors.inkSoft,
    fontSize: 13,
  },
});
