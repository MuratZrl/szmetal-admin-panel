export const TR_TOKEN_FIXES: Readonly<Record<string, string>> = {
  surme: 'Sürme',
  katlanir: 'Katlanır',
  cita: 'Çıta',
  kapi: 'Kapı',
  isicam: 'Isıcam',
  cam: 'Cam',
  balkon: 'Balkon',
  // ihtiyaca göre ekle
};

function capitalizeTr(word: string): string {
  if (!word) return word;
  const lower = word.toLocaleLowerCase('tr-TR');
  return lower[0].toLocaleUpperCase('tr-TR') + lower.slice(1);
}

/** 'surme-cam-balkon' → 'Sürme Cam Balkon'
 *  Önce labels sözlüğünden dener, yoksa token bazlı düzeltme uygular. */
export function prettyTr(input?: string | null, dict?: Record<string, string>): string {
  if (!input) return '';
  // exact match (ör. slug → label map)
  if (dict && dict[input]) return dict[input];
  // token düzeltme
  return input
    .split(/[-_\s]+/g)
    .filter(Boolean)
    .map(t => TR_TOKEN_FIXES[t.toLocaleLowerCase('tr-TR')] ?? capitalizeTr(t))
    .join(' ');
}
