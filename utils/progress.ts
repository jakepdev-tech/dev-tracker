import { Activity } from "../types/learning";

export function calculateProgress(activities: Activity[], goalId: string): number {
  const goalActivities = activities.filter((activity) => activity.goalId === goalId);

  if (goalActivities.length === 0) {
    return 0;
  }

  const completedActivities = goalActivities.filter(
    (activity) => activity.status === "completed"
  );

  return Math.round((completedActivities.length / goalActivities.length) * 100);
}