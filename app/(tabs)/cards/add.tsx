import { Card, BillCycle, FormData, ErrorState } from "@/types";
import {
  saveCard,
  saveCardSecureDetails,
  createBillCycle,
} from "@/utils/storage";
import { router } from "expo-router";
import { useState, useRef } from "react";
import RNPickerSelect from "react-native-picker-select";
import {
  Text,
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { ConfirmationModal } from "@/components/common/model";
import {
  checkDueDateSanity,
  formatExpiry,
  getCurrentCycleDate,
  getDueDate,
} from "@/utils/helpers/dateHelpers";
import { FormInput } from "@/components/cardadd/FormInput";
import {
  banks,
  cardColors,
  colorNames,
  networks,
  pickerSelectStyles,
} from "@/utils/consts";
import { FullCardPreview } from "@/components/common/FullCardPreview";
import { Section } from "@/components/cardadd/Section";
import { formatCardNumber } from "@/utils/helpers/formHelpers";
import { AntDesign } from "@expo/vector-icons";

export default function AddCardScreen() {
  // Form input refs for keyboard navigation
  const bankPickerRef = useRef(null);
  const networkPickerRef = useRef(null);
  const bankNameRef = useRef<TextInput>(null);
  const cardNameRef = useRef<TextInput>(null);
  const networkRef = useRef<TextInput>(null);
  const cardNumberRef = useRef<TextInput>(null);
  const expiryRef = useRef<TextInput>(null);
  const cvvRef = useRef<TextInput>(null);
  const cardHolderNameRef = useRef<TextInput>(null);
  const billDateRef = useRef<TextInput>(null);
  const dueDateRef = useRef<TextInput>(null);
  const limitRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const customBankRef = useRef<TextInput>(null);
  const customNetworkRef = useRef<TextInput>(null);

  // Form state
  const [formData, setFormData] = useState<FormData>({
    bankName: "",
    cardName: "",
    network: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    cardHolderName: "",
    billDate: "",
    dueDate: "",
    limit: "",
    color: cardColors[0],
  });

  // UI state
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);
  const [showCustomBank, setShowCustomBank] = useState<boolean>(false);
  const [showCustomNetwork, setShowCustomNetwork] = useState<boolean>(false);
  const [customBankValue, setCustomBankValue] = useState<string>("");
  const [customNetworkValue, setCustomNetworkValue] = useState<string>("");
  const [selectedColorIndex, setSelectedColorIndex] = useState<number>(0);
  const [showWarningModal, setShowWarningModal] = useState<boolean>(false);
  const [warningMessage, setWarningMessage] = useState<string>("");
  const [errors, setErrors] = useState<ErrorState>({});

  const scrollToInput = (inputRef: React.RefObject<TextInput>) => {
    if (inputRef.current && scrollViewRef.current) {
      inputRef.current.measureLayout(
        scrollViewRef.current as any,
        (x, y) => {
          scrollViewRef.current?.scrollTo({ y: y - 100, animated: true });
        },
        () => console.log("Failed to measure layout")
      );
    }
  };

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
      setCustomNetworkValue(""); // Reset custom input
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

  const validateForm = (): boolean => {
    const newErrors: ErrorState = {};
    let isValid = true;

    if (!formData.bankName.trim()) {
      newErrors.bankName = "Bank name is required";
      isValid = false;
    }

    if (!formData.cardName.trim()) {
      newErrors.cardName = "Card name is required";
      isValid = false;
    }

    if (!formData.network.trim()) {
      newErrors.network = "Card network is required";
      isValid = false;
    }

    const cardNumberDigits = formData.cardNumber.replace(/\s/g, "");
    if (!cardNumberDigits) {
      newErrors.cardNumber = "Card number is required";
      isValid = false;
    } else if (cardNumberDigits.length < 13 || cardNumberDigits.length > 16) {
      newErrors.cardNumber = "Card number must be between 13 and 16 digits";
      isValid = false;
    }

    // Expiry validation
    if (!formData.expiry.trim()) {
      newErrors.expiry = "Expiry date is required";
      isValid = false;
    } else {
      const [month, year] = formData.expiry.split("/");
      if (!month || !year || parseInt(month) > 12 || parseInt(month) < 1) {
        newErrors.expiry = "Invalid expiry date";
        isValid = false;
      } else {
        const expiryDate = new Date(parseInt(`20${year}`), parseInt(month) - 1);
        if (expiryDate < new Date()) {
          newErrors.expiry = "Card has expired";
          isValid = false;
        }
      }
    }

    // CVV validation
    if (!formData.cvv.trim()) {
      newErrors.cvv = "CVV is required";
      isValid = false;
    } else if (!/^\d{3,4}$/.test(formData.cvv)) {
      newErrors.cvv = "CVV must be 3 or 4 digits";
      isValid = false;
    }

    // Cardholder name validation
    if (!formData.cardHolderName.trim()) {
      newErrors.cardHolderName = "Cardholder name is required";
      isValid = false;
    }

    // Bill date validation
    const billDate = parseInt(formData.billDate);
    if (!formData.billDate.trim()) {
      newErrors.billDate = "Bill date is required";
      isValid = false;
    } else if (isNaN(billDate) || billDate < 1 || billDate > 31) {
      newErrors.billDate = "Bill date must be between 1 and 31";
      isValid = false;
    }

    // Due date validation
    const dueDate = parseInt(formData.dueDate);
    if (!formData.dueDate.trim()) {
      newErrors.dueDate = "Due date is required";
      isValid = false;
    } else if (isNaN(dueDate) || dueDate < 1 || dueDate > 31) {
      newErrors.dueDate = "Due date must be between 1 and 31";
      isValid = false;
    }

    // Credit limit validation
    const limit = parseFloat(formData.limit);
    if (!formData.limit.trim()) {
      newErrors.limit = "Credit limit is required";
      isValid = false;
    } else if (isNaN(limit) || limit <= 0) {
      newErrors.limit = "Credit limit must be a positive number";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Form submission handler
  const validateAndSave = async (): Promise<void> => {
    if (!validateForm()) {
      Alert.alert(
        "Validation Error",
        "Please fix the errors in the form before submitting."
      );
      return;
    }

    const newCard: Card = {
      id: Date.now().toString(),
      lastDigits: formData.cardNumber.replace(/\s/g, "").slice(-4),
      bankName: formData.bankName.trim(),
      cardName: formData.cardName.trim(),
      network: formData.network.trim(),
      limit: parseFloat(formData.limit),
      billDate: parseInt(formData.billDate),
      dueDate: parseInt(formData.dueDate),
      color: formData.color,
    };

    const warning = checkDueDateSanity(newCard.billDate, newCard.dueDate);
    if (warning) {
      setWarningMessage(warning);
      setShowWarningModal(true);
      return;
    }

    await saveCardAndCycle(newCard);
  };

  // Save card and create billing cycle
  const saveCardAndCycle = async (newCard: Card): Promise<void> => {
    try {
      const cardSaved = await saveCard(newCard);
      if (!cardSaved) throw new Error("Failed to save card");

      const secureDetailsSaved = await saveCardSecureDetails(newCard.id, {
        cardNumber: formData.cardNumber.replace(/\s/g, ""),
        expiryDate: formData.expiry,
        cvv: formData.cvv,
        cardHolderName: formData.cardHolderName.trim(),
      });
      if (!secureDetailsSaved) throw new Error("Failed to save secure details");

      const currentCycleDate = getCurrentCycleDate(newCard.billDate);
      const dueDate = getDueDate(
        newCard.billDate,
        newCard.dueDate,
        currentCycleDate
      );

      const newCycle: BillCycle = {
        id: `cycle_${currentCycleDate}_${newCard.id}`,
        cardId: newCard.id,
        cycleDate: currentCycleDate,
        totalBill: 0,
        remainingAmount: 0,
        status: "not updated" as
          | "not updated"
          | "unpaid"
          | "partial"
          | "paid"
          | "overdue",
        payments: [],
        dueDate,
      };
      const cycleSaved = await createBillCycle(newCycle);
      if (!cycleSaved) throw new Error("Failed to create bill cycle");

      Alert.alert("Success", "Card added successfully!", [
        { text: "OK", onPress: () => router.replace(`/cards/${newCard.id}`) },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to save card. Please try again.");
      console.error(error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 50}
    >
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 bg-gray-100"
        keyboardShouldPersistTaps="handled"
      >
        <View className="p-4">
          <Text className="text-2xl font-bold text-gray-800 mb-6">
            Add New Card
          </Text>

          {/* Card Preview */}
          <View className="mb-4">
            <FullCardPreview
              bankName={formData.bankName}
              cardName={formData.cardName}
              network={formData.network}
              cardNumber={formData.cardNumber}
              cardHolderName={formData.cardHolderName}
              expiry={formData.expiry}
              cvv={formData.cvv}
              color={formData.color}
            />
          </View>

          {/* Card Information Section */}
          <Section title="Card Information">
            {/* Bank Name Dropdown */}
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
                Icon={() => <AntDesign name="down" size={24} color="gray" />}
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
                      setSelectedBank(null); // Reset picker to placeholder
                    }}
                  >
                    <Text className="text-white text-center font-semibold">
                      Cancel
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
              {selectedBank &&
                !banks.some((bank) => bank.value === selectedBank) && (
                  <Text className="text-gray-600 text-xs mt-1">
                    Custom Bank: {selectedBank}
                  </Text>
                )}
              {errors.bankName && (
                <Text className="text-red-500 text-xs mt-1">
                  {errors.bankName}
                </Text>
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

            {/* Network Type Dropdown */}
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-1">
                Card Network
              </Text>
              <RNPickerSelect
                onValueChange={handleNetworkSelect}
                items={networks}
                value={selectedNetwork}
                placeholder={{}}
                style={pickerSelectStyles}
                ref={networkPickerRef}
                useNativeAndroidPickerStyle={false} // Important for Android styling
                onOpen={() => scrollToInput(networkRef)}
                Icon={() => <AntDesign name="down" size={24} color="gray" />}
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
                      setSelectedNetwork(null); // Reset picker to placeholder
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
                <Text className="text-red-500 text-xs mt-1">
                  {errors.network}
                </Text>
              )}
            </View>
          </Section>

          {/* Card Details Section */}
          <Section title="Card Details">
            <FormInput
              label="Card Number"
              value={formData.cardNumber}
              onChangeText={(text: string) =>
                setFormData({ ...formData, cardNumber: formatCardNumber(text) })
              }
              placeholder="1234 5678 9012 3456"
              keyboardType="numeric"
              maxLength={19}
              error={errors.cardNumber}
              inputRef={cardNumberRef}
              onSubmitEditing={() => expiryRef.current?.focus()}
              onFocus={() => scrollToInput(cardNumberRef)}
            />

            <View className="flex-row space-x-4">
              <View className="flex-1">
                <FormInput
                  label="Expiry Date"
                  value={formData.expiry}
                  onChangeText={(text: string) =>
                    setFormData({ ...formData, expiry: formatExpiry(text) })
                  }
                  placeholder="MM/YY"
                  keyboardType="numeric"
                  maxLength={5}
                  error={errors.expiry}
                  inputRef={expiryRef}
                  onSubmitEditing={() => cvvRef.current?.focus()}
                  onFocus={() => scrollToInput(expiryRef)}
                />
              </View>

              <View className="flex-1">
                <FormInput
                  label="CVV"
                  value={formData.cvv}
                  onChangeText={(text: string) =>
                    setFormData({ ...formData, cvv: text })
                  }
                  placeholder="123"
                  keyboardType="numeric"
                  maxLength={4}
                  error={errors.cvv}
                  inputRef={cvvRef}
                  onFocus={() => scrollToInput(cvvRef)}
                  onSubmitEditing={() => cardHolderNameRef.current?.focus()}
                />
              </View>
            </View>

            <FormInput
              label="Card Holder Name"
              value={formData.cardHolderName}
              onChangeText={(text: string) =>
                setFormData({ ...formData, cardHolderName: text })
              }
              placeholder="e.g., John Doe"
              error={errors.cardHolderName}
              inputRef={cardHolderNameRef}
              onSubmitEditing={() => billDateRef.current?.focus()}
              onFocus={() => scrollToInput(cardHolderNameRef)}
            />
          </Section>

          {/* Billing Information Section */}
          <Section title="Billing Information">
            <View className="flex-row space-x-4">
              <View className="flex-1">
                <FormInput
                  label="Bill Date"
                  value={formData.billDate}
                  onChangeText={(text: string) =>
                    setFormData({ ...formData, billDate: text })
                  }
                  placeholder="e.g., 15"
                  keyboardType="numeric"
                  maxLength={2}
                  error={errors.billDate}
                  inputRef={billDateRef}
                  onSubmitEditing={() => dueDateRef.current?.focus()}
                  onFocus={() => scrollToInput(billDateRef)}
                />
              </View>

              <View className="flex-1">
                <FormInput
                  label="Due Date"
                  value={formData.dueDate}
                  onChangeText={(text: string) =>
                    setFormData({ ...formData, dueDate: text })
                  }
                  placeholder="e.g., 25"
                  keyboardType="numeric"
                  maxLength={2}
                  error={errors.dueDate}
                  inputRef={dueDateRef}
                  onSubmitEditing={() => limitRef.current?.focus()}
                  onFocus={() => scrollToInput(dueDateRef)}
                />
              </View>
            </View>

            <FormInput
              label="Credit Limit"
              value={formData.limit}
              onChangeText={(text: string) =>
                setFormData({ ...formData, limit: text })
              }
              placeholder="e.g., 5000"
              keyboardType="numeric"
              error={errors.limit}
              inputRef={limitRef}
              onFocus={() => scrollToInput(limitRef)}
            />
          </Section>

          {/* Card Appearance Section */}
          <Section title="Card Appearance">
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
                      selectedColorIndex === index
                        ? "border-2 border-gray-800"
                        : ""
                    }`}
                    style={{ backgroundColor: color }}
                  />
                  <Text className="text-xs text-center">
                    {colorNames[index]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Section>

          {/* Submit Button */}
          <TouchableOpacity
            className="bg-blue-600 p-4 rounded-lg mt-6 mb-8"
            onPress={validateAndSave}
          >
            <Text className="text-white text-center font-semibold text-lg">
              Add Card
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Warning Confirmation Modal */}
      <ConfirmationModal
        visible={showWarningModal}
        onClose={() => setShowWarningModal(false)}
        onConfirm={() => {
          setShowWarningModal(false);
          saveCardAndCycle({
            id: Date.now().toString(),
            lastDigits: formData.cardNumber.replace(/\s/g, "").slice(-4),
            bankName: formData.bankName.trim(),
            cardName: formData.cardName.trim(),
            network: formData.network.trim(),
            limit: parseFloat(formData.limit),
            billDate: parseInt(formData.billDate),
            dueDate: parseInt(formData.dueDate),
            color: formData.color,
          });
        }}
        title="Billing Dates Alert"
        description={warningMessage}
        color="orange"
      />
    </KeyboardAvoidingView>
  );
}
