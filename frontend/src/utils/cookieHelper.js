import Cookies from 'js-cookie';
import CryptoJS from 'crypto-js';

const COOKIE_NAME = 'userAccess';
const SECRET_KEY = 'zwRfwfJxDHWefrwwfewfECWCW';  // Keep this secret

const COOKIE_OPTIONS = {
  expires: 2,       // Cookie expires in 2 days
  secure: false,    // Set false for local development (change to true for production)
  sameSite: 'Lax',  // Allows cross-site requests in local development
};

// Decrypt userRoleId when retrieving from cookie
export const decryptData = (ciphertext) => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
};

// Save userRoleId in cookie (No encryption, as it's handled server-side)
export const setUserRoleCookie = (userRoleId) => {
  Cookies.set(COOKIE_NAME, userRoleId, COOKIE_OPTIONS);
};

// Get decrypted userRoleId from cookie
export const getUserRoleCookie = () => {
  const encryptedRoleId = Cookies.get(COOKIE_NAME);
  return encryptedRoleId ? decryptData(encryptedRoleId) : null;
};

// Remove userRoleId cookie (Logout)
export const removeUserRoleCookie = () => {
  Cookies.remove(COOKIE_NAME);
};
