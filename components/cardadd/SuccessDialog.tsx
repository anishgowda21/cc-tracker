import { Modal, Text, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";

type Props = {
  showSuccessDialog: boolean;
  setShowSuccessDialog: (value: boolean) => void;
  newCardId: string;
};

export function SuccessDialog({
  showSuccessDialog,
  setShowSuccessDialog,
  newCardId,
}: Props) {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showSuccessDialog}
      onRequestClose={() => setShowSuccessDialog(false)}
    >
      <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
        <View className="w-5/6 bg-white rounded-xl p-6 items-center">
          <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-4">
            <MaterialIcons name="check-circle" size={40} color="#22c55e" />
          </View>
          <Text className="text-2xl font-bold text-gray-800 mt-2">
            Card Added!
          </Text>
          <Text className="text-gray-600 text-center mt-2 mb-6">
            Your card has been successfully added to your collection.
          </Text>
          <TouchableOpacity
            className="bg-blue-600 p-4 rounded-lg w-full"
            onPress={() => {
              setShowSuccessDialog(false);
              router.replace(`/cards/${newCardId}`);
            }}
          >
            <Text className="text-white text-center font-semibold">
              View Card
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
