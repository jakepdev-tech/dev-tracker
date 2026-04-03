import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  buildSavePayloadFromDraft,
  createEmptyGoalDraft,
  createEmptyTaskDraft,
  createGoalDraftFromExisting,
  GoalDraft,
  TaskDraft,
} from "../state/goalDraft";
import { useGoals } from "../state/GoalContext";
import { validateGoalPayload } from "../state/storage";
import { colors, gradients } from "../theme/theme";
import { GoalTask, LearningGoal } from "../types/learning";
import { getTaskStatusFromProgress } from "../utils/progress";

const GOAL_TYPES: LearningGoal["type"][] = [
  "certification",
  "project",
  "capability",
  "domain",
];

const GOAL_STATUSES: LearningGoal["status"][] = [
  "planned",
  "in-progress",
  "blocked",
  "completed",
];

const TASK_STATUSES: GoalTask["status"][] = [
  "not-started",
  "in-progress",
  "blocked",
  "completed",
];

export default function GoalFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const { getGoalById, getTasksByGoalId, saveGoal } = useGoals();
  const existingGoal = id ? getGoalById(id) : undefined;
  const existingTasks = useMemo(() => (id ? getTasksByGoalId(id) : []), [getTasksByGoalId, id]);

  const [draft, setDraft] = useState<GoalDraft>(createEmptyGoalDraft());
  const [error, setError] = useState("");

  useEffect(() => {
    setDraft(createGoalDraftFromExisting(existingGoal, existingTasks));
    setError("");
  }, [existingGoal, existingTasks]);

  const totalWeight = useMemo(
    () => draft.tasks.reduce((sum, task) => sum + (Number(task.weight) || 0), 0),
    [draft.tasks]
  );

  function updateDraft<K extends keyof GoalDraft>(key: K, value: GoalDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function updateTaskDraft(taskId: string, updater: (task: TaskDraft) => TaskDraft) {
    setDraft((current) => ({
      ...current,
      tasks: current.tasks.map((task) => (task.id === taskId ? updater(task) : task)),
    }));
  }

  function addTaskDraft() {
    setDraft((current) => ({
      ...current,
      tasks: [...current.tasks, createEmptyTaskDraft(current.tasks.length)],
    }));
  }

  function removeTaskDraft(taskId: string) {
    setDraft((current) => ({
      ...current,
      tasks: current.tasks.filter((task) => task.id !== taskId),
    }));
  }

  function handleSave() {
    const goalId = existingGoal?.id ?? `goal-${Date.now()}`;
    const payload = buildSavePayloadFromDraft(draft, goalId, existingGoal);
    const validation = validateGoalPayload(payload);

    if (!validation.valid) {
      setError(validation.errors[0] ?? "Unable to save goal.");
      return;
    }

    const result = saveGoal(payload);

    if (!result.ok) {
      setError(result.errors[0] ?? "Unable to save goal.");
      return;
    }

    setError("");
    router.replace(`/goal/${goalId}`);
  }

  return (
    <>
      <Stack.Screen options={{ title: existingGoal ? "Edit Goal" : "Add Goal" }} />
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.headerCard}>
            <Text style={styles.title}>{existingGoal ? "Edit Goal" : "Add Goal"}</Text>
            <Text style={styles.subtitle}>
              Create a weighted goal plan with dates, evidence, and task-level detail.
            </Text>
          </View>

          <SectionCard>
            <Field
              label="Goal title"
              value={draft.title}
              onChangeText={(value) => updateDraft("title", value)}
            />
            <Field
              label="Description"
              value={draft.description}
              onChangeText={(value) => updateDraft("description", value)}
              multiline
            />

            <SelectorRow
              label="Goal type"
              options={GOAL_TYPES}
              value={draft.type}
              onChange={(value) => updateDraft("type", value as LearningGoal["type"])}
            />

            <SelectorRow
              label="Goal status"
              options={GOAL_STATUSES}
              value={draft.status}
              onChange={(value) => updateDraft("status", value as LearningGoal["status"])}
            />

            <Field
              label="Start date (YYYY-MM-DD)"
              value={draft.startDate}
              onChangeText={(value) => updateDraft("startDate", value)}
            />
            <Field
              label="Target date (YYYY-MM-DD)"
              value={draft.targetDate}
              onChangeText={(value) => updateDraft("targetDate", value)}
            />
            <Field
              label="Completion date (YYYY-MM-DD)"
              value={draft.completionDate}
              onChangeText={(value) => updateDraft("completionDate", value)}
            />
            <Field
              label="Notes"
              value={draft.notes}
              onChangeText={(value) => updateDraft("notes", value)}
              multiline
            />
            <Field
              label="Tags (comma separated)"
              value={draft.tags}
              onChangeText={(value) => updateDraft("tags", value)}
            />
          </SectionCard>

          <SectionCard>
            <View style={styles.tasksHeader}>
              <View>
                <Text style={styles.sectionTitle}>Tasks</Text>
                <Text style={styles.sectionHint}>Task weights should total 100%.</Text>
              </View>
              <Pressable onPress={addTaskDraft} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Add Task</Text>
              </Pressable>
            </View>

            <View style={styles.weightBanner}>
              <Text style={styles.weightLabel}>Current allocation</Text>
              <Text style={styles.weightValue}>{totalWeight}%</Text>
            </View>

            {draft.tasks.map((task, index) => (
              <View key={task.id} style={styles.taskCard}>
                <View style={styles.taskCardHeader}>
                  <Text style={styles.taskCardTitle}>Task {index + 1}</Text>
                  <Text onPress={() => removeTaskDraft(task.id)} style={styles.deleteLink}>
                    Delete
                  </Text>
                </View>

                <Field
                  label="Task title"
                  value={task.title}
                  onChangeText={(value) =>
                    updateTaskDraft(task.id, (current) => ({ ...current, title: value }))
                  }
                />
                <Field
                  label="Details"
                  value={task.details}
                  onChangeText={(value) =>
                    updateTaskDraft(task.id, (current) => ({ ...current, details: value }))
                  }
                  multiline
                />
                <SelectorRow
                  label="Task status"
                  options={TASK_STATUSES}
                  value={task.status}
                  onChange={(value) =>
                    updateTaskDraft(task.id, (current) => ({
                      ...current,
                      status: value as GoalTask["status"],
                    }))
                  }
                />
                <Field
                  label="Progress (0-100)"
                  value={task.progress}
                  keyboardType="number-pad"
                  onChangeText={(value) =>
                    updateTaskDraft(task.id, (current) => {
                      const progress = Math.max(0, Math.min(100, Number(value) || 0));

                      return {
                        ...current,
                        progress: String(progress),
                        status:
                          current.status === "blocked"
                            ? "blocked"
                            : getTaskStatusFromProgress(progress),
                      };
                    })
                  }
                />
                <Field
                  label="Weight percentage"
                  value={task.weight}
                  keyboardType="number-pad"
                  onChangeText={(value) =>
                    updateTaskDraft(task.id, (current) => ({
                      ...current,
                      weight: String(Math.max(0, Number(value) || 0)),
                    }))
                  }
                />
                <Field
                  label="Evidence"
                  value={task.evidence}
                  onChangeText={(value) =>
                    updateTaskDraft(task.id, (current) => ({ ...current, evidence: value }))
                  }
                  multiline
                />
                <Field
                  label="Task tags (comma separated)"
                  value={task.tags}
                  onChangeText={(value) =>
                    updateTaskDraft(task.id, (current) => ({ ...current, tags: value }))
                  }
                />
                <Field
                  label="Task start date (YYYY-MM-DD)"
                  value={task.startDate}
                  onChangeText={(value) =>
                    updateTaskDraft(task.id, (current) => ({ ...current, startDate: value }))
                  }
                />
                <Field
                  label="Task target date (YYYY-MM-DD)"
                  value={task.targetDate}
                  onChangeText={(value) =>
                    updateTaskDraft(task.id, (current) => ({ ...current, targetDate: value }))
                  }
                />
                <Field
                  label="Task completion date (YYYY-MM-DD)"
                  value={task.completionDate}
                  onChangeText={(value) =>
                    updateTaskDraft(task.id, (current) => ({
                      ...current,
                      completionDate: value,
                    }))
                  }
                />
              </View>
            ))}
          </SectionCard>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable onPress={handleSave} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>
              {existingGoal ? "Save changes" : "Create goal"}
            </Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return <View style={styles.sectionCard}>{children}</View>;
}

