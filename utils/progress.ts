import {
  GoalSortOption,
  GoalStatus,
  GoalTask,
  LearningGoal,
  TaskStatus,
} from "../types/learning";

export function clampProgress(progress: number) {
  return Math.max(0, Math.min(100, Math.round(progress)));
}

export function getGoalTasks(tasks: GoalTask[], goalId: string) {
  return tasks
    .filter((task) => task.goalId === goalId)
    .sort((left, right) => left.sortOrder - right.sortOrder);
}

export function calculateTaskWeightTotal(tasks: GoalTask[], goalId: string) {
  return getGoalTasks(tasks, goalId).reduce((sum, task) => sum + task.weight, 0);
}

export function calculateGoalProgress(tasks: GoalTask[], goalId: string) {
  const goalTasks = getGoalTasks(tasks, goalId);

  if (goalTasks.length === 0) {
    return 0;
  }

  const weightedProgress = goalTasks.reduce((sum, task) => {
    return sum + task.weight * clampProgress(task.progress);
  }, 0);

  return Math.round(weightedProgress / 100);
}

export function getTaskStatusFromProgress(progress: number): TaskStatus {
  if (progress >= 100) {
    return "completed";
  }

  if (progress > 0) {
    return "in-progress";
  }

  return "not-started";
}

export function inferGoalStatus(goal: LearningGoal, tasks: GoalTask[]): GoalStatus {
  const goalTasks = getGoalTasks(tasks, goal.id);

  if (goalTasks.some((task) => task.status === "blocked")) {
    return "blocked";
  }

  const progress = calculateGoalProgress(tasks, goal.id);

  if (progress >= 100 && goalTasks.length > 0) {
    return "completed";
  }

  if (progress > 0) {
    return "in-progress";
  }

  return goal.status;
}

export function getAllTags(goals: LearningGoal[], tasks: GoalTask[]) {
  return Array.from(
    new Set(
      [...goals.flatMap((goal) => goal.tags), ...tasks.flatMap((task) => task.tags)]
        .map((tag) => tag.trim())
        .filter(Boolean)
    )
  ).sort((left, right) => left.localeCompare(right));
}

export function getTopTags(goals: LearningGoal[], tasks: GoalTask[]) {
  const counts = new Map<string, number>();

  [...goals.flatMap((goal) => goal.tags), ...tasks.flatMap((task) => task.tags)].forEach(
    (tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1)
  );

  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((left, right) => right.count - left.count || left.tag.localeCompare(right.tag))
    .slice(0, 6);
}

export function getOutstandingTaskBuckets(tasks: GoalTask[], today: Date) {
  const oneDay = 24 * 60 * 60 * 1000;
  const todayOnly = startOfDay(today);

  const buckets = {
    today: 0,
    next7Days: 0,
    next14Days: 0,
    beyond14Days: 0,
  };

  tasks
    .filter((task) => task.status !== "completed" && task.targetDate)
    .forEach((task) => {
      const target = startOfDay(new Date(task.targetDate ?? ""));
      const diffDays = Math.floor((target.getTime() - todayOnly.getTime()) / oneDay);

      if (diffDays <= 0) {
        buckets.today += 1;
      } else if (diffDays <= 7) {
        buckets.next7Days += 1;
      } else if (diffDays <= 14) {
        buckets.next14Days += 1;
      } else {
        buckets.beyond14Days += 1;
      }
    });

  return buckets;
}

export function getTaskStatusBreakdown(tasks: GoalTask[]) {
  const counts: Record<TaskStatus, number> = {
    "not-started": 0,
    "in-progress": 0,
    blocked: 0,
    completed: 0,
  };

  tasks.forEach((task) => {
    counts[task.status] += 1;
  });

  return counts;
}

export function sortGoals(
  goals: LearningGoal[],
  tasks: GoalTask[],
  sortOption: GoalSortOption
) {
  return [...goals].sort((left, right) => {
    if (sortOption === "title-asc") {
      return left.title.localeCompare(right.title);
    }

    if (sortOption === "target-asc") {
      return compareOptionalDates(left.targetDate, right.targetDate);
    }

    if (sortOption === "progress-desc") {
      return (
        calculateGoalProgress(tasks, right.id) - calculateGoalProgress(tasks, left.id)
      );
    }

    return compareOptionalDates(right.updatedAt, left.updatedAt);
  });
}

function compareOptionalDates(left?: string, right?: string) {
  if (!left && !right) {
    return 0;
  }

  if (!left) {
    return 1;
  }

  if (!right) {
    return -1;
  }

  return new Date(left).getTime() - new Date(right).getTime();
}

function startOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}
