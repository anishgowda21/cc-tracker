import { BillCycle, Card, CardSecureDetails, Payment } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

const calculateDueDate = (billDate: number, dueDate: number): Date => {
  const today = new Date();
  let dueMonth = today.getMonth();
  let dueYear = today.getFullYear();

  if (dueDate < billDate) {
    dueMonth = dueMonth + 1;

    if (dueMonth > 11) {
      dueMonth = 0;
      dueYear = dueYear + 1;
    }
  }

  return new Date(dueYear, dueMonth, dueDate);
};

const STORAGE_KEYS = {
  CARDS: "cards",
  BILLCYCLES: "bill_cycles",
};

export const getCards = async (): Promise<Card[]> => {
  try {
    const cards = await AsyncStorage.getItem(STORAGE_KEYS.CARDS);
    return cards ? JSON.parse(cards) : [];
  } catch (error) {
    console.error("Error getting cards:", error);
    return [];
  }
};

export const saveCard = async (card: Card): Promise<boolean> => {
  try {
    const existigCards = await getCards();
    const updatedCards = [...existigCards, card];

    await AsyncStorage.setItem(
      STORAGE_KEYS.CARDS,
      JSON.stringify(updatedCards)
    );
    return true;
  } catch (error) {
    console.error("Error saving card:", error);
    return false;
  }
};

export const saveCardSecureDetails = async (
  cardId: string,
  details: CardSecureDetails
): Promise<boolean> => {
  try {
    await SecureStore.setItemAsync(
      `card_details_${cardId}`,
      JSON.stringify(details)
    );
    return true;
  } catch (error) {
    console.error("Error saving secure details:", error);
    return false;
  }
};

export const getCardSecureDetails = async (
  cardId: string
): Promise<CardSecureDetails | null> => {
  try {
    const details = await SecureStore.getItemAsync(`card_details_${cardId}`);
    return details ? JSON.parse(details) : null;
  } catch (error) {
    console.error("Error getting secure details:", error);
    return null;
  }
};

export const getBillCycles = async (): Promise<BillCycle[]> => {
  try {
    const cycles = await AsyncStorage.getItem(STORAGE_KEYS.BILLCYCLES);
    return cycles ? JSON.parse(cycles) : [];
  } catch (error) {
    console.error("Error getting bill cycles:", error);
    return [];
  }
};

export const getCardBillCycles = async (
  cardId: string
): Promise<BillCycle[]> => {
  try {
    const allCycles = await getBillCycles();
    return allCycles.filter((cycle) => cycle.cardId === cardId);
  } catch (error) {
    console.error("Error getting card bill cycles:", error);
    return [];
  }
};

export const createBillCycle = async (
  billCycle: BillCycle
): Promise<boolean> => {
  try {
    const existingCycles = await getBillCycles();
    const updatedCycles = [...existingCycles, billCycle];

    await AsyncStorage.setItem(
      STORAGE_KEYS.BILLCYCLES,
      JSON.stringify(updatedCycles)
    );
    return true;
  } catch (error) {
    console.error("Error saving bill cycle:", error);
    return false;
  }
};

export const updateBillCycle = async (
  billCycle: BillCycle
): Promise<boolean> => {
  try {
    const existingCycles = await getBillCycles();
    const updatedCycles = existingCycles.map((c) =>
      c.id === billCycle.id ? billCycle : c
    );

    await AsyncStorage.setItem(
      STORAGE_KEYS.BILLCYCLES,
      JSON.stringify(updatedCycles)
    );
    return true;
  } catch (error) {
    console.error("Error updating bill cycle:", error);
    return false;
  }
};
