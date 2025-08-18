// app/(admin)/_components_/layout/Sidebar.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { useRouter, usePathname } from 'next/navigation';

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
  SxProps,
  Theme,
} from '@mui/material';

import { mainLinks, type SidebarLink } from '@/constants/mainlinks';
import { supabase } from '@/lib/supabase/supabaseClient';
import type { User } from '@supabase/supabase-js';

type SidebarProps = Record<string, never>;

export default function Sidebar(_props: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // -------------------------
  // styling + helpers
  // -------------------------
  const activeGradient = 'linear-gradient(180deg, #7f1d1d 0%, #3b0000 100%)';
  const hoverGradient =
    'linear-gradient(180deg, rgba(127,29,29,0.95) 0%, rgba(59,0,0,0.95) 100%)';

  const getButtonSx = (isActive: boolean, disabled?: boolean): SxProps<Theme> => ({
    justifyContent: 'center',
    borderRadius: 3,
    width: 45,
    height: 45,
    position: 'relative',
    overflow: 'hidden',
    color: isActive ? '#fff' : 'gray.600',
    transform: isActive ? 'translateY(-1px)' : 'none',

    // target nested svgs (works with Badge wrapper)
    '& svg, & .MuiSvgIcon-root': {
      position: 'relative',
      zIndex: 2,
      transition: 'color 220ms ease, transform 150ms ease',
      // ensure they inherit color from the button
      color: 'inherit',
    },

    '&::before': {
      content: '""',
      position: 'absolute',
      inset: 0,
      zIndex: 1,
      background: isActive ? activeGradient : hoverGradient,
      opacity: isActive ? 1 : 0,
      transition: 'opacity 220ms ease',
      pointerEvents: 'none',
    },

    '&:hover': {
      '&::before': { opacity: 1 },
      // icons inherit color, but force nested svg color too just in case
      '& svg, & .MuiSvgIcon-root': {
        color: '#fff',
      },
    },

    ...(disabled ? { opacity: 0.25, pointerEvents: 'none', transform: 'none' } : {}),
  });

  // -------------------------
  // logout
  // -------------------------
  const handleLogout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Çıkış sırasında hata:', error.message);
      return;
    }
    router.push('/login');
  }, [router]);

  // -------------------------
  // initial load: user, role, unread count
  // -------------------------
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

        // extract role safely
        const roleData = roleRes?.data as Record<string, unknown> | null;
        const fetchedRole =
          roleData && typeof roleData.role === 'string' ? (roleData.role as string) : null;
        setRole(fetchedRole);

        // extract count safely (defensive)
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

  // -------------------------
  // realtime notifications subscription
  // -------------------------
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
      // best-effort cleanup for different supabase client versions
      if (channel && typeof (supabase).removeChannel === 'function') {
        // older API
        (supabase).removeChannel(channel);
      } else if (channel && typeof (channel).unsubscribe === 'function') {
        channel.unsubscribe();
      }
    };
  }, [user]);

  // -------------------------
  // filtered links by role
  // -------------------------
  const filteredLinks = useMemo(() => {
    if (role === 'Admin') return mainLinks;

    if (role === 'User') {
      const allowedForUser = ['/account', '/systems', '/orders', '/login'];
      return mainLinks.filter((link) => allowedForUser.includes(link.href));
    }

    // while auth resolves, show links in disabled state so layout doesn't jump
    if (loading)
      return mainLinks.map((l) => ({ ...l } as SidebarLink & { disabled?: true })).map((l) => ({
        ...l,
        disabled: true,
      })) as SidebarLink[];

    return [];
  }, [role, loading]);

  // -------------------------
  // render single link
  // -------------------------
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
        <Tooltip
          title={tooltipTitle}
          placement="right"
        >
          {isLogout ? (
            <ListItemButton
              onClick={handleLogout}
              aria-label="Logout"
              aria-current={isActive ? 'page' : undefined}
              sx={getButtonSx(isActive, disabled)}
            >
              {iconElement}
            </ListItemButton>
          ) : (
            <ListItemButton
              component={Link}
              href={href}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
              sx={getButtonSx(isActive, disabled)}
            >
              {iconElement}
            </ListItemButton>
          )}
        </Tooltip>
      </ListItem>
    );
  };

  // -------------------------
  // layout
  // -------------------------
  return (
    <Drawer
      variant="permanent"
      anchor="left"
      className="hidden sm:flex"
      PaperProps={{
        sx: {
          color: 'white',
          backgroundColor: 'black',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: 60,
          py: 3,
        },
      }}
    >
      {/* logo */}
      <Box display="flex" flexDirection="column" alignItems="center" sx={{ px: 0 }}>
        <Link href="/dashboard" aria-label="Go to dashboard">
          <Box sx={{ cursor: 'pointer' }}>
            <Image src="/szmetal-logo.png" alt="Admin Logo" width={55} height={55} />
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

      {/* logout */}
      <Box display="flex" flexDirection="column" alignItems="center">
        {filteredLinks.find((link) => link.label === 'Logout') ? (
          renderLink(filteredLinks.find((link) => link.label === 'Logout')!)
        ) : null}
      </Box>
    </Drawer>
  );
}
