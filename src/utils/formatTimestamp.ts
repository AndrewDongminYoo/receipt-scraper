export function formatTimestamp(timestamp: string) {
  return timestamp.replace('T', ' ').slice(0, 16);
}
