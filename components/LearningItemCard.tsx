import { StyleSheet, Text, View } from "react-native";
import { LearningGoal } from "../types/learning";

type Props = {
  item: LearningGoal;
};

export default function LearningItemCard({ item }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.meta}>Type: {item.type}</Text>
      <Text style={styles.meta}>Status: {item.status}</Text>

      {item.targetDate ? (
        <Text style={styles.meta}>Target: {item.targetDate}</Text>
      ) : null}

      {item.fundingType ? (
        <Text style={styles.meta}>Funding: {item.fundingType}</Text>
      ) : null}

      {item.tags && item.tags.length > 0 ? (
        <Text style={styles.meta}>Tags: {item.tags.join(", ")}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#f8fafc",
    marginBottom: 8,
  },
  meta: {
    fontSize: 14,
    color: "#cbd5e1",
    marginBottom: 2,
  },
});