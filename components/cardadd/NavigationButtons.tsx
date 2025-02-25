import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  currentStep: number;
  totalSteps: number;
  handlePreviousStep: () => void;
  handleNextStep: () => void;
};

export function NavigationButtons({
  currentStep,
  totalSteps,
  handlePreviousStep,
  handleNextStep,
}: Props) {
  return (
    <View className="flex-row justify-between px-4 mt-6 mb-8">
      <TouchableOpacity
        className={`p-4 rounded-lg ${
          currentStep === 0 ? "bg-gray-300" : "bg-blue-600"
        }`}
        onPress={handlePreviousStep}
        disabled={currentStep === 0}
      >
        <Text
          className={`text-center font-semibold ${
            currentStep === 0 ? "text-gray-500" : "text-white"
          }`}
        >
          Back
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="bg-blue-600 p-4 rounded-lg"
        onPress={handleNextStep}
      >
        <Text className="text-white text-center font-semibold">
          {currentStep === totalSteps - 1 ? "Finish" : "Next"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
