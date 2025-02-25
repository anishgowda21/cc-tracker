import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Keyboard,
} from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useEffect, useState, useRef, useCallback } from "react";
import {
  getCards,
  getCardBillCycles,
  createBillCycle,
  updateBillCycle,
  deleteCard,
} from "@/utils/storage";
import { Card, BillCycle } from "@/types";
import { ConfirmationModal } from "@/components/common/model";
import { getCurrentCycleDate, getDueDate } from "@/utils/helpers/dateHelpers";
import Feather from "@expo/vector-icons/Feather";
import CardDetails from "@/components/cardView/CardDetails";

type BannerContent = {
  message: string;
  color: string;
  textColor: string;
  icon: "file-text" | "alert-triangle" | "clock" | "check-circle";
};

// Banner content based on cycle status
const getBannerContent = (cycle: BillCycle): BannerContent => {
  switch (cycle.status) {
    case "not updated":
      return {
        message: "Bill not updated for this cycle",
        color: "#fef9c3",
        textColor: "#854d0e",
        icon: "file-text",
      };
    case "unpaid":
      return {
        message: `Bill amount: ₹${cycle.totalBill.toLocaleString(
          "en-IN"
        )} - Payment pending`,
        color: "#fee2e2",
        textColor: "#b91c1c",
        icon: "alert-triangle",
      };
    case "partial":
      return {
        message: `Remaining payment: ₹${cycle.remainingAmount.toLocaleString(
          "en-IN"
        )}`,
        color: "#ffedd5",
        textColor: "#9a3412",
        icon: "clock",
      };
    case "overdue":
      return {
        message: "Payment Overdue!",
        color: "#fee2e2",
        textColor: "#b91c1c",
        icon: "alert-triangle",
      };
    case "paid":
      return {
        message: "You are all caught up!",
        color: "#d1fae5",
        textColor: "#166534",
        icon: "check-circle",
      };
  }
};

