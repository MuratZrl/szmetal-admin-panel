// src/features/products/screen/detail/Comments/hooks/useCommentMenu.ts
'use client';

import * as React from 'react';

export type CommentMenuState = {
  menuAnchor: HTMLElement | null;
  menuForId: number | null;
  menuOpen: boolean;
  openMenu: (e: React.MouseEvent<HTMLElement>, id: number) => void;
  closeMenu: () => void;
};

export function useCommentMenu(): CommentMenuState {
  const [menuAnchor, setMenuAnchor] = React.useState<HTMLElement | null>(null);
  const [menuForId, setMenuForId] = React.useState<number | null>(null);

  const menuOpen = Boolean(menuAnchor) && menuForId !== null;

  const openMenu = React.useCallback((e: React.MouseEvent<HTMLElement>, id: number) => {
    setMenuAnchor(e.currentTarget);
    setMenuForId(id);
  }, []);

  const closeMenu = React.useCallback(() => {
    setMenuAnchor(null);
    setMenuForId(null);
  }, []);

  return { menuAnchor, menuForId, menuOpen, openMenu, closeMenu };
}
