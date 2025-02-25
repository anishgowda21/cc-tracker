import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { BillCycle, Card } from "@/types";
import {
  getCardBillCycles,
  getCardById,
  updateBillCycle,
} from "@/utils/storage";
import RNPickerSelect from "react-native-picker-select";
import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

// Reward Modal Component
const RewardModal = ({ visible, onClose, cycle, onRewardSave }: ModalProps) => {
  const [rewardInput, setRewardInput] = useState(
    cycle?.rewardPoints?.toString() || ""
  );

  const handleSave = () => {
    let rewardAmount = null;
    if (rewardInput && !isNaN(parseFloat(rewardInput))) {
      rewardAmount = parseFloat(rewardInput);
    }
    onRewardSave && cycle && onRewardSave(cycle.id, rewardAmount);
  };

  if (!cycle) return null;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalContainer}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {cycle.rewardPoints !== null ? "Edit Rewards" : "Add Rewards"}
                </Text>
                <TouchableOpacity onPress={onClose}>
                  <Feather name="x" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalLabel}>Cycle</Text>
              <Text style={styles.modalValue}>
                {formatCycleDate(cycle.cycleDate)}
              </Text>

              <Text style={styles.inputLabel}>Reward Amount</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.inputPrefix}>₹</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter amount"
                  value={rewardInput}
                  onChangeText={setRewardInput}
                  keyboardType="numeric"
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                />
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={onClose}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={handleSave}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// Edit Cycle Modal Component
type ModalProps = {
  visible: boolean;
  onClose: () => void;
  cycle: BillCycle | null;
  onEditSave?: (cycleId: string, billAmount: number, dueDate: string) => void;
  onRewardSave?: (cycleId: string, rewardAmount: number | null) => void;
};

const EditCycleModal = ({
  visible,
  onClose,
  cycle,
  onEditSave,
}: ModalProps) => {
  const [totalBill, setTotalBill] = useState(cycle?.totalBill.toString() || "");
  const [dueDate, setDueDate] = useState(cycle?.dueDate || "");
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (cycle) {
      setTotalBill(cycle.totalBill.toString());
      setDueDate(cycle.dueDate);
    }
  }, [cycle]);

  const handleSave = () => {
    let billAmount = null;
    if (totalBill && !isNaN(parseFloat(totalBill))) {
      billAmount = parseFloat(totalBill);
    }

    if (!billAmount || billAmount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid bill amount");
      return;
    }

    onEditSave && onEditSave(cycle!.id, billAmount, dueDate);
  };

  const handleDateChange = (event: any, selectedDate: Date | undefined) => {
    setShowDatePicker(false);
    if (selectedDate) {
      // Format date as YYYY-MM-DD
      const formattedDate = selectedDate.toISOString().split("T")[0];
      setDueDate(formattedDate);
    }
  };

  if (!cycle) return null;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalContainer}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Bill Cycle</Text>
                <TouchableOpacity onPress={onClose}>
                  <Feather name="x" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Bill Amount</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.inputPrefix}>₹</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter bill amount"
                  value={totalBill}
                  onChangeText={setTotalBill}
                  keyboardType="numeric"
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                />
              </View>
              <Text style={styles.helperText}>
                Changing the bill amount will recalculate payment status
              </Text>

              <Text style={styles.inputLabel}>Due Date</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowDatePicker(true)}
              >
                <Feather
                  name="calendar"
                  size={16}
                  color="#4b5563"
                  style={styles.dateIcon}
                />
                <Text style={styles.dateText}>{dueDate}</Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={new Date(dueDate)}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false); // Always hide picker after selection
                    if (selectedDate) {
                      // Format date as YYYY-MM-DD
                      const formattedDate = selectedDate
                        .toISOString()
                        .split("T")[0];
                      setDueDate(formattedDate);
                    }
                  }}
                />
              )}

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={onClose}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.saveButton,
                    { backgroundColor: "#2563eb" },
                  ]}
                  onPress={handleSave}
                >
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// Helper Functions
const formatCycleDate = (cycleDate: string) => {
  const [year, month] = cycleDate.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return date.toLocaleString("default", { month: "long", year: "numeric" });
};

const formatDueDate = (dueDate: string) => {
  if (!dueDate) return "N/A";
  const [year, month, day] = dueDate.split("-");
  return `${day}/${month}/${year}`;
};

const capitalizeStatus = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

