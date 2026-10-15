import crypto from 'crypto';

/**
 * Normalizes email addresses to prevent duplicate accounts
 */
export function normalizeEmail(email) {
  if (!email || typeof email !== 'string') return null;
  let [local, domain] = email.trim().toLowerCase().split('@');
  if (!domain) return email.trim().toLowerCase();
  // Strip sub-addressing (+tag)
  local = local.split('+')[0];
  return `${local}@${domain}`;
}

/**
 * Validates WooCommerce Webhook HMAC-SHA256 signature
 */
export function verifyWooWebhookSignature(rawBody, signature, secret) {
  if (!signature || !secret) return false;
  try {
    const computed = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('base64');
    
    // Constant-time buffer compare
    const bufA = Buffer.from(signature, 'utf8');
    const bufB = Buffer.from(computed, 'utf8');
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch (err) {
    return false;
  }
}

/**
 * Formats numeric values to USD or given currency
 */
export function formatCurrency(amount, currency = 'USD') {
  const num = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(num);
}

/**
 * Calculates day difference between two dates
 */
export function daysBetween(dateA, dateB = new Date()) {
  const d1 = new Date(dateA);
  const d2 = new Date(dateB);
  const diffTime = Math.abs(d2 - d1);
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}
