// app/(admin)/_constants_/mainlinks.ts
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
  { label: 'Create Request', labelTr: 'Talep Oluştur',  href: '/create_request', icon: ShoppingCart },
  { label: 'Requests',       labelTr: 'Talepler',       href: '/requests',       icon: Analytics },
  { label: 'Clients',        labelTr: 'Müşteriler',     href: '/clients',        icon: People },
  { label: 'Orders',         labelTr: 'Siparişler',     href: '/orders',         icon: ShoppingBasket, disabled: false },
  { label: 'Products',       labelTr: 'Ürünler',        href: '/products',       icon: Category },
  // Logout’ta href vermesen de olur; biz buton gibi davranıyoruz
  { label: 'Logout',         labelTr: 'Çıkış Yap',      href: '/login',          icon: LogoutIcon },
];
