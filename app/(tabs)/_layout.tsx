import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          // headerShown: false if you don't want header
        }}
      />
      <Tabs.Screen
        name="cards"
        options={{
          title: "My Cards",
          // headerShown: false if you don't want header
        }}
      />
    </Tabs>
  );
}
