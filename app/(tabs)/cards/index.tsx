import { Card, BillCycle } from "@/types";
import { getCards, getCardBillCycles } from "@/utils/storage";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { CardPreview } from "@/components/cardList/CardPreview";
import {
  AddCardButton,
  EmptyState,
} from "@/components/cardList/AdditionButtons";

export default function CardsScreen() {
  const [cardList, setCardList] = useState<Card[]>([]);
  const [billCycles, setBillCycles] = useState<{ [key: string]: BillCycle }>(
    {}
  );
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadCards();
    }, [])
  );

  async function loadCards() {
    setLoading(true);
    try {
      const cards = await getCards();
      setCardList(cards);

      // Load latest bill cycle for each card
      const cyclesData: { [key: string]: BillCycle } = {};
      for (const card of cards) {
        const cycles = await getCardBillCycles(card.id);
        if (cycles.length > 0) {
          // Get latest cycle by sorting
          const latestCycle = cycles.sort((a, b) =>
            b.cycleDate.localeCompare(a.cycleDate)
          )[0];
          cyclesData[card.id] = latestCycle;
        }
      }
      setBillCycles(cyclesData);
    } catch (error) {
      console.error("Error loading cards:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#1e40af" />
        <Text className="mt-4 text-gray-600">Loading your cards...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="px-4 pt-6 pb-2">
        <Text className="text-2xl font-bold text-gray-800">My Cards</Text>
      </View>

      {cardList.length === 0 ? (
        <EmptyState />
      ) : (
        <View className="px-4 pt-2">
          {cardList.map((card) => (
            <CardPreview
              key={card.id}
              card={card}
              latestCycle={billCycles[card.id]}
            />
          ))}
          <AddCardButton />
        </View>
      )}
    </View>
  );
}
