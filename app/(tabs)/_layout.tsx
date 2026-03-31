import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: "#0f172a" },
        headerTintColor: "#f8fafc",
        tabBarStyle: {
          backgroundColor: "#0f172a",
          borderTopColor: "#1e293b",
        },
        tabBarActiveTintColor: "#60a5fa",
        tabBarInactiveTintColor: "#94a3b8",
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Dashboard" }} />
      <Tabs.Screen name="tasks" options={{ title: "Tasks" }} />
      <Tabs.Screen name="reports" options={{ title: "Reports" }} />
    </Tabs>
  );
}
