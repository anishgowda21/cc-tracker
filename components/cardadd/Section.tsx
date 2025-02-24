import { View, Text } from "react-native";

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

export const Section: React.FC<SectionProps> = ({ title, children }) => (
  <View className="mb-6">
    <Text className="text-lg font-bold text-gray-800 mb-3">{title}</Text>
    <View className="bg-white rounded-xl shadow-sm p-4">{children}</View>
  </View>
);
