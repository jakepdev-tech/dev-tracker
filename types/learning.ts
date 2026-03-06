export type LearningStatus =
  | "planned"
  | "in-progress"
  | "reading"
  | "complete";

export type LearningType =
  | "certification"
  | "course"
  | "book"
  | "article"
  | "project";

export interface LearningItem {
  id: string;
  title: string;
  type: LearningType;
  status: LearningStatus;
  provider?: string;
  targetDate?: string;
}