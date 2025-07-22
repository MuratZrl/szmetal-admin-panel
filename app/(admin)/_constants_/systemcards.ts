// app/(admin)/_constants_/systemcards.ts

export type SystemButtonLabels = {
  details: string;
  request: string;
};

export type SystemLinks = {
  detailsPage: string;
  requestPage: string;
};

export type System = {
  imageUrl: string;
  title: string;
  description: string;

  tag?: string; // 👈 optional tag

  buttonLabels: SystemButtonLabels;
  links: SystemLinks;
};

export const systems = [
  {
    imageUrl: '/systemcards/giyotin-sistemi.jpeg',
    title: 'Giyotin Sistemi',
    description: 'Malzeme giriş-çıkış takibi, envanter analizi ve raporlama çözümleri.',
    tag: 'Yeni', // 👈 sadece bazılarında olur
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
