import { Stack } from "expo-router";

export default function CardsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ headerShown: false, title: "Cards" }}
      />
      <Stack.Screen name="add" options={{ title: "Add New Card" }} />
    </Stack>
  );
}
