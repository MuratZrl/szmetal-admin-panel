// src/features/products/components/form/constants.ts

/**
 * Stabil input id'leri (SSR/CSR hydration mismatch riskini azaltmak için)
 * NOT: Aynı sayfada iki farklı Product form render edilirse id çakışır.
 * Şu an tek form varsayımıyla sabit tutuldu.
 */

// General infos
export const PRODUCT_FORM_CODE_ID = 'product-form-code';
export const PRODUCT_FORM_NAME_ID = 'product-form-name';
export const PRODUCT_FORM_CUSTOMER_MOLD_ID = 'product-form-customer-mold';
export const PRODUCT_FORM_AVAILABILITY_ID = 'product-form-availability';

// Category cascade
export const PRODUCT_FORM_CATEGORY_ID = 'product-form-category';
export const PRODUCT_FORM_SUBCATEGORY_ID = 'product-form-subcategory';
export const PRODUCT_FORM_SUBSUBCATEGORY_ID = 'product-form-subsubcategory';

// Variant
export const PRODUCT_FORM_VARIANT_ID = 'product-form-variant';

// Codes
export const PRODUCT_FORM_MANUFACTURER_CODE_ID = 'product-form-manufacturer-code';
export const PRODUCT_FORM_TEMP_CODE_ID = 'product-form-temp-code';

// Drawer, controller, scale
export const PRODUCT_FORM_DRAWER_ID = 'product-form-drawer';
export const PRODUCT_FORM_CONTROL_ID = 'product-form-control';
export const PRODUCT_FORM_SCALE_ID = 'product-form-scale';

// Specs
export const PRODUCT_FORM_UNIT_WEIGHT_G_ID = 'product-form-unit-weight-g';
export const PRODUCT_FORM_WALL_THICKNESS_MM_ID = 'product-form-wall-thickness-mm';
export const PRODUCT_FORM_SECTION_MM2_ID = 'product-form-section-mm2';
export const PRODUCT_FORM_OUTER_SIZE_MM_ID = 'product-form-outer-size-mm';
