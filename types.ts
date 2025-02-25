export type Card = {
  id: string;
  lastDigits: string;
  bankName: string;
  cardName: string;
  network: string;
  limit: number;
  billDate: number; // Day of month bill generates (1-31)
  dueDate: number; // Day of month payment is due (1-31)
  color?: string;
};

export type BillCycle = {
  id: string;
  cardId: string;
  cycleDate: string; // e.g., "2025-02"
  totalBill: number;
  remainingAmount: number;
  dueDate: string; // e.g., "2025-02-25"
  rewardPoints: null | number;
  status: "not updated" | "unpaid" | "partial" | "paid" | "overdue";
  payments: Payment[];
};

export type Payment = {
  id: string;
  amount: number;
  date: string;
  method?: string;
  reference?: string;
};

export type CardSecureDetails = {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardHolderName: string;
};

export interface FormData {
  bankName: string;
  cardName: string;
  network: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  cardHolderName: string;
  billDate: string;
  dueDate: string;
  limit: string;
  color: string;
}

// Error state type
export interface ErrorState {
  bankName?: string;
  cardName?: string;
  network?: string;
  cardNumber?: string;
  expiry?: string;
  cvv?: string;
  cardHolderName?: string;
  billDate?: string;
  dueDate?: string;
  limit?: string;
}
