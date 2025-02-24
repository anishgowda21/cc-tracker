export const getDueDate = (
  billDate: number,
  dueDate: number,
  cycleDate: string
): string => {
  const [year, month] = cycleDate.split("-").map(Number); // e.g., ["2025", "02"]
  let dueMonth = month;
  let dueYear = year;

  // Adjust: same month if dueDate >= billDate, next month if dueDate < billDate
  if (dueDate < billDate) {
    dueMonth = month === 12 ? 1 : month + 1;
    dueYear = month === 12 ? year + 1 : year;
  }

  const date = new Date(dueYear, dueMonth - 1, dueDate);
  return date.toISOString().split("T")[0]; // e.g., "2025-02-28" or "2025-03-03"
};

export const getCurrentCycleDate = (billDate: number): string => {
  const today = new Date();
  const day = today.getDate();
  let month = today.getMonth();
  let year = today.getFullYear();

  if (day < billDate) {
    month -= 1;
    if (month < 0) {
      month = 11;
      year -= 1;
    }
  }

  return `${year}-${String(month + 1).padStart(2, "0")}`;
};

export const formatExpiry = (text: string) => {
  const cleaned = text.replace(/\D/g, "").slice(0, 4);
  if (cleaned.length <= 2) return cleaned;
  const month = cleaned.slice(0, 2);
  const year = cleaned.slice(2);
  return `${month}${year ? "/" + year : ""}`;
};

export const checkDueDateSanity = (
  billDate: number,
  dueDate: number
): string | null => {
  const gap =
    dueDate <= billDate ? 31 - billDate + dueDate : dueDate - billDate;

  if (gap < 20) {
    return `Hey, ${gap} days is quick—usually it’s 20-25 days from bill to due. You good with that?`;
  } else if (gap > 25) {
    return `Whoa, ${gap} days is a stretch—most due dates land 20-25 days after the bill. Sure about this?`;
  }
  return null;
};
