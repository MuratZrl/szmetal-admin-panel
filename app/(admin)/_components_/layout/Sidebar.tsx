// app/(admin)/_components_/layout/Sidebar.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';

import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  Tooltip,
  Box,
  Badge,
} from '@mui/material';

import { mainLinks, SidebarLink } from '../../_constants_/mainlinks';

import { supabase } from '../../../lib/supabase/supabaseClient';

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const [role, setRole] = useState<string | null>(null);

  const [unreadCount, setUnreadCount] = useState<number>(0);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Çıkış sırasında hata:', error.message);
      return;
    }
    router.push('/login');
  };

  const filteredLinks = useMemo(() => {
    if (role === 'Admin') return mainLinks;

    if (role === 'User') {
      const allowedForUser = ['/account', '/systems', '/notifications', '/login'];
      return mainLinks.filter((link) => allowedForUser.includes(link.href));
    }

    return []; // rol yoksa hiçbir şey gösterme
  }, [role]);

  useEffect(() => {
    const fetchRole = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        setRole(profile?.role || null);
      }
    };

    fetchRole();
  }, []);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      setUnreadCount(count || 0);
    };

    fetchUnreadCount();
  }, []);


  useEffect(() => {
    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase
        .channel('realtime-notifications')
        channel
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            setUnreadCount((prev) => prev + 1);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupRealtime();
  }, []);

  const renderLink = ({ label, href, icon: Icon }: SidebarLink) => {
    const isActive = pathname.startsWith(href);
    const isLogout = label === 'Logout';

    const button = (
      <ListItemButton
        onClick={isLogout ? handleLogout : undefined} // sadece logout için
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: isActive ? 'orangered' : 'gray.600',
          transition: 'color 0.15s ease',
          '&:hover': {
            color: 'orangered',
            backgroundColor: 'transparent',
          },
        }}
      >
        {label === 'Orders' ? (
          <Badge badgeContent={unreadCount} color="error">
            <Icon fontSize="medium" />
          </Badge>
        ) : (
          <Icon fontSize="medium" />
        )}
      </ListItemButton>
    );

    return (
      <ListItem key={href} disablePadding sx={{ justifyContent: 'center' }}>
        <Tooltip
          title={label}
          placement="right"
          PopperProps={{
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: [0, 0], // hover balonunun butona göre uzaklığı
                },
              },
            ],
            sx: {
              '& .MuiTooltip-tooltip': {
                backgroundColor: 'black',
                color: '#fff',
                fontSize: '0.875rem',
                borderRadius: 2,
                padding: '8px 12px',
              },
            },
          }}
        >
          {isLogout ? button : <Link href={href}>{button}</Link>}
        </Tooltip>
      </ListItem>
    );
  };

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
      {/* Logo */}
      <Box display="flex" flexDirection="column" alignItems="center">
        <Link href="/dashboard">
          <Box>
            <Image
              src="/szmetal-logo.png"
              alt="Admin Logo"
              width={45}
              height={45}
              className="transition-transform"
            />
          </Box>
        </Link>
      </Box>

      {/* Menü Linkleri */}
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        flex={1}
        justifyContent="center"
      >
        <List>
          {filteredLinks
            .filter((link) => link.label !== 'Logout')
            .map(renderLink)}
        </List>
      </Box>

      {/* Logout */}
      <Box display="flex" flexDirection="column" alignItems="center">
        {(() => {
          const logoutLink = filteredLinks.find((link) => link.label === 'Logout');
          return logoutLink ? renderLink(logoutLink) : null;
        })()}
      </Box>

    </Drawer>
  );
};

export default Sidebar;
