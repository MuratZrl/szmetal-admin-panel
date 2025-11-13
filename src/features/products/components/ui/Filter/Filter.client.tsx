// src/features/products/components/Filters.client.tsx
'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import {
  Box,
  Grid,
  Stack,
  TextField,
  MenuItem,
  Typography,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  List,
  ListItemButton,
  ListItemText,
  Collapse,
  Divider,
  InputAdornment,
} from '@mui/material';
import { alpha, type Theme } from '@mui/material/styles';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SearchIcon from '@mui/icons-material/Search';

// MUI X Date Pickers + dayjs
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { type Dayjs } from 'dayjs';
import 'dayjs/locale/tr';

/** Map: slug -> node */
export type CategoryTree = Record<
  string,
  { name: string; subs: { slug: string; name: string }[] }
>;

export type VariantOption = { key: string; name: string };

// Görünür varyant satırı sayısı ve satır yüksekliği
const VISIBLE_VARIANT_ROWS = 7;
const VARIANT_ROW_H_PX = 40;

// Bölüm kutusu stili
const sectionSx = (t: Theme) => ({
  p: 1.25,
  borderRadius: 1.25,
  border: '1px solid',
  borderColor: 'divider',
  backgroundColor: alpha(t.palette.background.paper, 0.6),
  backdropFilter: 'saturate(120%) blur(2px)',
});

