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
    // Default placeholder for empty card number
    if (!number || number.trim().length === 0) {
      return "•••• •••• •••• ••••";
    }

    // Clean the input by removing spaces
    const cleanNumber = number.replace(/\s+/g, "");

    // Format the card number with spaces
    if (cleanNumber.length <= 16) {
      let formatted = "";
      for (let i = 0; i < cleanNumber.length; i++) {
        if (i > 0 && i % 4 === 0) {
          formatted += " ";
        }
        formatted += cleanNumber[i];
      }

      // Pad with bullet points if needed
      const remainingDigits = 16 - cleanNumber.length;
      if (remainingDigits > 0) {
        if (formatted.length > 0) formatted += " ";
        for (let i = 0; i < remainingDigits; i++) {
          if (i > 0 && i % 4 === 0) {
            formatted += " ";
          }
          formatted += "•";
        }
      }

      return formatted;
    } else {
      // Handle case where input is too long
      return cleanNumber
        .substring(0, 16)
        .replace(/(.{4})/g, "$1 ")
        .trim();
    }
  };

  return (
    <View
      className="w-full rounded-2xl px-5 py-6"
      style={{
        backgroundColor: color || "#1E40AF",
        shadowColor: color || "#1E40AF",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
        height: 200,
        justifyContent: "space-between",
      }}
    >
      {/* Top Row - Bank Name, Card Name, and Network */}
      <View className="flex-row justify-between items-start">
        <View>
          <Text className="text-white text-xl font-bold">
            {bankName || "BANK NAME"}
          </Text>
          <Text className="text-white text-xs opacity-80 mt-1">
            {cardName || "Credit Card"}
          </Text>
        </View>
        <Text className="text-white font-medium text-base">
          {network || "VISA"}
        </Text>
      </View>

      {/* Card Number Row - Single text with proper spacing */}
      <View className="my-2">
        <Text className="text-white text-xl font-mono tracking-wider text-center">
          {formatCardNumber(cardNumber)}
        </Text>
      </View>

      {/* Bottom Row - Card Holder, Expiry, CVV */}
      <View className="flex-row justify-between items-end">
        <View className="flex-1 mr-4">
          <Text className="text-white opacity-80 text-xs mb-1">
            CARD HOLDER
          </Text>
          <Text className="text-white font-medium truncate" numberOfLines={1}>
            {cardHolderName || "YOUR NAME"}
          </Text>
        </View>

        <View className="flex-row">
          <View className="mr-4">
            <Text className="text-white opacity-80 text-xs mb-1">EXPIRES</Text>
            <Text className="text-white font-medium">{expiry || "MM/YY"}</Text>
          </View>

          <View>
            <Text className="text-white opacity-80 text-xs mb-1">CVV</Text>
            <Text className="text-white font-medium">{cvv || "•••"}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};
