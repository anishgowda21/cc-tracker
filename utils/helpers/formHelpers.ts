export const formatCardNumber = (text: string): string => {
  const cleaned = text.replace(/\D/g, "").slice(0, 16);
  const parts = cleaned.match(/.{1,4}/g) || [];
  return parts.join(" ");
};
