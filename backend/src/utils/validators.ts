export function validateChannelName(name: string): { valid: boolean; message?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, message: 'channelName is required' };
  }
  if (name.length > 100) {
    return { valid: false, message: 'channelName too long (max 100)' };
  }
  return { valid: true };
}


