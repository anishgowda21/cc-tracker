import { Text, View } from "react-native";

const stepTitles = [
  "Card Information",
  "Card Details",
  "Billing Information",
  "Card Appearance",
];

type Props = {
  currentStep: number;
};

export function ProgressIndicator({ currentStep }: Props) {
  return (
    <View className="flex-row justify-between px-4 mb-4">
      {stepTitles.map((title, index) => (
        <View key={title} className="items-center flex-1">
          <View
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              index <= currentStep ? "bg-blue-600" : "bg-gray-300"
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                index <= currentStep ? "text-white" : "text-gray-600"
              }`}
            >
              {index + 1}
            </Text>
          </View>
          <Text className="text-xs text-gray-600 mt-1 text-center">
            {title}
          </Text>
        </View>
      ))}
    </View>
  );
}
