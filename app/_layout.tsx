import { Stack } from "expo-router";
import { GoalProvider } from "../state/GoalContext";

export default function RootLayout() {
  return (
    <GoalProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#0f172a" },
          headerTintColor: "#f8fafc",
          headerTitleStyle: { fontWeight: "700" },
          contentStyle: { backgroundColor: "#0f172a" },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="goal-form" options={{ title: "Goal" }} />
        <Stack.Screen name="goal/[id]" options={{ title: "Goal Details" }} />
      </Stack>
    </GoalProvider>
  );
}
