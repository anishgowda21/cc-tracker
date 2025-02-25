import { ErrorState, FormData } from "@/types";
import { banks, networks, pickerSelectStyles } from "@/utils/consts";
import Feather from "@expo/vector-icons/Feather";
import { useRef } from "react";
import { TextInput, View, Text, TouchableOpacity } from "react-native";
import RNPickerSelect from "react-native-picker-select";
import { FormInput } from "../FormInput";

type Props = {
  formData: FormData;
  setFormData: (data: FormData) => void;
  selectedBank: string | null;
  setSelectedBank: (value: string | null) => void;
  selectedNetwork: string | null;
  setSelectedNetwork: (value: string | null) => void;
  showCustomBank: boolean;
  setShowCustomBank: (value: boolean) => void;
  showCustomNetwork: boolean;
  setShowCustomNetwork: (value: boolean) => void;
  customBankValue: string;
  setCustomBankValue: (value: string) => void;
  customNetworkValue: string;
  setCustomNetworkValue: (value: string) => void;
  errors: ErrorState;
  scrollToInput: (ref: React.RefObject<TextInput>) => void;
};

export default function CardInformationSection({
  formData,
  setFormData,
  selectedBank,
  setSelectedBank,
  selectedNetwork,
  setSelectedNetwork,
  showCustomBank,
  setShowCustomBank,
  showCustomNetwork,
  setShowCustomNetwork,
  customBankValue,
  setCustomBankValue,
  customNetworkValue,
  setCustomNetworkValue,
  errors,
  scrollToInput,
}: Props) {
  const bankPickerRef = useRef(null);
  const networkPickerRef = useRef(null);
  const bankNameRef = useRef<TextInput>(null);
  const cardNameRef = useRef<TextInput>(null);
  const networkRef = useRef<TextInput>(null);
  const customBankRef = useRef<TextInput>(null);
  const customNetworkRef = useRef<TextInput>(null);

  const handleBankSelect = (value: string) => {
    if (value === "other") {
      setShowCustomBank(true);
      setSelectedBank(null);
      setFormData({ ...formData, bankName: "" });
      setCustomBankValue("");
    } else if (value && !showCustomBank) {
      setShowCustomBank(false);
      setSelectedBank(value);
      setFormData({ ...formData, bankName: value });
      setCustomBankValue("");
    }
  };

  const handleNetworkSelect = (value: string) => {
    if (value === "other") {
      setShowCustomNetwork(true);
      setSelectedNetwork(null);
      setFormData({ ...formData, network: "" });
      setCustomNetworkValue("");
    } else if (value && !showCustomNetwork) {
      setShowCustomNetwork(false);
      setSelectedNetwork(value);
      setFormData({ ...formData, network: value });
      setCustomNetworkValue("");
    }
  };

  const handleCustomBankSubmit = () => {
    if (customBankValue.trim()) {
      const trimmedValue = customBankValue.trim();
      setFormData({ ...formData, bankName: trimmedValue });
      setSelectedBank(trimmedValue);
      setShowCustomBank(false);
      setCustomBankValue("");
    }
  };

  const handleCustomNetworkSubmit = () => {
    if (customNetworkValue.trim()) {
      setFormData({ ...formData, network: customNetworkValue.trim() });
      setSelectedNetwork(customNetworkValue.trim());
      setShowCustomNetwork(false);
      setCustomNetworkValue("");
    }
  };

  return (
    <View>
      <View className="mb-4">
        <Text className="text-gray-700 font-medium mb-1">Bank Name</Text>
        <RNPickerSelect
          onValueChange={handleBankSelect}
          items={banks}
          value={selectedBank}
          placeholder={{}}
          style={pickerSelectStyles}
          ref={bankPickerRef}
          useNativeAndroidPickerStyle={false}
          onOpen={() => scrollToInput(bankNameRef)}
          Icon={() => <Feather name="chevron-down" size={24} color="gray" />}
        />
        {showCustomBank && (
          <View className="mt-2 flex-row items-center">
            <TextInput
              ref={customBankRef}
              value={customBankValue}
              onChangeText={setCustomBankValue}
              placeholder="Enter bank name"
              className="flex-1 border border-gray-300 bg-white rounded-lg p-3"
              onFocus={() => scrollToInput(customBankRef)}
              onSubmitEditing={handleCustomBankSubmit}
              autoFocus={true}
            />
            <TouchableOpacity
              className="bg-blue-600 p-3 rounded-lg ml-2"
              onPress={handleCustomBankSubmit}
            >
              <Text className="text-white text-center font-semibold">
                Submit
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-gray-400 p-3 rounded-lg ml-2"
              onPress={() => {
                setShowCustomBank(false);
                setCustomBankValue("");
                setSelectedBank(null);
              }}
            >
              <Text className="text-white text-center font-semibold">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        )}
        {selectedBank && !banks.some((bank) => bank.value === selectedBank) && (
          <Text className="text-gray-600 text-xs mt-1">
            Custom Bank: {selectedBank}
          </Text>
        )}
        {errors.bankName && (
          <Text className="text-red-500 text-xs mt-1">{errors.bankName}</Text>
        )}
      </View>

      <FormInput
        label="Card Name"
        value={formData.cardName}
        onChangeText={(text: string) =>
          setFormData({ ...formData, cardName: text })
        }
        placeholder="e.g., Platinum Rewards"
        error={errors.cardName}
        inputRef={cardNameRef}
        onSubmitEditing={() => networkRef.current?.focus()}
        onFocus={() => scrollToInput(cardNameRef)}
      />

      <View className="mb-4">
        <Text className="text-gray-700 font-medium mb-1">Card Network</Text>
        <RNPickerSelect
          onValueChange={handleNetworkSelect}
          items={networks}
          value={selectedNetwork}
          placeholder={{}}
          style={pickerSelectStyles}
          ref={networkPickerRef}
          useNativeAndroidPickerStyle={false}
          onOpen={() => scrollToInput(networkRef)}
          Icon={() => <Feather name="chevron-down" size={24} color="gray" />}
        />
        {showCustomNetwork && (
          <View className="mt-2 flex-row items-center">
            <TextInput
              ref={customNetworkRef}
              value={customNetworkValue}
              onChangeText={setCustomNetworkValue}
              placeholder="Enter network type"
              className="flex-1 border border-gray-300 bg-white rounded-lg p-3"
              onFocus={() => scrollToInput(customNetworkRef)}
              onSubmitEditing={handleCustomNetworkSubmit}
              autoFocus={true}
            />
            <TouchableOpacity
              className="bg-blue-600 p-3 rounded-lg ml-2"
              onPress={handleCustomNetworkSubmit}
            >
              <Text className="text-white text-center font-semibold">
                Submit
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-gray-400 p-3 rounded-lg ml-2"
              onPress={() => {
                setShowCustomNetwork(false);
                setCustomNetworkValue("");
                setSelectedNetwork(null);
              }}
            >
              <Text className="text-white text-center font-semibold">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        )}
        {selectedNetwork &&
          !networks.some((net) => net.value === selectedNetwork) && (
            <Text className="text-gray-600 text-xs mt-1">
              Custom Network: {selectedNetwork}
            </Text>
          )}
        {errors.network && (
          <Text className="text-red-500 text-xs mt-1">{errors.network}</Text>
        )}
      </View>
    </View>
  );
}
