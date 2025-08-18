// src/components/ui/_constants_/systemcards.ts
import type { SystemCardType } from '@/types/systems'; // adjust path if needed

// tiny slug helper
const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');

export const systems: SystemCardType[] = [
  {
    id: 'giyotin-sistemi',
    title: 'Giyotin Sistemi',
    description:
      'Malzeme giriş-çıkış takibi, envanter analizi ve raporlama çözümleri.',
    imageUrl: '/systemcards/giyotin-sistemi.jpeg',
    tag: 'Yeni',
    buttonLabels: { request: 'Hemen Talep Oluştur', primary: 'Detaylar' },
    links: { requestPage: '/systems/giyotin-sistemi', details: '/details/giyotin-sistemi' },
    isActive: true,
    createdAt: new Date().toISOString(),
    meta: {},
  },
  {
    id: 'cam-balkon-sistemi',
    title: 'Cam Balkon Sistemi',
    description: 'Üretim aşamalarını anlık takip edin ve verimliliği ölçün.',
    imageUrl: '/systemcards/cam-balkon-sistemi.jpg',
    tag: 'Popüler',
    buttonLabels: { request: 'Hemen Talep Oluştur', primary: 'Detaylar' },
    links: { requestPage: '/systems/cam-balkon-sistemi', details: '/details/cam-balkon-sistemi' },
    isActive: true,
    createdAt: new Date().toISOString(),
    meta: {},
  },
  {
    id: 'giydirme-cephe-sistemi',
    title: 'Giydirme Cephe Sistemi',
    description: 'Ürün kalitesini ölçümleyin, hataları erken tespit edin.',
    imageUrl: '/systemcards/giydirme-cephe-sistemi.jpg',
    buttonLabels: { request: 'Hemen Talep Oluştur', primary: 'Detaylar' },
    links: { requestPage: '/systems/giydirme-cephe-sistemi', details: '/details/giydirme-cephe-sistemi' },
    isActive: true,
    meta: {},
  },
  {
    id: 'kupeste-sistemi',
    title: 'Küpeşte Sistemi',
    description: 'Vardiya planlama, izin ve performans takibi.',
    imageUrl: '/systemcards/kupeste-sistemi.jpg',
    buttonLabels: { request: 'Hemen Talep Oluştur', primary: 'Detaylar' },
    links: { requestPage: '/systems/kupeste-sistemi', details: '/details/kupeste-sistemi' },
    isActive: true,
    meta: {},
  },
  {
    id: 'seramik-cephe-kaplama-sistemi',
    title: 'Seramik Cephe Kaplama Sistemi',
    description: 'Tedarik sürecinizi optimize edin ve maliyetleri yönetin.',
    imageUrl: '/systemcards/seramik-cephe-kaplama-sistemi.jpg',
    buttonLabels: { request: 'Hemen Talep Oluştur', primary: 'Detaylar' },
    links: { requestPage: '/systems/seramik-cephe-kaplama-sistemi', details: '/details/seramik-cephe-kaplama-sistemi' },
    isActive: true,
    meta: {},
  },
  {
    id: 'profil-sistemi',
    title: 'Profil Sistemi',
    description: 'Ekipmanlarınızın bakım takvimini ve geçmişini yönetin.',
    imageUrl: '/systemcards/profil-sistemi.jpg',
    buttonLabels: { request: 'Hemen Talep Oluştur', primary: 'Detaylar' },
    links: { requestPage: '/systems/profil-sistemi', details: '/details/profil-sistemi' },
    isActive: true,
    meta: {},
  },
  {
    id: 'aluminyum-dograma-sistemi',
    title: 'Alüminyum Doğrama Sistemi',
    description: 'Enerji tüketimini analiz edin, verimlilik sağlayın.',
    imageUrl: '/systemcards/aluminyum-dograma-sistemi.jpg',
    buttonLabels: { request: 'Hemen Talep Oluştur', primary: 'Detaylar' },
    links: { requestPage: '/systems/aluminyum-dograma-sistemi', details: '/details/aluminyum-dograma-sistemi' },
    isActive: true,
    meta: {},
  },
];
