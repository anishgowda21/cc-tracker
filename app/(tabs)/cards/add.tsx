import { Card, BillCycle, FormData, ErrorState } from "@/types";
import {
  saveCard,
  saveCardSecureDetails,
  createBillCycle,
} from "@/utils/storage";
import { useState, useRef } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ConfirmationModal } from "@/components/common/model";
import { FullCardPreview } from "@/components/common/FullCardPreview";
import { ProgressIndicator } from "@/components/cardadd/ProgressIndicator";
import { NavigationButtons } from "@/components/cardadd/NavigationButtons";
import { WelcomeDialog } from "@/components/cardadd/WelcomeDialog";
import { SuccessDialog } from "@/components/cardadd/SuccessDialog";
import { HelpDialog } from "@/components/cardadd/HelpDialog";
import { cardColors } from "@/utils/consts";
import {
  checkDueDateSanity,
  getCurrentCycleDate,
  getDueDate,
} from "@/utils/helpers/dateHelpers";
import { MaterialIcons } from "@expo/vector-icons";
import {
  BillingInformationSection,
  CardAppearanceSection,
  CardDetailsSection,
  CardInformationSection,
} from "@/components/cardadd/Sections";

export default function AddCardScreen() {
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const totalSteps = 4;
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
  const [showWelcomeDialog, setShowWelcomeDialog] = useState<boolean>(true);
  const [showSuccessDialog, setShowSuccessDialog] = useState<boolean>(false);
  const [newCardId, setNewCardId] = useState<string>("");
  const [showHelpDialog, setShowHelpDialog] = useState<boolean>(false);
  const [helpContent, setHelpContent] = useState<string>("");

  const stepHelpContent = [
    "Enter your bank name, card name (like 'Gold', 'Platinum', etc.), and card network (Visa, Mastercard, etc.). This helps identify your card.",
    "Enter your card number, expiry date, CVV, and cardholder name as they appear on your physical card. This information is securely stored and used to display your card preview.",
    "Enter the monthly billing date (when your statement is generated) and payment due date. The credit limit is the maximum amount you can spend on this card.",
    "Choose a color for your card visualization. This helps you quickly identify different cards in your collection.",
  ];

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

  const validateStep = (step: number): boolean => {
    const newErrors: ErrorState = {};
    let isValid = true;

    setErrors({});

    switch (step) {
      case 0:
        if (!formData.bankName.trim())
          (newErrors.bankName = "Bank name is required"), (isValid = false);
        if (!formData.cardName.trim())
          (newErrors.cardName = "Card name is required"), (isValid = false);
        if (!formData.network.trim())
          (newErrors.network = "Card network is required"), (isValid = false);
        break;
      case 1:
        const cardNumberDigits = formData.cardNumber.replace(/\s/g, "");
        if (!cardNumberDigits)
          (newErrors.cardNumber = "Card number is required"), (isValid = false);
        else if (cardNumberDigits.length < 13 || cardNumberDigits.length > 16)
          (newErrors.cardNumber =
            "Card number must be between 13 and 16 digits"),
            (isValid = false);
        if (!formData.expiry.trim())
          (newErrors.expiry = "Expiry date is required"), (isValid = false);
        else {
          const [month, year] = formData.expiry.split("/");
          if (!month || !year || parseInt(month) > 12 || parseInt(month) < 1)
            (newErrors.expiry = "Invalid expiry date"), (isValid = false);
          else {
            const expiryDate = new Date(
              parseInt(`20${year}`),
              parseInt(month) - 1
            );
            if (expiryDate < new Date())
              (newErrors.expiry = "Card has expired"), (isValid = false);
          }
        }
        if (!formData.cvv.trim())
          (newErrors.cvv = "CVV is required"), (isValid = false);
        else if (!/^\d{3,4}$/.test(formData.cvv))
          (newErrors.cvv = "CVV must be 3 or 4 digits"), (isValid = false);
        if (!formData.cardHolderName.trim())
          (newErrors.cardHolderName = "Cardholder name is required"),
            (isValid = false);
        break;
      case 2:
        const billDate = parseInt(formData.billDate);
        if (!formData.billDate.trim())
          (newErrors.billDate = "Bill date is required"), (isValid = false);
        else if (isNaN(billDate) || billDate < 1 || billDate > 31)
          (newErrors.billDate = "Bill date must be between 1 and 31"),
            (isValid = false);
        const dueDate = parseInt(formData.dueDate);
        if (!formData.dueDate.trim())
          (newErrors.dueDate = "Due date is required"), (isValid = false);
        else if (isNaN(dueDate) || dueDate < 1 || dueDate > 31)
          (newErrors.dueDate = "Due date must be between 1 and 31"),
            (isValid = false);
        const limit = parseFloat(formData.limit);
        if (!formData.limit.trim())
          (newErrors.limit = "Credit limit is required"), (isValid = false);
        else if (isNaN(limit) || limit <= 0)
          (newErrors.limit = "Credit limit must be a positive number"),
            (isValid = false);
        break;
      case 3:
        break;
    }

    setErrors(newErrors);
    return isValid;
  };

  const validateForm = (): boolean => {
    const newErrors: ErrorState = {};
    let isValid = true;

    if (!formData.bankName.trim())
      (newErrors.bankName = "Bank name is required"), (isValid = false);
    if (!formData.cardName.trim())
      (newErrors.cardName = "Card name is required"), (isValid = false);
    if (!formData.network.trim())
      (newErrors.network = "Card network is required"), (isValid = false);

    const cardNumberDigits = formData.cardNumber.replace(/\s/g, "");
    if (!cardNumberDigits)
      (newErrors.cardNumber = "Card number is required"), (isValid = false);
    else if (cardNumberDigits.length < 13 || cardNumberDigits.length > 16)
      (newErrors.cardNumber = "Card number must be between 13 and 16 digits"),
        (isValid = false);

    if (!formData.expiry.trim())
      (newErrors.expiry = "Expiry date is required"), (isValid = false);
    else {
      const [month, year] = formData.expiry.split("/");
      if (!month || !year || parseInt(month) > 12 || parseInt(month) < 1)
        (newErrors.expiry = "Invalid expiry date"), (isValid = false);
      else {
        const expiryDate = new Date(parseInt(`20${year}`), parseInt(month) - 1);
        if (expiryDate < new Date())
          (newErrors.expiry = "Card has expired"), (isValid = false);
      }
    }

    if (!formData.cvv.trim())
      (newErrors.cvv = "CVV is required"), (isValid = false);
    else if (!/^\d{3,4}$/.test(formData.cvv))
      (newErrors.cvv = "CVV must be 3 or 4 digits"), (isValid = false);

    if (!formData.cardHolderName.trim())
      (newErrors.cardHolderName = "Cardholder name is required"),
        (isValid = false);

    const billDate = parseInt(formData.billDate);
    if (!formData.billDate.trim())
      (newErrors.billDate = "Bill date is required"), (isValid = false);
    else if (isNaN(billDate) || billDate < 1 || billDate > 31)
      (newErrors.billDate = "Bill date must be between 1 and 31"),
        (isValid = false);

    const dueDate = parseInt(formData.dueDate);
    if (!formData.dueDate.trim())
      (newErrors.dueDate = "Due date is required"), (isValid = false);
    else if (isNaN(dueDate) || dueDate < 1 || dueDate > 31)
      (newErrors.dueDate = "Due date must be between 1 and 31"),
        (isValid = false);

    const limit = parseFloat(formData.limit);
    if (!formData.limit.trim())
      (newErrors.limit = "Credit limit is required"), (isValid = false);
    else if (isNaN(limit) || limit <= 0)
      (newErrors.limit = "Credit limit must be a positive number"),
        (isValid = false);

    setErrors(newErrors);
    return isValid;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    } else {
      Alert.alert(
        "Validation Error",
        "Please fix the errors before proceeding."
      );
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const showStepHelp = () => {
    setHelpContent(stepHelpContent[currentStep]);
    setShowHelpDialog(true);
  };

  const handleSubmit = (): void => {
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

    saveCardAndCycle(newCard);
  };

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

      setNewCardId(newCard.id);
      setShowSuccessDialog(true);
    } catch (error) {
      Alert.alert("Error", "Failed to save card. Please try again.");
      console.error(error);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <CardInformationSection
            formData={formData}
            setFormData={setFormData}
            selectedBank={selectedBank}
            setSelectedBank={setSelectedBank}
            selectedNetwork={selectedNetwork}
            setSelectedNetwork={setSelectedNetwork}
            showCustomBank={showCustomBank}
            setShowCustomBank={setShowCustomBank}
            showCustomNetwork={showCustomNetwork}
            setShowCustomNetwork={setShowCustomNetwork}
            customBankValue={customBankValue}
            setCustomBankValue={setCustomBankValue}
            customNetworkValue={customNetworkValue}
            setCustomNetworkValue={setCustomNetworkValue}
            errors={errors}
            scrollToInput={scrollToInput}
          />
        );
      case 1:
        return (
          <CardDetailsSection
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            scrollToInput={scrollToInput}
          />
        );
      case 2:
        return (
          <BillingInformationSection
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            scrollToInput={scrollToInput}
          />
        );
      case 3:
        return (
          <CardAppearanceSection
            formData={formData}
            setFormData={setFormData}
            selectedColorIndex={selectedColorIndex}
            setSelectedColorIndex={setSelectedColorIndex}
          />
        );
      default:
        return null;
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
          <View className="mb-6">
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

          <ProgressIndicator currentStep={currentStep} />

          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-2xl font-bold text-gray-800">
              {
                [
                  "Card Information",
                  "Card Details",
                  "Billing Information",
                  "Card Appearance",
                ][currentStep]
              }
            </Text>
            <TouchableOpacity onPress={showStepHelp}>
              <MaterialIcons name="help-outline" size={24} color="gray" />
            </TouchableOpacity>
          </View>

          {renderStepContent()}

          <NavigationButtons
            currentStep={currentStep}
            totalSteps={totalSteps}
            handlePreviousStep={handlePreviousStep}
            handleNextStep={handleNextStep}
          />
        </View>
      </ScrollView>

      <WelcomeDialog
        showWelcomeDialog={showWelcomeDialog}
        setShowWelcomeDialog={setShowWelcomeDialog}
      />
      <SuccessDialog
        showSuccessDialog={showSuccessDialog}
        setShowSuccessDialog={setShowSuccessDialog}
        newCardId={newCardId}
      />
      <HelpDialog
        showHelpDialog={showHelpDialog}
        setShowHelpDialog={setShowHelpDialog}
        helpContent={helpContent}
      />
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
