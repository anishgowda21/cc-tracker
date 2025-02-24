import { Card } from "@/types";
import { saveCard, saveCardSecureDetails } from "@/utils/storage";
import { router } from "expo-router";
import { useState } from "react";
import {
  Text,
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";

const cardColors = [
  "#1F4B8E", // Navy blue
  "#B8860B", // Gold
  "#2B7A78", // Teal
  "#654321", // Brown
  "#4B0082", // Indigo
];

export default function AddCardScreen() {
  const [formData, setFormData] = useState({
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
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);

  // Formatting Functions
  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, "").slice(0, 16); // Only digits, max 16
    const parts = cleaned.match(/.{1,4}/g) || [];
    return parts.join(" ");
  };

  const formatExpiry = (text: string) => {
    const cleaned = text.replace(/\D/g, "").slice(0, 4); // MMYY max
    if (cleaned.length <= 2) return cleaned;
    const month = cleaned.slice(0, 2);
    const year = cleaned.slice(2);
    return `${month}${year ? "/" + year : ""}`;
  };

  // Validation Functions
  const validateForm = () => {
    const errors: string[] = [];

    // Required fields
    if (!formData.bankName.trim()) errors.push("Bank Name is required");
    if (!formData.cardName.trim()) errors.push("Card Name is required");
    if (!formData.network.trim()) errors.push("Card Network is required");
    if (!formData.cardNumber.trim()) errors.push("Card Number is required");
    if (!formData.expiry.trim()) errors.push("Expiry Date is required");
    if (!formData.cvv.trim()) errors.push("CVV is required");
    if (!formData.cardHolderName.trim())
      errors.push("Card Holder Name is required");
    if (!formData.billDate.trim()) errors.push("Bill Date is required");
    if (!formData.dueDate.trim()) errors.push("Due Date is required");
    if (!formData.limit.trim()) errors.push("Credit Limit is required");

    // Card Number: 16 digits
    const cardNumberDigits = formData.cardNumber.replace(/\s/g, "");
    if (cardNumberDigits.length !== 16)
      errors.push("Card Number must be 16 digits");

    // Expiry: Valid MM/YY
    const [month, year] = formData.expiry.split("/");
    if (!month || !year || parseInt(month) > 12 || parseInt(month) < 1) {
      errors.push("Expiry must be a valid MM/YY date");
    } else {
      const expiryDate = new Date(parseInt(`20${year}`), parseInt(month) - 1);
      if (expiryDate < new Date()) errors.push("Card has expired");
    }

    // CVV: 3-4 digits
    if (!/^\d{3,4}$/.test(formData.cvv))
      errors.push("CVV must be 3 or 4 digits");

    // Bill/Due Dates: 1-31
    const billDate = parseInt(formData.billDate);
    const dueDate = parseInt(formData.dueDate);
    if (isNaN(billDate) || billDate < 1 || billDate > 31) {
      errors.push("Bill Date must be between 1 and 31");
    }
    if (isNaN(dueDate) || dueDate < 1 || dueDate > 31) {
      errors.push("Due Date must be between 1 and 31");
    }

    // Credit Limit: Positive number
    const limit = parseFloat(formData.limit);
    if (isNaN(limit) || limit <= 0)
      errors.push("Credit Limit must be a positive number");

    return errors;
  };

  const validateAndSave = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      Alert.alert("Validation Errors", errors.join("\n"));
      return;
    }

    const newCard: Card = {
      id: Date.now().toString(),
      bankName: formData.bankName.trim(),
      cardName: formData.cardName.trim(),
      network: formData.network.trim(),
      limit: parseFloat(formData.limit),
      billDate: parseInt(formData.billDate),
      dueDate: parseInt(formData.dueDate),
      color: formData.color,
    };

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

      Alert.alert("Success", "Card added successfully!");
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to save card. Please try again.");
      console.error(error);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-100 p-4">
      <Text className="text-2xl font-bold text-gray-800 mb-6">
        Add New Card
      </Text>
      <View className="space-y-4">
        {/* Bank Name */}
        <View>
          <Text className="text-gray-700 font-medium mb-1">Bank Name</Text>
          <TextInput
            placeholder="e.g., Chase"
            value={formData.bankName}
            onChangeText={(text) =>
              setFormData({ ...formData, bankName: text })
            }
            className="border border-gray-300 bg-white p-3 rounded-lg"
          />
        </View>

        {/* Card Name */}
        <View>
          <Text className="text-gray-700 font-medium mb-1">Card Name</Text>
          <TextInput
            placeholder="e.g., Platinum Rewards"
            value={formData.cardName}
            onChangeText={(text) =>
              setFormData({ ...formData, cardName: text })
            }
            className="border border-gray-300 bg-white p-3 rounded-lg"
          />
        </View>

        {/* Network */}
        <View>
          <Text className="text-gray-700 font-medium mb-1">Card Network</Text>
          <TextInput
            placeholder="e.g., Visa, Mastercard"
            value={formData.network}
            onChangeText={(text) => setFormData({ ...formData, network: text })}
            className="border border-gray-300 bg-white p-3 rounded-lg"
          />
        </View>

        {/* Card Number */}
        <View>
          <Text className="text-gray-700 font-medium mb-1">Card Number</Text>
          <TextInput
            placeholder="1234 5678 9012 3456"
            value={formData.cardNumber}
            onChangeText={(text) =>
              setFormData({ ...formData, cardNumber: formatCardNumber(text) })
            }
            keyboardType="numeric"
            maxLength={19}
            className="border border-gray-300 bg-white p-3 rounded-lg"
          />
        </View>

        {/* Expiry */}
        <View>
          <Text className="text-gray-700 font-medium mb-1">Expiry Date</Text>
          <TextInput
            placeholder="MM/YY"
            value={formData.expiry}
            onChangeText={(text) =>
              setFormData({ ...formData, expiry: formatExpiry(text) })
            }
            keyboardType="numeric"
            maxLength={5}
            className="border border-gray-300 bg-white p-3 rounded-lg"
          />
        </View>

        {/* CVV */}
        <View>
          <Text className="text-gray-700 font-medium mb-1">CVV</Text>
          <TextInput
            placeholder="123"
            value={formData.cvv}
            onChangeText={(text) => setFormData({ ...formData, cvv: text })}
            keyboardType="numeric"
            maxLength={4}
            className="border border-gray-300 bg-white p-3 rounded-lg"
          />
        </View>

        {/* Card Holder Name */}
        <View>
          <Text className="text-gray-700 font-medium mb-1">
            Card Holder Name
          </Text>
          <TextInput
            placeholder="e.g., John Doe"
            value={formData.cardHolderName}
            onChangeText={(text) =>
              setFormData({ ...formData, cardHolderName: text })
            }
            className="border border-gray-300 bg-white p-3 rounded-lg"
          />
        </View>

        {/* Bill Date */}
        <View>
          <Text className="text-gray-700 font-medium mb-1">Bill Date</Text>
          <TextInput
            placeholder="e.g., 15"
            value={formData.billDate}
            onChangeText={(text) =>
              setFormData({ ...formData, billDate: text })
            }
            keyboardType="numeric"
            maxLength={2}
            className="border border-gray-300 bg-white p-3 rounded-lg"
          />
        </View>

        {/* Due Date */}
        <View>
          <Text className="text-gray-700 font-medium mb-1">Due Date</Text>
          <TextInput
            placeholder="e.g., 25"
            value={formData.dueDate}
            onChangeText={(text) => setFormData({ ...formData, dueDate: text })}
            keyboardType="numeric"
            maxLength={2}
            className="border border-gray-300 bg-white p-3 rounded-lg"
          />
        </View>

        {/* Credit Limit */}
        <View>
          <Text className="text-gray-700 font-medium mb-1">Credit Limit</Text>
          <TextInput
            placeholder="e.g., 5000"
            value={formData.limit}
            onChangeText={(text) => setFormData({ ...formData, limit: text })}
            keyboardType="numeric"
            className="border border-gray-300 bg-white p-3 rounded-lg"
          />
        </View>

        {/* Color Picker */}
        <View>
          <Text className="text-gray-700 font-medium mb-2">Card Color</Text>
          <View className="flex-row space-x-3">
            {cardColors.map((color, index) => (
              <TouchableOpacity
                key={color}
                onPress={() => {
                  setSelectedColorIndex(index);
                  setFormData({ ...formData, color });
                }}
                className={`w-12 h-12 rounded-full ${
                  selectedColorIndex === index ? "border-2 border-gray-800" : ""
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          className="bg-blue-600 p-4 rounded-lg mt-6"
          onPress={validateAndSave}
        >
          <Text className="text-white text-center font-semibold text-lg">
            Add Card
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
