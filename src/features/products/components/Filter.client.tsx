// src/features/products/components/Filters.client.tsx
'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box, Grid, TextField, MenuItem, Slider, Typography, Button,
  FormGroup, FormControlLabel, Checkbox, List, ListItemButton,
  ListItemText, Collapse, Divider
} from '@mui/material';

export default function Filters({
  categoryTree,
  variants,
  maxUnitWeightKg = 2,
}: {
  categoryTree: Record<string, string[]>;
  variants: string[];
  maxUnitWeightKg?: number;
}) {
  const subsOf = React.useCallback(
    (cat: string) => categoryTree[cat] ?? [],
    [categoryTree]
  );

  const router = useRouter();
  const sp = useSearchParams();

  // URL -> state
  const initialCategories = sp.getAll('category');
  const initialSubCategories = sp.getAll('subCategory');

  const [q, setQ] = React.useState(sp.get('q') ?? '');
  const [categories, setCategories] = React.useState<string[]>(initialCategories);
  const [subCategories, setSubCategories] = React.useState<string[]>(initialSubCategories);

  // Çoklu expand
  const [expanded, setExpanded] = React.useState<string[]>(() => {
    const set = new Set<string>(initialCategories);
    for (const [cat, subs] of Object.entries(categoryTree)) {
      if (subs.some(s => initialSubCategories.includes(s))) set.add(cat);
    }
    return Array.from(set);
  });

  const [variantsSel, setVariantsSel] = React.useState<string[]>(sp.getAll('variants'));
  const [wRange, setWRange] = React.useState<[number, number]>([
    Number(sp.get('wMin') ?? 0) || 0,
    Number(sp.get('wMax') ?? maxUnitWeightKg) || maxUnitWeightKg,
  ]);
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

  function toggleVariant(v: string) {
    setVariantsSel(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);
  }

  function apply() {
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    categories.forEach(c => params.append('category', c));
    subCategories.forEach(s => params.append('subCategory', s));
    variantsSel.forEach(v => params.append('variants', v));
    if (wRange[0] > 0) params.set('wMin', String(wRange[0]));
    if (wRange[1] < maxUnitWeightKg) params.set('wMax', String(wRange[1]));
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    if (sort) params.set('sort', sort);
    router.replace(`?${params.toString()}`);
  }

  function reset() {
    setQ('');
    setCategories([]);
    setSubCategories([]);
    setExpanded([]);
    setVariantsSel([]);
    setWRange([0, maxUnitWeightKg]);
    setFrom('');
    setTo('');
    setSort('date-desc');
    router.replace(`?`);
  }

  // <<< BURADAN İTİBAREN render >>>
  return (
    <Box className="space-y-4" sx={{ position: 'sticky', top: 16 }}>
      <TextField label="Ara (code veya ad)" size="small" value={q} onChange={e => setQ(e.target.value)} fullWidth />

            {/* Kategori ağacı */}
      <Box>
        <Typography variant="body2" gutterBottom mt={2}>Kategori</Typography>
        <List dense disablePadding>
          {Object.entries(categoryTree).map(([cat, subs]) => {
            const open =
              expanded.includes(cat) ||
              categories.includes(cat) ||
              subs.some(s => subCategories.includes(s));

            const allSelected = subs.every(s => subCategories.includes(s));
            const someSelected = subs.some(s => subCategories.includes(s));
            const catChecked = categories.includes(cat) || allSelected;

            return (
              <Box key={cat}>
                <ListItemButton onClick={() => toggleExpand(cat)} sx={{ borderRadius: 1 }}>
                  <FormControlLabel
                    sx={{ m: 0 }}
                    control={
                      <Checkbox
                        checked={catChecked}
                        indeterminate={!allSelected && someSelected}
                        onChange={(e) => { e.stopPropagation(); toggleCategory(cat); }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    }
                    label={<ListItemText primary={cat} />}
                  />
                </ListItemButton>

                <Collapse in={open} timeout="auto" unmountOnExit>
                  <List disablePadding dense sx={{ pl: 3 }}>
                    {subs.map(sub => (
                      <ListItemButton
                        key={sub}
                        onClick={(e) => { e.stopPropagation(); toggleSubCategory(cat, sub); }}
                        sx={{ borderRadius: 1 }}
                      >
                        <FormControlLabel
                          sx={{ m: 0 }}
                          control={
                            <Checkbox
                              checked={subCategories.includes(sub)}
                              onChange={(e) => { e.stopPropagation(); toggleSubCategory(cat, sub); }}
                              onClick={(e) => e.stopPropagation()}
                            />
                          }
                          label={<ListItemText primary={sub} />}
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
        <Typography variant="body2" gutterBottom>Variant</Typography>
        <FormGroup>
          {variants.map(v => (
            <FormControlLabel
              key={v}
              control={<Checkbox checked={variantsSel.includes(v)} onChange={() => toggleVariant(v)} />}
              label={v}
            />
          ))}
        </FormGroup>
      </Box>

      {/* Ağırlık */}
      <Box>
        <Typography variant="body2" gutterBottom>Birim ağırlık aralığı (kg)</Typography>
        <Slider
          value={wRange}
          onChange={(_, val) => setWRange(val as [number, number])}
          min={0}
          max={maxUnitWeightKg}
          step={0.01}
          valueLabelDisplay="auto"
        />
        <Grid container spacing={1}>
          <Grid size={{ xs: 6 }}>
            <TextField size="small" label="Min" type="number" inputProps={{ step: '0.01' }}
              value={wRange[0]} onChange={e => setWRange([Number(e.target.value), wRange[1]])} fullWidth />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField size="small" label="Max" type="number" inputProps={{ step: '0.01' }}
              value={wRange[1]} onChange={e => setWRange([wRange[0], Number(e.target.value)])} fullWidth />
          </Grid>
        </Grid>
      </Box>

      {/* Tarih aralığı */}
      <Grid container spacing={1}>
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
