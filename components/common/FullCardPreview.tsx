import React from "react";
import { View, Text } from "react-native";

interface FullCardPreviewProps {
  bankName?: string;
  cardName?: string;
  network?: string;
  cardNumber?: string;
  cardHolderName?: string;
  expiry?: string;
  cvv?: string;
  color?: string;
}

export const FullCardPreview: React.FC<FullCardPreviewProps> = ({
  bankName,
  cardName,
  network,
  cardNumber,
  cardHolderName,
  expiry,
  cvv,
  color,
}) => {
  const formatCardNumber = (number?: string) => {
    if (!number || number.length === 0) {
      return ["••••", "••••", "••••", "••••"];
    }

    const cleanNumber = number.replace(/\s+/g, "");

    if (cleanNumber.length === 16) {
      return [
        cleanNumber.substring(0, 4),
        cleanNumber.substring(4, 8),
        cleanNumber.substring(8, 12),
        cleanNumber.substring(12, 16),
      ];
    } else {
      return number.includes(" ") ? number.split(" ") : [number];
    }
  };

  const formattedCardNumber = formatCardNumber(cardNumber);

  return (
    <View
      className="w-full rounded-2xl p-6 mb-6"
      style={{
        backgroundColor: color || "#1E40AF",
        shadowColor: color || "#1E40AF",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 10,
        height: 200,
      }}
    >
      {/* Top Row - Bank Name, Card Name, and Network */}
      <View className="flex-row justify-between items-start mb-8">
        <View>
          <Text className="text-white text-xl font-bold">
            {bankName || "BANK NAME"}
          </Text>
          <Text className="text-white text-xs opacity-70">
            {cardName || "Credit Card"}
          </Text>
        </View>
        <Text className="text-white font-medium text-sm">
          {network || "VISA"}
        </Text>
      </View>

      {/* Card Number Row */}
      <View className="flex-row justify-between mb-10">
        {formattedCardNumber.map((segment, index) => (
          <Text
            key={index}
            className="text-white text-lg font-mono"
            style={{
              flex: 1,
              textAlign:
                index === 0
                  ? "left"
                  : index === formattedCardNumber.length - 1
                  ? "right"
                  : "center",
            }}
          >
            {segment}
          </Text>
        ))}
      </View>

      {/* Bottom Row - Card Holder, Expiry, CVV */}
      <View className="flex-row justify-between items-end">
        <View className="flex-1 mr-4 overflow-hidden">
          <Text className="text-white opacity-70 text-xs mb-1">
            CARD HOLDER
          </Text>
          <Text className="text-white font-medium truncate" numberOfLines={1}>
            {cardHolderName || "YOUR NAME"}
          </Text>
        </View>

        <View className="flex-row">
          <View className="mr-6">
            <Text className="text-white opacity-70 text-xs mb-1">EXPIRES</Text>
            <Text className="text-white font-medium">{expiry || "MM/YY"}</Text>
          </View>

          <View>
            <Text className="text-white opacity-70 text-xs mb-1">CVV</Text>
            <Text className="text-white font-medium">{cvv || "•••"}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};
