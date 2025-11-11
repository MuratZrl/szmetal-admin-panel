// src/features/products/components/Filters.client.tsx
'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import {
  Box,
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
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

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
      // runtime compat: eski şema (string[]) mı, yeni şema mı?
      const raw = (categoryTree as unknown as Record<string, unknown>)[catSlug];
      if (Array.isArray(raw)) return raw; // eski: ['katlanir-cam', ...]
      const node = raw as CategoryTree[string] | undefined; // yeni: { name, subs: [...] }
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
      if (Array.isArray(raw)) return catSlug; // eski şema: ad = slug
      const node = raw as CategoryTree[string] | undefined; // yeni şema
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

  // Müşteri kalıbı state'i
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
    router.replace(`?`);
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="tr">
      <Box className="space-y-4" sx={{ position: 'sticky', top: 16 }}>
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
        />

        <Box mt={1}>
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

        <Box>
          <Typography variant="body2" gutterBottom mt={2}>
            Kategoriler
          </Typography>

          <List dense disablePadding>
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
                      sx={{ m: 0 }}
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
                            sx={{ m: 0 }}
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
                  <Divider sx={{ my: 0.5 }} />
                </Box>
              );
            })}
          </List>
        </Box>

        <Box>
          <Typography variant="body2" gutterBottom mt={2}>
            Varyant
          </Typography>

          <Box
            sx={{
              maxHeight: VISIBLE_VARIANT_ROWS * VARIANT_ROW_H_PX,
              overflowY: 'auto',
              pr: 1,
            }}
            aria-label="Varyant filtreleri"
          >
            <FormGroup>
              {variantsSorted.map((v) => (
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
          </Box>
        </Box>

        <Grid container spacing={1} my={3}>
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

        <TextField
          label="Sırala"
          select
          size="small"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          fullWidth
          sx={{ mb: 3 }}
        >
          <MenuItem value="date-desc">Tarih yeni → eski</MenuItem>
          <MenuItem value="date-asc">Tarih eski → yeni</MenuItem>
          <MenuItem value="weight-asc">Ağırlık artan</MenuItem>
          <MenuItem value="weight-desc">Ağırlık azalan</MenuItem>
          <MenuItem value="code-asc">Kod A → Z</MenuItem>
          <MenuItem value="code-desc">Kod Z → A</MenuItem>
        </TextField>

        <Grid container spacing={1}>

          <Grid size={{ xs: 6 }}>
            <Button 
              fullWidth 
              onClick={apply} 
              variant="contained" 
              color='contrast' 
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
              color='contrast'
              sx={{ textTransform: 'capitalize' }
            }>
              Sıfırla
            </Button>
          </Grid>

        </Grid>
      </Box>
    </LocalizationProvider>
  );
}
