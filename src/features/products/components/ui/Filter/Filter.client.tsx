// src/features/products/components/Filters.client.tsx
'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import {
  Box,
  Stack,              // ← eklendi
  Grid,
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
import { alpha } from '@mui/material/styles';   // ← eklendi
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SearchIcon from '@mui/icons-material/Search';

// MUI X Date Pickers + dayjs
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/tr';

export type CategoryTree = Record<
  string, // slug
  { name: string; subs: { slug: string; name: string }[] }
>;

export type VariantOption = { key: string; name: string };

// Kaç satır görünsün ve bir satır yaklaşık kaç px olsun
const VISIBLE_VARIANT_ROWS = 7;
const VARIANT_ROW_H_PX = 40;

// Bölüm görünümü: yumuşak zemin, ince çerçeve, köşe
const sectionSx = (t: any) => ({
  p: 1.25,
  borderRadius: 1.25,
  border: '1px solid',
  borderColor: 'divider',
  backgroundColor: alpha(t.palette.background.paper, 0.6),
  backdropFilter: 'saturate(120%) blur(2px)',
});

export default function Filters({
  categoryTree,
  variants,
}: {
  categoryTree: CategoryTree;
  variants: VariantOption[];
}) {
  // Yardımcılar: slug listesi ve görünen ad
  const subsOf = React.useCallback(
    (catSlug: string): string[] => {
      const raw = (categoryTree as unknown as Record<string, unknown>)[catSlug];
      if (Array.isArray(raw)) return raw;
      const node = raw as CategoryTree[string] | undefined;
      return node?.subs?.map((s) => s.slug) ?? [];
    },
    [categoryTree],
  );

  const collator = React.useMemo(
    () => new Intl.Collator('tr', { sensitivity: 'base', numeric: false }),
    [],
  );

  const catNameOf = React.useCallback(
    (catSlug: string): string => {
      const raw = (categoryTree as unknown as Record<string, unknown>)[catSlug];
      if (Array.isArray(raw)) return catSlug;
      const node = raw as CategoryTree[string] | undefined;
      return (node?.name ?? catSlug).trim();
    },
    [categoryTree],
  );

  // Sıralı kategori slug'ları:
  const catSlugsSorted = React.useMemo(() => {
    return Object.keys(categoryTree).sort((a, b) => collator.compare(catNameOf(a), catNameOf(b)));
  }, [categoryTree, collator, catNameOf]);

  const variantsSorted = React.useMemo(() => {
    return [...variants].sort((a, b) => {
      const an = (a.name ?? '').trim();
      const bn = (b.name ?? '').trim();
      const cmp = collator.compare(an, bn);
      return cmp !== 0 ? cmp : collator.compare(a.key, b.key);
    });
  }, [variants, collator]);

  const router = useRouter();
  const sp = useSearchParams();

  // URL -> state
  const initialCategories = sp.getAll('category');
  const initialSubCategories = sp.getAll('subCategory');

  // Müşteri kalıbı
  const rawCM = sp.get('customerMold');
  const initialMold = rawCM === 'Evet' || rawCM === 'true' || rawCM === '1';

  const [q, setQ] = React.useState(sp.get('q') ?? '');
  const [categories, setCategories] = React.useState<string[]>(initialCategories);
  const [subCategories, setSubCategories] = React.useState<string[]>(initialSubCategories);

  const [moldOnly, setMoldOnly] = React.useState<boolean>(initialMold);

  // Expand başlangıcı: URL'de seçili olan parent veya child açık gelsin
  const [expanded, setExpanded] = React.useState<string[]>(() => {
    const set = new Set<string>(initialCategories);
    for (const catSlug of Object.keys(categoryTree)) {
      const subs = subsOf(catSlug);
      if (subs.some((s) => initialSubCategories.includes(s))) set.add(catSlug);
    }
    return Array.from(set);
  });

  const [variantsSel, setVariantsSel] = React.useState<string[]>(sp.getAll('variants'));

  const [from, setFrom] = React.useState(sp.get('from') ?? '');
  const [to, setTo] = React.useState(sp.get('to') ?? '');
  const [sort, setSort] = React.useState(sp.get('sort') ?? 'date-desc');

  // Varyant arama (yalnızca yerel state; URL’e koymuyoruz)
  const [variantQuery, setVariantQuery] = React.useState<string>('');

  // dayjs <-> string yardımcıları
  const toDayjs = React.useCallback((v: string): Dayjs | null => {
    if (!v) return null;
    const d = dayjs(v, 'YYYY-MM-DD', true);
    return d.isValid() ? d : null;
  }, []);

  const toIso = React.useCallback((d: Dayjs | null): string => {
    return d ? d.format('YYYY-MM-DD') : '';
  }, []);

  // Kullanılabilir (true) filtresi
  const rawAvail = sp.get('availability');
  const initialAvail =
    !!rawAvail && ['1', 'true', 'on', 'yes', 'evet'].includes(rawAvail.toLowerCase());
  const [availableOnly, setAvailableOnly] = React.useState<boolean>(initialAvail);

  function toggleExpand(cat: string) {
    setExpanded((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]));
  }

  function toggleCategory(cat: string) {
    const subs = subsOf(cat);
    setCategories((prev) => {
      const exists = prev.includes(cat);
      if (exists) {
        setSubCategories((scs) => scs.filter((s) => !subs.includes(s)));
        return prev.filter((c) => c !== cat);
      } else {
        setSubCategories((scs) => Array.from(new Set([...scs, ...subs])));
        setExpanded((exp) => (exp.includes(cat) ? exp : [...exp, cat]));
        return [...prev, cat];
      }
    });
  }

  function toggleSubCategory(cat: string, sub: string) {
    const subs = subsOf(cat);
    setSubCategories((prev) => {
      const next = prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub];
      const allSelected = subs.every((s) => next.includes(s));
      setCategories((prevCats) =>
        allSelected ? (prevCats.includes(cat) ? prevCats : [...prevCats, cat]) : prevCats.filter((c) => c !== cat),
      );
      setExpanded((exp) => (exp.includes(cat) ? exp : [...exp, cat]));
      return next;
    });
  }

  function toggleVariant(key: string) {
    setVariantsSel((prev) => (prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]));
  }

  // Varyant listesi filtreleme (TR/küçük-büyük duyarsız)
  const variantsFiltered = React.useMemo(() => {
    const needle = variantQuery.trim().toLocaleLowerCase('tr');
    if (!needle) return variantsSorted;
    return variantsSorted.filter((v) => {
      const name = (v.name ?? '').toLocaleLowerCase('tr');
      const key = v.key.toLocaleLowerCase('tr');
      return name.includes(needle) || key.includes(needle);
    });
  }, [variantQuery, variantsSorted]);

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

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="tr">
      {/* Bölümler arası boşluğu Stack yönetiyor */}
      <Stack spacing={2.25} sx={{ position: 'sticky', top: 16 }}>
        
        {/* Arama */}
        <Box component="section" sx={(t) => sectionSx(t)}>
          <Typography variant="overline" sx={{ opacity: 0.8 }}>Genel Arama</Typography>
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
            sx={{ mt: 1 }}
          />
        </Box>

        {/* Basit checkbox filtreleri */}
        <Box component="section" sx={(t) => sectionSx(t)}>
          <Typography variant="overline" sx={{ opacity: 0.8 }}>Durumlar</Typography>
          <Box >
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

        {/* Kategori */}
        <Box component="section" sx={(t) => sectionSx(t)}>
          <Typography variant="overline" sx={{ opacity: 0.8 }}>Kategoriler</Typography>
          <List dense disablePadding sx={{}}>
            {catSlugsSorted.map((catSlug) => {
              const raw = (categoryTree as unknown as Record<string, unknown>)[catSlug];
              const node = Array.isArray(raw)
                ? { name: catSlug, subs: raw.map((sl) => ({ slug: sl, name: sl })) }
                : ((raw as CategoryTree[string] | undefined) ?? { name: catSlug, subs: [] });
              const { name, subs } = node;

              const subSlugs = subs.map((s) => s.slug);
              const hasSubs = subSlugs.length > 0;

              const open =
                expanded.includes(catSlug) ||
                categories.includes(catSlug) ||
                subSlugs.some((s) => subCategories.includes(s));

              const allSelected = hasSubs && subSlugs.every((s) => subCategories.includes(s));
              const someSelected = hasSubs && subSlugs.some((s) => subCategories.includes(s));

              const catChecked = categories.includes(catSlug) || allSelected;

              return (
                <Box key={catSlug}>
                  <ListItemButton
                    disableRipple
                    disableTouchRipple
                    onClick={() => toggleExpand(catSlug)}
                    sx={{ display: 'flex', justifyContent: 'space-between', borderRadius: 1 }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={catChecked}
                          indeterminate={!allSelected && someSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleCategory(catSlug);
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
                        opacity: subs.length ? 1 : 0,
                        pointerEvents: 'none',
                      }}
                    />
                  </ListItemButton>

                  <Collapse in={open} timeout="auto" unmountOnExit>
                    <List disablePadding dense sx={{ pl: 3 }}>
                      {subs.map(({ slug: subSlug, name: subLabel }) => (
                        <ListItemButton
                          key={subSlug}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSubCategory(catSlug, subSlug);
                          }}
                          sx={{ borderRadius: 1 }}
                        >
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={subCategories.includes(subSlug)}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  toggleSubCategory(catSlug, subSlug);
                                }}
                                onClick={(e) => e.stopPropagation()}
                              />
                            }
                            label={<ListItemText primary={subLabel} />}
                          />
                        </ListItemButton>
                      ))}
                    </List>
                  </Collapse>
                  <Divider sx={{ my: 0.75 }} />
                </Box>
              );
            })}
          </List>
        </Box>

        {/* Varyant + arama */}
        <Box component="section" sx={(t) => sectionSx(t)}>
          <Typography variant="overline" sx={{ opacity: 0.8 }}>Profil Çeşidi</Typography>

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
                        onChange={() => toggleVariant(v.key)}
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
          <Typography variant="overline" sx={{ opacity: 0.8 }}>Sıralama</Typography>
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
