import { View, Text, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { getCards } from "@/utils/storage";
import { Card } from "@/types";

export default function CardView() {
  const { id } = useLocalSearchParams();
  const [card, setCard] = useState<Card | null>(null);

  useEffect(() => {
    loadCard();
  }, []);

  async function loadCard() {
    const cards = await getCards();
    console.log(cards);

    const currentCard = cards.find((c) => c.id === id);
    setCard(currentCard || null);
  }

  if (!card) return <Text>No Card info</Text>;

  return (
    <View className="flex-1 p-4">
      {/* Card Details */}
      <View
        className="w-full rounded-3xl p-6"
        style={{ backgroundColor: card.color }}
      >
        <Text className="text-white text-2xl mb-6">{card.bankName}</Text>

        <Text className="text-white text-lg opacity-80">Current Balance</Text>
        <Text className="text-white text-4xl mb-6">${card.currentBalance}</Text>

        <View className="flex-row justify-between">
          <View>
            <Text className="text-white opacity-80">Available Credit</Text>
            <Text className="text-white text-2xl">
              ${card.limit - card.currentBalance}
            </Text>
          </View>
          <View>
            <Text className="text-white opacity-80">Credit Limit</Text>
            <Text className="text-white text-2xl">${card.limit}</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="flex-row justify-between mt-6">
        <TouchableOpacity
          className="bg-white p-4 rounded-xl flex-1 mx-2 items-center shadow"
          onPress={() => {
            router.push(`/cards/${id}/payment`);
          }}
        >
          <Text className="font-semibold">Make Payment</Text>
        </TouchableOpacity>

        <TouchableOpacity className="bg-white p-4 rounded-xl flex-1 mx-2 items-center shadow">
          <Text className="font-semibold">Payment History</Text>
        </TouchableOpacity>

        <TouchableOpacity className="bg-white p-4 rounded-xl flex-1 mx-2 items-center shadow">
          <Text className="font-semibold">Statistics</Text>
        </TouchableOpacity>
      </View>

      {/* Payment Information */}
      <View className="bg-white rounded-xl mt-6 p-4">
        <Text className="text-xl font-semibold mb-4">Payment Information</Text>

        <View className="flex-row justify-between py-3 border-b border-gray-200">
          <Text className="text-gray-600">Due Date</Text>
          <Text>{card.dueDate}</Text>
        </View>

        <View className="flex-row justify-between py-3 border-b border-gray-200">
          <Text className="text-gray-600">Minimum Payment</Text>
          <Text>$35</Text>
        </View>

        <View className="flex-row justify-between py-3">
          <Text className="text-gray-600">Last Payment</Text>
          <Text>Coming soon...</Text>
        </View>
      </View>
    </View>
  );
}
