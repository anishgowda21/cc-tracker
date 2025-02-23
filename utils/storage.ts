import { Card, CardSecureDetails, Payment } from "@/types";
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
  PAYMENTS: "payments",
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

export const addPayment = async (payment: Payment): Promise<boolean> => {
  try {
    const payments = await getPayments(payment.cardId);
    const updatedPayments = [...payments, payment];
    await AsyncStorage.setItem(
      `${STORAGE_KEYS.PAYMENTS}_${payment.cardId}`,
      JSON.stringify(updatedPayments)
    );
    return true;
  } catch (error) {
    console.error("Error adding payment:", error);
    return false;
  }
};

export const getPayments = async (cardId: string): Promise<Payment[]> => {
  try {
    const payments = await AsyncStorage.getItem(
      `${STORAGE_KEYS.PAYMENTS}_${cardId}`
    );
    return payments ? JSON.parse(payments) : [];
  } catch (error) {
    console.error("Error getting payments:", error);
    return [];
  }
};
