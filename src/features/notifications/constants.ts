// src/features/notifications/constants.ts

import InventoryIcon from '@mui/icons-material/Inventory2Outlined';
import EditNoteIcon from '@mui/icons-material/EditNoteOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PersonAddIcon from '@mui/icons-material/PersonAddOutlined';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import ToggleOnIcon from '@mui/icons-material/ToggleOnOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import type { NotificationType } from './types';
import type { OverridableComponent } from '@mui/types';
import type { SvgIconTypeMap } from '@mui/material/SvgIcon';

type IconComponent = OverridableComponent<SvgIconTypeMap<object, 'svg'>>;

type NotificationMeta = {
  icon: IconComponent;
  color: string; // MUI palette path (e.g. 'success.main')
  getHref?: (data: Record<string, unknown>) => string | null;
};

export const NOTIFICATION_META: Record<NotificationType, NotificationMeta> = {
  product_created: {
    icon: InventoryIcon,
    color: 'success.main',
    getHref: (d) => d.product_id ? `/products/${d.product_id}` : null,
  },
  product_updated: {
    icon: EditNoteIcon,
    color: 'info.main',
    getHref: (d) => d.product_id ? `/products/${d.product_id}` : null,
  },
  product_deleted: {
    icon: DeleteOutlineIcon,
    color: 'error.main',
  },
  user_registered: {
    icon: PersonAddIcon,
    color: 'success.main',
    getHref: () => '/clients',
  },
  user_role_changed: {
    icon: AdminPanelSettingsIcon,
    color: 'warning.main',
    getHref: () => '/clients',
  },
  user_status_changed: {
    icon: ToggleOnIcon,
    color: 'warning.main',
    getHref: () => '/clients',
  },
  comment_added: {
    icon: ChatBubbleOutlineIcon,
    color: 'info.main',
    getHref: (d) => d.product_id ? `/products/${d.product_id}` : null,
  },
  system: {
    icon: InfoOutlinedIcon,
    color: 'text.secondary',
  },
};
