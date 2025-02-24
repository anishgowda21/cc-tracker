import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState, useRef } from "react";
import {
  getCards,
  getCardBillCycles,
  createBillCycle,
  updateBillCycle,
  deleteCard,
} from "@/utils/storage";
import { Card, BillCycle } from "@/types";
import { ConfirmationModal } from "@/components/common/model";

// Helper to determine current cycle date
const getCurrentCycleDate = (billDate: number): string => {
  const today = new Date();
  const day = today.getDate();
  let month = today.getMonth();
  let year = today.getFullYear();

  if (day < billDate) {
    month -= 1;
    if (month < 0) {
      month = 11;
      year -= 1;
    }
  }

  return `${year}-${String(month + 1).padStart(2, "0")}`;
};

// Banner content based on cycle status
const getBannerContent = (cycle: BillCycle) => {
  switch (cycle.status) {
    case "not updated":
      return { message: "Bill not updated for this cycle", color: "yellow" };
    case "unpaid":
      return {
        message: `Bill amount: $${cycle.totalBill} - Payment pending`,
        color: "red",
      };
    case "partial":
      return {
        message: `Remaining payment: $${cycle.remainingAmount}`,
        color: "orange",
      };
    case "overdue":
      return { message: "Payment Overdue!", color: "red" };
    case "paid":
      return { message: "You are all caught up!", color: "green" };
  }
};

// Reusable Confirmation Modal Component

