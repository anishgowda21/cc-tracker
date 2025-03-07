import { BillCycle, Card, CardSecureDetails, Payment } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

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

export async function getCardById(cardId: string): Promise<Card | null> {
  try {
    const cards = await getCards();
    return cards.find((c) => c.id === cardId) || null;
  } catch (error) {
    console.error("Error fetching card by ID:", error);
    return null;
  }
}

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

export const deleteCard = async (cardId: string): Promise<boolean> => {
  try {
    // Delete card from AsyncStorage
    const existingCards = await getCards();
    const updatedCards = existingCards.filter((card) => card.id !== cardId);
    await AsyncStorage.setItem(
      STORAGE_KEYS.CARDS,
      JSON.stringify(updatedCards)
    );

    // Delete secure details
    await SecureStore.deleteItemAsync(`card_details_${cardId}`);

    // Delete associated bill cycles
    const existingCycles = await getBillCycles();
    const updatedCycles = existingCycles.filter(
      (cycle) => cycle.cardId !== cardId
    );
    await AsyncStorage.setItem(
      STORAGE_KEYS.BILLCYCLES,
      JSON.stringify(updatedCycles)
    );

    return true;
  } catch (error) {
    console.error("Error deleting card:", error);
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

export const getLatestBillCycle = async (
  cardId: string
): Promise<BillCycle | null> => {
  try {
    const cycles = await getCardBillCycles(cardId);
    if (cycles.length === 0) return null;
    return [...cycles].sort((a, b) =>
      b.cycleDate.localeCompare(a.cycleDate)
    )[0];
  } catch (error) {
    console.error("Error fetching latest bill cycle:", error);
    return null;
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
