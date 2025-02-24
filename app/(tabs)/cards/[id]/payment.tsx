import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";

export default function PaymentScreen() {
  const { id } = useLocalSearchParams();
  const [amount, setAmount] = useState("");

  return (
    <View className="flex-1 p-4">
      <Text className="text-xl font-bold mb-4">Add Payment</Text>

      <View className="bg-white rounded-lg p-4 shadow">
        <Text className="text-gray-600 mb-2">Payment Amount</Text>
        <TextInput
          placeholder="Enter Amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          className="border p-2 rounded mb-2"
        />
        <TouchableOpacity
          className="bg-blue-500 p-3 rounded"
          onPress={() => {
            console.log(`Payment of ${amount} added for card ${id}`);
            setAmount("");
          }}
        >
          <Text className="text-white text-center">Add Payment</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
