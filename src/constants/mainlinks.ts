// src/constants/mainlinks.ts
import type { SidebarLink } from '@/features/sidebar/types';

import AccountCircle from '@mui/icons-material/AccountCircle';
import Dashboard from '@mui/icons-material/Dashboard';
import People from '@mui/icons-material/People';
import ShowChartIcon from '@mui/icons-material/ShowChart';

import Category from '@mui/icons-material/Category';
import Logout from '@mui/icons-material/Logout';

export const mainLinks: SidebarLink[] = [
  { label: 'Account',             labelTr: 'Hesabım',        href: '/account',                   icon: AccountCircle },
  { label: 'Dashboard',           labelTr: 'Kontrol Paneli', href: '/dashboard',                 icon: Dashboard },
  { label: 'Clients',             labelTr: 'Kullanıcılar',   href: '/clients',                   icon: People },
  { label: 'Product Analytics',   labelTr: 'Ürün Analizi',   href: '/products_analytics',        icon: ShowChartIcon },

  { label: 'Products',            labelTr: 'Profiller',      href: '/products',                  icon: Category,       section: 'quick',  order: 1 },

  { label: 'Logout',              labelTr: 'Çıkış Yap',      href: '/login',                     icon: Logout,         section: 'footer' },
];
