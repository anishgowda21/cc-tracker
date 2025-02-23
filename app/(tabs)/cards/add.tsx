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

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s+/g, "").replace(/\D/g, "");
    const parts = [];
    for (let i = 0; i < cleaned.length && i < 16; i += 4) {
      parts.push(cleaned.substr(i, 4));
    }
    return parts.join(" ");
  };

  const formatExpiry = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      const month = parseInt(cleaned.substring(0, 2));
      if (month > 12) return formData.expiry;

      if (cleaned.length === 2) return `${cleaned}/`;
      if (cleaned.length > 2) {
        return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
      }
    }
    return cleaned;
  };

  const validateAndSave = () => {
    // Required fields
    if (!formData.bankName || !formData.cardName || !formData.network) {
      alert("Please fill all required fields");
      return;
    }

    // Validate dates
    const billDate = parseInt(formData.billDate);
    const dueDate = parseInt(formData.dueDate);
    if (billDate < 1 || billDate > 31 || dueDate < 1 || dueDate > 31) {
      alert("Please enter valid dates (1-31)");
      return;
    }

    // Create card object
    const newCard: Card = {
      id: Date.now().toString(), // Simple ID generation
      bankName: formData.bankName,
      cardName: formData.cardName,
      network: formData.network,
      limit: parseFloat(formData.limit),
      billDate: billDate,
      dueDate: dueDate,
      currentBalance: 0,
      color: formData.color,
    };

    // Save card
    saveCard(newCard).then((success) => {
      if (success) {
        // Save secure details separately
        saveCardSecureDetails(newCard.id, {
          cardNumber: formData.cardNumber.replace(/\s+/g, ""),
          expiryDate: formData.expiry,
          cvv: formData.cvv,
          cardHolderName: formData.cardHolderName,
        }).then(() => {
          router.back();
        });
      } else {
        alert("Error saving card");
      }
    });
  };

  return (
    <ScrollView className="flex-1 p-4">
      <Text className="text-xl font-bold mb-4">Add New Card</Text>
      <View className="space-y-4">
        <Text className="text-gray-700">Bank Name</Text>
        <TextInput
          placeholder="Bank Name"
          value={formData.bankName}
          onChangeText={(text) => setFormData({ ...formData, bankName: text })}
          className="border p-2 rounded"
        />

        <Text className="text-gray-700">Card Name</Text>
        <TextInput
          placeholder="Card Name"
          value={formData.cardName}
          onChangeText={(text) => setFormData({ ...formData, cardName: text })}
          className="border p-2 rounded"
        />

        <Text className="text-gray-700">Card Network</Text>
        <TextInput
          placeholder="Card Network (Visa/Mastercard/Amex)"
          value={formData.network}
          onChangeText={(text) => setFormData({ ...formData, network: text })}
          className="border p-2 rounded"
        />

        <Text className="text-gray-700">Card Number</Text>
        <TextInput
          placeholder="Card Number"
          value={formData.cardNumber}
          onChangeText={(text) => {
            const formatted = formatCardNumber(text);
            setFormData({ ...formData, cardNumber: formatted });
          }}
          keyboardType="numeric"
          maxLength={19}
          className="border p-2 rounded"
        />

        <Text className="text-gray-700">Card Expiry</Text>
        <TextInput
          placeholder="Expiry (MM/YY)"
          value={formData.expiry}
          onChangeText={(text) => {
            const formatted = formatExpiry(text);
            setFormData({ ...formData, expiry: formatted });
          }}
          keyboardType="numeric"
          maxLength={5}
          className="border p-2 rounded"
        />

        <Text className="text-gray-700">CVV</Text>
        <TextInput
          placeholder="CVV"
          value={formData.cvv}
          onChangeText={(text) => setFormData({ ...formData, cvv: text })}
          keyboardType="numeric"
          maxLength={4}
          className="border p-2 rounded"
        />

        <Text className="text-gray-700">Card Holder Name</Text>
        <TextInput
          placeholder="Card Holder Name"
          value={formData.cardHolderName}
          onChangeText={(text) =>
            setFormData({ ...formData, cardHolderName: text })
          }
          className="border p-2 rounded"
        />

        <Text className="text-gray-700">Bill Date</Text>
        <TextInput
          placeholder="Bill Date (1-31)"
          value={formData.billDate}
          onChangeText={(text) => setFormData({ ...formData, billDate: text })}
          keyboardType="numeric"
          maxLength={2}
          className="border p-2 rounded"
        />

        <Text className="text-gray-700">Due Date</Text>
        <TextInput
          placeholder="Due Date (1-31)"
          value={formData.dueDate}
          onChangeText={(text) => setFormData({ ...formData, dueDate: text })}
          keyboardType="numeric"
          maxLength={2}
          className="border p-2 rounded"
        />

        <Text className="text-gray-700">Credit Limit</Text>
        <TextInput
          placeholder="Credit Limit"
          value={formData.limit}
          onChangeText={(text) => setFormData({ ...formData, limit: text })}
          keyboardType="numeric"
          className="border p-2 rounded"
        />

        <Text className="text-gray-700">Select Card Color</Text>
        <View className="flex-row space-x-2">
          {cardColors.map((color, index) => (
            <TouchableOpacity
              key={color}
              onPress={() => {
                setSelectedColorIndex(index);
                setFormData({ ...formData, color });
              }}
              className={`w-10 h-10 rounded-full ${
                selectedColorIndex === index ? "border-2 border-black" : ""
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </View>

        <TouchableOpacity
          className="bg-blue-500 p-3 rounded"
          onPress={() => {
            // Add validation and saving logic here
            console.log(formData);
            validateAndSave();
            // router.back();
          }}
        >
          <Text className="text-white text-center">Add Card</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
