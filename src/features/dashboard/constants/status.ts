// src/constants/requests/status.ts
export type RequestStatus = 'pending' | 'approved' | 'rejected';

export const STATUS_LABELS_TR: Record<RequestStatus, string> = {
  pending: 'Bekleyen',
  approved: 'Onaylanan',
  rejected: 'Reddedilen',
};

export function statusLabelTR(raw: string): string {
  const s = raw?.toLowerCase() as RequestStatus;
  return STATUS_LABELS_TR[s] ?? raw;
}

// Anlamlı sabit renkler (MUI'nin default'larına yakın)
export const STATUS_COLORS_HEX: Record<RequestStatus, string> = {
  approved: '#2e7d32', // success.main
  pending:  '#ed6c02', // warning.main
  rejected: '#d32f2f', // error.main
};
