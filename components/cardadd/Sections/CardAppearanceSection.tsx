import { Text, View, TouchableOpacity } from "react-native";
import { cardColors, colorNames } from "@/utils/consts";
import { FormData } from "@/types";

type Props = {
  formData: FormData;
  setFormData: (data: FormData) => void;
  selectedColorIndex: number;
  setSelectedColorIndex: (index: number) => void;
};

export default function CardAppearanceSection({
  formData,
  setFormData,
  selectedColorIndex,
  setSelectedColorIndex,
}: Props) {
  return (
    <View>
      <Text className="text-gray-700 font-medium mb-2">Card Color</Text>
      <View className="flex-row flex-wrap">
        {cardColors.map((color, index) => (
          <TouchableOpacity
            key={color}
            onPress={() => {
              setSelectedColorIndex(index);
              setFormData({ ...formData, color });
            }}
            className="mr-4 mb-2 items-center"
          >
            <View
              className={`w-12 h-12 rounded-full mb-1 ${
                selectedColorIndex === index ? "border-2 border-gray-800" : ""
              }`}
              style={{ backgroundColor: color }}
            />
            <Text className="text-xs text-center">{colorNames[index]}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
