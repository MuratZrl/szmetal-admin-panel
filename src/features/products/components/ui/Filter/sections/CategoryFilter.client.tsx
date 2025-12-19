// src/features/products/components/ui/Filter/sections/CategoryFilter.client.tsx
'use client';

import * as React from 'react';
import {
  Box,
  Checkbox,
  Collapse,
  Divider,
  FormControlLabel,
  Grid,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SearchIcon from '@mui/icons-material/Search';

import type { CategoryTree } from '../types';
import { sectionSx } from '../sectionSx';
import { CATEGORY_ROW_H_PX, VISIBLE_CATEGORY_ROWS } from '../constants';

type CategoryFilterSectionProps = {
  topLevelSlugs: string[]; // en üst kategori slug listesi
  categoryTree: CategoryTree; // tüm kategori ağacı (slug -> node)
  categories: string[]; // seçili root kategoriler
  subCategories: string[]; // seçili alt kategoriler
  expanded: string[]; // açık olan node slug'ları
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
}: CategoryFilterSectionProps): React.JSX.Element {
  // Türkçe sıralama için collator
  const collator = React.useMemo(
    () => new Intl.Collator('tr', { sensitivity: 'base', numeric: false }),
    [],
  );

  // Üstteki "Ara" input state'i
  const [categoryQuery, setCategoryQuery] = React.useState<string>('');

  // Arama terimi normalize (trim + tr lowercase)
  const needle = React.useMemo(() => categoryQuery.trim().toLocaleLowerCase('tr'), [categoryQuery]);
  const queryActive = needle.length > 0; // arama açık mı?

  // Slug -> görünen isim
  const catNameOf = React.useCallback(
    (slug: string): string => categoryTree[slug]?.name ?? slug,
    [categoryTree],
  );

  // Slug -> çocuk slug'lar
  const childrenOf = React.useCallback(
    (slug: string): string[] => (categoryTree[slug]?.subs ?? []).map((s) => s.slug),
    [categoryTree],
  );

  // childSlug -> parentSlug map (root bulmak ve ancestor zinciri için)
  const parentMap = React.useMemo(() => {
    const m = new Map<string, string>();
    for (const [p, node] of Object.entries(categoryTree)) {
      for (const s of node.subs) m.set(s.slug, p);
    }
    return m;
  }, [categoryTree]);

  // Bir slug'ın hangi top-level root'a bağlı olduğunu bul
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

  // Bir node'un tüm alt torunlarını (descendants) çıkar
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

  // Root kategorileri Türkçe isme göre sırala
  const topLevelSorted = React.useMemo(
    () => [...topLevelSlugs].sort((a, b) => collator.compare(catNameOf(a), catNameOf(b))),
    [topLevelSlugs, collator, catNameOf],
  );

  // Node expand/collapse toggle (sadece UI aç/kapa)
  const toggleExpand = React.useCallback(
    (slug: string) => {
      setExpanded((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
    },
    [setExpanded],
  );

  // Node seçimi toggle (checkbox davranışı, tree selection mantığı)
  const toggleNode = React.useCallback(
    (slug: string) => {
      const isRoot = topLevelSlugs.includes(slug);
      const branchDesc = descendantsOf(slug);

      // subCategories set gibi kullan
      const selectedNonRoots = new Set<string>(subCategories);
      let nextCategories = [...categories];

      // root seçili mi?
      const rootSelected = isRoot && nextCategories.includes(slug);

      // root değilse: dalın tüm torunları seçili mi?
      const branchAllSelected = branchDesc.length > 0 && branchDesc.every((d) => selectedNonRoots.has(d));

      // "bu node seçili sayılır mı?" kararı
      const isSelfSelected = isRoot ? rootSelected || branchAllSelected : selectedNonRoots.has(slug);

      if (isSelfSelected) {
        // seçimi kaldır
        if (isRoot) nextCategories = nextCategories.filter((c) => c !== slug);
        selectedNonRoots.delete(slug);
        for (const d of branchDesc) selectedNonRoots.delete(d);
      } else {
        // seçimi ekle
        if (isRoot) {
          if (!nextCategories.includes(slug)) nextCategories.push(slug);
        } else {
          selectedNonRoots.add(slug);
        }
        for (const d of branchDesc) selectedNonRoots.add(d);
      }

      // root olmayan bir node seçildiyse: bağlı root tam seçili mi kontrol et
      if (!isRoot) {
        const root = rootOf(slug);
        if (root) {
          const all = descendantsOf(root).every((d) => selectedNonRoots.has(d));
          nextCategories = all
            ? Array.from(new Set([...nextCategories, root]))
            : nextCategories.filter((c) => c !== root);
        }
      }

      // state commit
      setCategories(nextCategories);
      setSubCategories(Array.from(selectedNonRoots));

      // seçilince otomatik genişlet (UX)
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

  // Arama eşleşen slug'lar (isim veya slug içinde needle geçiyorsa)
  const matchSet = React.useMemo(() => {
    if (!queryActive) return null;
    const m = new Set<string>();
    const keys = Object.keys(categoryTree);
    for (const slug of keys) {
      const name = (categoryTree[slug]?.name ?? slug).toLocaleLowerCase('tr');
      const s = slug.toLocaleLowerCase('tr');
      if (name.includes(needle) || s.includes(needle)) m.add(slug);
    }
    return m;
  }, [queryActive, needle, categoryTree]);

  // Aramada görünmesi gereken node'lar: eşleşenler + onların ancestor zinciri + root güvenliği
  const visibleSet = React.useMemo(() => {
    if (!queryActive || !matchSet || matchSet.size === 0) return null;

    const vis = new Set<string>();

    // eşleşen node'dan yukarı doğru tüm parent'ları ekle
    const addAncestors = (slug: string) => {
      let cur: string | undefined = slug;
      const seen = new Set<string>();
      while (cur) {
        vis.add(cur);
        const p = parentMap.get(cur);
        if (!p || seen.has(p)) break;
        seen.add(p);
        cur = p;
      }
    };

    for (const s of matchSet) addAncestors(s);

    // root zinciri eksik olursa root'u yine de ekle
    for (const s of matchSet) {
      const r = rootOf(s);
      if (r) vis.add(r);
    }

    return vis;
  }, [queryActive, matchSet, parentMap, rootOf]);

  // Arama varken root listesi de filtrelensin
  const topLevelFiltered = React.useMemo(() => {
    if (!queryActive) return topLevelSorted;
    if (!visibleSet) return [];
    return topLevelSorted.filter((root) => visibleSet.has(root));
  }, [queryActive, topLevelSorted, visibleSet]);

  // Recursive render: tek bir node ve alt ağacı
  function renderNode(slug: string, depth: number): React.JSX.Element | null {
    // aramada görünmeyecekse render etme
    if (queryActive && visibleSet && !visibleSet.has(slug)) return null;

    const name = catNameOf(slug);

    // çocukları sırala ve gerekirse aramaya göre filtrele
    const kidsAll = childrenOf(slug).sort((a, b) => collator.compare(catNameOf(a), catNameOf(b)));
    const kids = queryActive && visibleSet ? kidsAll.filter((k) => visibleSet.has(k)) : kidsAll;

    const hasKids = kidsAll.length > 0;

    // seçili set: root + sub'lar
    const selected = new Set<string>([...categories, ...subCategories]);

    // checkbox state (checked/indeterminate)
    const desc = descendantsOf(slug);
    const allSelected = desc.length > 0 && desc.every((d) => selected.has(d));
    const someSelected = desc.some((d) => selected.has(d)) && !allSelected;

    const isRoot = topLevelSlugs.includes(slug);
    const checked = selected.has(slug) || (isRoot && allSelected);

    // aramada otomatik açık göster; normalde expanded/selected ile aç
    const open = queryActive ? kids.length > 0 : expanded.includes(slug) || kidsAll.some((k) => selected.has(k));

    return (
      <Box key={slug}>
        <ListItemButton
          disableRipple
          disableTouchRipple
          // aramada aç/kapa yok (otomatik açık), normalde expand toggle
          onClick={() => {
            if (!queryActive) toggleExpand(slug);
          }}
          sx={{
            // depth ile içeri kaydırma
            pl: 1.25 + depth * 2,
            pr: 1,
            display: 'flex',
            alignItems: 'center',
            borderRadius: 1,
            minHeight: CATEGORY_ROW_H_PX,
          }}
        >
          {/* Checkbox + metin: Variant ile aynı hizayı korumak için m:0 + width:1 */}
          <FormControlLabel
            sx={{
              m: 0,
              width: 1,
              flex: 1,
              minWidth: 0,
              '& .MuiFormControlLabel-label': {
                flex: 1,
                minWidth: 0,
              },
            }}
            control={
              <Checkbox
                checked={checked}
                indeterminate={!checked && someSelected}
                // checkbox tıklanınca expand tetiklenmesin
                onChange={(e) => {
                  e.stopPropagation();
                  toggleNode(slug);
                }}
                onClick={(e) => e.stopPropagation()}
              />
            }
            label={<ListItemText primary={name} />}
          />

          {/* Ok ikonu: sabit genişlikli kutu, hizayı bozmaması için */}
          <Box
            sx={{
              width: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: hasKids ? 1 : 0,
              pointerEvents: 'none',
            }}
            aria-hidden
          >
            <KeyboardArrowDownIcon
              sx={{
                transition: 'transform 0.2s ease',
                transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            />
          </Box>
        </ListItemButton>

        {/* açık node varsa araya divider */}
        {open && hasKids ? <Divider sx={{ my: 0.75 }} /> : null}

        {/* alt liste (collapse) */}
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
    <Box
      component="section"
      sx={(t) => ({
        ...sectionSx(t),
        borderRadius: 2.25,
      })}
    >
      <Typography variant="overline" sx={{ opacity: 0.75 }}>
        Kategoriler
      </Typography>

      {/* Başlık ile içerik arasında düz renk separator */}
      <Box
        sx={(t) => ({
          mt: 1,
          mb: 1.5,
          height: 2,
          borderRadius: 999,
          bgcolor: t.palette.divider,
        })}
      />

      {/* Arama inputu (Variant ile aynı stil) */}
      <Grid container spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Ara"
            value={categoryQuery}
            onChange={(e) => setCategoryQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              sx: {
                height: 32,
                '& .MuiInputBase-input': { py: 0.25, fontSize: 12.5 },
                '& .MuiInputAdornment-root': { mr: 0.25 },
                '& .MuiSvgIcon-root': { fontSize: 18 },
              },
            }}
          />
        </Grid>
      </Grid>

      {/* Scroll alanı */}
      <Box
        sx={{
          maxHeight: VISIBLE_CATEGORY_ROWS * CATEGORY_ROW_H_PX,
          overflowY: 'auto',
          pr: 1,
        }}
      >
        {/* Aramada boş sonuç */}
        {queryActive && topLevelFiltered.length === 0 ? (
          <Typography variant="caption" color="text.secondary">
            Sonuç yok
          </Typography>
        ) : (
          <List dense disablePadding>
            {topLevelFiltered.map((slug, idx) => (
              <React.Fragment key={slug}>
                {renderNode(slug, 0)}
                {idx < topLevelFiltered.length - 1 ? <Divider sx={{ my: 0.75 }} /> : null}
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
}
