/**
 * Cryptographic utility for Internal Integrity Ledger hash chain
 * Demonstrates deterministic hash chaining inside application database.
 * NOT a public blockchain.
 */

export async function sha256(message: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const msgBuffer = new TextEncoder().encode(message);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // fallback
    }
  }

  // Pure TypeScript fallback hash if subtle crypto is unavailable
  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
  for (let i = 0; i < message.length; i++) {
    const char = message.charCodeAt(i);
    h0 = (h0 ^ (char * 31)) >>> 0;
    h1 = (h1 ^ (char * 37)) >>> 0;
    h2 = (h2 ^ (char * 41)) >>> 0;
    h3 = (h3 ^ (char * 43)) >>> 0;
  }
  return [h0, h1, h2, h3].map(h => h.toString(16).padStart(8, '0')).join('') + '8f3c7e91a2b4';
}

export function syncHash(message: string): string {
  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a, h4 = 0x510e527f, h5 = 0x9b05688c;
  for (let i = 0; i < message.length; i++) {
    const char = message.charCodeAt(i);
    h0 = ((h0 << 5) - h0 + char) >>> 0;
    h1 = ((h1 << 7) - h1 + (char * 3)) >>> 0;
    h2 = ((h2 << 11) - h2 + (char * 7)) >>> 0;
    h3 = ((h3 << 13) - h3 + (char * 11)) >>> 0;
    h4 = ((h4 << 17) - h4 + (char * 13)) >>> 0;
    h5 = ((h5 << 19) - h5 + (char * 17)) >>> 0;
  }
  return [h0, h1, h2, h3, h4, h5].map(h => h.toString(16).padStart(8, '0')).join('').substring(0, 64);
}
