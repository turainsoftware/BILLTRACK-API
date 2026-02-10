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

const generateNamePrefix = (name) => {
  // Validate input - must be a string
  if (typeof name !== "string") {
    return "";
  }

  // Trim all extra spaces and convert to a normalized form
  const trimmedName = name.trim();

  // Handle empty string
  if (!trimmedName) {
    return "";
  }

  // Split by spaces and filter out empty strings (handles multiple consecutive spaces)
  const words = trimmedName.split(/\s+/).filter((word) => word.length > 0);

  // Case 1: Multiple words - take first letter of each word
  if (words.length > 1) {
    return words.map((word) => word.charAt(0).toUpperCase()).join("");
  }

  // Case 2: Single word
  const singleWord = words[0];

  // Case 2a: Single character - return it in uppercase
  if (singleWord.length === 1) {
    return singleWord.toUpperCase();
  }

  // Case 2b: Single word with multiple characters - return first TWO characters
  return singleWord.substring(0, 2).toUpperCase();
};

module.exports = { generateInvoiceNumber, generateNamePrefix };
