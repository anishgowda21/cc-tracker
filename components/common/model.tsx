import { Modal, View, Text, TouchableOpacity } from "react-native";

export const ConfirmationModal = ({
  visible,
  onClose,
  onConfirm,
  title,
  description,
  color = "gray",
}: {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  color?: string;
}) => (
  <Modal transparent visible={visible} animationType="fade">
    <View className="flex-1 justify-center items-center bg-black/50">
      <View className="bg-white p-6 rounded-xl w-4/5">
        <Text className="text-xl font-semibold mb-4" style={{ color }}>
          {title}
        </Text>
        <Text className="text-gray-600 mb-6">{description}</Text>
        <View className="flex-row justify-between">
          <TouchableOpacity
            className="bg-gray-300 p-3 rounded-lg flex-1 mr-2"
            onPress={onClose}
          >
            <Text className="text-center font-semibold">Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="p-3 rounded-lg flex-1 ml-2"
            style={{ backgroundColor: color }}
            onPress={onConfirm}
          >
            <Text className="text-white text-center font-semibold">
              Confirm
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);
