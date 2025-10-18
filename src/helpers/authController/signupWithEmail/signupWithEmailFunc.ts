/**
 * Extracts the username (the part before the '@') from an email address
 * and returns it in lowercase.
 *
 * @param {string} email - The email address to process.
 * @returns {string | null} The lowercase username part of the email, or null for invalid input.
 */
export const extractUsernameFromEmail = (email: string): string | null => {
  // Check if the input is a valid string and contains '@'
  if (typeof email !== "string" || !email.includes("@")) {
    console.error("Invalid input: Please provide a valid email address.");
    return null; // Return null for invalid input
  }

  // Split the email string at the "@" symbol to separate the username and domain.
  // This creates an array, e.g., "you@gmail.com" becomes ["you", "gmail.com"].
  const parts = email.split("@");

  // The username is the first part of the array (default to an empty string to avoid undefined).
  const username = parts[0] ?? "";

  // Convert the username to lowercase and return it.
  return username.toLowerCase();
};
