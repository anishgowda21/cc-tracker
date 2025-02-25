import Feather from "@expo/vector-icons/Feather";
import { router } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";

export const AddCardButton = () => (
  <TouchableOpacity
    onPress={() => router.push("/cards/add")}
    className="mt-4 mb-6 bg-blue-600 p-4 rounded-xl flex-row justify-center items-center"
  >
    <Feather
      name="plus-circle"
      size={20}
      color="white"
      style={{ marginRight: 8 }}
    />
    <Text className="text-white text-center font-semibold text-lg">
      Add New Card
    </Text>
  </TouchableOpacity>
);

export const EmptyState = () => (
  <View className="flex-1 justify-center items-center p-6">
    <Feather
      name="credit-card"
      size={64}
      color="#9ca3af"
      style={{ marginBottom: 16 }}
    />
    <Text className="text-xl font-bold text-gray-800 mb-2 text-center">
      No cards added yet
    </Text>
    <Text className="text-gray-500 mb-8 text-center">
      Add your first credit card to start tracking payments and due dates
    </Text>
    <AddCardButton />
  </View>
);
