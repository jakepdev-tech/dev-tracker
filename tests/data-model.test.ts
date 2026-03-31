import assert from "node:assert/strict";
import { initialTrackerData } from "../data/mockData";
import { buildSavePayloadFromDraft } from "../state/goalDraft";
import {
  CURRENT_SCHEMA_VERSION,
  migrateTrackerData,
  normalizeGoal,
  normalizeTask,
  validateGoalPayload,
} from "../state/trackerModel";
import { calculateGoalProgress } from "../utils/progress";

function run() {
  const now = "2026-03-31T10:00:00.000Z";

  const normalizedGoal = normalizeGoal(
    {
      id: "goal-1",
      title: "  Security Track  ",
      type: "domain",
      status: "planned",
      tags: ["security", "security", " iam "],
    },
    now
  );

  assert.equal(normalizedGoal.title, "Security Track");
  assert.deepEqual(normalizedGoal.tags, ["security", "iam"]);
  assert.equal(normalizedGoal.createdAt, now);

  const normalizedTask = normalizeTask(
    {
      id: "task-1",
      goalId: "goal-1",
      title: "  Finish lab  ",
      progress: 120,
      weight: -10,
      tags: ["lab", " lab "],
    },
    0
  );

  assert.equal(normalizedTask.title, "Finish lab");
  assert.equal(normalizedTask.progress, 100);
  assert.equal(normalizedTask.weight, 0);
  assert.deepEqual(normalizedTask.tags, ["lab"]);
  assert.equal(normalizedTask.status, "completed");

  const migrated = migrateTrackerData({
    schemaVersion: CURRENT_SCHEMA_VERSION,
    data: initialTrackerData,
  });

  assert.ok(migrated.goals.length > 0);
  assert.ok(migrated.tasks.length > 0);

  const goalProgress = calculateGoalProgress(migrated.tasks, "goal-aws-architect");
  assert.equal(goalProgress, 43);

  const payload = buildSavePayloadFromDraft(
    {
      title: "Cloud Plan",
      description: "Track exam prep",
      type: "certification",
      status: "planned",
      startDate: "2026-04-01",
      targetDate: "2026-06-01",
      completionDate: "",
      notes: "",
      tags: "cloud, cloud, security",
      tasks: [
        {
          id: "task-a",
          title: "Module 1",
          details: "",
          status: "completed",
          progress: "100",
          weight: "50",
          evidence: "notes",
          tags: "cloud, basics",
          startDate: "2026-04-01",
          targetDate: "2026-04-10",
          completionDate: "2026-04-08",
        },
        {
          id: "task-b",
          title: "Module 2",
          details: "",
          status: "in-progress",
          progress: "40",
          weight: "50",
          evidence: "",
          tags: "security",
          startDate: "2026-04-11",
          targetDate: "2026-05-10",
          completionDate: "",
        },
      ],
    },
    "goal-cloud"
  );

  const validResult = validateGoalPayload(payload);
  assert.equal(validResult.valid, true);

  const invalidResult = validateGoalPayload({
    goal: {
      ...payload.goal,
      completionDate: "2026-03-01",
    },
    tasks: [
      ...payload.tasks.slice(0, 1),
      {
        ...payload.tasks[1],
        weight: 10,
      },
    ],
  });

  assert.equal(invalidResult.valid, false);
  assert.ok(
    invalidResult.errors.includes(
      "Goal dates must keep target/completion on or after the start date."
    )
  );
  assert.ok(
    invalidResult.errors.includes("Task weights must add up to 100% for the goal.")
  );

  console.log("data-model verification passed");
}

run();
