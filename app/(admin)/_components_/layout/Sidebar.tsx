'use client';

import Image from 'next/image';
import Link from 'next/link';

import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';

import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  Tooltip,
  Box,
} from '@mui/material';

import { mainLinks, SidebarLink } from '../../_constants_/mainlinks';

import { supabase } from '../../../lib/supabaseClient';

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Çıkış sırasında hata:', error.message);
      return;
    }
    router.push('/login');
  };

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
        <Icon fontSize="medium" />
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
          {mainLinks
            .filter((link) => link.label !== 'Logout') // 👈 logout ayrı gösterilecek
            .map(renderLink)}
        </List>
      </Box>

      {/* Logout */}
      <Box display="flex" flexDirection="column" alignItems="center">
        {(() => {
          const logoutLink = mainLinks.find((link) => link.label === 'Logout');
          return logoutLink ? renderLink(logoutLink) : null;
        })()}
      </Box>

    </Drawer>
  );
};

export default Sidebar;
