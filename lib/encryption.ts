import CryptoJS from "crypto-js";

// Use environment variable for encryption key
const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "fallback-key";

export const encryptApiKey = (apiKey: string): string => {
  try {
    const encrypted = CryptoJS.AES.encrypt(apiKey, ENCRYPTION_KEY).toString();
    return encrypted;
  } catch (error) {
    console.error("Encryption failed:", error);
    throw new Error("Failed to encrypt API key");
  }
};

export const decryptApiKey = (encryptedApiKey: string): string => {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedApiKey, ENCRYPTION_KEY);
    const apiKey = decrypted.toString(CryptoJS.enc.Utf8);

    if (!apiKey) {
      throw new Error("Failed to decrypt API key");
    }

    return apiKey;
  } catch (error) {
    console.error("Decryption failed:", error);
    throw new Error("Failed to decrypt API key");
  }
};

// Validate API key format (basic validation)
export const isValidApiKey = (apiKey: string): boolean => {
  // Appwrite API keys typically start with certain patterns and are long
  const apiKeyPattern = /^[a-zA-Z0-9_-]{50,}$/;
  return apiKeyPattern.test(apiKey.trim());
};
