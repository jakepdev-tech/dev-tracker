import { LearningItem } from "../types/learning";

export const mockItems: LearningItem[] = [
  {
    id: "1",
    title: "AWS Solutions Architect Associate",
    type: "certification",
    status: "in-progress",
    provider: "AWS"
  },
  {
    id: "2",
    title: "MuleSoft Developer Level 1",
    type: "certification",
    status: "planned",
    provider: "MuleSoft"
  },
  {
    id: "3",
    title: "Designing Data Intensive Applications",
    type: "book",
    status: "reading",
    provider: "O'Reilly"
  }
];