export default function CardView() {
  const { id }: { id: string } = useLocalSearchParams();
  const [card, setCard] = useState<Card | null>(null);
  const [billCycles, setBillCycles] = useState<BillCycle[]>([]);
  const [billInput, setBillInput] = useState<string>("");
  const [showBillInput, setShowBillInput] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const cards = await getCards();
    const currentCard = cards.find((c) => c.id === id);
    if (!currentCard) {
      setCard(null);
      return;
    }
    console.log(currentCard);

    setCard(currentCard);

    const cycles = await getCardBillCycles(id as string);
    setBillCycles(cycles);
    console.log(cycles);
    const currentCycleDate = getCurrentCycleDate(currentCard.billDate);
    const hasCurrentCycle = cycles.some(
      (c) => c.cycleDate === currentCycleDate
    );

    if (!hasCurrentCycle) {
      const today = new Date();
      const [year, month] = currentCycleDate.split("-").map(Number); // e.g., ["2025", "02"]
      let dueMonth = month;
      let dueYear = year;

      // Adjust dueDate: same month if dueDate >= billDate, next month if dueDate < billDate
      if (currentCard.dueDate < currentCard.billDate) {
        dueMonth = month === 12 ? 1 : month + 1;
        dueYear = month === 12 ? year + 1 : year;
      }

      const dueDate = new Date(dueYear, dueMonth - 1, currentCard.dueDate);

      const newCycle: BillCycle = {
        id: `cycle_${currentCycleDate}_${id}`,
        cardId: id as string,
        cycleDate: currentCycleDate,
        totalBill: 0,
        remainingAmount: 0,
        status: "not updated",
        payments: [],
        dueDate: dueDate.toISOString().split("T")[0], // e.g., "2025-02-28" or "2025-03-03"
      };
      await createBillCycle(newCycle);
      setBillCycles([...cycles, newCycle]);
    }
  };

  const handleBillUpdate = async () => {
    if (!billInput || isNaN(parseFloat(billInput))) return;

    const latestCycle = billCycles.sort((a, b) =>
      b.cycleDate.localeCompare(a.cycleDate)
    )[0];
    if (!latestCycle) return;

    const amount = parseFloat(billInput);
    const updatedCycle: BillCycle = {
      ...latestCycle,
      totalBill: amount,
      remainingAmount: amount,
      status: amount === 0 ? "paid" : "unpaid",
    };

    await updateBillCycle(updatedCycle);
    setBillCycles(
      billCycles.map((c) => (c.id === updatedCycle.id ? updatedCycle : c))
    );
    setBillInput("");
    setShowBillInput(false);
  };

  const handleDeleteCard = async () => {
    await deleteCard(id);
    setShowDeleteModal(false);
    router.replace("/cards");
  };

  const scrollToInput = () => {
    setShowBillInput(true);
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: 300, animated: true });
    }, 100);
  };

  if (!card) return <Text>No Card info</Text>;

  const latestCycle = billCycles.sort((a, b) =>
    b.cycleDate.localeCompare(a.cycleDate)
  )[0];
  const banner = latestCycle ? getBannerContent(latestCycle) : null;
  const isNotUpdated = latestCycle?.status === "not updated";

  return (
    <ScrollView
      ref={scrollViewRef}
      className="flex-1"
      contentContainerStyle={{ padding: 16 }}
    >
      {/* Banner */}
      {banner && (
        <View
          className="p-3 mb-4 rounded-lg"
          style={{ backgroundColor: banner.color }}
        >
          <Text className="text-white font-semibold">{banner.message}</Text>
        </View>
      )}

      {/* Card Details */}
      <View
        className="w-full rounded-3xl p-6 mb-6"
        style={{ backgroundColor: card.color }}
      >
        <Text className="text-white text-2xl mb-6">{card.bankName}</Text>

        <Text className="text-white text-lg opacity-80">Current Balance</Text>
        <Text className="text-white text-4xl mb-6">
          ${latestCycle ? latestCycle.remainingAmount : "0"}
        </Text>

        <View className="flex-row justify-between">
          <View>
            <Text className="text-white opacity-80">Available Credit</Text>
            <Text className="text-white text-2xl">
              $
              {latestCycle
                ? card.limit - latestCycle.remainingAmount
                : card.limit}
            </Text>
          </View>
          <View>
            <Text className="text-white opacity-80">Credit Limit</Text>
            <Text className="text-white text-2xl">${card.limit}</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="flex-row justify-between mb-6">
        <TouchableOpacity
          className="bg-white p-4 rounded-xl flex-1 mx-2 items-center shadow"
          onPress={() => router.push(`/cards/${id}/payment`)}
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

      {/* Permanent View Bill Cycles Button */}
      <TouchableOpacity
        className="bg-purple-500 p-4 rounded-xl items-center shadow mb-6"
        onPress={() => {}}
      >
        <Text className="text-white font-semibold">View Bill Cycles</Text>
      </TouchableOpacity>

      {/* Add Due Button and Input (Only for "not updated") */}
      {isNotUpdated && (
        <View className="mb-6">
          <TouchableOpacity
            className="bg-blue-500 p-4 rounded-xl items-center shadow"
            onPress={scrollToInput}
          >
            <Text className="text-white font-semibold">Add Due</Text>
          </TouchableOpacity>

          {showBillInput && (
            <View className="mt-4 bg-white p-4 rounded-xl shadow">
              <TextInput
                placeholder="Enter bill amount"
                value={billInput}
                onChangeText={setBillInput}
                keyboardType="numeric"
                className="border p-2 rounded mb-4"
                onFocus={scrollToInput}
              />
              <TouchableOpacity
                className="bg-green-500 p-3 rounded"
                onPress={handleBillUpdate}
              >
                <Text className="text-white text-center">Submit</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Delete Card Button */}
      <TouchableOpacity
        className="bg-red-500 p-4 rounded-xl items-center shadow mb-6"
        onPress={() => setShowDeleteModal(true)}
      >
        <Text className="text-white font-semibold">Delete Card</Text>
      </TouchableOpacity>

      {/* Payment Information */}
      <View className="bg-white rounded-xl p-4">
        <Text className="text-xl font-semibold mb-4">Payment Information</Text>
        <View className="flex-row justify-between py-3 border-b border-gray-200">
          <Text className="text-gray-600">Due Date</Text>
          <Text>{latestCycle ? latestCycle.dueDate : "N/A"}</Text>
        </View>
      </View>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteCard}
        title="Delete Card"
        description={`Are you sure you want to delete ${card.bankName}? This action cannot be undone.`}
        color="red"
      />
    </ScrollView>
  );
}
