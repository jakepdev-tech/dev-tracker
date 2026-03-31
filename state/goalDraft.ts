import { GoalTask, LearningGoal } from "../types/learning";

export interface TaskDraft {
  id: string;
  title: string;
  details: string;
  status: GoalTask["status"];
  progress: string;
  weight: string;
  evidence: string;
  tags: string;
  startDate: string;
  targetDate: string;
  completionDate: string;
}

export interface GoalDraft {
  title: string;
  description: string;
  type: LearningGoal["type"];
  status: LearningGoal["status"];
  startDate: string;
  targetDate: string;
  completionDate: string;
  notes: string;
  tags: string;
  tasks: TaskDraft[];
}

export function createEmptyGoalDraft(): GoalDraft {
  return {
    title: "",
    description: "",
    type: "project",
    status: "planned",
    startDate: "",
    targetDate: "",
    completionDate: "",
    notes: "",
    tags: "",
    tasks: [],
  };
}

export function createGoalDraftFromExisting(
  goal?: LearningGoal,
  tasks: GoalTask[] = []
): GoalDraft {
  if (!goal) {
    return createEmptyGoalDraft();
  }

  return {
    title: goal.title,
    description: goal.description ?? "",
    type: goal.type,
    status: goal.status,
    startDate: goal.startDate ?? "",
    targetDate: goal.targetDate ?? "",
    completionDate: goal.completionDate ?? "",
    notes: goal.notes ?? "",
    tags: goal.tags.join(", "),
    tasks: tasks.map((task) => ({
      id: task.id,
      title: task.title,
      details: task.details ?? "",
      status: task.status,
      progress: String(task.progress),
      weight: String(task.weight),
      evidence: task.evidence ?? "",
      tags: task.tags.join(", "),
      startDate: task.startDate ?? "",
      targetDate: task.targetDate ?? "",
      completionDate: task.completionDate ?? "",
    })),
  };
}

export function createEmptyTaskDraft(taskCount: number): TaskDraft {
  return {
    id: `task-${Date.now()}-${taskCount}`,
    title: "",
    details: "",
    status: "not-started",
    progress: "0",
    weight: "0",
    evidence: "",
    tags: "",
    startDate: "",
    targetDate: "",
    completionDate: "",
  };
}

export function buildSavePayloadFromDraft(
  draft: GoalDraft,
  goalId: string,
  existingGoal?: LearningGoal
) {
  const now = new Date().toISOString();

  const goal: LearningGoal = {
    id: goalId,
    title: draft.title.trim(),
    description: normalizeOptionalText(draft.description),
    type: draft.type,
    status: draft.status,
    startDate: normalizeOptionalText(draft.startDate),
    targetDate: normalizeOptionalText(draft.targetDate),
    completionDate: normalizeOptionalText(draft.completionDate),
    notes: normalizeOptionalText(draft.notes),
    tags: parseTagString(draft.tags),
    createdAt: existingGoal?.createdAt ?? now,
    updatedAt: now,
  };

  const tasks: GoalTask[] = draft.tasks.map((task, index) => ({
    id: task.id,
    goalId,
    title: task.title.trim(),
    details: normalizeOptionalText(task.details),
    status: task.status,
    progress: Number(task.progress) || 0,
    weight: Number(task.weight) || 0,
    evidence: normalizeOptionalText(task.evidence),
    tags: parseTagString(task.tags),
    startDate: normalizeOptionalText(task.startDate),
    targetDate: normalizeOptionalText(task.targetDate),
    completionDate: normalizeOptionalText(task.completionDate),
    sortOrder: index,
  }));

  return { goal, tasks };
}

function parseTagString(value: string) {
  return Array.from(
    new Set(
      value
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    )
  );
}

function normalizeOptionalText(value: string) {
  const trimmed = value.trim();
  return trimmed || undefined;
}
