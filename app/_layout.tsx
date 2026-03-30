import { Stack } from "expo-router";
import { GoalProvider } from "../state/GoalContext";

export default function RootLayout() {
  console.log("RootLayout is rendering");
  return (
    <GoalProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#0f172a" },
          headerTintColor: "#f8fafc",
          headerTitleStyle: { fontWeight: "600" },
  }}
/>
    </GoalProvider>
  );
}