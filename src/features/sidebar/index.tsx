// src/features/sidebar/index.ts
import SidebarRoot from './components/SidebarRoot.client';
import type { SidebarInitialData } from './services/sidebar.server';
import type { SidebarLink } from './types';

export default function Sidebar({ initialData, mainLinks }: { initialData: SidebarInitialData; mainLinks: SidebarLink[]; }) {
  return (
    <SidebarRoot
      initialRole={initialData.role}
      initialUnread={initialData.unreadCount}
      userId={initialData.userId}
      mainLinks={mainLinks}
    />
  );
}
