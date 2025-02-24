import { KeyboardTypeOptions, TextInput, View, Text } from "react-native";

interface FormInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number;
  error?: string;
  secureTextEntry?: boolean;
  iconComponent?: React.ReactNode;
  onSubmitEditing?: () => void;
  inputRef?: React.RefObject<TextInput>;
  onFocus?: () => void;
  onBlur?: () => void;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  maxLength,
  error,
  secureTextEntry = false,
  iconComponent = null,
  onSubmitEditing,
  inputRef,
  onFocus,
  onBlur,
}) => (
  <View className="mb-4">
    <Text className="text-gray-700 font-medium mb-1">{label}</Text>
    <View
      className={`flex-row items-center border ${
        error ? "border-red-500" : "border-gray-300"
      } bg-white rounded-lg overflow-hidden`}
    >
      {iconComponent && <View className="pl-3">{iconComponent}</View>}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        maxLength={maxLength}
        secureTextEntry={secureTextEntry}
        onSubmitEditing={onSubmitEditing}
        onFocus={onFocus}
        onBlur={onBlur}
        className={`flex-1 p-3 ${iconComponent ? "pl-2" : "pl-3"}`}
      />
    </View>
    {error ? <Text className="text-red-500 text-xs mt-1">{error}</Text> : null}
  </View>
);
