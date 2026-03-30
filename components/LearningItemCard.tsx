import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LearningGoal } from "../types/learning";

type Props = {
  item: LearningGoal;
  progress: number;
};

export default function LearningItemCard({ item, progress }: Props) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/goal/[id]" as const,
          params: { id: item.id },
        })
      }
      style={styles.card}
    >
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.meta}>Type: {item.type}</Text>
      <Text style={styles.meta}>Status: {item.status}</Text>

      {item.targetDate ? (
        <Text style={styles.meta}>Target: {item.targetDate}</Text>
      ) : null}

      {item.fundingType ? (
        <Text style={styles.meta}>Funding: {item.fundingType}</Text>
      ) : null}

      <View style={styles.progressRow}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>{progress}%</Text>
      </View>

      {item.tags && item.tags.length > 0 ? (
        <Text style={styles.meta}>Tags: {item.tags.join(", ")}</Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 16,
    gap: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#f8fafc",
    marginBottom: 4,
  },
  meta: {
    fontSize: 14,
    color: "#cbd5e1",
  },
  progressRow: {
    marginTop: 8,
    gap: 6,
  },
  progressBar: {
    width: "100%",
    height: 10,
    backgroundColor: "#334155",
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#22c55e",
    borderRadius: 999,
  },
  progressText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#f8fafc",
    textAlign: "right",
  },
});