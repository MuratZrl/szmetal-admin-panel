// app/(admin)/_constants_/mainlinks.ts
import {
  AccountCircle,
  Dashboard,
  Storage,
  ListAlt,
  People,
  Inventory,
  Logout,
  ShoppingBasket,
} from '@mui/icons-material';

export type SidebarLink = {
  label: string;
  href: string;
  icon: typeof Dashboard; // MUI ikon tipi (hepsi aynı base'den türetilmiş)
};

export const mainLinks: SidebarLink[] = [
  { label: 'Account', href: '/account', icon: AccountCircle },
  { label: 'Dashboard', href: '/dashboard', icon: Dashboard },
  { label: 'Systems', href: '/systems', icon: Storage },
  { label: 'Requests', href: '/requests', icon: ListAlt },
  { label: 'Clients', href: '/clients', icon: People },
  { label: 'Products', href: '/products', icon: Inventory },
  { label: 'Orders', href: '/orders', icon: ShoppingBasket },
  { label: 'Logout', href: '/login', icon: Logout }, // 👈 logout da dahil edildi
];
