// app/(admin)/_components_/layout/Sidebar.tsx
'use client';

import React from 'react';

import Link from 'next/link';
import Image from 'next/image';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

import { useTheme as useNextTheme } from 'next-themes';

import { SIDEBAR_WIDTH } from '@/constants/layout';

import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';

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

import { mainLinks} from '@/constants/mainlinks';
import type { SidebarLink } from '@/features/sidebar/types';

import { supabase } from '@/lib/supabase/supabaseClient';
import type { User } from '@supabase/supabase-js';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const { resolvedTheme, setTheme } = useNextTheme();
  const current: 'light' | 'dark' = resolvedTheme === 'dark' ? 'dark' : 'light';
  const nextMode: 'light' | 'dark' = current === 'dark' ? 'light' : 'dark';
  const ThemeIcon: React.ElementType = current === 'dark' ? DarkModeIcon : LightModeIcon;

  const [, setMountedTheme] = useState(false);
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
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
      const allowedForUser = ['/account', '/create_request', '/orders', '/login'];
      return mainLinks.filter((link) => allowedForUser.includes(link.href));
    }

    if (loading)
      return mainLinks
        .map((l) => ({ ...l, disabled: true } as SidebarLink & { disabled?: boolean }));

    return [];
  }, [role, loading]);

  // renderLink'i güncelle
  const renderLink = (link: SidebarLink, opts?: { center?: boolean }) => {
    const { label, labelTr, href, icon: Icon } = link;
    const isLogout = label === 'Logout';
    const isActive = pathname?.startsWith(href ?? '') ?? false;
    const disabled = Boolean((link as Partial<SidebarLink>).disabled);
    const tooltipTitle = labelTr ?? label;

    // bottom için kompakt ölçüler (ikon butonu)
    const compact = Boolean(opts?.center);

    const iconElement =
      label === 'Orders' ? (
        <Badge badgeContent={unreadCount} color="error">
          <Icon fontSize="medium" />
        </Badge>
      ) : (
        <Icon fontSize="medium" />
      );

    return (

      <ListItem
        key={href ?? label}
        disablePadding
        sx={{
          justifyContent: 'center',
          width: compact ? 'auto' : '100%', // ⬅️ alt tarafta genişleme olmasın
        }}
      >

        <Tooltip title={tooltipTitle} placement="right" arrow>
          {isLogout ? (
            <ListItemButton
              className="SidebarNavButton"
              onClick={handleLogout}
              aria-label="Logout"
              aria-current={isActive ? 'page' : undefined}
              selected={isActive}
              disabled={disabled}
              sx={{
                justifyContent: compact ? 'center' : undefined, // ⬅️ merkezle
                width: compact ? 44 : undefined,
                height: compact ? 44 : undefined,
                minWidth: compact ? 44 : undefined,
                px: compact ? 0 : undefined,
              }}
            >
              {iconElement}
            </ListItemButton>
          ) : (
            <ListItemButton
              className="SidebarNavButton"

              LinkComponent={Link}
              href={href}             // ← kritik
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
              selected={isActive}
              disabled={disabled}
              draggable={false}
              sx={{
                justifyContent: compact ? 'center' : undefined,
                width: compact ? 44 : undefined,
                height: compact ? 44 : undefined,
                minWidth: compact ? 44 : undefined,
                px: compact ? 0 : undefined,
              }}
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
      // className="hidden sm:flex" yerine MUI breakpoint istersen:
      sx={{
        display: { xs: 'none', sm: 'flex' },

        // ⬇️ KÖK genişlik (main’i doğru itmek için şart)
        width: SIDEBAR_WIDTH,
        flexShrink: 0,

        // ⬇️ Paper genişlik (görünen drawer’ın gerçek eni)
        '& .MuiDrawer-paper': (theme) => ({
          width: SIDEBAR_WIDTH,
          boxSizing: 'border-box',
          borderRadius: 0,
          backgroundColor: theme.palette.surface[1],
          borderRight: `1px solid ${theme.palette.surface.outline}`,
          paddingTop: theme.spacing(3.5),
          paddingBottom: theme.spacing(3.5),
        }),
      }}
    >

      {/* logo */}
      <Box display="flex" flexDirection="column" alignItems="center">
        <Link href="/create_request" aria-label="Go to request">
          {/* Sabit bir alan ayır: genişlik ve yükseklik */}
          <Box
            sx={{
              position: 'relative',
              width: 60,            // sidebar genişliğine göre ayarla (120–160 iyi)
              height: 40,            // logonun gerçek oranına yakın bir yükseklik
              mx: 'auto',
            }}
          >
            {mounted ? (
              <Image
                src={current === 'dark' ? '/logo_white.png' : '/logo_black.png'}
                alt="Logo"
                fill                          // width/height yerine fill
                style={{ objectFit: 'contain', objectPosition: 'center' }}
                priority
                draggable={false}
              />
            ) : null}
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
                  <CircularProgress size={35} color="inherit" />
                </IconButton>
              </ListItemButton>
            </ListItem>
          ) : (
            filteredLinks
              .filter(link => link.label !== 'Logout')
              .map(link => renderLink(link))
          )}
        </List>
      </Box>

      {/* bottom: theme toggle + logout */}
      <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column" sx={{ gap: 0.5 }}>
        
        {/* toggle */}

        <ListItemButton
          onClick={() => setTheme(nextMode)}
          sx={{ justifyContent: 'center', width: 44, height: 44, px: 0 }}
        >
          <ThemeIcon fontSize="medium" />
        </ListItemButton>


        {/* logout'u merkezli (compact) render et */}
        {filteredLinks.find((l) => l.label === 'Logout')
          ? renderLink(filteredLinks.find((l) => l.label === 'Logout')!, { center: true })
          : null}

      </Box>

    </Drawer>
  );
}
