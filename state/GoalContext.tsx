import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { initialTrackerData } from "../data/mockData";
import { GoalTask, LearningGoal, TrackerData } from "../types/learning";
import {
  loadTrackerData,
  normalizeGoal,
  normalizeTask,
  saveTrackerData,
  validateGoalPayload,
} from "./storage";

type SaveGoalInput = {
  goal: LearningGoal;
  tasks: GoalTask[];
};

type GoalContextType = {
  goals: LearningGoal[];
  tasks: GoalTask[];
  hydrated: boolean;
  saveGoal: (input: SaveGoalInput) => { ok: boolean; errors: string[] };
  deleteGoal: (goalId: string) => void;
  getGoalById: (goalId: string) => LearningGoal | undefined;
  getTasksByGoalId: (goalId: string) => GoalTask[];
};

const GoalContext = createContext<GoalContextType | undefined>(undefined);

export const GoalProvider = ({ children }: { children: React.ReactNode }) => {
  const [data, setData] = useState<TrackerData>(initialTrackerData);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const loadedData = await loadTrackerData();

        if (isMounted) {
          setData(loadedData);
        }
      } finally {
        if (isMounted) {
          setHydrated(true);
        }
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    saveTrackerData(data).catch((error) => {
      console.warn("Failed to save tracker data", error);
    });
  }, [data, hydrated]);

  function saveGoal({ goal, tasks }: SaveGoalInput) {
    const now = new Date().toISOString();
    const normalizedGoal = normalizeGoal(
      {
        ...goal,
        updatedAt: now,
        createdAt: goal.createdAt ?? now,
      },
      now
    );
    const normalizedTasks = tasks.map((task, index) =>
      normalizeTask(
        {
          ...task,
          goalId: normalizedGoal.id,
          sortOrder: index,
        },
        index
      )
    );
    const validation = validateGoalPayload({
      goal: normalizedGoal,
      tasks: normalizedTasks,
    });

    if (!validation.valid) {
      return { ok: false, errors: validation.errors };
    }

    setData((current) => {
      const existingGoal = current.goals.some((entry) => entry.id === goal.id);

      return {
        goals: existingGoal
          ? current.goals.map((entry) =>
              entry.id === goal.id ? normalizedGoal : entry
            )
          : [...current.goals, normalizedGoal],
        tasks: [
          ...current.tasks.filter((task) => task.goalId !== goal.id),
          ...normalizedTasks,
        ],
      };
    });

    return { ok: true, errors: [] };
  }

  function deleteGoal(goalId: string) {
    setData((current) => ({
      goals: current.goals.filter((goal) => goal.id !== goalId),
      tasks: current.tasks.filter((task) => task.goalId !== goalId),
    }));
  }

  function getGoalById(goalId: string) {
    return data.goals.find((goal) => goal.id === goalId);
  }

  function getTasksByGoalId(goalId: string) {
    return data.tasks
      .filter((task) => task.goalId === goalId)
      .sort((left, right) => left.sortOrder - right.sortOrder);
  }

  const value = useMemo(
    () => ({
      goals: data.goals,
      tasks: data.tasks,
      hydrated,
      saveGoal,
      deleteGoal,
      getGoalById,
      getTasksByGoalId,
    }),
    [data.goals, data.tasks, hydrated]
  );

  return <GoalContext.Provider value={value}>{children}</GoalContext.Provider>;
};

export const useGoals = () => {
  const context = useContext(GoalContext);

  if (!context) {
    throw new Error("useGoals must be used inside GoalProvider");
  }

  return context;
};
