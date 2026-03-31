import {
  GoalStatus,
  GoalTask,
  LearningGoal,
  TaskStatus,
  TrackerData,
  TrackerStorageEnvelope,
  ValidationResult,
} from "../types/learning";
import { clampProgress, inferGoalStatus } from "../utils/progress";

export const CURRENT_SCHEMA_VERSION = 2;

type SaveGoalPayload = {
  goal: LearningGoal;
  tasks: GoalTask[];
};

export function migrateTrackerData(
  source: TrackerStorageEnvelope | TrackerData
): TrackerData {
  const rawData = isStorageEnvelope(source) ? source.data : source;
  return normalizeTrackerData(rawData);
}

export function normalizeTrackerData(data: TrackerData): TrackerData {
  const now = new Date().toISOString();
  const normalizedGoals = (data.goals ?? []).map((goal) => normalizeGoal(goal, now));
  const normalizedTasks = (data.tasks ?? []).map((task, index) =>
    normalizeTask(task, index)
  );

  const tasksByGoal = new Map<string, GoalTask[]>();

  normalizedTasks.forEach((task) => {
    const existing = tasksByGoal.get(task.goalId) ?? [];
    existing.push(task);
    tasksByGoal.set(task.goalId, existing);
  });

  return {
    goals: normalizedGoals.map((goal) => ({
      ...goal,
      status: inferGoalStatus(goal, tasksByGoal.get(goal.id) ?? []),
    })),
    tasks: normalizedTasks,
  };
}

export function normalizeGoal(goal: Partial<LearningGoal>, fallbackTimestamp: string) {
  return {
    id: goal.id ?? `goal-${Date.now()}`,
    title: normalizeOptionalText(goal.title) ?? "",
    description: normalizeOptionalText(goal.description),
    type: normalizeGoalType(goal.type),
    status: normalizeGoalStatus(goal.status),
    startDate: normalizeOptionalDate(goal.startDate),
    targetDate: normalizeOptionalDate(goal.targetDate),
    completionDate: normalizeOptionalDate(goal.completionDate),
    notes: normalizeOptionalText(goal.notes),
    tags: normalizeTags(goal.tags),
    createdAt: goal.createdAt ?? fallbackTimestamp,
    updatedAt: goal.updatedAt ?? fallbackTimestamp,
  };
}

export function normalizeTask(task: Partial<GoalTask>, fallbackSortOrder: number): GoalTask {
  const progress = clampProgress(Number(task.progress) || 0);
  const status = normalizeTaskStatus(task.status, progress);

  return {
    id: task.id ?? `task-${Date.now()}-${fallbackSortOrder}`,
    goalId: task.goalId ?? "",
    title: normalizeOptionalText(task.title) ?? "",
    details: normalizeOptionalText(task.details),
    status,
    progress,
    weight: Math.max(0, Number(task.weight) || 0),
    evidence: normalizeOptionalText(task.evidence),
    tags: normalizeTags(task.tags),
    startDate: normalizeOptionalDate(task.startDate),
    targetDate: normalizeOptionalDate(task.targetDate),
    completionDate: normalizeOptionalDate(task.completionDate),
    sortOrder: Number.isFinite(task.sortOrder) ? Number(task.sortOrder) : fallbackSortOrder,
  };
}

export function validateGoalPayload({ goal, tasks }: SaveGoalPayload): ValidationResult {
  const errors: string[] = [];

  if (!normalizeOptionalText(goal.title)) {
    errors.push("Goal title is required.");
  }

  if (!isValidOptionalDate(goal.startDate)) {
    errors.push("Goal start date must be in YYYY-MM-DD format.");
  }

  if (!isValidOptionalDate(goal.targetDate)) {
    errors.push("Goal target date must be in YYYY-MM-DD format.");
  }

  if (!isValidOptionalDate(goal.completionDate)) {
    errors.push("Goal completion date must be in YYYY-MM-DD format.");
  }

  if (!areDatesInOrder(goal.startDate, goal.targetDate, goal.completionDate)) {
    errors.push("Goal dates must keep target/completion on or after the start date.");
  }

  if (tasks.some((task) => !normalizeOptionalText(task.title))) {
    errors.push("Each task needs a title before saving.");
  }

  if (tasks.some((task) => !isValidOptionalDate(task.startDate))) {
    errors.push("Task start dates must be in YYYY-MM-DD format.");
  }

  if (tasks.some((task) => !isValidOptionalDate(task.targetDate))) {
    errors.push("Task target dates must be in YYYY-MM-DD format.");
  }

  if (tasks.some((task) => !isValidOptionalDate(task.completionDate))) {
    errors.push("Task completion dates must be in YYYY-MM-DD format.");
  }

  if (tasks.some((task) => !areDatesInOrder(task.startDate, task.targetDate, task.completionDate))) {
    errors.push("Task dates must keep target/completion on or after the start date.");
  }

  if (tasks.some((task) => clampProgress(task.progress) !== task.progress)) {
    errors.push("Task progress must stay between 0 and 100.");
  }

  if (tasks.some((task) => task.weight < 0)) {
    errors.push("Task weights cannot be negative.");
  }

  const totalWeight = tasks.reduce((sum, task) => sum + Math.max(0, Number(task.weight) || 0), 0);

  if (tasks.length > 0 && totalWeight !== 100) {
    errors.push("Task weights must add up to 100% for the goal.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function isStorageEnvelope(value: TrackerStorageEnvelope | TrackerData): value is TrackerStorageEnvelope {
  return typeof (value as TrackerStorageEnvelope).schemaVersion === "number";
}

function normalizeGoalType(value?: LearningGoal["type"]) {
  const valid: LearningGoal["type"][] = [
    "certification",
    "project",
    "capability",
    "domain",
  ];

  return valid.includes(value ?? "project") ? (value as LearningGoal["type"]) : "project";
}

function normalizeGoalStatus(value?: GoalStatus): GoalStatus {
  const valid: GoalStatus[] = ["planned", "in-progress", "blocked", "completed"];
  return valid.includes(value ?? "planned") ? (value as GoalStatus) : "planned";
}

function normalizeTaskStatus(value: TaskStatus | undefined, progress: number): TaskStatus {
  if (value === "blocked") {
    return "blocked";
  }

  if (progress >= 100) {
    return "completed";
  }

  if (progress > 0) {
    return "in-progress";
  }

  return "not-started";
}

function normalizeOptionalText(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function normalizeTags(tags?: string[]) {
  return Array.from(
    new Set(
      (tags ?? [])
        .map((tag) => tag.trim())
        .filter(Boolean)
    )
  );
}

function normalizeOptionalDate(value?: string) {
  return isValidOptionalDate(value) ? value : undefined;
}

function isValidOptionalDate(value?: string) {
  if (!value) {
    return true;
  }

  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function areDatesInOrder(startDate?: string, targetDate?: string, completionDate?: string) {
  const start = startDate ? Date.parse(startDate) : undefined;
  const target = targetDate ? Date.parse(targetDate) : undefined;
  const completion = completionDate ? Date.parse(completionDate) : undefined;

  if (start && target && start > target) {
    return false;
  }

  if (start && completion && start > completion) {
    return false;
  }

  return true;
}
