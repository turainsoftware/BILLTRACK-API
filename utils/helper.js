const { Op } = require("sequelize");

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

function getCurrentFinancialYearCreatedAt(date = new Date()) {
  const now = new Date(date);
  const year = now.getFullYear();
  const month = now.getMonth(); // 0 = Jan, 3 = April

  let startDate, endDate;

  if (month >= 3) {
    // April or later
    startDate = new Date(year, 3, 1, 0, 0, 0, 0);
    endDate = new Date(year + 1, 3, 0, 23, 59, 59, 999);
  } else {
    // Jan–March
    startDate = new Date(year - 1, 3, 1, 0, 0, 0, 0);
    endDate = new Date(year, 3, 0, 23, 59, 59, 999);
  }

  return {
    createdAt: {
      [Op.between]: [startDate, endDate],
    },
  };
}

module.exports = {
  generateInvoiceNumber,
  generateNamePrefix,
  getCurrentFinancialYearCreatedAt,
};
