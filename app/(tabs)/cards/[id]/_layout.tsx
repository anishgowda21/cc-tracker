import { Stack } from "expo-router";

export default function CardViewLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Card Details",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="payment"
        options={{ title: "Make Payment", headerShown: false }}
      />
      {/* 
      <Stack.Screen name="history" options={{ title: "Payment History" }} />
      <Stack.Screen name="stats" options={{ title: "Statistics" }} />
      */}
    </Stack>
  );
}
