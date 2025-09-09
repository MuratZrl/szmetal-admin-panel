/** Kategori ağacı tipini ProductDicts’e bağımlı olmadan tanımlayalım */
export type CategoryTree = Record<
  string,
  {
    name: string;
    subs: { slug: string; name: string }[];
  }
>;

export type CategoryOption = { slug: string; name: string };
export type SubCategoryOption = { slug: string; name: string };

export type CategoryHelpers = {
  /** Tüm parent kategoriler (slug, name) */
  categoryOptions: CategoryOption[];
  /** Seçili parent’a göre alt kategoriler */
  getSubCatsFor: (categorySlug: string | null | undefined) => SubCategoryOption[];
  /** Alt kategori slug → görünen ad */
  subLabelMap: Map<string, string>;
  /** Kategori slug → görünen ad */
  categoryLabelMap: Map<string, string>;
  /** Alt kategorinin sahibi parent’ı bulur */
  findOwnerCategory: (subSlug: string) => string | null;
  /** Tüm alt kategoriler (unique) */
  allSubCats: SubCategoryOption[];
};

/** Dicts.categoryTree içinden tek seferde tüm yardımcıları üret */
export function buildCategoryHelpers(tree: CategoryTree | null | undefined): CategoryHelpers {
  const safeTree: CategoryTree = tree ?? {};

  const categoryOptions: CategoryOption[] = Object.entries(safeTree).map(
    ([slug, node]) => ({ slug, name: node.name })
  );

  const categoryLabelMap = new Map<string, string>();
  const subLabelMap = new Map<string, string>();

  Object.entries(safeTree).forEach(([slug, node]) => {
    categoryLabelMap.set(slug, node.name);
    node.subs.forEach(s => subLabelMap.set(s.slug, s.name));
  });

  // Unique tüm sub’lar
  const allSubCatsMap = new Map<string, SubCategoryOption>();
  Object.values(safeTree).forEach(node => {
    node.subs.forEach(s => allSubCatsMap.set(s.slug, { slug: s.slug, name: s.name }));
  });
  const allSubCats = Array.from(allSubCatsMap.values());

  const getSubCatsFor = (categorySlug: string | null | undefined): SubCategoryOption[] => {
    if (!categorySlug) return allSubCats;
    const node = safeTree[categorySlug];
    return node ? node.subs.map(s => ({ slug: s.slug, name: s.name })) : allSubCats;
    // kategori bulunamazsa düşmeyelim
  };

  const findOwnerCategory = (subSlug: string): string | null => {
    for (const [parent, node] of Object.entries(safeTree)) {
      if (node.subs.some(s => s.slug === subSlug)) return parent;
    }
    return null;
  };

  return {
    categoryOptions,
    getSubCatsFor,
    subLabelMap,
    categoryLabelMap,
    findOwnerCategory,
    allSubCats,
  };
}

/** Boş stringleri null yapan küçük yardımcı */
export function emptyToNull(v: string | null | undefined): string | null {
  if (typeof v !== 'string') return null;
  const s = v.trim();
  return s.length ? s : null;
}

/** NaN ve boş girişleri null’a çevirir, integer=true ise yuvarlar */
export function normalizeNumber(input: unknown, integer = false): number | null {
  if (input == null) return null;
  const s = String(input).replace(',', '.').trim();
  if (!s) return null;
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return integer ? Math.round(n) : n;
}
