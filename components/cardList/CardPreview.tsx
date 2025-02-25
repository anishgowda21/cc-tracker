import { Card, BillCycle } from "@/types";
import { router } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";
import Feather from "@expo/vector-icons/Feather";

export const CardPreview = ({
  card,
  latestCycle,
}: {
  card: Card;
  latestCycle?: BillCycle;
}) => {
  // Get status icon and color based on payment status
  const getStatusInfo = (status?: string) => {
    if (!status)
      return { icon: "help-circle", color: "#9ca3af", text: "No data" };

    switch (status) {
      case "paid":
        return {
          icon: "check-circle",
          color: "#16a34a",
          text: "Paid",
        };
      case "partial":
        return {
          icon: "clock",
          color: "#ea580c",
          text: `₹${latestCycle?.remainingAmount.toLocaleString(
            "en-IN"
          )} remaining`,
        };
      case "unpaid":
        return {
          icon: "alert-circle",
          color: "#dc2626",
          text: `₹${latestCycle?.totalBill.toLocaleString("en-IN")} due`,
        };
      case "overdue":
        return {
          icon: "alert-triangle",
          color: "#dc2626",
          text: "Overdue!",
        };
      case "not updated":
        return {
          icon: "file-text",
          color: "#ca8a04",
          text: "Bill not updated",
        };
      default:
        return {
          icon: "help-circle",
          color: "#9ca3af",
          text: status,
        };
    }
  };

  const statusInfo = getStatusInfo(latestCycle?.status);

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";

    // Convert YYYY-MM-DD to DD/MM
    const parts = dateString.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}`;
    }
    return dateString;
  };

  return (
    <TouchableOpacity
      onPress={() => router.push(`/cards/${card.id}`)}
      className="mb-4 overflow-hidden rounded-xl"
    >
      <View
        style={{
          backgroundColor: card.color || "#1e40af",
          shadowColor: card.color || "#1e40af",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 6,
          elevation: 5,
        }}
        className="rounded-xl"
      >
        {/* Top section with bank/card name and network */}
        <View className="p-4 flex-row justify-between items-start">
          <View>
            <Text className="text-white text-lg font-bold">
              {card.bankName}
            </Text>
            <Text className="text-white text-xs opacity-70">
              {card.cardName || "Credit Card"}
            </Text>
          </View>
          <Text className="text-white font-medium">{card.network}</Text>
        </View>

        {/* Middle section with last digits */}
        <View className="px-4 pb-2">
          <Text className="text-white text-sm opacity-80">
            •••• •••• •••• {card.lastDigits}
          </Text>
        </View>

        {/* Bottom section with payment status */}
        <View className="bg-black bg-opacity-20 p-4">
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <Feather
                name={statusInfo.icon as any}
                size={16}
                color={statusInfo.color}
                style={{ marginRight: 6 }}
              />
              <Text className="text-white font-medium">{statusInfo.text}</Text>
            </View>

            {latestCycle?.dueDate && (
              <View className="flex-row items-center">
                <Feather
                  name="calendar"
                  size={14}
                  color="white"
                  style={{ marginRight: 4, opacity: 0.7 }}
                />
                <Text className="text-white opacity-90">
                  Due: {formatDate(latestCycle.dueDate)}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};
