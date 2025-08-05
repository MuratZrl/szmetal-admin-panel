// app/_constants_/categories/categoryData.ts

import CategoryIcon from '@mui/icons-material/Category'; // Örnek ikon, değiştirebilirsin

export type CategoryItem = {
  title: string;
  icon?: React.ReactNode;
  imageUrl?: string;
};

export const categoryData: CategoryItem[] = [
  {
    title: 'Küpeşte Sistemleri',
    icon: <CategoryIcon />,
    imageUrl: '/categorycards/kupeste-sistemi.jpeg'
  },
  {
    title: 'Giyotin Cam',
    icon: <CategoryIcon />,
  },
];