export default function CardView() {
  const { id }: { id: string } = useLocalSearchParams();
  const [card, setCard] = useState<Card | null>(null);
  const [billCycles, setBillCycles] = useState<BillCycle[]>([]);
  const [billInput, setBillInput] = useState<string>("");
  const [showBillInput, setShowBillInput] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      (event) => {
        if (showBillInput && scrollViewRef.current) {
          scrollViewRef.current.scrollToEnd({ animated: true });
        }
      }
    );

    return () => {
      keyboardDidShowListener.remove();
    };
  }, [showBillInput]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

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
      const dueDate = getDueDate(
        currentCard.billDate,
        currentCard.dueDate,
        currentCycleDate
      );

      const newCycle: BillCycle = {
        id: `cycle_${currentCycleDate}_${id}`,
        cardId: id as string,
        cycleDate: currentCycleDate,
        totalBill: 0,
        rewardPoints: null,
        remainingAmount: 0,
        status: "not updated",
        payments: [],
        dueDate,
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
      scrollViewRef.current?.scrollToEnd({ animated: true });
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
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ padding: 16 }}
      directionalLockEnabled={true}
    >
      {/* Card Details - Visual Credit Card */}
      <CardDetails card={card} latestCycle={latestCycle} />

      {/* Status Banner */}
      {banner && (
        <View
          className="p-4 mb-6 rounded-xl flex-row items-center"
          style={{ backgroundColor: banner.color }}
        >
          <Feather
            name={banner.icon}
            size={20}
            color={banner.textColor}
            style={{ marginRight: 8 }}
          />
          <Text className="font-semibold" style={{ color: banner.textColor }}>
            {banner.message}
          </Text>
        </View>
      )}

      {/* Action Buttons - Quick Actions */}
      <View className="mb-6">
        <Text className="text-gray-700 font-semibold text-lg mb-3">
          Quick Actions
        </Text>
        <View className="flex-row justify-between">
          <TouchableOpacity
            className="bg-white rounded-xl p-4 shadow flex-1 mr-2 items-center"
            onPress={() => router.push(`/cards/${id}/payment`)}
          >
            <View className="bg-blue-100 p-2 rounded-full mb-2">
              <Feather name="dollar-sign" size={20} color="#2563EB" />
            </View>
            <Text className="text-sm font-medium text-gray-800">Pay Now</Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-white rounded-xl p-4 shadow flex-1 mx-2 items-center">
            <View className="bg-purple-100 p-2 rounded-full mb-2">
              <Feather name="file-text" size={20} color="#7C3AED" />
            </View>
            <Text className="text-sm font-medium text-gray-800">
              Bill History
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-white rounded-xl p-4 shadow flex-1 ml-2 items-center">
            <View className="bg-green-100 p-2 rounded-full mb-2">
              <Feather name="bar-chart-2" size={20} color="#16A34A" />
            </View>
            <Text className="text-sm font-medium text-gray-800">Stats</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Payment Information */}
      <View className="bg-white rounded-xl p-4 mb-6 shadow">
        <Text className="text-gray-800 font-semibold text-lg mb-4">
          Payment Details
        </Text>

        <View className="flex-row justify-between py-3 border-b border-gray-100">
          <View className="flex-row items-center">
            <Feather
              name="calendar"
              size={16}
              color="#4B5563"
              style={{ marginRight: 8 }}
            />
            <Text className="text-gray-600">Due Date</Text>
          </View>
          <Text className="font-medium text-gray-800">
            {latestCycle ? latestCycle.dueDate : "N/A"}
          </Text>
        </View>

        <View className="flex-row justify-between py-3 border-b border-gray-100">
          <View className="flex-row items-center">
            <Feather
              name="dollar-sign"
              size={16}
              color="#4B5563"
              style={{ marginRight: 8 }}
            />
            <Text className="text-gray-600">Total Bill</Text>
          </View>
          <Text className="font-medium text-gray-800">
            ₹{latestCycle ? latestCycle.totalBill.toLocaleString("en-IN") : "0"}
          </Text>
        </View>

        <View className="flex-row justify-between py-3">
          <View className="flex-row items-center">
            <Feather
              name="clock"
              size={16}
              color="#4B5563"
              style={{ marginRight: 8 }}
            />
            <Text className="text-gray-600">Bill Generated</Text>
          </View>
          <Text className="font-medium text-gray-800">
            {latestCycle
              ? latestCycle.cycleDate.replace(
                  /(\d{4})-(\d{2})-(\d{2})/,
                  "$3/$2/$1"
                )
              : "N/A"}
          </Text>
        </View>
      </View>

      {/* Add Due Button and Input (Only for "not updated") */}
      {isNotUpdated && (
        <View className="bg-white rounded-xl p-4 mb-6 shadow">
          <Text className="text-gray-800 font-semibold text-lg mb-3">
            Update Bill Amount
          </Text>
          {showBillInput ? (
            <>
              <TextInput
                placeholder="Enter bill amount"
                value={billInput}
                onChangeText={setBillInput}
                keyboardType="numeric"
                className="border border-gray-300 p-3 rounded-lg mb-3"
                onFocus={scrollToInput}
              />
              <View className="flex-row space-x-3">
                <TouchableOpacity
                  className="bg-blue-600 p-3 rounded-lg flex-1"
                  onPress={handleBillUpdate}
                >
                  <Text className="text-white text-center font-medium">
                    Save Bill Amount
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-gray-200 p-3 rounded-lg flex-1"
                  onPress={() => {
                    setBillInput("");
                    setShowBillInput(false);
                  }}
                >
                  <Text className="text-gray-700 text-center font-medium">
                    Close
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <TouchableOpacity
              className="bg-blue-600 p-3 rounded-lg"
              onPress={scrollToInput}
            >
              <Text className="text-white text-center font-medium">
                Add Bill Amount
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Edit and Delete buttons side by side */}
      <View className="flex-row mb-8 space-x-3">
        {/* Edit Card Button */}
        <TouchableOpacity className="bg-indigo-600 p-4 rounded-xl flex-1 flex-row justify-center shadow">
          <Text className="text-white font-semibold">Edit Card</Text>
        </TouchableOpacity>

        {/* Delete Card Button */}
        <TouchableOpacity
          className="flex-1 flex-row justify-center items-center bg-white p-4 rounded-xl shadow border border-red-200"
          onPress={() => setShowDeleteModal(true)}
        >
          <Feather
            name="trash-2"
            size={18}
            color="#DC2626"
            style={{ marginRight: 8 }}
          />
          <Text className="text-red-600 font-medium">Delete Card</Text>
        </TouchableOpacity>
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
