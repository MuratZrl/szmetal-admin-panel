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
  Category,
} from '@mui/icons-material';

export type SidebarLink = {
  label: string;
  labelTr: string;
  href: string;
  icon: React.ElementType;  // works for MUI icon components
  disabled?: boolean;       // <- add this optional property
};

export const mainLinks: SidebarLink[] = [
  { label: 'Account', labelTr: 'Hesabım', href: '/account', icon: AccountCircle },
  { label: 'Dashboard', labelTr: 'Kontrol Paneli', href: '/dashboard', icon: Dashboard },
  { label: 'Create Request', labelTr: 'Talep Oluştur', href: '/create_request', icon: Storage },
  { label: 'Requests', labelTr: 'Talepler', href: '/requests', icon: ListAlt },
  { label: 'Clients', labelTr: 'Müşteriler', href: '/clients', icon: People },
  { label: 'System Products', labelTr: 'Sistem Ürünleri', href: '/system_products', icon: Inventory },
  { label: 'Orders', labelTr: 'Siparişler', href: '/orders', icon: ShoppingBasket, disabled: false },
  { label: 'Products', labelTr: 'Ürünler', href: '/products', icon: Category },
  { label: 'Logout', labelTr: 'Çıkış Yap', href: '/login', icon: Logout },
];

