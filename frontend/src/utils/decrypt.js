import CryptoJS from 'crypto-js';

export const decryptData = (ciphertext) => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, 'zwRfwfJxDHWefrwwfewfECWCW');
    return bytes.toString(CryptoJS.enc.Utf8);  // Return decrypted value
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
};
