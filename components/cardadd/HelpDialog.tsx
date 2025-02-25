import { Modal, Text, TouchableOpacity, View } from "react-native";

type Props = {
  showHelpDialog: boolean;
  setShowHelpDialog: (value: boolean) => void;
  helpContent: string;
};

export function HelpDialog({
  showHelpDialog,
  setShowHelpDialog,
  helpContent,
}: Props) {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showHelpDialog}
      onRequestClose={() => setShowHelpDialog(false)}
    >
      <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
        <View className="w-5/6 bg-white rounded-xl p-6">
          <Text className="text-xl font-bold text-gray-800 mb-4">Help</Text>
          <Text className="text-gray-600 mb-6">{helpContent}</Text>
          <TouchableOpacity
            className="bg-blue-600 p-4 rounded-lg"
            onPress={() => setShowHelpDialog(false)}
          >
            <Text className="text-white text-center font-semibold">Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
