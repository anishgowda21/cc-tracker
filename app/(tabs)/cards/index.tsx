import { Card, BillCycle } from "@/types";
import { getCards, getCardBillCycles } from "@/utils/storage";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { CardPreview } from "@/components/cardList/CardPreview";
import {
  AddCardButton,
  EmptyState,
} from "@/components/cardList/AdditionButtons";
import { Feather } from "@expo/vector-icons";

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
      <View className="px-4 pt-6 pb-2 flex-row justify-between items-center">
        <Text className="text-2xl font-bold text-gray-800">My Cards</Text>
        <TouchableOpacity
          onPress={() => router.push("/cards/add")}
          className="w-10 h-10 bg-blue-600 rounded-full justify-center items-center"
        >
          <Feather name={"plus"} size={24} color="white" />
        </TouchableOpacity>
      </View>

      {cardList.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={cardList}
          renderItem={({ item }) => (
            <CardPreview card={item} latestCycle={billCycles[item.id]} />
          )}
          keyExtractor={(item) => item.id}
          ListFooterComponent={<AddCardButton />}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8 }}
        />
      )}
    </View>
  );
}
