import React, { createContext, useContext, useState } from "react";
import { mockActivities, mockGoals } from "../data/mockData";
import { Activity, LearningGoal } from "../types/learning";

type GoalContextType = {
  goals: LearningGoal[];
  activities: Activity[];

  addGoal: (goal: LearningGoal) => void;

  addActivity: (activity: Activity) => void;
  toggleActivity: (activityId: string) => void;
};

const GoalContext = createContext<GoalContextType | undefined>(undefined);

export const GoalProvider = ({ children }: { children: React.ReactNode }) => {
  const [goals, setGoals] = useState<LearningGoal[]>(mockGoals);
  const [activities, setActivities] = useState<Activity[]>(mockActivities);

  const addGoal = (goal: LearningGoal) => {
    setGoals((prev) => [...prev, goal]);
  };

  const addActivity = (activity: Activity) => {
    setActivities((prev) => [...prev, activity]);
  };

  const toggleActivity = (activityId: string) => {
    setActivities((prev) =>
      prev.map((a) =>
        a.id === activityId
          ? {
              ...a,
              status: a.status === "completed" ? "todo" : "completed",
            }
          : a
      )
    );
  };

  return (
    <GoalContext.Provider
      value={{ goals, activities, addGoal, addActivity, toggleActivity }}
    >
      {children}
    </GoalContext.Provider>
  );
};

export const useGoals = () => {
  const context = useContext(GoalContext);
  if (!context) throw new Error("useGoals must be used inside GoalProvider");
  return context;
};