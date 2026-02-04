// Utility to get intersection of arrays
export function arrayIntersection<T>(arrays: T[][]): T[] {
  if (arrays.length === 0) return [];
  return arrays.reduce((a, b) => a.filter(x => b.includes(x)));
}
