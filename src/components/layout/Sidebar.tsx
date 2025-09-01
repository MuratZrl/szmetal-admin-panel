// app/(admin)/_components_/layout/Sidebar.tsx
'use client';

import Link from 'next/link';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme as useNextTheme } from 'next-themes';

import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';

import Logo from '@/components/ui/Logo';

import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  Tooltip,
  Box,
  Badge,
  CircularProgress,
  IconButton,
} from '@mui/material';

import { mainLinks, type SidebarLink } from '@/constants/mainlinks';
import { supabase } from '@/lib/supabase/supabaseClient';
import type { User } from '@supabase/supabase-js';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // theme toggle (next-themes)
  const { resolvedTheme, setTheme } = useNextTheme();
  const [mountedTheme, setMountedTheme] = useState(false);
  useEffect(() => setMountedTheme(true), []);

  // logout
  const handleLogout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Çıkış sırasında hata:', error.message);
      return;
    }
    router.push('/login');
  }, [router]);

  // initial load: user, role, unread count
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const { data: userData } = await supabase.auth.getUser();
        const currentUser = userData?.user ?? null;
        if (!mounted) return;
        setUser(currentUser);

        if (!currentUser) {
          setRole(null);
          setUnreadCount(0);
          return;
        }

        const [roleRes, unreadRes] = await Promise.all([
          supabase.from('users').select('role').eq('id', currentUser.id).single(),
          supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', currentUser.id)
            .eq('is_read', false),
        ]);

        if (!mounted) return;

        const roleData = roleRes?.data as Record<string, unknown> | null;
        const fetchedRole =
          roleData && typeof roleData.role === 'string' ? (roleData.role as string) : null;
        setRole(fetchedRole);

        const unreadObj = unreadRes as unknown as Record<string, unknown> | null;
        const count = unreadObj && typeof unreadObj.count === 'number' ? (unreadObj.count as number) : 0;
        setUnreadCount(count);
      } catch (err) {
        console.error('Sidebar load error', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  // realtime notifications subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`notifications-user-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => setUnreadCount((prev) => prev + 1)
      )
      .subscribe();

    return () => {
      if (channel && typeof (supabase).removeChannel === 'function') {
        (supabase).removeChannel(channel);
      } else if (channel && typeof (channel).unsubscribe === 'function') {
        (channel).unsubscribe();
      }
    };
  }, [user]);

  // filtered links by role
  const filteredLinks = useMemo(() => {
    if (role === 'Admin') return mainLinks;

    if (role === 'User') {
      const allowedForUser = ['/account', '/systems', '/orders', '/login'];
      return mainLinks.filter((link) => allowedForUser.includes(link.href));
    }

    if (loading)
      return mainLinks
        .map((l) => ({ ...l, disabled: true } as SidebarLink & { disabled?: boolean }));

    return [];
  }, [role, loading]);

  // render single link
  const renderLink = (link: SidebarLink) => {
    const { label, labelTr, href, icon: Icon } = link;
    const isActive = pathname?.startsWith(href ?? '') ?? false;
    const isLogout = label === 'Logout';

    const disabled = Boolean((link as Partial<SidebarLink>).disabled);

    const iconElement =
      label === 'Orders' ? (
        <Badge badgeContent={unreadCount} color="error">
          <Icon fontSize="medium" />
        </Badge>
      ) : (
        <Icon fontSize="medium" />
      );

    const tooltipTitle = labelTr ?? label;

    return (
      <ListItem key={href} disablePadding sx={{ justifyContent: 'center' }}>
        <Tooltip title={tooltipTitle} placement="right" arrow>
          {isLogout ? (
            <ListItemButton
              className="SidebarNavButton"
              onClick={handleLogout}
              aria-label="Logout"
              aria-current={isActive ? 'page' : undefined}
              selected={isActive}
              disabled={disabled}
            >
              {iconElement}
            </ListItemButton>
          ) : (
            <ListItemButton
              className="SidebarNavButton"
              component={Link}
              href={href}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
              selected={isActive}
              disabled={disabled}
            >
              {iconElement}
            </ListItemButton>
          )}
        </Tooltip>
      </ListItem>
    );
  };

  // layout
  return (
    <Drawer
      variant="permanent"
      anchor="left"
      className="hidden sm:flex"
      // Stil yok: Drawer kâğıdı ve ölçüleri theme.ts -> components.MuiDrawer.styleOverrides.paper
    >
      {/* logo */}
      <Box display="flex" flexDirection="column" alignItems="center">
        <Link href="/dashboard" aria-label="Go to dashboard">
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            sx={{
              color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#111',
            }}
          >
            <Logo sx={{ fontSize: 55 }} />
          </Box>
        </Link>
      </Box>

      {/* center: nav */}
      <Box display="flex" flexDirection="column" alignItems="center" flex={1} justifyContent="center">
        <List sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {loading ? (
            <ListItem disablePadding sx={{ justifyContent: 'center' }}>
              <ListItemButton sx={{ justifyContent: 'center' }}>
                <IconButton size="small" disabled>
                  <CircularProgress size={20} color="inherit" />
                </IconButton>
              </ListItemButton>
            </ListItem>
          ) : (
            filteredLinks.filter((link) => link.label !== 'Logout').map(renderLink)
          )}
        </List>
      </Box>

      {/* bottom: theme toggle + logout */}
      <Box display="flex" flexDirection="column" alignItems="center" sx={{ gap: 0.5 }}>
        {mountedTheme ? (
          <Tooltip title={resolvedTheme === 'dark' ? 'Light moda geç' : 'Dark moda geç'} placement="right">
            <ListItemButton
              className="SidebarNavButton"
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              aria-label="Tema değiştir"
            >
              {resolvedTheme === 'dark' ? (
                <LightModeIcon fontSize="medium" />
              ) : (
                <DarkModeIcon fontSize="medium" />
              )}
            </ListItemButton>
          </Tooltip>
        ) : (
          // mount olmadan önce layout zıplamasın diye placeholder
          <ListItemButton aria-hidden>
            <Box sx={{ width: 20, height: 20 }} />
          </ListItemButton>
        )}

        {filteredLinks.find((link) => link.label === 'Logout') ? (
          renderLink(filteredLinks.find((link) => link.label === 'Logout')!)
        ) : null}
      </Box>
    </Drawer>
  );
}