function Field({
  label,
  value,
  onChangeText,
  multiline,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  multiline?: boolean;
  keyboardType?: "default" | "number-pad";
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        style={[styles.input, multiline && styles.multilineInput]}
        multiline={multiline}
        keyboardType={keyboardType}
        placeholderTextColor={colors.inkMuted}
      />
    </View>
  );
}

function SelectorRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chipRow}>
          {options.map((option) => (
            <Text
              key={option}
              onPress={() => onChange(option)}
              style={[styles.chip, value === option && styles.chipSelected]}
            >
              {option.replace("-", " ")}
            </Text>
          ))}
        </View>
      </ScrollView>
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
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: colors.line,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "700",
  },
  input: {
    backgroundColor: colors.cardMuted,
    color: colors.ink,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.line,
  },
  multilineInput: {
    minHeight: 96,
    textAlignVertical: "top",
  },
  chipRow: {
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
  tasksHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: "800",
  },
  sectionHint: {
    color: colors.inkSoft,
    fontSize: 13,
    marginTop: 4,
  },
  secondaryButton: {
    backgroundColor: colors.primaryLight,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  secondaryButtonText: {
    color: colors.primaryDark,
    fontWeight: "700",
  },
  weightBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#EEF4FF",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  weightLabel: {
    color: colors.inkSoft,
    fontSize: 13,
    fontWeight: "700",
  },
  weightValue: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: "800",
  },
  taskCard: {
    backgroundColor: colors.pageAlt,
    borderRadius: 20,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.line,
  },
  taskCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  taskCardTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "800",
  },
  deleteLink: {
    color: colors.danger,
    fontWeight: "700",
  },
  error: {
    color: colors.danger,
    fontSize: 14,
    textAlign: "center",
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 16,
  },
});
