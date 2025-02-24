import { View, Text } from "react-native";

interface FullCardPreviewProps {
  bankName?: string;
  network?: string;
  cardNumber?: string;
  cardHolderName?: string;
  expiry?: string;
  cvv?: string;
  color?: string;
}

export const FullCardPreview: React.FC<FullCardPreviewProps> = ({
  bankName,
  network,
  cardNumber,
  cardHolderName,
  expiry,
  cvv,
  color,
}) => (
  <View
    className="h-48 w-full rounded-xl p-4 mb-4"
    style={{ backgroundColor: color || "#1F4B8E" }}
  >
    <View className="flex-row justify-between mb-6">
      <View>
        <Text className="text-white opacity-70 text-xs">Bank Name</Text>
        <Text className="text-white font-bold text-base">
          {bankName || "BANK NAME"}
        </Text>
      </View>
      <View>
        <Text className="text-white opacity-70 text-xs">Network</Text>
        <Text className="text-white font-bold">{network || "VISA"}</Text>
      </View>
    </View>

    {/* Spread card number evenly */}
    <View className="flex-row justify-between mb-6">
      {cardNumber
        ? cardNumber.split(" ").map((segment, index) => (
            <Text
              key={index}
              className="text-white text-lg font-mono"
              style={{ flex: 1, textAlign: "center" }}
            >
              {segment}
            </Text>
          ))
        : Array(4)
            .fill("••••")
            .map((segment, index) => (
              <Text
                key={index}
                className="text-white text-lg font-mono"
                style={{ flex: 1, textAlign: "center" }}
              >
                {segment}
              </Text>
            ))}
    </View>

    <View className="flex-row justify-between items-end">
      <View>
        <Text className="text-white opacity-70 text-xs">CARD HOLDER</Text>
        <Text className="text-white">{cardHolderName || "YOUR NAME"}</Text>
      </View>
      <View>
        <Text className="text-white opacity-70 text-xs">EXPIRES</Text>
        <Text className="text-white">{expiry || "MM/YY"}</Text>
      </View>
      <View>
        <Text className="text-white opacity-70 text-xs">CVV</Text>
        <Text className="text-white">{cvv || "•••"}</Text>
      </View>
    </View>
  </View>
);
