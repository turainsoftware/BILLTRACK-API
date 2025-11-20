function generateInvoiceNumber(businessId) {
  const prefix = "INV" + businessId; // e.g., INV45
  const minLen = 12;
  const maxLen = 15;

  // Final length between 12–15
  const finalLength =
    Math.floor(Math.random() * (maxLen - minLen + 1)) + minLen;

  const remaining = finalLength - prefix.length;

  if (remaining <= 0) {
    throw new Error("businessId too long to fit inside 12–15 characters");
  }

  // Numbers + letters
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  let randomPart = "";
  for (let i = 0; i < remaining; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return prefix + randomPart;
}

module.exports = { generateInvoiceNumber };