// Main Component
const BillCycleHistory = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [card, setCard] = useState<Card | null>(null);
  const [billCycles, setBillCycles] = useState<BillCycle[]>([]);
  const [expandedCycle, setExpandedCycle] = useState<string | null>(null);
  const [editingCycle, setEditingCycle] = useState<BillCycle | null>(null);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState<BillCycle | null>(null);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [selectedYear, setSelectedYear] = useState<string>("2025");
  const [isLoading, setIsLoading] = useState(true);
  const [years, setYears] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const cardData = await getCardById(id);
      const cyclesData = await getCardBillCycles(id);

      setCard(cardData);
      setBillCycles(cyclesData);

      // Extract available years
      const availableYears = [
        ...new Set(cyclesData.map((cycle) => cycle.cycleDate.split("-")[0])),
      ]
        .sort()
        .reverse();

      setYears(availableYears);

      // Set default selected year to the most recent
      if (availableYears.length > 0 && !selectedYear) {
        setSelectedYear(availableYears[0]);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      Alert.alert("Error", "Failed to load bill cycles");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCycles = billCycles.filter((cycle) =>
    cycle.cycleDate.startsWith(selectedYear)
  );

  const totalSpending = filteredCycles.reduce(
    (sum, cycle) => sum + cycle.totalBill,
    0
  );

  const totalRewards = filteredCycles
    .filter((cycle) => cycle.rewardPoints !== null)
    .reduce((sum, cycle) => sum + (cycle.rewardPoints || 0), 0);

  const sortedCycles = [...filteredCycles].sort((a, b) =>
    sortOrder === "desc"
      ? b.cycleDate.localeCompare(a.cycleDate)
      : a.cycleDate.localeCompare(b.cycleDate)
  );

  const latestCycle = sortedCycles.length > 0 ? sortedCycles[0] : null;

  const toggleCycle = (cycleId: string) => {
    setExpandedCycle(expandedCycle === cycleId ? null : cycleId);
  };

  const handleRewardClick = (cycle: BillCycle) => {
    setSelectedCycle(cycle);
    setShowRewardModal(true);
  };

  const saveReward = async (cycleId: string, rewardAmount: number | null) => {
    try {
      const cycleToUpdate = billCycles.find((c) => c.id === cycleId);
      if (!cycleToUpdate) return;

      const updatedCycle = {
        ...cycleToUpdate,
        rewardPoints: rewardAmount,
      };

      const success = await updateBillCycle(updatedCycle);
      if (success) {
        // Update local state
        setBillCycles((prevCycles) =>
          prevCycles.map((cycle) =>
            cycle.id === cycleId ? updatedCycle : cycle
          )
        );
        setShowRewardModal(false);
      } else {
        Alert.alert("Error", "Failed to update rewards");
      }
    } catch (error) {
      console.error("Error saving reward:", error);
      Alert.alert("Error", "Failed to save reward");
    }
  };

  const saveCycleEdit = async (
    cycleId: string,
    billAmount: number,
    newDueDate: string
  ) => {
    try {
      const cycleToUpdate = billCycles.find((c) => c.id === cycleId);
      if (!cycleToUpdate) return;

      // Calculate new status based on existing payments
      const totalPaid = cycleToUpdate.payments.reduce(
        (sum, payment) => sum + payment.amount,
        0
      );
      let newStatus: BillCycle["status"] = cycleToUpdate.status;
      let newRemainingAmount = billAmount - totalPaid;

      if (newRemainingAmount <= 0) {
        newStatus = "paid";
        newRemainingAmount = 0;
      } else if (totalPaid > 0) {
        newStatus = "partial";
      } else {
        newStatus = "unpaid";
      }

      const updatedCycle = {
        ...cycleToUpdate,
        totalBill: billAmount,
        dueDate: newDueDate,
        remainingAmount: newRemainingAmount,
        status: newStatus,
      };

      const success = await updateBillCycle(updatedCycle);
      if (success) {
        // Update local state
        setBillCycles((prevCycles) =>
          prevCycles.map((cycle) =>
            cycle.id === cycleId ? updatedCycle : cycle
          )
        );
        setEditingCycle(null);
      } else {
        Alert.alert("Error", "Failed to update bill cycle");
      }
    } catch (error) {
      console.error("Error saving cycle edit:", error);
      Alert.alert("Error", "Failed to save changes");
    }
  };

  const getStatusStyle = (status: BillCycle["status"]) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "partial":
        return "bg-orange-100 text-orange-800";
      case "unpaid":
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const renderCycleItem = ({ item }: { item: BillCycle }) => (
    <View className="bg-white rounded-xl shadow-sm mb-3 overflow-hidden">
      <TouchableOpacity
        className={`p-4 ${item.id === latestCycle?.id ? "bg-blue-50" : ""}`}
        onPress={() => toggleCycle(item.id)}
      >
        <View className="flex-row justify-between items-start">
          <View>
            <View className="flex-row items-center">
              <Text className="font-bold text-gray-800">
                {formatCycleDate(item.cycleDate)}
              </Text>
              {item.id === latestCycle?.id && (
                <Text className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Current
                </Text>
              )}
            </View>
            <Text className="text-sm text-gray-600 mt-1">
              Due: {formatDueDate(item.dueDate)}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Text
              className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusStyle(
                item.status
              )}`}
            >
              {capitalizeStatus(item.status)}
            </Text>
            <Text className="ml-2">
              {expandedCycle === item.id ? (
                <Feather name="chevron-down" size={24} />
              ) : (
                <Feather name="chevron-right" size={24} />
              )}
            </Text>
          </View>
        </View>
        <View className="mt-2 flex-row justify-between items-center">
          <View>
            <Text className="text-sm text-gray-600">Bill Amount</Text>
            <Text className="font-bold">
              ₹{item.totalBill.toLocaleString("en-IN")}
            </Text>
          </View>
          <View className="text-right">
            <Text className="text-sm text-gray-600">Rewards</Text>
            {item.rewardPoints !== null ? (
              <View className="flex-row items-center justify-end">
                <Text className="font-bold text-green-600 mr-1">
                  ₹{item.rewardPoints.toLocaleString("en-IN")}
                </Text>
                <TouchableOpacity onPress={() => handleRewardClick(item)}>
                  <Feather name="edit-2" size={14} color="#2563eb" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                className="bg-green-100 px-2 py-1 rounded-full flex-row items-center"
                onPress={() => handleRewardClick(item)}
              >
                <Feather name="plus" size={12} color="#16a34a" />
                <Text className="text-xs text-green-700 ml-1">Add</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>

      {expandedCycle === item.id && (
        <View className="p-4 bg-gray-50 border-t border-gray-100">
          {item.id === latestCycle?.id && (
            <View className="mb-3 flex-row justify-end">
              <TouchableOpacity
                className="bg-blue-50 px-3 py-1 rounded-lg flex-row items-center"
                onPress={() => setEditingCycle(item)}
              >
                <Feather
                  name="edit-2"
                  size={14}
                  color="#2563eb"
                  className="mr-1"
                />
                <Text className="text-sm text-blue-700">Edit Cycle</Text>
              </TouchableOpacity>
            </View>
          )}
          <Text className="text-sm font-semibold text-gray-700 mb-2">
            Payment History
          </Text>
          {item.payments.length > 0 ? (
            item.payments.map((payment) => (
              <View
                key={payment.id}
                className="bg-white p-2 rounded-lg border border-gray-200 flex-row justify-between mb-2"
              >
                <View>
                  <Text className="font-medium">
                    ₹{payment.amount.toLocaleString("en-IN")}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {payment.date} • {payment.method || "Not specified"}
                  </Text>
                  {payment.reference && (
                    <Text className="text-xs text-gray-400">
                      Ref: {payment.reference}
                    </Text>
                  )}
                </View>
                <Text className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded self-center">
                  Completed
                </Text>
              </View>
            ))
          ) : (
            <Text className="text-center text-gray-500 text-sm p-3 bg-white rounded-lg border border-gray-200">
              No payments yet
            </Text>
          )}
          <View className="bg-white p-3 rounded-lg border border-gray-200 mt-3">
            <View className="flex-row justify-between text-sm mb-1">
              <Text className="text-gray-600">Total Bill:</Text>
              <Text className="font-semibold">
                ₹{item.totalBill.toLocaleString("en-IN")}
              </Text>
            </View>
            <View className="flex-row justify-between text-sm mb-1">
              <Text className="text-gray-600">Total Paid:</Text>
              <Text className="font-semibold">
                ₹
                {(item.totalBill - item.remainingAmount).toLocaleString(
                  "en-IN"
                )}
              </Text>
            </View>
            {item.remainingAmount > 0 && (
              <View className="flex-row justify-between text-sm mb-1">
                <Text className="text-gray-600">Remaining:</Text>
                <Text className="font-semibold text-red-600">
                  ₹{item.remainingAmount.toLocaleString("en-IN")}
                </Text>
              </View>
            )}
            {item.rewardPoints !== null && (
              <View className="flex-row justify-between text-sm">
                <Text className="text-gray-600">Rewards Earned:</Text>
                <Text className="font-semibold text-green-600">
                  ₹{item.rewardPoints.toLocaleString("en-IN")}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="mt-4 text-gray-600">Loading bill cycles...</Text>
      </View>
    );
  }

  if (!card) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 p-4">
        <Feather name="alert-circle" size={48} color="#dc2626" />
        <Text className="text-xl font-bold mt-4 text-center text-gray-800">
          Card not found
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
    <View className="flex-1 bg-gray-50 p-4">
      <View className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <Text className="text-xl font-bold">
          {card.bankName} - {card.cardName}
        </Text>
        <Text className="text-sm text-gray-500 mb-3">
          •••• •••• •••• {card.lastDigits}
        </Text>
        <View className="flex-row justify-between">
          <View className="bg-blue-50 p-3 rounded-lg flex-1 mr-2">
            <Text className="text-xs text-blue-700 font-medium mb-1">
              TOTAL SPENT
            </Text>
            <Text className="text-lg font-bold">
              ₹{totalSpending.toLocaleString("en-IN")}
            </Text>
          </View>
          <View className="bg-green-50 p-3 rounded-lg flex-1">
            <Text className="text-xs text-green-700 font-medium mb-1">
              TOTAL REWARDS
            </Text>
            <Text className="text-lg font-bold">
              ₹{totalRewards.toLocaleString("en-IN")}
            </Text>
          </View>
        </View>
      </View>

      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-row items-center">
          <Text className="font-bold text-gray-800 mr-2">Bill Cycles</Text>
          {years.length > 0 ? (
            <View style={styles.yearPickerContainer}>
              <RNPickerSelect
                onValueChange={(value) => value && setSelectedYear(value)}
                items={years.map((year) => ({ label: year, value: year }))}
                value={selectedYear}
                style={{
                  inputIOS: styles.yearPickerIOS,
                  inputAndroid: styles.yearPickerAndroid,
                }}
                placeholder={{}}
                useNativeAndroidPickerStyle={false}
                Icon={() => (
                  <Feather
                    name="chevron-down"
                    size={16}
                    color="#4b5563"
                    style={styles.yearPickerIcon}
                  />
                )}
              />
            </View>
          ) : (
            <Text className="text-gray-500">No data</Text>
          )}
        </View>
        <TouchableOpacity
          className="bg-white p-2 rounded-lg shadow-sm flex-row items-center"
          onPress={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
        >
          <Text className="text-sm text-gray-600 mr-1">Sort</Text>
          <Feather
            name={sortOrder === "desc" ? "arrow-down" : "arrow-up"}
            size={16}
            color="#4b5563"
          />
        </TouchableOpacity>
      </View>

      {sortedCycles.length > 0 ? (
        <FlatList
          data={sortedCycles}
          renderItem={renderCycleItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View className="flex-1 justify-center items-center">
          <Feather name="calendar" size={48} color="#9ca3af" />
          <Text className="text-lg text-gray-500 mt-4">
            No bill cycles for {selectedYear}
          </Text>
        </View>
      )}

      {/* Reward Modal */}
      <RewardModal
        visible={showRewardModal}
        onClose={() => setShowRewardModal(false)}
        cycle={selectedCycle}
        onRewardSave={saveReward}
      />

      {/* Edit Cycle Modal */}
      <EditCycleModal
        visible={editingCycle !== null}
        onClose={() => setEditingCycle(null)}
        cycle={editingCycle}
        onEditSave={saveCycleEdit}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  // Year Picker Styles
  yearPickerContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
  },
  yearPickerIOS: {
    fontSize: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    color: "#4b5563",
    width: 100,
  },
  yearPickerAndroid: {
    fontSize: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    color: "#4b5563",
    width: 100,
  },
  yearPickerIcon: {
    right: 10,
    top: 10,
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    width: "100%",
    maxWidth: 340,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  modalLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  modalValue: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: "white",
  },
  inputPrefix: {
    paddingLeft: 12,
    color: "#6b7280",
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 16,
  },
  helperText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: -12,
    marginBottom: 16,
  },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: "white",
  },
  dateIcon: {
    marginRight: 8,
  },
  dateText: {
    fontSize: 16,
    color: "#111827",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f3f4f6",
    marginRight: 8,
  },
  cancelButtonText: {
    color: "#4b5563",
    fontWeight: "500",
  },
  saveButton: {
    backgroundColor: "#10b981",
  },
  saveButtonText: {
    color: "white",
    fontWeight: "500",
  },
});

export default BillCycleHistory;
