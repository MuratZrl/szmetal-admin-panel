// src/features/products/components/ui/Filter/sections/CategoryFilterSection.tsx
'use client';

import * as React from 'react';
import {
  Box,
  Checkbox,
  Collapse,
  Divider,
  FormControlLabel,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

import type { CategoryTree } from '../types';
import { sectionSx } from '../sectionSx';
import { CATEGORY_ROW_H_PX, VISIBLE_CATEGORY_ROWS } from '../constants';

type CategoryFilterSectionProps = {
  topLevelSlugs: string[];
  categoryTree: CategoryTree;
  categories: string[];
  subCategories: string[];
  expanded: string[];
  setCategories: React.Dispatch<React.SetStateAction<string[]>>;
  setSubCategories: React.Dispatch<React.SetStateAction<string[]>>;
  setExpanded: React.Dispatch<React.SetStateAction<string[]>>;
};

export function CategoryFilterSection({
  topLevelSlugs,
  categoryTree,
  categories,
  subCategories,
  expanded,
  setCategories,
  setSubCategories,
  setExpanded,
}: CategoryFilterSectionProps) {
  const collator = React.useMemo(
    () => new Intl.Collator('tr', { sensitivity: 'base', numeric: false }),
    [],
  );

  const catNameOf = React.useCallback(
    (slug: string): string => categoryTree[slug]?.name ?? slug,
    [categoryTree],
  );

  const childrenOf = React.useCallback(
    (slug: string): string[] => (categoryTree[slug]?.subs ?? []).map((s) => s.slug),
    [categoryTree],
  );

  const parentMap = React.useMemo(() => {
    const m = new Map<string, string>();
    for (const [p, node] of Object.entries(categoryTree)) {
      for (const s of node.subs) m.set(s.slug, p);
    }
    return m;
  }, [categoryTree]);

  const rootOf = React.useCallback(
    (slug: string): string | null => {
      let cur: string | undefined = slug;
      const seen = new Set<string>();
      while (cur) {
        if (topLevelSlugs.includes(cur)) return cur;
        const p = parentMap.get(cur);
        if (!p || seen.has(p)) return null;
        seen.add(p);
        cur = p;
      }
      return null;
    },
    [parentMap, topLevelSlugs],
  );

  const descendantsOf = React.useCallback(
    (slug: string): string[] => {
      const out: string[] = [];
      const stack: string[] = [...childrenOf(slug)];
      while (stack.length) {
        const s = stack.pop() as string;
        out.push(s);
        const kids = childrenOf(s);
        for (const k of kids) stack.push(k);
      }
      return Array.from(new Set(out));
    },
    [childrenOf],
  );

  const topLevelSorted = React.useMemo(
    () => [...topLevelSlugs].sort((a, b) => collator.compare(catNameOf(a), catNameOf(b))),
    [topLevelSlugs, collator, catNameOf],
  );

  const toggleExpand = React.useCallback(
    (slug: string) => {
      setExpanded((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
    },
    [setExpanded],
  );

  const toggleNode = React.useCallback(
    (slug: string) => {
      const isRoot = topLevelSlugs.includes(slug);
      const branchDesc = descendantsOf(slug);
      const selectedNonRoots = new Set<string>(subCategories);
      let nextCategories = [...categories];

      const rootSelected = isRoot && nextCategories.includes(slug);
      const branchAllSelected =
        branchDesc.length > 0 && branchDesc.every((d) => selectedNonRoots.has(d));

      const isSelfSelected = isRoot ? rootSelected || branchAllSelected : selectedNonRoots.has(slug);

      if (isSelfSelected) {
        if (isRoot) nextCategories = nextCategories.filter((c) => c !== slug);
        selectedNonRoots.delete(slug);
        for (const d of branchDesc) selectedNonRoots.delete(d);
      } else {
        if (isRoot) {
          if (!nextCategories.includes(slug)) nextCategories.push(slug);
        } else {
          selectedNonRoots.add(slug);
        }
        for (const d of branchDesc) selectedNonRoots.add(d);
      }

      if (!isRoot) {
        const root = rootOf(slug);
        if (root) {
          const all = descendantsOf(root).every((d) => selectedNonRoots.has(d));
          nextCategories = all
            ? Array.from(new Set([...nextCategories, root]))
            : nextCategories.filter((c) => c !== root);
        }
      }

      setCategories(nextCategories);
      setSubCategories(Array.from(selectedNonRoots));
      setExpanded((prev) => (prev.includes(slug) ? prev : [...prev, slug]));
    },
    [
      categories,
      subCategories,
      descendantsOf,
      rootOf,
      topLevelSlugs,
      setCategories,
      setSubCategories,
      setExpanded,
    ],
  );

  function renderNode(slug: string, depth: number) {
    const name = catNameOf(slug);
    const kids = childrenOf(slug).sort((a, b) => collator.compare(catNameOf(a), catNameOf(b)));
    const hasKids = kids.length > 0;

    const selected = new Set<string>([...categories, ...subCategories]);
    const desc = descendantsOf(slug);
    const allSelected = desc.length > 0 && desc.every((d) => selected.has(d));
    const someSelected = desc.some((d) => selected.has(d)) && !allSelected;

    const isRoot = topLevelSlugs.includes(slug);
    const checked = selected.has(slug) || (isRoot && allSelected);

    const open = expanded.includes(slug) || kids.some((k) => selected.has(k));

    return (
      <Box key={slug}>
        <ListItemButton
          disableRipple
          disableTouchRipple
          onClick={() => toggleExpand(slug)}
          sx={{
            pl: 1.25 + depth * 2,
            display: 'flex',
            justifyContent: 'space-between',
            borderRadius: 1,
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={checked}
                indeterminate={!checked && someSelected}
                onChange={(e) => {
                  e.stopPropagation();
                  toggleNode(slug);
                }}
                onClick={(e) => e.stopPropagation()}
              />
            }
            label={<ListItemText primary={name} />}
          />

          <KeyboardArrowDownIcon
            aria-hidden
            sx={{
              transition: 'transform 0.2s ease',
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              opacity: hasKids ? 1 : 0,
              pointerEvents: 'none',
            }}
          />
        </ListItemButton>

        {open && hasKids ? <Divider sx={{ my: 0.75 }} /> : null}

        <Collapse in={open} timeout="auto" unmountOnExit>
          <List disablePadding dense>
            {kids.map((child, idx) => (
              <React.Fragment key={child}>
                {renderNode(child, depth + 1)}
                {idx < kids.length - 1 ? <Divider sx={{ my: 0.75 }} /> : null}
              </React.Fragment>
            ))}
          </List>
        </Collapse>
      </Box>
    );
  }

  return (
    <Box component="section" sx={(t) => sectionSx(t)}>
      <Typography variant="overline" sx={{ opacity: 0.75 }}>
        Kategoriler
      </Typography>

      <Box
        sx={{
          maxHeight: VISIBLE_CATEGORY_ROWS * CATEGORY_ROW_H_PX,
          overflowY: 'auto',
          pr: 1,
        }}
      >
        <List dense disablePadding>
          {topLevelSorted.map((slug, idx) => (
            <React.Fragment key={slug}>
              {renderNode(slug, 0)}
              {idx < topLevelSorted.length - 1 ? <Divider sx={{ my: 0.75 }} /> : null}
            </React.Fragment>
          ))}
        </List>
      </Box>
    </Box>
  );
}
