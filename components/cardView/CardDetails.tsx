import { BillCycle, Card } from "@/types";
import { View, Text } from "react-native";

interface CardDetailsProps {
  card: Card;
  latestCycle: BillCycle;
}

const CardDetails = ({ card, latestCycle }: CardDetailsProps) => {
  return (
    <View
      className="w-full rounded-2xl p-6 mb-6"
      style={{
        backgroundColor: card.color,
        shadowColor: card.color,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 10,
      }}
    >
      <View className="flex-row justify-between items-start mb-8">
        <View>
          <Text className="text-white text-xl font-bold">{card.bankName}</Text>
          <Text className="text-white text-xs opacity-70">
            {card.cardName || "Platinum Rewards"} - {card.lastDigits || "4567"}
          </Text>
        </View>
        <Text className="text-white font-medium text-sm">
          {card.network || "VISA"}
        </Text>
      </View>

      <Text className="text-white text-sm opacity-80 mb-1">
        Current Balance
      </Text>
      <Text className="text-white text-3xl font-bold mb-6">
        ₹
        {latestCycle
          ? latestCycle.remainingAmount.toLocaleString("en-IN")
          : "0"}
      </Text>

      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-white text-xs opacity-80 mb-1">
            Total Bill Amount
          </Text>
          <Text className="text-white text-lg font-semibold">
            ₹{latestCycle ? latestCycle.totalBill.toLocaleString("en-IN") : "0"}
          </Text>
        </View>
        <View>
          <Text className="text-white text-xs opacity-80 mb-1">
            Credit Limit
          </Text>
          <Text className="text-white text-lg font-semibold">
            ₹{card.limit.toLocaleString("en-IN")}
          </Text>
        </View>
      </View>
    </View>
  );
};
export default CardDetails;
