// src/features/products/components/ProductInfo/types.ts
import type * as React from 'react';

export type Maybe<T> = T | null | undefined;

export type LabelMaps = {
  category?: Record<string, string>;
  subCategory?: Record<string, string>;
  subSubCategory?: Record<string, string>;
  variant?: Record<string, string>;
};

export type DetailItem = {
  label: string;
  value: React.ReactNode;
};

export type ProductInfoProps = {
  title: string;
  variant: string;

  category?: string | null;
  subCategory?: string | null;
  subSubCategory?: string | null;

  date: string;
  revisionDate?: string | null;

  /** created_at sütunundan gelecek, eklenme tarihi */
  createdAt: string;
  /** updated_at sütunundan gelecek, güncellenme tarihi */
  updatedAt?: string | null;
  /** created_by sütunundan gelecek, eklendiği kişi tarafından */
  createdBy: string;

  id: string;
  code?: string | null;

  hasCustomerMold?: boolean | null;
  has_customer_mold?: boolean | null;

  availability?: boolean | null;

  drawer?: Maybe<string>;
  control?: Maybe<string>;

  unit_weight_g_pm?: number;

  wallThicknessMm?: number | null;

  scale?: Maybe<string>;
  outerSizeMm?: Maybe<number>;
  sectionMm2?: Maybe<number>;

  tempCode?: Maybe<string>;
  profileCode?: Maybe<string>;
  manufacturerCode?: Maybe<string>;

  labels?: LabelMaps;

  footerSlot?: React.ReactNode;

  mediaSrc?: string | null;
  mediaFileUrl?: string | null;
  mediaExt?: 'pdf' | 'png' | 'webp' | 'jpg' | 'jpeg' | null;
  mediaMime?: string | null;

  children?: React.ReactNode;
  description?: string | null;
};
