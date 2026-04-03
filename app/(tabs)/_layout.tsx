import { Tabs } from "expo-router";
import { colors, gradients } from "../../theme/theme";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: gradients.headerBottom },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: { fontWeight: "700" },
        headerShadowVisible: false,
        sceneStyle: { backgroundColor: colors.page },
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: colors.line,
          height: 72,
          paddingTop: 8,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.inkMuted,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Dashboard" }} />
      <Tabs.Screen name="tasks" options={{ title: "Tasks" }} />
      <Tabs.Screen name="reports" options={{ title: "Reports" }} />
    </Tabs>
  );
}
