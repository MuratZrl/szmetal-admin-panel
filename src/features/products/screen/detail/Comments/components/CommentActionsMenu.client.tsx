'use client';
// src/features/products/screen/detail/Comments/CommentActionsMenu.client.tsx

import * as React from 'react';
import { IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

type Props = {
  disabled?: boolean; // ör: edit modunda, vs.
  onEdit: () => void;
  onDelete: () => void;

  /**
   * Opsiyonel: dışarıdan kontrol etmek istersen.
   * Vermezsen component kendi içinde anchor state tutar.
   */
  anchorEl?: HTMLElement | null;
  open?: boolean;
  onOpenChange?: (nextOpen: boolean) => void;
};

export default function CommentActionsMenu({
  disabled = false,
  onEdit,
  onDelete,
  anchorEl: externalAnchor,
  open: externalOpen,
  onOpenChange,
}: Props): React.JSX.Element {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  const isControlled = typeof externalOpen === 'boolean' || typeof externalAnchor !== 'undefined';
  const usedAnchor = isControlled ? (externalAnchor ?? null) : anchorEl;
  const usedOpen = isControlled ? Boolean(externalOpen) : Boolean(anchorEl);

  const openMenu = (e: React.MouseEvent<HTMLElement>) => {
    if (disabled) return;
    if (isControlled) {
      onOpenChange?.(true);
      return;
    }
    setAnchorEl(e.currentTarget);
  };

  const closeMenu = () => {
    if (isControlled) {
      onOpenChange?.(false);
      return;
    }
    setAnchorEl(null);
  };

  return (
    <>
      <Tooltip placement="bottom" title="Seçenekler" arrow>
        <span>
          <IconButton
            size="small"
            onClick={openMenu}
            aria-label="Yorum menüsü"
            disabled={disabled}
            sx={{ ml: 0.25 }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>

      <Menu
        anchorEl={usedAnchor}
        open={usedOpen}
        onClose={closeMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <MenuItem
          onClick={() => {
            closeMenu();
            onEdit();
          }}
        >
          <EditOutlinedIcon fontSize="small" style={{ marginRight: 8 }} />
          Düzenle
        </MenuItem>

        <MenuItem
          onClick={() => {
            closeMenu();
            onDelete();
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteOutlineIcon fontSize="small" style={{ marginRight: 8 }} />
          Sil
        </MenuItem>
      </Menu>
    </>
  );
}
