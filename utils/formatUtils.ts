
/**
 * Sanitizes a phone number for use in WhatsApp (wa.me) links.
 * It removes all non-numeric characters.
 * WhatsApp requires the number in full international format without any 
 * special characters like +, -, or spaces.
 */
export const sanitizePhoneNumber = (phone: string): string => {
  if (!phone) return '';
  let cleaned = phone.replace(/\D/g, '');
  // WhatsApp links (wa.me) require the number in full international format.
  // A common mistake is including a leading zero after the country code (e.g. 27079... instead of 2779...).
  if (cleaned.startsWith('270') && cleaned.length > 10) {
    cleaned = '27' + cleaned.substring(3);
  }
  return cleaned;
};