export default function Filters({
  topLevelSlugs,
  categoryTree,
  variants,
}: {
  /** Sadece kök slug listesi; dicts.categories */
  topLevelSlugs: string[];
  /** Her düğüm kendi çocuklarını içerir; dicts.categoryTree */
  categoryTree: CategoryTree;
  variants: VariantOption[];
}) {
  const router = useRouter();
  const sp = useSearchParams();

  const collator = React.useMemo(
    () => new Intl.Collator('tr', { sensitivity: 'base', numeric: false }),
    [],
  );

  // Ad ve çocuk yardımcıları
  const catNameOf = React.useCallback(
    (slug: string): string => categoryTree[slug]?.name ?? slug,
    [categoryTree],
  );

  const childrenOf = React.useCallback(
    (slug: string): string[] => (categoryTree[slug]?.subs ?? []).map(s => s.slug),
    [categoryTree],
  );

  // child -> parent map (tek adımlı)
  const parentMap = React.useMemo(() => {
    const m = new Map<string, string>();
    for (const [p, node] of Object.entries(categoryTree)) {
      for (const s of node.subs) m.set(s.slug, p);
    }
    return m;
  }, [categoryTree]);

  // slug'ın kökü
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

  // slug'ın tüm torunları
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

  // Kökleri alfabetik sırala
  const topLevelSorted = React.useMemo(
    () => [...topLevelSlugs].sort((a, b) => collator.compare(catNameOf(a), catNameOf(b))),
    [topLevelSlugs, collator, catNameOf],
  );

  // URL -> state
  const [q, setQ] = React.useState(sp.get('q') ?? '');

  const initialCategories = sp.getAll('category');      // kök seçimleri
  const initialSubCategories = sp.getAll('subCategory'); // kök olmayan tüm seçimler

  const [categories, setCategories] = React.useState<string[]>(initialCategories);
  const [subCategories, setSubCategories] = React.useState<string[]>(initialSubCategories);

  const rawCM = sp.get('customerMold');
  const initialMold = rawCM === 'Evet' || rawCM === 'true' || rawCM === '1';
  const [moldOnly, setMoldOnly] = React.useState<boolean>(initialMold);

  const rawAvail = sp.get('availability');
  const initialAvail =
    !!rawAvail && ['1', 'true', 'on', 'yes', 'evet'].includes(rawAvail.toLowerCase());
  const [availableOnly, setAvailableOnly] = React.useState<boolean>(initialAvail);

  const [variantsSel, setVariantsSel] = React.useState<string[]>(sp.getAll('variants'));
  const [from, setFrom] = React.useState(sp.get('from') ?? '');
  const [to, setTo] = React.useState(sp.get('to') ?? '');
  const [sort, setSort] = React.useState(sp.get('sort') ?? 'date-desc');
  const [variantQuery, setVariantQuery] = React.useState<string>('');

  // İlk açılışta: URL'de işaretli olan her child'ın tüm atalarını expand et
  const [expanded, setExpanded] = React.useState<string[]>(() => {
    const s = new Set<string>(initialCategories);
    for (const sub of initialSubCategories) {
      let cur: string | undefined = sub;
      while (cur && parentMap.has(cur)) {
        const p = parentMap.get(cur);
        if (!p) break;
        s.add(p);
        cur = p;
      }
    }
    return Array.from(s);
  });

  // Tarih yardımcıları
  const toDayjs = React.useCallback((v: string): Dayjs | null => {
    if (!v) return null;
    const d = dayjs(v, 'YYYY-MM-DD', true);
    return d.isValid() ? d : null;
  }, []);
  const toIso = React.useCallback((d: Dayjs | null): string => (d ? d.format('YYYY-MM-DD') : ''), []);

  // Seçim/expand davranışları
  function toggleExpand(slug: string) {
    setExpanded((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
  }

  function toggleNode(slug: string) {
    const isRoot = topLevelSlugs.includes(slug);
    const branchDesc = descendantsOf(slug);
    const selectedNonRoots = new Set<string>(subCategories);
    let nextCategories = [...categories];

    const rootSelected = isRoot && nextCategories.includes(slug);
    const branchAllSelected =
      branchDesc.length > 0 && branchDesc.every((d) => selectedNonRoots.has(d));

    const isSelfSelected = isRoot ? rootSelected || branchAllSelected : selectedNonRoots.has(slug);

    if (isSelfSelected) {
      // dalı komple temizle
      if (isRoot) nextCategories = nextCategories.filter((c) => c !== slug);
      selectedNonRoots.delete(slug);
      for (const d of branchDesc) selectedNonRoots.delete(d);
    } else {
      // dalı seç
      if (isRoot) {
        if (!nextCategories.includes(slug)) nextCategories.push(slug);
      } else {
        selectedNonRoots.add(slug);
      }
      for (const d of branchDesc) selectedNonRoots.add(d);
    }

    // non-root seçimlerinden kökün durumunu türet
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
  }

  // Varyant sıralama/filtre
  const variantsSorted = React.useMemo(() => {
    return [...variants].sort((a, b) => {
      const an = (a.name ?? '').trim();
      const bn = (b.name ?? '').trim();
      const cmp = collator.compare(an, bn);
      return cmp !== 0 ? cmp : collator.compare(a.key, b.key);
    });
  }, [variants, collator]);

  const variantsFiltered = React.useMemo(() => {
    const needle = variantQuery.trim().toLocaleLowerCase('tr');
    if (!needle) return variantsSorted;
    return variantsSorted.filter((v) => {
      const name = (v.name ?? '').toLocaleLowerCase('tr');
      const key = v.key.toLocaleLowerCase('tr');
      return name.includes(needle) || key.includes(needle);
    });
  }, [variantQuery, variantsSorted]);

  // URL yaz
  function apply() {
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    categories.forEach((c) => params.append('category', c));
    subCategories.forEach((s) => params.append('subCategory', s));
    variantsSel.forEach((key) => params.append('variants', key));
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    if (sort) params.set('sort', sort);
    if (moldOnly) params.append('customerMold', 'Evet');
    if (availableOnly) params.set('availability', '1');
    router.replace(`?${params.toString()}`);
  }

  function reset() {
    setQ('');
    setCategories([]);
    setSubCategories([]);
    setExpanded([]);
    setVariantsSel([]);
    setFrom('');
    setTo('');
    setSort('date-desc');
    setMoldOnly(false);
    setAvailableOnly(false);
    setVariantQuery('');
    router.replace(`?`);
  }

  // Bir düğümü (ve çocuklarını) çizen recursive renderer
  function renderNode(slug: string, depth: number) {
    const name = catNameOf(slug);
    const kids = childrenOf(slug);
    const hasKids = kids.length > 0;

    const selected = new Set<string>([...categories, ...subCategories]);
    const desc = descendantsOf(slug);
    const allSelected = desc.length > 0 && desc.every((d) => selected.has(d));
    const someSelected = desc.some((d) => selected.has(d)) && !allSelected;

    const isRoot = topLevelSlugs.includes(slug);
    const checked = selected.has(slug) || (isRoot && allSelected);

    const open =
      expanded.includes(slug) ||
      kids.some((k) => selected.has(k));

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

        {/* Parent → Children arası çizgi (sadece açıkken ve çocuğu varsa) */}
        {open && hasKids ? <Divider sx={{ my: 0.75 /* istersen hizalı: , ml: 1.25 + depth * 2 */ }} /> : null}

        <Collapse in={open} timeout="auto" unmountOnExit>
          <List disablePadding dense>
            {kids.map((child, idx) => (
              <React.Fragment key={child}>
                {renderNode(child, depth + 1)}
                {/* Kardeşler arası çizgi; sonuncuda yok */}
                {idx < kids.length - 1 ? <Divider sx={{ my: 0.75 }} /> : null}
              </React.Fragment>
            ))}
          </List>
        </Collapse>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="tr">
      <Stack spacing={2.25} sx={{ position: 'sticky', top: 16 }}>
        
        {/* Arama */}
        <Box component="section" sx={(t) => sectionSx(t)}>
          <Typography variant="overline" gutterBottom sx={{ opacity: 0.75 }}>Genel Arama</Typography>
          <TextField
            fullWidth
            label="Ara (ad veya kod)"
            size="small"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                apply();
              }
            }}
            inputProps={{ enterKeyHint: 'search' }}
            sx={{ mt: 1.5 }}
          />
        </Box>

        {/* Basit checkbox filtreleri */}
        <Box component="section" sx={(t) => sectionSx(t)}>
          <Typography variant="overline" sx={{ opacity: 0.75 }}>Durumlar</Typography>
          <Box>
            <FormControlLabel
              control={<Checkbox checked={moldOnly} onChange={() => setMoldOnly((p) => !p)} />}
              label="Müşteri Kalıbı"
            />
          </Box>
          <Box>
            <FormControlLabel
              control={<Checkbox checked={availableOnly} onChange={() => setAvailableOnly((p) => !p)} />}
              label="Kullanılabilir"
            />
          </Box>
        </Box>

        {/* Kategoriler (recursive) */}
        <Box component="section" sx={(t) => sectionSx(t)}>
          <Typography variant="overline" sx={{ opacity: 0.75 }} >Kategoriler</Typography>
          <List dense disablePadding>
            {topLevelSorted.map((slug, idx) => (
              <React.Fragment key={slug}>
                {renderNode(slug, 0)}
                {idx < topLevelSorted.length - 1 ? <Divider sx={{ my: 0.75 }} /> : null}
              </React.Fragment>
            ))}
          </List>
        </Box>

        {/* Varyant + arama */}
        <Box component="section" sx={(t) => sectionSx(t)}>
          <Typography variant="overline" sx={{ opacity: 0.75 }} >Profil Çeşidi</Typography>
          <Grid container spacing={1} alignItems="center" sx={{ mt: 1, mb: 1 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Ara"
                value={variantQuery}
                onChange={(e) => setVariantQuery(e.target.value)}
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

          <Box
            sx={{
              maxHeight: VISIBLE_VARIANT_ROWS * VARIANT_ROW_H_PX,
              overflowY: 'auto',
              pr: 1,
            }}
            aria-label="Profil Çeşidi"
          >
            {variantsFiltered.length > 0 ? (
              <FormGroup>
                {variantsFiltered.map((v) => (
                  <FormControlLabel
                    key={v.key}
                    control={
                      <Checkbox
                        checked={variantsSel.includes(v.key)}
                        onChange={() =>
                          setVariantsSel((prev) =>
                            prev.includes(v.key) ? prev.filter((x) => x !== v.key) : [...prev, v.key],
                          )
                        }
                      />
                    }
                    label={v.name}
                  />
                ))}
              </FormGroup>
            ) : (
              <Typography variant="caption" color="text.secondary">
                Sonuç yok
              </Typography>
            )}
          </Box>
        </Box>

        {/* Tarih aralığı */}
        <Box component="section" sx={(t) => sectionSx(t)}>
          <Typography variant="overline" sx={{ marginBottom: 2, opacity: 0.8 }}>Tarih</Typography>
          <Grid container spacing={1} mt={1}>
            <Grid size={{ xs: 6 }}>
              <DatePicker
                label="Tarih baş."
                format="DD/MM/YY"
                value={toDayjs(from)}
                onChange={(val) => setFrom(toIso(val))}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    InputLabelProps: { shrink: true },
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <DatePicker
                label="Tarih bitiş"
                format="DD/MM/YY"
                value={toDayjs(to)}
                onChange={(val) => setTo(toIso(val))}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    InputLabelProps: { shrink: true },
                  },
                }}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Sıralama */}
        <Box component="section" sx={(t) => sectionSx(t)}>
          <Typography variant="overline" sx={{ opacity: 0.75 }}>Sıralama</Typography>
          <TextField
            label="Sırala"
            select
            size="small"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            fullWidth
            sx={{ mt: 1 }}
          >
            <MenuItem value="date-desc">Tarih yeni → eski</MenuItem>
            <MenuItem value="date-asc">Tarih eski → yeni</MenuItem>
            <MenuItem value="weight-asc">Ağırlık artan</MenuItem>
            <MenuItem value="weight-desc">Ağırlık azalan</MenuItem>
            <MenuItem value="code-asc">Kod A → Z</MenuItem>
            <MenuItem value="code-desc">Kod Z → A</MenuItem>
          </TextField>
        </Box>

        {/* Aksiyonlar */}
        <Box component="section" sx={(t) => ({ ...sectionSx(t), p: 1 })}>
          <Grid container spacing={1}>
            <Grid size={{ xs: 6 }}>
              <Button
                fullWidth
                onClick={apply}
                variant="contained"
                color="contrast"
                sx={{ textTransform: 'capitalize' }}
              >
                Uygula
              </Button>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Button
                fullWidth
                onClick={reset}
                variant="outlined"
                color="contrast"
                sx={{ textTransform: 'capitalize' }}
              >
                Sıfırla
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Stack>
    </LocalizationProvider>
  );
}
