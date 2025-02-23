export type Card = {
  id: string;
  bankName: string;
  cardName: string;
  limit: number;
  billDate: number; // Day of month bill generates (1-31)
  dueDate: number; // Day of month payment is due (1-31)
  currentBalance: number;
  color?: string;
};

export type CardSecureDetails = {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardHolderName: string;
};

export type Payment = {
  id: string;
  cardId: string;
  amount: number;
  date: string;
  billMonth: string; // Format: "2024-02"
};
