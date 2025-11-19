// src/features/products/components/ui/Filter/types.ts
export type CategoryTree = Record<
  string,
  {
    name: string;
    subs: { slug: string; name: string }[];
  }
>;

export type VariantOption = {
  key: string;
  name: string;
};
