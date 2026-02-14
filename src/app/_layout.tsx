import "../../global.css";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#1a1a2e" },
        headerTintColor: "#e0e0e0",
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Word Learning" }} />
      <Stack.Screen
        name="add"
        options={{ title: "単語を登録", presentation: "modal" }}
      />
      <Stack.Screen name="word/[id]" options={{ title: "単語詳細" }} />
    </Stack>
  );
}
