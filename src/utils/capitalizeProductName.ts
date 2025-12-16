// src/utils/capitalizeProductName.ts
export function capitalizeProductName(input: string): string {
  const raw = (input ?? '').trim().replace(/\s+/g, ' ');
  if (!raw) return raw;

  const words = raw.split(' ');
  const out = words.map((w) => {
    const token = w.trim();
    if (!token) return token;

    // İçinde rakam varsa dokunma (30x15, 1.3mm, T.3152, 42mm vs)
    if (/\d/.test(token)) return token;

    // Tamamen büyük kısaltma ise dokunma (PVC, MY, OFFICE)
    const lettersOnly = token.replace(/[^A-Za-zÇĞİÖŞÜçğıöşü]/g, '');
    if (
      lettersOnly.length >= 2 &&
      lettersOnly === lettersOnly.toLocaleUpperCase('tr-TR')
    ) {
      return token;
    }

    // Normal kelime: lower + ilk harf upper (TR locale)
    const lower = token.toLocaleLowerCase('tr-TR');
    const first = lower.charAt(0).toLocaleUpperCase('tr-TR');
    return first + lower.slice(1);
  });

  return out.join(' ');
}
