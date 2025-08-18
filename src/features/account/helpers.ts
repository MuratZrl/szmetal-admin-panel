// src/features/account/helpers.ts
import type { SxProps, Theme } from "@mui/system";

export type RoleKey = "Admin" | "Moderator" | "User" | string;

export const ROLE_LABEL_MAP: Record<string, string> = {
  Admin: "Admin",
  Moderator: "Moderatör",
  User: "Kullanıcı",
};

export function getRoleLabel(role?: RoleKey): string {
  if (!role) return ROLE_LABEL_MAP.User;
  return ROLE_LABEL_MAP[role] ?? role;
}

/**
 * MUI sx uyumlu stil döndürür.
 * Sadece görünüm için; içeriği business logic'ten ayır.
 */
export function getRoleSx(role?: RoleKey): SxProps<Theme> {
  const base = { color: "white", fontWeight: "bold" } as const;

  switch (role) {
    case "Admin":
      return { ...base, background: "linear-gradient(90deg, purple, orangered)" };
    case "Moderator":
      return { ...base, backgroundColor: "darkred" };
    case "User":
    default:
      return { ...base, backgroundColor: "orangered" };
  }
}

/** Alternatif: label + sx tek çağrıda almak istersen */
export function getRoleInfo(role?: RoleKey) {
  return {
    label: getRoleLabel(role),
    sx: getRoleSx(role),
  };
}
