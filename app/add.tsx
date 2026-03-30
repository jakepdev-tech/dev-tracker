import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useGoals } from "../state/GoalContext";
import { colors } from "../theme/theme";
import {
  FundingType,
  GoalStatus,
  GoalType,
  LearningGoal,
} from "../types/learning";

const GOAL_TYPES: GoalType[] = ["certification", "project", "capability"];
const GOAL_STATUSES: GoalStatus[] = [
  "planned",
  "in-progress",
  "paused",
  "completed",
];
const FUNDING_TYPES: FundingType[] = [
  "self",
  "employer",
  "learning-budget",
  "free",
];

function isValidDate(value: string): boolean {
  if (!value) return true;
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

type SelectorProps<T extends string> = {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
};

function SelectorGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: SelectorProps<T>) {
  return (
    <View style={styles.selectorGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.optionRow}>
        {options.map((option) => {
          const isSelected = option === value;

          return (
            <Pressable
              key={option}
              onPress={() => onChange(option)}
              style={[
                styles.optionChip,
                isSelected && styles.optionChipSelected,
              ]}
            >
              <Text
                style={[
                  styles.optionChipText,
                  isSelected && styles.optionChipTextSelected,
                ]}
              >
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function getDefaultFormValues() {
  return {
    id: "",
    title: "",
    type: "project" as GoalType,
    status: "planned" as GoalStatus,
    targetDate: "",
    fundingType: "free" as FundingType,
    tags: "",
  };
}

export default function AddScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { addGoal, updateGoal } = useGoals();

  const [editingGoalId, setEditingGoalId] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState<GoalType>("project");
  const [status, setStatus] = useState<GoalStatus>("planned");
  const [targetDate, setTargetDate] = useState("");
  const [fundingType, setFundingType] = useState<FundingType>("free");
  const [tags, setTags] = useState("");
  const [error, setError] = useState("");

  const parsedGoal: LearningGoal | null = useMemo(() => {
    const rawGoal = params.goal;

    if (!rawGoal || Array.isArray(rawGoal)) {
      return null;
    }

    try {
      return JSON.parse(rawGoal) as LearningGoal;
    } catch {
      return null;
    }
  }, [params.goal]);

  const isEditMode = !!parsedGoal;

  useEffect(() => {
    if (parsedGoal) {
      setEditingGoalId(parsedGoal.id);
      setTitle(parsedGoal.title ?? "");
      setType(parsedGoal.type ?? "project");
      setStatus(parsedGoal.status ?? "planned");
      setTargetDate(parsedGoal.targetDate ?? "");
      setFundingType(parsedGoal.fundingType ?? "free");
      setTags(parsedGoal.tags?.join(", ") ?? "");
      setError("");
      return;
    }

    const defaults = getDefaultFormValues();
    setEditingGoalId(defaults.id);
    setTitle(defaults.title);
    setType(defaults.type);
    setStatus(defaults.status);
    setTargetDate(defaults.targetDate);
    setFundingType(defaults.fundingType);
    setTags(defaults.tags);
    setError("");
  }, [parsedGoal]);

  const isFormValid = useMemo(() => {
    return title.trim().length > 0 && isValidDate(targetDate);
  }, [title, targetDate]);

  function handleSave() {
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    if (!isValidDate(targetDate)) {
      setError("Target date must be in YYYY-MM-DD format.");
      return;
    }

    setError("");

    const goalToSave: LearningGoal = {
      id: editingGoalId || Date.now().toString(),
      title: title.trim(),
      type,
      status,
      targetDate: targetDate || undefined,
      fundingType,
      tags: tags
        ? tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [],
    };

    if (isEditMode) {
      updateGoal(goalToSave);
    } else {
      addGoal(goalToSave);
    }

    router.back();
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: isEditMode ? "Edit Goal" : "Add Goal",
        }}
      />

    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          {isEditMode ? "Edit Learning Goal" : "Add Learning Goal"}
        </Text>

        <TextInput
          placeholder="Title"
          placeholderTextColor="#94a3b8"
          style={styles.input}
          value={title}
          onChangeText={setTitle}
        />

        <SelectorGroup
          label="Type"
          options={GOAL_TYPES}
          value={type}
          onChange={setType}
        />

        <SelectorGroup
          label="Status"
          options={GOAL_STATUSES}
          value={status}
          onChange={setStatus}
        />

        <TextInput
          placeholder="Target Date (YYYY-MM-DD)"
          placeholderTextColor="#94a3b8"
          style={styles.input}
          value={targetDate}
          onChangeText={setTargetDate}
          autoCapitalize="none"
        />

        <SelectorGroup
          label="Funding Type"
          options={FUNDING_TYPES}
          value={fundingType}
          onChange={setFundingType}
        />

        <TextInput
          placeholder="Tags (comma separated)"
          placeholderTextColor="#94a3b8"
          style={styles.input}
          value={tags}
          onChangeText={setTags}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          style={[styles.button, !isFormValid && styles.buttonDisabled]}
          onPress={handleSave}
        >
          <Text style={styles.buttonText}>
            {isEditMode ? "Update Goal" : "Save Goal"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
    </>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    color: colors.textPrimary,
  },
  selectorGroup: {
    gap: 8,
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionChip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  optionChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.secondary,
  },
  optionChipText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "500",
  },
  optionChipTextSelected: {
    color: colors.textPrimary,
    fontWeight: "700",
  },
  error: {
    color: "#fca5a5",
    fontSize: 14,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontWeight: "600",
    color: "#0f172a",
  },
});