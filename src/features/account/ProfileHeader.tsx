// src/features/account/ProfileHeader.tsx
"use client";

import React from "react";
import { Avatar, Box, Typography, Chip, Button } from "@mui/material";
import type { SxProps, Theme } from "@mui/system";
import type { UserData } from "./useAccount";

export type ProfileHeaderProps = {
  userData: UserData;
  /**
   * File olabilir veya undefined (ör. input temizlendi).
   * Parent component bu file'ı upload handler'a verecek.
   */
  onUploadClick: (file?: File) => void;
  onRemove: () => void;
  uploading: boolean;
  roleLabel: string;
  roleStyle?: SxProps<Theme>;
};

export default function ProfileHeader({
  userData,
  onUploadClick,
  onRemove,
  uploading,
  roleLabel,
  roleStyle,
}: ProfileHeaderProps) {
  return (
    <Box display="flex" alignItems="center" justifyContent="space-between" gap={2} mb={3}>
      <Box display="flex" alignItems="center" gap={2}>
        <Avatar
          src={userData?.image ?? "/avatar.jpg"}
          sx={{ width: 64, height: 64 }}
          alt={userData?.username ?? "Avatar"}
        />
        <Box>
          <Typography fontWeight={600}>
            {userData?.username ?? "Yükleniyor..."}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {userData?.email ?? ""}
          </Typography>
          <Chip label={roleLabel} size="small" sx={{ mt: 1, ...(roleStyle ?? {}) }} />
        </Box>
      </Box>

      <Box display="flex" gap={1}>
        <Button component="label" variant="outlined" size="small">
          {uploading ? "Yükleniyor..." : "Resim Yükle"}
          <input
            hidden
            accept="image/*"
            type="file"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const file = e.currentTarget.files?.[0];
              onUploadClick(file);
              // temizlemek istersen: e.currentTarget.value = '';
            }}
          />
        </Button>

        <Button
          variant="text"
          color="error"
          size="small"
          onClick={onRemove}
        >
          Kaldır
        </Button>
      </Box>
    </Box>
  );
}
