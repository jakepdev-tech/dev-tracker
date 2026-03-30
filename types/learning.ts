export type GoalStatus =
  | "planned"
  | "in-progress"
  | "paused"
  | "completed";

export type GoalType =
  | "certification"
  | "project"
  | "capability";

export type FundingType =
  | "self"
  | "employer"
  | "learning-budget"
  | "free";

export type ActivityStatus =
  | "planned"
  | "todo"
  | "in-progress"
  | "completed";

export type ActivityType =
  | "module"
  | "revision"
  | "exam"
  | "project-step"
  | "reading"
  | "practice"
  | "other";

export interface Activity {
  id: string;
  goalId: string;

  title: string;
  description?: string;

  type?: ActivityType;
  status: ActivityStatus;

  startDate?: string;
  targetDate?: string;
  completionDate?: string;

  notes?: string;
  links?: string[];
  tags?: string[];
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

  fundingType?: FundingType;

  notes?: string;
  links?: string[];
  tags?: string[];
}