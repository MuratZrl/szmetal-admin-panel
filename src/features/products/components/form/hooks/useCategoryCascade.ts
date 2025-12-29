// src/features/products/components/form/hooks/useCategoryCascade.ts
'use client'; // Next.js App Router: bu dosya client tarafında çalışacak (hook + RHF watch/effect var)

import * as React from 'react'; // useMemo + useEffect kullanıyoruz

import { buildCategoryHelpers } from '@/features/products/forms/helpers'; // categoryTree’den seçenek + label map + helper fonksiyon üreten yardımcı
import type { ProductDicts } from '@/features/products/services/dicts.server'; // dicts tipi (categoryTree + variants vs)
import type { UseFormReturn } from 'react-hook-form'; // react-hook-form methods tipi
import type { ProductFormValues } from '@/features/products/forms/schema'; // form alanlarının ana tipi (category/subCategory/subSubCategory vs)

// Bu formda ayrıca dosya alanı var (form şemasına eklenmiş local field)
type WithFileFields = { file: File | null };

// Hook’un çalıştığı gerçek form tipi: ProductFormValues + file alanı
type FormType = ProductFormValues & WithFileFields;

/**
 * Kategori kademesi (category -> subCategory -> subSubCategory) için:
 * - Seçenekleri hesaplar
 * - Category değişince alt alanları resetler/uygun hale getirir
 * - CustomerMold = "Evet" ise kategori alanlarını tamamen devre dışı bıraktırır (temizler)
 * - UI’da required/disabled kararlarını verebilmen için flag’ler üretir
 */
