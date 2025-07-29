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
  labelTr: string;
  href: string;
  icon: typeof Dashboard;
};

export const mainLinks: SidebarLink[] = [
  { label: 'Account', labelTr: 'Hesabım', href: '/account', icon: AccountCircle },
  { label: 'Dashboard', labelTr: 'Kontrol Paneli', href: '/dashboard', icon: Dashboard },
  { label: 'Systems', labelTr: 'Sistemler', href: '/systems', icon: Storage },
  { label: 'Requests', labelTr: 'Talepler', href: '/requests', icon: ListAlt },
  { label: 'Clients', labelTr: 'Müşteriler', href: '/clients', icon: People },
  { label: 'Products', labelTr: 'Ürünler', href: '/products', icon: Inventory },
  { label: 'Orders', labelTr: 'Siparişler', href: '/orders', icon: ShoppingBasket },
  { label: 'Logout', labelTr: 'Çıkış Yap', href: '/login', icon: Logout },
];

