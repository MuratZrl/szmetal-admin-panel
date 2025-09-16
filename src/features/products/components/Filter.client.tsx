// src/features/products/components/Filters.client.tsx
'use client';

import * as React from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import {
  Box, Grid, TextField, MenuItem, Typography, Button,
  FormGroup, FormControlLabel, Checkbox, List, ListItemButton,
  ListItemText, Collapse, Divider
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

export type CategoryTree = Record<
  string, // slug
  { name: string; subs: { slug: string; name: string }[] }
>;

export type VariantOption = { key: string; name: string };

export default function Filters({
  categoryTree,
  variants,
}: {
  categoryTree: CategoryTree;
  variants: VariantOption[];
}) {
  
  // Yardımcılar: slug listesi ve görünen ad
  const subsOf = React.useCallback((catSlug: string): string[] => {
    // runtime compat: eski şema (string[]) mı, yeni şema mı?
    const raw = (categoryTree as unknown as Record<string, unknown>)[catSlug];
    if (Array.isArray(raw)) return raw; // eski: ['katlanir-cam', ...]
    const node = raw as CategoryTree[string] | undefined; // yeni: { name, subs: [...] }
    return node?.subs?.map(s => s.slug) ?? [];
  }, [categoryTree]);

  const router = useRouter();
  const sp = useSearchParams();

  // URL -> state
  const initialCategories = sp.getAll('category');
  const initialSubCategories = sp.getAll('subCategory');

  // YENİ: müşteri kalıbı
  const rawCM = sp.get('customerMold');
  const initialMold = rawCM === 'Evet' || rawCM === 'true' || rawCM === '1';

  const [q, setQ] = React.useState(sp.get('q') ?? '');
  const [categories, setCategories] = React.useState<string[]>(initialCategories);
  const [subCategories, setSubCategories] = React.useState<string[]>(initialSubCategories);

  // YENİ: müşteri kalıbı state'i
  const [moldOnly, setMoldOnly] = React.useState<boolean>(initialMold);

  // Expand başlangıcı: URL'de seçili olan parent veya child açık gelsin
  const [expanded, setExpanded] = React.useState<string[]>(() => {
    const set = new Set<string>(initialCategories);
    for (const catSlug of Object.keys(categoryTree)) {
      const subs = subsOf(catSlug);
      if (subs.some(s => initialSubCategories.includes(s))) set.add(catSlug);
    }
    return Array.from(set);
  });

  const [variantsSel, setVariantsSel] = React.useState<string[]>(sp.getAll('variants'));
  
  const [from, setFrom] = React.useState(sp.get('from') ?? '');
  const [to, setTo] = React.useState(sp.get('to') ?? '');
  const [sort, setSort] = React.useState(sp.get('sort') ?? 'date-desc');

  function toggleExpand(cat: string) {
    setExpanded(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  }

  function toggleCategory(cat: string) {
    const subs = subsOf(cat);
    setCategories(prev => {
      const exists = prev.includes(cat);
      if (exists) {
        setSubCategories(scs => scs.filter(s => !subs.includes(s)));
        return prev.filter(c => c !== cat);
      } else {
        setSubCategories(scs => Array.from(new Set([...scs, ...subs])));
        setExpanded(exp => exp.includes(cat) ? exp : [...exp, cat]);
        return [...prev, cat];
      }
    });
  }

  function toggleSubCategory(cat: string, sub: string) {
    const subs = subsOf(cat);
    setSubCategories(prev => {
      const next = prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub];
      const allSelected = subs.every(s => next.includes(s));
      setCategories(prevCats => allSelected
        ? (prevCats.includes(cat) ? prevCats : [...prevCats, cat])
        : prevCats.filter(c => c !== cat)
      );
      setExpanded(exp => exp.includes(cat) ? exp : [...exp, cat]);
      return next;
    });
  }

  function toggleVariant(key: string) {
    setVariantsSel(prev => prev.includes(key) ? prev.filter(x => x !== key) : [...prev, key]);
  }

  function apply() {
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    categories.forEach(c => params.append('category', c));
    subCategories.forEach(s => params.append('subCategory', s));
    variantsSel.forEach(key => params.append('variants', key));

    if (from) params.set('from', from);
    if (to) params.set('to', to);
    if (sort) params.set('sort', sort);

    if (moldOnly) params.append('customerMold', 'Evet');

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

    // YENİ
    setMoldOnly(false);

    router.replace(`?`);
  }

  // <<< BURADAN İTİBAREN render >>>
  return (
    <Box className="space-y-4" sx={{ position: 'sticky', top: 16 }}>

      <TextField label="Ara (code veya ad)" size="small" value={q} onChange={e => setQ(e.target.value)} fullWidth />
      
      <Box mt={2} >
        <FormControlLabel
          control={
            <Checkbox
              checked={moldOnly}
              onChange={() => setMoldOnly(p => !p)}
            />
          }
          label="Müşteri Kalıbı"
        />
      </Box>

      {/* Kategori ağacı */}
      <Box>
        <Typography variant="body2" gutterBottom mt={2}>Kategoriler</Typography>

        <List dense disablePadding>
          {Object.keys(categoryTree).map((catSlug) => {

            const raw = (categoryTree as unknown as Record<string, unknown>)[catSlug];
            const node =
              Array.isArray(raw)
              ? { name: catSlug, subs: raw.map(sl => ({ slug: sl, name: sl })) }
              : (raw as CategoryTree[string] | undefined) ?? { name: catSlug, subs: [] };
            const { name, subs } = node;

            const subSlugs = subs.map(s => s.slug);
            const hasSubs = subSlugs.length > 0;

            const open =
              expanded.includes(catSlug) ||
              categories.includes(catSlug) ||
              subSlugs.some(s => subCategories.includes(s));

            // sadece çocuk varsa all/some hesapla
            const allSelected  = hasSubs && subSlugs.every(s => subCategories.includes(s));
            const someSelected = hasSubs && subSlugs.some(s => subCategories.includes(s));

            // parent, ya listede seçiliyse ya da TÜM çocuklar seçiliyse checked olsun
            const catChecked = categories.includes(catSlug) || allSelected;

            return (
              <Box key={catSlug}>

                <ListItemButton 
                  disableRipple 
                  disableTouchRipple
                  onClick={() => toggleExpand(catSlug)} 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    borderRadius: 1 
                    }}
                >

                  <FormControlLabel
                    sx={{ m: 0 }}
                    control={
                      <Checkbox
                        checked={catChecked}
                        indeterminate={!allSelected && someSelected}
                        onChange={(e) => { e.stopPropagation(); toggleCategory(catSlug); }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    }
                    label={<ListItemText primary={name} />}
                  />

                  {/* Sağdaki chevron */}
                  <KeyboardArrowDownIcon
                    aria-hidden
                    sx={{
                      transition: 'transform 0.2s ease',
                      transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                      opacity: subs.length ? 1 : 0,          // alt kategori yoksa gizle
                      pointerEvents: 'none',                 // tıklama davranışı ListItemButton’da kalsın
                    }}
                  />

                </ListItemButton>

                <Collapse in={open} timeout="auto" unmountOnExit>
                  <List disablePadding dense sx={{ pl: 3 }}>
                    {subs.map(({ slug: subSlug, name: subLabel }) => (
                      <ListItemButton
                        key={subSlug}
                        onClick={(e) => { e.stopPropagation(); toggleSubCategory(catSlug, subSlug); }}
                        sx={{ borderRadius: 1 }}
                      >
                        <FormControlLabel
                          sx={{ m: 0 }}
                          control={
                            <Checkbox
                              checked={subCategories.includes(subSlug)}
                              onChange={(e) => { e.stopPropagation(); toggleSubCategory(catSlug, subSlug); }}
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

      {/* Variant */}
      <Box>
        <Typography 
          variant="body2" 
          gutterBottom

          mt={2}
        >
          Variant
        </Typography>
        <FormGroup>
          {variants.map(v => (
            <FormControlLabel
              key={v.key}
              control={
                <Checkbox
                  checked={variantsSel.includes(v.key)}
                  onChange={() => toggleVariant(v.key)}
                />
              }
              label={v.name}   // ← UI’da name göster
            />
          ))}
        </FormGroup>
      </Box>

      {/* Tarih aralığı */}
      <Grid container spacing={1} my={2} >
        <Grid size={{ xs: 6 }}>
          <TextField label="Tarih baş." type="date" size="small"
            value={from} onChange={e => setFrom(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
        </Grid>
        <Grid size={{ xs: 6 }}>
          <TextField label="Tarih bitiş" type="date" size="small"
            value={to} onChange={e => setTo(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
        </Grid>
      </Grid>

      {/* Sıralama */}
      <TextField label="Sırala" select size="small" value={sort} onChange={e => setSort(e.target.value)} fullWidth sx={{ mb: 2 }}>
        <MenuItem value="date-desc">Tarih yeni → eski</MenuItem>
        <MenuItem value="date-asc">Tarih eski → yeni</MenuItem>
        <MenuItem value="weight-asc">Ağırlık artan</MenuItem>
        <MenuItem value="weight-desc">Ağırlık azalan</MenuItem>
        <MenuItem value="code-asc">Kod A → Z</MenuItem>
        <MenuItem value="code-desc">Kod Z → A</MenuItem>
      </TextField>

      <Grid container spacing={1}>
        <Grid size={{ xs: 6 }}>
          <Button onClick={apply} variant="contained" fullWidth sx={{ textTransform: 'capitalize' }}>Uygula</Button>
        </Grid>
        <Grid size={{ xs: 6 }}>
          <Button onClick={reset} variant="outlined" fullWidth sx={{ textTransform: 'capitalize' }}>Sıfırla</Button>
        </Grid>
      </Grid>
    </Box>
  );
}
