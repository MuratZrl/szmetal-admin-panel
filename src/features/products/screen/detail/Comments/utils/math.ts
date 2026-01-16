// src/features/products/screen/detail/Comments/utils/math.ts

/**
 * Sayıyı [min, max] aralığında sınırlar.
 */
export function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}
