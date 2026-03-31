import AsyncStorage from "@react-native-async-storage/async-storage";
import { initialTrackerData } from "../data/mockData";
import { TrackerData, TrackerStorageEnvelope } from "../types/learning";
import {
  CURRENT_SCHEMA_VERSION,
  migrateTrackerData,
  normalizeGoal,
  normalizeTask,
  normalizeTrackerData,
  validateGoalPayload,
} from "./trackerModel";

export { CURRENT_SCHEMA_VERSION, normalizeGoal, normalizeTask, validateGoalPayload };

export const STORAGE_KEY = "dev-tracker-data-v2";

export async function loadTrackerData() {
  try {
    const raw =
      (await AsyncStorage.getItem(STORAGE_KEY)) ??
      (await AsyncStorage.getItem("dev-tracker-data-v1"));

    if (!raw) {
      return normalizeTrackerData(initialTrackerData);
    }

    const parsed = JSON.parse(raw) as TrackerStorageEnvelope | TrackerData;
    return migrateTrackerData(parsed);
  } catch (error) {
    console.warn("Failed to load tracker data", error);
    return normalizeTrackerData(initialTrackerData);
  }
}

export async function saveTrackerData(data: TrackerData) {
  const normalized = normalizeTrackerData(data);
  const envelope: TrackerStorageEnvelope = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    data: normalized,
  };

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
}
