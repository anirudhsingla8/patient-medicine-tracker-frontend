export function daysUntil(dateStr?: string): number | undefined {
    if (!dateStr) return undefined;
    const target = new Date(dateStr);
    const now = new Date();
    // Reset time part to ensure we compare dates only, or at least be consistent
    // However, the original implementation just used current time.
    // Let's stick to the original logic but maybe cleaner.
    const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
}
