// app/(admin)/_constants/systemproductcards.ts

export type SystemProduct = {
  imageSrc: string;
  title: string;
  slug: string;
};

export const products: SystemProduct[] = [
  {
    imageSrc: '/productcards/giyotin-sistemi.jpeg',
    title: 'Giyotin Sistemi',
    slug: 'giyotin-sistemi',
  },
  {
    imageSrc: '/productcards/cam-balkon-sistemi.jpg',
    title: 'Cam Balkon Sistemi',
    slug: 'cam-balkon-sistemi',
  },
  {
    imageSrc: '/productcards/giydirme-cephe-sistemi.jpg',
    title: 'Giydirme Cephe Sistemi',
    slug: 'giydirme-cephe-sistemi',
  },
  {
    imageSrc: '/productcards/aluminyum-dograma-sistemi.jpg',
    title: 'Alüminyum Doğrama Sistemi',
    slug: 'aluminyum-dograma-sistemi',
  },
  {
    imageSrc: '/productcards/kupeste-sistemi.jpg',
    title: 'Küpeşte Sistemi',
    slug: 'kupeste-sistemi',
  },
  {
    imageSrc: '/productcards/profil-sistemi.jpg',
    title: 'Profil Sistemi',
    slug: 'profil-sistemi',
  },
  {
    imageSrc: '/productcards/seramik-cephe-kaplama-sistemi.jpg',
    title: 'Cephe Kaplama Sistemi',
    slug: 'seramik-cephe-kaplama-sistemi',
  },
];
