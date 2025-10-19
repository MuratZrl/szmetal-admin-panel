// src/constants/mainlinks.ts
import {
  AccountCircle,
  Dashboard,
  ShoppingCart,
  Analytics,
  People,
  Logout as LogoutIcon,
  ShoppingBasket,
  Category,
} from '@mui/icons-material';

import type { SidebarLink } from '@/features/sidebar/types';

export const mainLinks: SidebarLink[] = [
  { label: 'Account',        labelTr: 'Hesabım',        href: '/account',        icon: AccountCircle },
  { label: 'Dashboard',      labelTr: 'Kontrol Paneli', href: '/dashboard',      icon: Dashboard },
  { label: 'Requests',       labelTr: 'Talepler',       href: '/requests',       icon: Analytics },
  { label: 'Clients',        labelTr: 'Kullanıcılar',   href: '/clients',        icon: People },
  
  // Quick bölümünde istediklerin:
  { label: 'Products',       labelTr: 'Ürünler',        href: '/products',       icon: Category, section: 'quick', order: 1 },
  { label: 'Create Request', labelTr: 'Talep Oluştur',  href: '/create_request', icon: ShoppingCart,   section: 'quick', order: 2 },
  { label: 'Orders',         labelTr: 'Siparişler',     href: '/orders',         icon: ShoppingBasket, section: 'quick', order: 3 },

  // Footer:
  { label: 'Logout',         labelTr: 'Çıkış Yap',      href: '/login',          icon: LogoutIcon,     section: 'footer' },
];
