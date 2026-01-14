export function formatTimeElapsed(createdAt: string): string {
  const now = new Date();
  const created = new Date(createdAt);
  const diffMs = now.getTime() - created.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin} min`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs} hr`;
  return `${Math.floor(diffHrs / 24)} days`;
}