export function useCategoryCascade(methods: UseFormReturn<FormType>, dicts: ProductDicts) {
  // RHF methods içinden sadece ihtiyacımız olanları alıyoruz:
  // watch: alan değişince yeniden render + değer okuma
  // setValue: alan değerini programatik set etme
  // getValues: anlık form değerini okuma (effect içinde “current” kontrolü için)
  const { watch, setValue, getValues } = methods;

  // categoryTree üzerinden yardımcıları üret:
  // useMemo ile dicts değişmedikçe aynı helper objesini kullanırız (gereksiz hesap yapmayız)
  // dicts?.categoryTree değişirse helpers yeniden oluşur
  const helpers = React.useMemo(() => buildCategoryHelpers(dicts?.categoryTree), [dicts]);

  // helpers içinden, UI için option listesi ve bir slug’ın çocuklarını getiren fonksiyonu alıyoruz
  const { categoryOptions, getSubCatsFor } = helpers;

  // Form alanlarını “izle”:
  // watch('category') -> category değişince hook yeniden render olur, effect’ler çalışır
  const watchedCategory = watch('category');

  // subCategory izleniyor çünkü subSubCategory seçenekleri buna bağlı
  const watchedSubCategory = watch('subCategory');

  // watchedCategory / watchedSubCategory tanımlarının altına ekle
  const prevCategoryRef = React.useRef<string | null>(null);

  // customerMold izleniyor çünkü "Evet" ise kategorileri kilitleyip temizliyoruz
  const watchedCustomerMold = watch('customerMold');

  // UI kararlarında basit boolean kullanmak için
  const isCustomerMold = watchedCustomerMold === 'Evet';

  /**
   * EFFECT 1: category değişince subCategory + subSubCategory düzelt
   *
   * Kurallar:
   * - category boşsa: subCategory/subSubCategory temizle.
   * - category’nin child’ı yoksa: subCategory’yi category ile aynı yap (bu senin önceki “tek seviye” kararın),
   *   subSubCategory boş kalsın.
   * - category’nin child’ı varsa: subCategory current değeri artık geçersiz olabilir.
   *   geçersizse temizle, her durumda subSubCategory’yi resetle.
   */
  React.useEffect(() => {
    // category seçilmemişse alt alanlar anlamsız, sıfırla
    if (!watchedCategory) {
      setValue('subCategory', '', { shouldValidate: true });
      setValue('subSubCategory', '', { shouldValidate: true });
      prevCategoryRef.current = null;
      return;
    }

    const prevCat = prevCategoryRef.current;
    const isFirstLoadForCategory = prevCat == null;

    // Seçilen category’nin alt seçeneklerini getir
    const subs = getSubCatsFor(watchedCategory);

    // Eğer category leaf ise: subCategory = category (senin kararın), subSub yok.
    if (subs.length === 0) {
      setValue('subCategory', watchedCategory, { shouldValidate: true });
      // subSub zaten anlamsız, sadece doluysa temizle
      if (getValues('subSubCategory')) {
        setValue('subSubCategory', '', { shouldValidate: true });
      }
      prevCategoryRef.current = watchedCategory;
      return;
    }

    // category’nin altları varsa: subCategory geçerli mi kontrol et
    const currentSub = getValues('subCategory');

    if (currentSub && !subs.some((s) => s.slug === currentSub)) {
      // subCategory artık bu category'ye ait değil -> temizle ve subSub da temizle
      setValue('subCategory', '', { shouldValidate: true });
      setValue('subSubCategory', '', { shouldValidate: true });
      prevCategoryRef.current = watchedCategory;
      return;
    }

    // Buradaki kritik fix:
    // İlk yüklemede (edit initial değerleri set edilmişken) subSub'ı sakın resetleme.
    // Sadece category gerçekten değişmişse resetle.
    const categoryChanged = !isFirstLoadForCategory && prevCat !== watchedCategory;
    if (categoryChanged) {
      setValue('subSubCategory', '', { shouldValidate: true });
    }

    prevCategoryRef.current = watchedCategory;
  }, [watchedCategory, getSubCatsFor, setValue, getValues]);


  /**
   * EFFECT 2: subCategory değişince subSubCategory düzelt
   *
   * Kurallar:
   * - subCategory boşsa: subSubCategory temizle.
   * - subCategory’nin child’ı yoksa: subSubCategory yine boş kalmalı.
   * - subCategory’nin child’ı varsa ve mevcut subSubCategory artık listede yoksa temizle.
   */
  React.useEffect(() => {
    // subCategory seçilmemişse en alt kategori seçilemez, sıfırla
    if (!watchedSubCategory) {
      setValue('subSubCategory', '', { shouldValidate: true });
      return;
    }

    // subCategory’nin alt seçenekleri (en alt kategori seçenekleri)
    const subs = getSubCatsFor(watchedSubCategory);

    // formda şu an seçili en alt kategori (varsa)
    const current = getValues('subSubCategory');

    // subCategory’nin child’ı yoksa en alt kategori yok demektir
    if (subs.length === 0) {
      setValue('subSubCategory', '', { shouldValidate: true });
    } else if (current && !subs.some((s) => s.slug === current)) {
      // child’lar var ama mevcut subSubCategory bu listeye ait değilse, temizle
      setValue('subSubCategory', '', { shouldValidate: true });
    }
  }, [
    watchedSubCategory, // subCategory değişince çalışsın
    getSubCatsFor,      // helper fonksiyon referansı
    setValue,           // RHF setValue
    getValues,          // RHF getValues
  ]);

  /**
   * EFFECT 3: customerMold = "Evet" olduğunda kategori alanlarını tamamen temizle
   *
   * Bu, UI’da kategori alanlarını disable ettiğin senaryoda
   * form state’in de “temiz” kalmasını sağlar (validation + submit payload düzgün olur).
   */
  React.useEffect(() => {
    // müşteri kalıbı değilse dokunma
    if (!isCustomerMold) return;

    // müşteri kalıbı ise kategori alanlarının hepsini boşalt
    setValue('category', '', { shouldValidate: true });
    setValue('subCategory', '', { shouldValidate: true });
    setValue('subSubCategory', '', { shouldValidate: true });
  }, [
    isCustomerMold, // sadece bu değer true/false değişince çalışır
    setValue,       // RHF setValue referansı
  ]);

  /**
   * rootCategoryOptions:
   * categoryTree’den “üst seviye” (parent olmayan) kategorileri çıkarmak için:
   * - tree’de geçen tüm child slug’ları bir Set’e topla
   * - categoryOptions içinden child olmayanları filtrele (root’ları bul)
   *
   * Neden?
   * - UI’daki “Kategori” select’inde sadece kökleri göstermek istiyorsun.
   * - Alt kategoriler “Alt Kategori” select’inde görünsün.
   */
  const rootCategoryOptions = React.useMemo(() => {
    // dicts categoryTree yoksa elimizdeki categoryOptions’u olduğu gibi döndür
    const tree = dicts?.categoryTree;
    if (!tree) return categoryOptions;

    // tüm child slug’larını topla
    const childSlugs = new Set<string>();

    // tree node’ları dolaş
    Object.values(tree).forEach((node) =>
      // node.subs: bu node’un child listesi
      node.subs.forEach((s) => childSlugs.add(s.slug)),
    );

    // child olmayanlar root’tur
    return categoryOptions.filter((c) => !childSlugs.has(c.slug));
  }, [
    dicts,           // tree değişirse yeniden hesapla
    categoryOptions, // options değişirse yeniden hesapla
  ]);

  // UI için: seçili category varsa subCategory seçeneklerini getir, yoksa boş array
  const subCategoryOptions = watchedCategory ? getSubCatsFor(watchedCategory) : [];

  // UI için: seçili subCategory varsa subSubCategory seçeneklerini getir, yoksa boş array
  const subSubCategoryOptions = watchedSubCategory ? getSubCatsFor(watchedSubCategory) : [];

  // Kök kategori var mı? (kategori select disable/required kararında kullanılıyor)
  const hasRootCategories = rootCategoryOptions.length > 0;

  // Seçilen category’nin gerçekten child’ı var mı? (UI’da subCategory alanını gösterme/required kararında)
  const hasRealSubCategories = subCategoryOptions.length > 0;

  // Seçilen subCategory’nin gerçekten child’ı var mı? (UI’da subSubCategory alanını gösterme/required kararında)
  const hasRealSubSubCategories = subSubCategoryOptions.length > 0;

  /**
   * noSubCategoryLevel:
   * category seçili ama onun alt kategorisi yoksa, “alt kategori seviyesi yok” demektir.
   * customerMold değilken anlamlı (customerMold ise zaten kategori yok).
   */
  const noSubCategoryLevel = !!watchedCategory && !hasRealSubCategories && !isCustomerMold;

  /**
   * noSubSubLevel:
   * category seçili + alt kategori seviyesi var (hasRealSubCategories true)
   * ama subCategory’nin altı yoksa “en alt seviye yok” demektir.
   */
  const noSubSubLevel =
    !!watchedCategory &&
    hasRealSubCategories &&
    !hasRealSubSubCategories &&
    !isCustomerMold;

  /**
   * isSubRequired:
   * - müşteri kalıbı değilse
   * - gerçekten alt kategori opsiyonu varsa
   * - ve “alt kategori seviyesi yok” durumunda değilsek
   */
  const isSubRequired = !isCustomerMold && !!watchedCategory && hasRealSubCategories;

  /**
   * isSubSubRequired:
   * - müşteri kalıbı değilse
   * - gerçekten en alt kategori opsiyonu varsa
   * - alt seviye yok senaryosunda değilsek
   */
  const isSubSubRequired = false;

  // Hook çıktısı:
  // - buildCategoryHelpers’dan gelen her şeyi dışarı açıyoruz (label map’ler, helper fonksiyonlar vs)
  // - ayrıca UI’da işine yarayan “watched values”, option listeleri ve flag’leri veriyoruz
  return {
    ...helpers,              // categoryLabelMap, subLabelMap, findOwnerCategory vs burada
    watchedCategory,         // UI placeholder / renderValue kararlarında kullanılıyor
    watchedSubCategory,      // UI placeholder / renderValue kararlarında kullanılıyor
    isCustomerMold,          // disable/required kararları
    rootCategoryOptions,     // Kategori select options (root)
    hasRootCategories,       // Kategori alanını enable/disable etmek için
    subCategoryOptions,      // Alt kategori options
    subSubCategoryOptions,   // En alt kategori options
    hasRealSubCategories,    // Alt kategori var mı?
    hasRealSubSubCategories, // En alt kategori var mı?
    noSubCategoryLevel,      // Alt kategori seviyesi yok mu?
    noSubSubLevel,           // En alt seviye yok mu?
    isSubRequired,           // Alt kategori required mı?
    isSubSubRequired,        // En alt kategori required mı?
  };
}
