/**
 * Shorten hash for compact display
 */
export function shortenHash(hash, lead = 8, tail = 8) {
  if (!hash) return '';
  if (hash.length <= lead + tail) return hash;
  return `${hash.substring(0, lead)}...${hash.substring(hash.length - tail)}`;
}

/**
 * Format timestamp into readable date time
 */
export function formatDate(timestamp) {
  if (!timestamp) return new Date().toISOString();
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

/**
 * Get File category: 'IMAGE', 'VIDEO', or 'DOCUMENT'
 */
export function getFileCategory(fileOrType) {
  const typeStr = typeof fileOrType === 'string' ? fileOrType.toLowerCase() : (fileOrType?.type || fileOrType?.name || '').toLowerCase();
  
  if (typeStr.includes('video') || typeStr.endsWith('.mp4') || typeStr.endsWith('.avi') || typeStr.endsWith('.mov') || typeStr.endsWith('.mkv')) {
    return 'VIDEO';
  }
  if (typeStr.includes('pdf') || typeStr.includes('document') || typeStr.includes('text') || typeStr.endsWith('.pdf') || typeStr.endsWith('.docx') || typeStr.endsWith('.txt')) {
    return 'DOCUMENT';
  }
  return 'IMAGE';
}
