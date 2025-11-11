// src/constants/mainlinks.ts
import type { SidebarLink } from '@/features/sidebar/types';

import AccountCircle from '@mui/icons-material/AccountCircle';
import Dashboard from '@mui/icons-material/Dashboard';
import Analytics from '@mui/icons-material/Analytics';
import People from '@mui/icons-material/People';
import Category from '@mui/icons-material/Category';
import ShoppingCart from '@mui/icons-material/ShoppingCart';
import ShoppingBasket from '@mui/icons-material/ShoppingBasket';
import Logout from '@mui/icons-material/Logout';

export const mainLinks: SidebarLink[] = [
  { label: 'Account',        labelTr: 'Hesabım',        href: '/account',        icon: AccountCircle },
  { label: 'Dashboard',      labelTr: 'Kontrol Paneli', href: '/dashboard',      icon: Dashboard },
  { label: 'Requests',       labelTr: 'Talepler',       href: '/requests',       icon: Analytics },
  { label: 'Clients',        labelTr: 'Kullanıcılar',   href: '/clients',        icon: People },
  { label: 'Products',       labelTr: 'Ürünler',        href: '/products',       icon: Category,       section: 'quick',  order: 1 },
  { label: 'Create Request', labelTr: 'Talep Oluştur',  href: '/create_request', icon: ShoppingCart,   section: 'quick',  order: 2 },
  { label: 'Orders',         labelTr: 'Siparişler',     href: '/orders',         icon: ShoppingBasket, section: 'quick',  order: 3 },
  { label: 'Logout',         labelTr: 'Çıkış Yap',      href: '/login',          icon: Logout,         section: 'footer' },
];
