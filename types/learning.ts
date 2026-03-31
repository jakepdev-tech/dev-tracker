export type GoalStatus =
  | "planned"
  | "in-progress"
  | "blocked"
  | "completed";

export type GoalType =
  | "certification"
  | "project"
  | "capability"
  | "domain";

export type TaskStatus =
  | "not-started"
  | "in-progress"
  | "blocked"
  | "completed";

export interface GoalTask {
  id: string;
  goalId: string;
  title: string;
  details?: string;
  status: TaskStatus;
  progress: number;
  weight: number;
  evidence?: string;
  tags: string[];
  startDate?: string;
  targetDate?: string;
  completionDate?: string;
  sortOrder: number;
}

export interface LearningGoal {
  id: string;
  title: string;
  description?: string;
  type: GoalType;
  status: GoalStatus;
  startDate?: string;
  targetDate?: string;
  completionDate?: string;
  notes?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TrackerData {
  goals: LearningGoal[];
  tasks: GoalTask[];
}

export interface TrackerStorageEnvelope {
  schemaVersion: number;
  data: TrackerData;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export type GoalSortOption =
  | "updated-desc"
  | "target-asc"
  | "progress-desc"
  | "title-asc";
