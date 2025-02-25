import { Modal, Text, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";

type Props = {
  showWelcomeDialog: boolean;
  setShowWelcomeDialog: (value: boolean) => void;
};

export function WelcomeDialog({
  showWelcomeDialog,
  setShowWelcomeDialog,
}: Props) {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showWelcomeDialog}
      onRequestClose={() => setShowWelcomeDialog(false)}
    >
      <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
        <View className="w-5/6 bg-white rounded-xl p-6 items-center">
          <MaterialIcons name="credit-card" size={60} color="#4182f7" />
          <Text className="text-2xl font-bold text-gray-800 mt-4">
            Add a New Card
          </Text>
          <Text className="text-gray-600 text-center mt-2 mb-6">
            We'll guide you through adding your credit card step by step. Your
            information is securely stored on your device.
          </Text>
          <View className="w-full">
            <TouchableOpacity
              className="bg-blue-600 p-4 rounded-lg mb-3"
              onPress={() => setShowWelcomeDialog(false)}
            >
              <Text className="text-white text-center font-semibold">
                Let's Get Started
              </Text>
            </TouchableOpacity>
            <TouchableOpacity className="p-2" onPress={() => router.back()}>
              <Text className="text-gray-600 text-center">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
