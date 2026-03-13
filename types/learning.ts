export type GoalType =
  | "certification"
  | "project"
  | "capability";

export type GoalStatus =
  | "planned"
  | "in-progress"
  | "paused"
  | "completed";

export type FundingType =
  | "self"
  | "employer"
  | "learning-budget"
  | "free";

export interface LearningGoal {
  id: string;
  title: string;
  type: GoalType;
  status: GoalStatus;

  startDate?: string;
  targetDate?: string;
  completionDate?: string;

  notes?: string[];
  links?: string[];

  cost?: number;
  fundingType?: FundingType;

  tags?: string[];
}

export type ActivityType =
  | "module"
  | "course"
  | "book"
  | "article"
  | "lab"
  | "revision"
  | "exam"
  | "project-step"
  | "task";

export type ActivityStatus =
  | "planned"
  | "in-progress"
  | "blocked"
  | "completed";

export interface LearningActivity {
  id: string;
  goalId: string;
  title: string;
  type: ActivityType;
  status: ActivityStatus;

  startDate?: string;
  targetDate?: string;
  completionDate?: string;

  notes?: string[];
  links?: string[];
  tags?: string[];
}