// src/utils/date.ts (güncelle)
export function getMonthBounds(date = new Date()) {
  // local date input alır, output UTC ISO string'ları sağlar
  const startOfThisMonth = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
  const startOfLastMonth = new Date(date.getFullYear(), date.getMonth() - 1, 1, 0, 0, 0, 0);
  // Son günün 23:59:59.999 zamanını al (yerel zaman), sonra ISO UTC'ye çevir
  const endOfLastMonth = new Date(date.getFullYear(), date.getMonth(), 0, 23, 59, 59, 999);

  return {
    startOfThisMonth,
    startOfLastMonth,
    endOfLastMonth,
    // kolay kullanım için ISO string'ler de döndür
    startOfThisMonthISO: startOfThisMonth.toISOString(),
    startOfLastMonthISO: startOfLastMonth.toISOString(),
    endOfLastMonthISO: endOfLastMonth.toISOString(),
  };
}
