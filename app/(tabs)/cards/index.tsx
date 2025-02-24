import { Card } from "@/types";
import { getCards } from "@/utils/storage";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";

export default function CardsScreen() {
  const [cardList, setCardList] = useState<Card[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadCards();
    }, [])
  );

  async function loadCards() {
    const cards = await getCards();
    setCardList(cards);
  }
  return (
    <View className="flex-1 px-4 pt-4">
      <Text className="text-2xl font-bold">My Cards</Text>
      <View className="mt-4">
        {cardList.map((card) => (
          <TouchableOpacity
            onPress={() => {
              router.push(`/cards/${card.id}`);
            }}
            key={card.id}
            className="bg-white p-4 rounded-lg mb-4"
          >
            <Text className="text-xl font-semibold">{card.cardName}</Text>
            <Text className="text-lg text-gray-500">{card.bankName}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          onPress={() => router.push("/cards/add")}
          className="mt-4 bg-blue-500 p-4 rounded-lg"
        >
          <Text className="text-white text-center font-semibold">
            Add New Card
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
