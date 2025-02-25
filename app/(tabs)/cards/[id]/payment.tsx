import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useState, useEffect, useRef } from "react";
import { BillCycle, Card, Payment } from "@/types";
import { getCardById, getLatestBillCycle } from "@/utils/storage";
import {
  handlePayment,
  handleFullPayment,
  getPaymentHistory,
} from "@/utils/helpers/paymentHelpers";
import Feather from "@expo/vector-icons/Feather";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
  interpolate,
  withDelay,
} from "react-native-reanimated";

const PAYMENT_METHODS = [
  "UPI",
  "Net Banking",
  "Debit Card",
  "Credit Card",
  "Cash",
];

export default function PaymentScreen() {
  const { id } = useLocalSearchParams();
  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState<string | null>(null);
  const [card, setCard] = useState<Card | null>(null);
  const [latestCycle, setLatestCycle] = useState<BillCycle | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [referenceNumber, setReferenceNumber] = useState("");
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [lastPaymentAmount, setLastPaymentAmount] = useState(0);
  const [displayAmount, setDisplayAmount] = useState(
    latestCycle
      ? `₹${latestCycle.remainingAmount.toLocaleString("en-IN", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })}`
      : "₹0"
  );
  const scrollViewRef = useRef<ScrollView>(null);

  const amountValue = useSharedValue(0);
  const progressValue = useSharedValue(0);
  const bannerOpacity = useSharedValue(0);
  const bannerTranslateY = useSharedValue(50);

  useEffect(() => {
    loadData();
  }, [id]);

  useEffect(() => {
    if (!latestCycle) return;

    // Set initial value
    setDisplayAmount(
      `₹${amountValue.value.toLocaleString("en-IN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}`
    );

    // Update display amount at ~60fps during animation
    const interval = setInterval(() => {
      setDisplayAmount(
        `₹${amountValue.value.toLocaleString("en-IN", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })}`
      );
    }, 16); // Approximately 60 frames per second

    return () => clearInterval(interval); // Cleanup on unmount or dependency change
  }, [latestCycle, amountValue]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const currentCard = await getCardById(id as string);
      if (!currentCard) {
        Alert.alert("Error", "Card not found");
        router.back();
        return;
      }
      setCard(currentCard);

      const latest = await getLatestBillCycle(id as string);
      if (!latest) {
        Alert.alert("Error", "No bill cycles found for this card");
        router.back();
        return;
      }
      setLatestCycle(latest);

      const history = await getPaymentHistory(id as string);
      setPayments(
        history.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )
      );

      amountValue.value = latest.remainingAmount;
      const percentage =
        ((latest.totalBill - latest.remainingAmount) / latest.totalBill) * 100;
      progressValue.value = percentage;
    } catch (error) {
      console.error("Error loading data:", error);
      Alert.alert("Error", "Failed to load card details");
    } finally {
      setIsLoading(false);
    }
  };

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${Math.min(progressValue.value, 100)}%`,
    height: 8,
    backgroundColor: "#2563eb",
    borderRadius: 4,
  }));

  const animatedBannerStyle = useAnimatedStyle(() => ({
    opacity: bannerOpacity.value,
    transform: [{ translateY: bannerTranslateY.value }],
  }));

  const validateAmount = (value: string) => {
    if (!value) {
      setAmountError("Amount is required");
      return false;
    }
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) {
      setAmountError("Please enter a valid positive number");
      return false;
    }
    if (latestCycle && num > latestCycle.remainingAmount) {
      setAmountError(
        `Amount cannot exceed ₹${latestCycle.remainingAmount.toLocaleString(
          "en-IN"
        )}`
      );
      return false;
    }
    setAmountError(null);
    return true;
  };

  const handleAmountChange = (text: string) => {
    const numericText = text.replace(/[^0-9.]/g, "");
    setAmount(numericText);
    validateAmount(numericText);
  };

  const processPaymentFlow = async (isFullPayment: boolean) => {
    if (!latestCycle || latestCycle.remainingAmount === 0) return;

    const paymentAmount = isFullPayment
      ? latestCycle.remainingAmount
      : parseFloat(amount);
    if (!isFullPayment && !validateAmount(amount)) {
      Alert.alert(
        "Invalid Amount",
        amountError || "Please enter a valid payment amount"
      );
      return;
    }

    setIsProcessing(true);
    setLastPaymentAmount(paymentAmount);

    try {
      const startAmount = latestCycle.remainingAmount;
      const endAmount = startAmount - paymentAmount;
      const startPercentage =
        ((latestCycle.totalBill - startAmount) / latestCycle.totalBill) * 100;
      const endPercentage =
        ((latestCycle.totalBill - endAmount) / latestCycle.totalBill) * 100;

      // Animate the amount value decreasing
      amountValue.value = withSequence(
        withTiming(startAmount, { duration: 100 }),
        withTiming(endAmount, {
          duration: 1200,
          easing: Easing.out(Easing.ease),
        })
      );

      // Animate the progress bar increasing
      progressValue.value = withTiming(endPercentage, {
        duration: 1200,
        easing: Easing.out(Easing.ease),
      });

      // Process the actual payment
      const updatedCycle = isFullPayment
        ? await handleFullPayment(
            id as string,
            paymentMethod,
            referenceNumber || undefined
          )
        : await handlePayment(
            id as string,
            paymentAmount,
            paymentMethod,
            referenceNumber || undefined
          );

      if (!updatedCycle) throw new Error("Failed to process payment");

      // Show success banner after animations complete
      bannerOpacity.value = withDelay(1300, withTiming(1, { duration: 500 }));
      bannerTranslateY.value = withDelay(
        1300,
        withTiming(0, { duration: 500 })
      );
      setShowSuccessBanner(true);

      setTimeout(() => {
        setLatestCycle(updatedCycle);
        setPayments(
          updatedCycle.payments.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )
        );
        setAmount("");
        setReferenceNumber("");
        setShowCustomInput(false);
        setIsProcessing(false);

        // Hide banner after 5 seconds
        setTimeout(() => {
          bannerOpacity.value = withTiming(0, { duration: 500 });
          bannerTranslateY.value = withTiming(50, { duration: 500 });
          setTimeout(() => setShowSuccessBanner(false), 500);
        }, 5000);
      }, 1500);
    } catch (error) {
      console.error("Error processing payment:", error);
      Alert.alert("Error", "Failed to process payment. Please try again.");
      setIsProcessing(false);
    }
  };

  const getAmountColor = (amount: number) => {
    if (amount === 0) return "#16a34a";
    if (amount < 1000) return "#22c55e";
    if (amount < 5000) return "#ca8a04";
    if (amount < 10000) return "#ea580c";
    return "#dc2626";
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="mt-4 text-gray-600">Loading payment details...</Text>
      </View>
    );
  }

  if (!card || !latestCycle) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Feather name="alert-circle" size={48} color="#dc2626" />
        <Text className="text-xl font-bold mt-4 text-center">
          Card or billing information not found
        </Text>
        <TouchableOpacity
          className="mt-6 bg-blue-600 px-6 py-3 rounded-xl"
          onPress={() => router.back()}
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "padding"}
      className="flex-1"
      keyboardVerticalOffset={Platform.OS === "ios" ? 120 : 50}
    >
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 bg-gray-50"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 150 }}
      >
        {/* Payment Status Card */}
        <View className="bg-white m-4 rounded-xl shadow-sm p-4">
          <Text className="text-lg font-bold text-gray-800 mb-2">
            Payment Status
          </Text>
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-gray-600 text-sm">Total Bill Amount:</Text>
            <Text className="font-semibold">
              ₹{latestCycle.totalBill.toLocaleString("en-IN")}
            </Text>
          </View>
          <View className="my-3 items-center">
            <Text className="text-gray-500 text-xs">Remaining Amount</Text>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                color: getAmountColor(latestCycle.remainingAmount),
              }}
            >
              {displayAmount}
            </Text>
          </View>
          <View className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <Animated.View style={animatedProgressStyle} />
          </View>
          <View className="flex-row justify-between text-xs text-gray-600 mb-3">
            <Text>0%</Text>
            <Text>
              {Math.round(
                ((latestCycle.totalBill - latestCycle.remainingAmount) /
                  latestCycle.totalBill) *
                  100
              )}
              % Paid
            </Text>
            <Text>100%</Text>
          </View>
          <View className="flex-row items-center justify-center bg-gray-100 p-2 rounded-lg">
            <Feather
              name="calendar"
              size={14}
              color="#4b5563"
              style={{ marginRight: 8 }}
            />
            <Text className="text-gray-700 text-sm">
              Due Date: <Text className="font-bold">{latestCycle.dueDate}</Text>
            </Text>
          </View>
        </View>

        {/* Success Banner */}
        {showSuccessBanner && (
          <Animated.View
            style={[animatedBannerStyle]}
            className="mx-4 mb-4 bg-green-100 border border-green-300 rounded-xl p-4 flex-row items-center"
          >
            <View className="bg-green-500 rounded-full p-2 mr-3">
              <Feather name="check" size={16} color="white" />
            </View>
            <View className="flex-1">
              <Text className="font-bold text-green-800">
                Payment Successful
              </Text>
              <Text className="text-green-700">
                ₹{lastPaymentAmount.toLocaleString("en-IN")} has been processed
                successfully
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Payment Options */}
        <View className="bg-white mx-4 rounded-xl shadow-sm p-4 mb-4">
          <Text className="text-lg font-bold text-gray-800 mb-3">
            Make a Payment
          </Text>
          <View className="flex-row space-x-3 mb-3">
            <TouchableOpacity
              className="flex-1 bg-blue-600 py-2 px-3 rounded-lg flex-row justify-center items-center"
              onPress={() => processPaymentFlow(true)}
              disabled={isProcessing || latestCycle.remainingAmount === 0}
            >
              <Text className="text-white font-bold mr-1">₹</Text>
              <Text className="text-white font-medium">Pay Full Amount</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-white border border-gray-300 py-2 px-3 rounded-lg flex-row justify-center items-center"
              onPress={() => setShowCustomInput(!showCustomInput)}
              disabled={isProcessing || latestCycle.remainingAmount === 0}
            >
              <Text className="text-gray-700 font-medium">
                {showCustomInput ? "Hide" : "Custom Amount"}
              </Text>
            </TouchableOpacity>
          </View>

          {showCustomInput && (
            <View className="border border-gray-200 rounded-lg p-3">
              <View className="mb-3">
                <Text className="text-gray-700 text-sm font-medium mb-1">
                  Payment Amount
                </Text>
                <View className="relative flex-row items-center">
                  <Text className="absolute left-3 text-gray-500">₹</Text>
                  <TextInput
                    placeholder="Enter amount"
                    value={amount}
                    onChangeText={handleAmountChange}
                    keyboardType="numeric"
                    className={`w-full bg-white border rounded-lg px-8 py-2 ${
                      amountError ? "border-red-500" : "border-gray-300"
                    }`}
                    editable={!isProcessing}
                  />
                </View>
                {amountError && (
                  <Text className="text-red-500 text-xs mt-1">
                    {amountError}
                  </Text>
                )}
              </View>
              <View className="mb-3">
                <Text className="text-gray-700 text-sm font-medium mb-1">
                  Payment Method
                </Text>
                <View className="border border-gray-300 rounded-lg px-3 py-2">
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View className="flex-row">
                      {PAYMENT_METHODS.map((method) => (
                        <TouchableOpacity
                          key={method}
                          className={`mr-2 px-3 py-1 rounded-full ${
                            paymentMethod === method
                              ? "bg-blue-600"
                              : "bg-gray-200"
                          }`}
                          onPress={() => setPaymentMethod(method)}
                          disabled={isProcessing}
                        >
                          <Text
                            className={`${
                              paymentMethod === method
                                ? "text-white"
                                : "text-gray-700"
                            }`}
                          >
                            {method}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              </View>
              <View className="mb-3">
                <Text className="text-gray-700 text-sm font-medium mb-1">
                  Reference Number (Optional)
                </Text>
                <TextInput
                  placeholder="Transaction ID, UPI reference, etc."
                  value={referenceNumber}
                  onChangeText={setReferenceNumber}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                  editable={!isProcessing}
                />
              </View>
              <TouchableOpacity
                className="bg-green-600 py-2 rounded-lg flex-row justify-center items-center"
                onPress={() => processPaymentFlow(false)}
                disabled={isProcessing || !amount || amountError !== null}
              >
                {isProcessing ? (
                  <View className="flex-row items-center">
                    <ActivityIndicator
                      size="small"
                      color="white"
                      style={{ marginRight: 8 }}
                    />
                    <Text className="text-white font-medium">
                      Processing...
                    </Text>
                  </View>
                ) : (
                  <Text className="text-white font-medium">Make Payment</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Recent Payments */}
        <View className="bg-white mx-4 rounded-xl shadow-sm p-4 mb-6">
          <Text className="text-lg font-bold text-gray-800 mb-2">
            Recent Payments
          </Text>
          {payments.length > 0 ? (
            <View>
              {payments.map((payment) => (
                <View
                  key={payment.id}
                  className="py-2 border-b border-gray-100 flex-row justify-between items-center"
                >
                  <View>
                    <Text className="font-medium">
                      ₹{payment.amount.toLocaleString("en-IN")}
                    </Text>
                    <Text className="text-xs text-gray-500">
                      {new Date(payment.date).toLocaleDateString("en-IN")} •{" "}
                      {payment.method || "Not specified"}
                    </Text>
                    {payment.reference && (
                      <Text className="text-xs text-gray-400">
                        Ref: {payment.reference}
                      </Text>
                    )}
                  </View>
                  <View className="bg-blue-100 px-2 py-0.5 rounded">
                    <Text className="text-blue-800 text-xs font-medium">
                      Completed
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View className="py-3 items-center">
              <Text className="text-gray-500 text-sm">
                No payment history yet
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
