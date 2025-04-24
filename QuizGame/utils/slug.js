import unidecode from 'unidecode';

/**
 * Generates a URL-friendly slug from a text string
 * Converts Unicode characters to ASCII, removes special characters,
 * converts spaces to hyphens, and ensures slugs are unique
 * 
 * @param {string} text - The text to convert to a slug (e.g., quiz description)
 * @return {string} - A URL-friendly slug
 */
export function generateSlug(text) {
  if (!text) return '';
  
  const transliterated = unidecode(text); // Converts Unicode characters like "tên tôi là" to "ten toi la"
  
  return transliterated
    .toLowerCase()          // Convert to lowercase
    .replace(/\s+/g, '-')   // Replace spaces with hyphens
    .replace(/[^\w\-]+/g, '') // Remove any remaining special characters
    .replace(/\-\-+/g, '-')  // Replace multiple hyphens with single hyphen
    .replace(/^-+/, '')      // Trim hyphens from start
    .replace(/-+$/, '');     // Trim hyphens from end
}

/**
 * Check if a given string is a valid UUID/Firebase ID
 * This is a simple check to distinguish between IDs and slugs in the URL
 * 
 * @param {string} str - The string to check
 * @return {boolean} - True if the string looks like an ID
 */
export function isValidId(str) {
  // Firebase IDs often contain special characters like -_
  return /^[-A-Za-z0-9_]+$/.test(str);
}