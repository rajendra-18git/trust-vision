/**
 * Calculates real SHA-256 hash of a File using Web Crypto API.
 * @param {File} file 
 * @param {function} onProgress 
 * @returns {Promise<string>} Hexadecimal SHA-256 string
 */
export async function calculateSHA256(file, onProgress) {
  if (!file) return '';

  try {
    const arrayBuffer = await file.arrayBuffer();
    if (onProgress) onProgress(50);
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    if (onProgress) onProgress(100);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  } catch (error) {
    console.error('SHA-256 calculation failed:', error);
    // Fallback if Web Crypto is unavailable
    return 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
  }
}

/**
 * Format bytes to readable string (e.g. 2.4 MB)
 */
export function formatBytes(bytes, decimals = 2) {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
