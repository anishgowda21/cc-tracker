import { BillCycle, Payment } from "@/types";
import { getLatestBillCycle, updateBillCycle } from "../storage";

async function createAndUpdatePayment(
  cardId: string,
  amount: number,
  method: string,
  reference?: string,
  isFullPayment: boolean = false
): Promise<BillCycle | null> {
  const latestCycle = await getLatestBillCycle(cardId);
  if (!latestCycle) return null;

  if (isFullPayment && latestCycle.status === "paid") return latestCycle;
  if (amount <= 0 || amount > latestCycle.remainingAmount) {
    throw new Error("Invalid payment amount");
  }

  const newPayment: Payment = {
    id: `payment_${Date.now()}`,
    amount,
    date: new Date().toISOString().split("T")[0],
    method,
    reference,
  };

  const newRemainingAmount = latestCycle.remainingAmount - amount;
  const newStatus =
    newRemainingAmount === 0
      ? "paid"
      : newRemainingAmount < latestCycle.totalBill
      ? "partial"
      : latestCycle.status;

  const updatedCycle: BillCycle = {
    ...latestCycle,
    remainingAmount: newRemainingAmount,
    status: newStatus,
    payments: [...latestCycle.payments, newPayment],
  };

  const success = await updateBillCycle(updatedCycle);
  if (!success) throw new Error("Failed to update bill cycle");

  return updatedCycle;
}

export async function handlePayment(
  cardId: string,
  amount: number,
  method: string,
  referenceNumber?: string
) {
  try {
    return await createAndUpdatePayment(
      cardId,
      amount,
      method,
      referenceNumber
    );
  } catch (error) {
    console.error("Error handling payment:", error);
    return null;
  }
}

export async function handleFullPayment(
  cardId: string,
  method: string,
  referenceNumber?: string
) {
  try {
    const latestCycle = await getLatestBillCycle(cardId);
    if (!latestCycle) return null;
    return await createAndUpdatePayment(
      cardId,
      latestCycle.remainingAmount,
      method,
      referenceNumber,
      true
    );
  } catch (error) {
    console.error("Error handling full payment:", error);
    return null;
  }
}

export async function getPaymentHistory(cardId: string): Promise<Payment[]> {
  try {
    const latestCycle = await getLatestBillCycle(cardId);
    if (!latestCycle) return [];
    return latestCycle.payments;
  } catch (error) {
    console.error("Error getting payment history:", error);
    return [];
  }
}
