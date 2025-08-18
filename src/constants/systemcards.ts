// app/(admin)/_constants_/systemcards.ts
import type { SystemCardType } from '@/types/systems'; // adjust path if needed

// === helpers ===
const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');

function uniqueSlug(base: string, existing: Set<string>) {
  let slug = base;
  let i = 1;
  while (existing.has(slug)) {
    slug = `${base}-${i++}`;
  }
  existing.add(slug);
  return slug;
}

// === raw type (matches the file you pasted) ===
type RawSystem = {
  imageUrl: string;
  title: string;
  description?: string;
  tag?: string;

  // original shape had these names; allow optional extras so normalization is robust
  buttonLabels?: {
    details?: string;     // your current file uses `details`
    request?: string;     // exists in your file
    primary?: string;     // accept alternate name
    secondary?: string;
  };

  links?: {
    detailsPage?: string; // your current file uses `detailsPage`
    requestPage?: string; // exists in your file
    details?: string;     // alternate possible name
    request?: string;
  };
};

// === raw data (unchanged content you provided) ===
const RAW_SYSTEMS: RawSystem[] = [
  {
    imageUrl: '/systemcards/giyotin-sistemi.jpeg',
    title: 'Giyotin Sistemi',
    description:
      'Malzeme giriş-çıkış takibi, envanter analizi ve raporlama çözümleri.',
    tag: 'Yeni',
    buttonLabels: {
      details: 'Detaylar',
      request: 'Hemen Talep Oluştur',
    },
    links: {
      detailsPage: '/details/giyotin-sistemi',
      requestPage: '/systems/giyotin-sistemi',
    },
  },
  {
    imageUrl: '/systemcards/cam-balkon-sistemi.jpg',
    title: 'Cam Balkon Sistemi',
    description: 'Üretim aşamalarını anlık takip edin ve verimliliği ölçün.',
    tag: 'Popüler',
    buttonLabels: {
      details: 'Detaylar',
      request: 'Hemen Talep Oluştur',
    },
    links: {
      detailsPage: '/details/cam-balkon-sistemi',
      requestPage: '/systems/cam-balkon-sistemi',
    },
  },
  {
    imageUrl: '/systemcards/giydirme-cephe-sistemi.jpg',
    title: 'Giydirme Cephe Sistemi',
    description: 'Ürün kalitesini ölçümleyin, hataları erken tespit edin.',
    buttonLabels: {
      details: 'Detaylar',
      request: 'Hemen Talep Oluştur',
    },
    links: {
      detailsPage: '/details/giydirme-cephe-sistemi',
      requestPage: '/systems/giydirme-cephe-sistemi',
    },
  },
  {
    imageUrl: '/systemcards/kupeste-sistemi.jpg',
    title: 'Küpeşte Sistemi',
    description: 'Vardiya planlama, izin ve performans takibi.',
    buttonLabels: {
      details: 'Detaylar',
      request: 'Hemen Talep Oluştur',
    },
    links: {
      detailsPage: '/details/kupeste-sistemi',
      requestPage: '/systems/kupeste-sistemi',
    },
  },
  {
    imageUrl: '/systemcards/seramik-cephe-kaplama-sistemi.jpg',
    title: 'Seramik Cephe Kaplama Sistemi',
    description: 'Tedarik sürecinizi optimize edin ve maliyetleri yönetin.',
    buttonLabels: {
      details: 'Detaylar',
      request: 'Hemen Talep Oluştur',
    },
    links: {
      detailsPage: '/details/seramik-cephe-kaplama-sistemi',
      requestPage: '/systems/seramik-cephe-kaplama-sistemi',
    },
  },
  {
    imageUrl: '/systemcards/profil-sistemi.jpg',
    title: 'Profil Sistemi',
    description: 'Ekipmanlarınızın bakım takvimini ve geçmişini yönetin.',
    buttonLabels: {
      details: 'Detaylar',
      request: 'Hemen Talep Oluştur',
    },
    links: {
      detailsPage: '/details/profil-sistemi',
      requestPage: '/systems/profil-sistemi',
    },
  },
  {
    imageUrl: '/systemcards/aluminyum-dograma-sistemi.jpg',
    title: 'Alüminyum Doğrama Sistemi',
    description: 'Enerji tüketimini analiz edin, verimlilik sağlayın.',
    buttonLabels: {
      details: 'Detaylar',
      request: 'Hemen Talep Oluştur',
    },
    links: {
      detailsPage: '/details/aluminyum-dograma-sistemi',
      requestPage: '/systems/aluminyum-dograma-sistemi',
    },
  },
];

// === normalization to canonical SystemCardType ===
const seenIds = new Set<string>();

export const systems: SystemCardType[] = RAW_SYSTEMS.map((s) => {
  const baseSlug = slugify(s.title ?? 'system');
  const id = uniqueSlug(baseSlug, seenIds);

  return {
    id,
    title: s.title,
    description: s.description ?? '',
    imageUrl: s.imageUrl ?? '',
    tag: s.tag,
    // canonical buttonLabels expected by SystemCardType:
    buttonLabels: {
      request: s.buttonLabels?.request ?? s.buttonLabels?.details ?? 'Talep Oluştur',
      primary: s.buttonLabels?.details ?? s.buttonLabels?.primary ?? undefined,
      secondary: s.buttonLabels?.secondary ?? undefined,
    },
    // canonical links expected by SystemCardType:
    links: {
      requestPage: s.links?.requestPage ?? s.links?.request ?? '',
      details: s.links?.detailsPage ?? s.links?.details ?? undefined,
    },
    isActive: true,
    createdAt: new Date().toISOString(),
    meta: {},
  };
});
