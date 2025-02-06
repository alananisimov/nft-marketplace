export function randomString(length = 12, useSpecialChars = false): string {
  const numbers = "0123456789";
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const specialChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";

  let chars = numbers + letters;
  if (useSpecialChars) {
    chars += specialChars;
  }

  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);

  return Array.from(randomValues)
    .map((value) => chars[value % chars.length])
    .join("");
}
