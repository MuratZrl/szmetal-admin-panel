'use client';
// src/features/sidebar/components/SidebarNavItem.tsx

import * as React from 'react';
import { usePathname } from 'next/navigation';

import {
  ListItem,
  ListItemButton,
  Tooltip,
  Box,
  Typography,
  Collapse,
  List,
  Paper,
  Popper,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import type { SidebarLink } from '../types';

export default function SidebarNavItem({
  link,
  active,
  compact,
  onLogout,
}: {
  link: SidebarLink;
  active: boolean;
  compact?: boolean;
  onLogout?: () => void;
}) {
  const pathname = usePathname();
  const Icon = link.icon;
  const isLogout = Boolean(onLogout);
  const title = link.labelTr ?? link.label;
  const hasChildren = !isLogout && link.children && link.children.length > 0;

  // Alt menüler: aktif sayfadayken veya ana link aktifken açık
  const childActive = hasChildren && link.children!.some(
    (c) => pathname === c.href || pathname.startsWith(`${c.href}/`) || pathname.startsWith(`${c.href}?`),
  );
  const [open, setOpen] = React.useState(active || childActive);

  React.useEffect(() => {
    if (active || childActive) setOpen(true);
  }, [active, childActive]);

  const handleClick = React.useCallback(() => {
    if (isLogout) {
      onLogout?.();
      return;
    }
    if (hasChildren && !compact) {
      setOpen((prev) => !prev);
    }
  }, [isLogout, onLogout, hasChildren, compact]);

  const buttonProps = isLogout
    ? ({ component: 'button', type: 'button', onClick: handleClick } as const)
    : hasChildren && !compact
      ? ({ href: link.href ?? '#', onClick: () => setOpen((prev) => !prev) } as const)
      : ({ href: link.href ?? '#' } as const);

  const ButtonEl = (
    <ListItemButton
      className={`SidebarNavItemButton${compact ? ' is-compact' : ''}`}
      {...buttonProps}
      aria-label={title}
      aria-current={active ? 'page' : undefined}
      selected={active}
      disabled={link.disabled}
      draggable={false}
      sx={hasChildren && !compact ? { cursor: 'pointer' } : undefined}
    >
      <Box component="span" sx={{ display: 'inline-flex' }}>
        <Icon fontSize="medium" />
      </Box>

      {!compact && (
        <>
          <Typography
            variant="body2"
            component="span"
            sx={{
              fontWeight: active ? 600 : 500,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              flex: 1,
            }}
          >
            {title}
          </Typography>

          {hasChildren && (
            <ExpandMoreIcon
              fontSize="small"
              sx={{
                transition: 'transform 0.2s ease',
                transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                opacity: 0.5,
                ml: 0.5,
              }}
            />
          )}
        </>
      )}
    </ListItemButton>
  );

  // Compact popover state
  const anchorRef = React.useRef<HTMLLIElement>(null);
  const [popoverOpen, setPopoverOpen] = React.useState(false);

  const handleCompactEnter = React.useCallback(() => {
    if (compact && hasChildren) setPopoverOpen(true);
  }, [compact, hasChildren]);

  const handleCompactLeave = React.useCallback(() => {
    if (compact && hasChildren) setPopoverOpen(false);
  }, [compact, hasChildren]);

  return (
    <>
      <ListItem
        ref={anchorRef}
        disablePadding
        sx={{ justifyContent: 'center', width: compact ? 'auto' : '100%' }}
        onMouseEnter={handleCompactEnter}
        onMouseLeave={handleCompactLeave}
      >
        {compact ? (
          hasChildren ? (
            // Çocuklu item'da tooltip yerine popover kullan
            <>
              {ButtonEl}
              <Popper
                open={popoverOpen}
                anchorEl={anchorRef.current}
                placement="right-start"
                modifiers={[
                  { name: 'offset', options: { offset: [0, 2] } },
                ]}
                sx={{ zIndex: 1300 }}
              >
                <Paper
                  elevation={8}
                  onMouseEnter={handleCompactEnter}
                  onMouseLeave={handleCompactLeave}
                  sx={(t) => ({
                    py: 0.5,
                    px: 0.5,
                    borderRadius: 2,
                    minWidth: 160,
                    bgcolor: t.palette.background.paper,
                    border: '1px solid',
                    borderColor: 'divider',
                  })}
                >
                  {/* Ana link */}
                  <ListItemButton
                    href={link.href ?? '#'}
                    draggable={false}
                    selected={active}
                    sx={(t) => ({
                      borderRadius: 1.5,
                      py: 0.75,
                      px: 1.5,
                      gap: 1,
                      mb: 0.5,
                    })}
                  >
                    <Box component="span" sx={{ display: 'inline-flex' }}>
                      <Icon fontSize="small" />
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: active ? 600 : 500, fontSize: 13 }}>
                      {title}
                    </Typography>
                  </ListItemButton>

                  {/* Alt linkler */}
                  {link.children!.map((child) => {
                    const ChildIcon = child.icon;
                    const childTitle = child.labelTr ?? child.label;
                    const isChildActive = pathname === child.href || pathname.startsWith(`${child.href}/`);

                    return (
                      <ListItemButton
                        key={child.href}
                        href={child.href}
                        draggable={false}
                        selected={isChildActive}
                        sx={(t) => ({
                          borderRadius: 1.5,
                          py: 0.75,
                          px: 1.5,
                          gap: 1,
                          ...(isChildActive
                            ? {
                                bgcolor: alpha(t.palette.primary.main, 0.12),
                                color: t.palette.primary.main,
                              }
                            : {}),
                        })}
                      >
                        <Box component="span" sx={{ display: 'inline-flex' }}>
                          <ChildIcon fontSize="small" />
                        </Box>
                        <Typography variant="body2" sx={{ fontSize: 13, fontWeight: isChildActive ? 600 : 400 }}>
                          {childTitle}
                        </Typography>
                      </ListItemButton>
                    );
                  })}
                </Paper>
              </Popper>
            </>
          ) : (
            <Tooltip title={title} placement="right" arrow disableInteractive enterTouchDelay={0}>
              {ButtonEl}
            </Tooltip>
          )
        ) : (
          ButtonEl
        )}
      </ListItem>

      {/* Alt menüler — sadece expanded modda göster */}
      {hasChildren && !compact && (
        <Collapse in={open} timeout={200} unmountOnExit>
          <List disablePadding sx={{ pl: 2 }}>
            {link.children!.map((child) => {
              const ChildIcon = child.icon;
              const childTitle = child.labelTr ?? child.label;
              const isChildActive = pathname === child.href || pathname.startsWith(`${child.href}/`) || pathname.startsWith(`${child.href}?`);

              return (
                <ListItem key={child.href} disablePadding>
                  <ListItemButton
                    href={child.href}
                    selected={isChildActive}
                    draggable={false}
                    sx={(t) => ({
                      borderRadius: 1.5,
                      py: 0.5,
                      px: 1.5,
                      gap: 1,
                      ...(isChildActive
                        ? {
                            bgcolor: alpha(t.palette.primary.main, 0.12),
                            color: t.palette.primary.main,
                          }
                        : {}),
                    })}
                  >
                    <Box component="span" sx={{ display: 'inline-flex' }}>
                      <ChildIcon fontSize="small" />
                    </Box>
                    <Typography
                      variant="body2"
                      component="span"
                      sx={{
                        fontSize: 13,
                        fontWeight: isChildActive ? 600 : 400,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {childTitle}
                    </Typography>
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Collapse>
      )}
    </>
  );
}
