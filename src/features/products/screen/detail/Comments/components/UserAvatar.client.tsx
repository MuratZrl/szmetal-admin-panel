// src/features/products/screen/detail/Comments/components/UserAvatar.client.tsx
'use client';

import * as React from 'react';
import { Avatar } from '@mui/material';
import { alpha } from '@mui/material/styles';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';

export type UserAvatarProps = {
  src?: string | null;
  alt?: string;
  size?: number; // default: 36
};

export default function UserAvatar({
  src,
  alt,
  size = 36,
}: UserAvatarProps): React.JSX.Element {
  const [broken, setBroken] = React.useState(false);

  React.useEffect(() => {
    setBroken(false);
  }, [src]);

  return (
    <Avatar
      src={!broken && src ? src : undefined}
      alt={alt}
      imgProps={{
        onError: () => setBroken(true),
        crossOrigin: 'anonymous',
        referrerPolicy: 'no-referrer-when-downgrade',
        loading: 'lazy',
      }}
      sx={(theme) => ({
        width: size,
        height: size,
        mt: 0,
        bgcolor: alpha(theme.palette.text.disabled, 0.12),
      })}
    >
      <PersonOutlineIcon fontSize="small" />
    </Avatar>
  );
}
