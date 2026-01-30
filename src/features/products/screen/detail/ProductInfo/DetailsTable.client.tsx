'use client';
// src/features/products/components/ProductInfo/DetailsTable.client.tsx

import * as React from 'react';

import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from '@mui/material';
import type { Theme } from '@mui/material/styles';
import { darken } from '@mui/material/styles';

import type { DetailItem } from './types';

const surfaceBg = (t: Theme): string =>
  t.palette.mode === 'dark' ? t.palette.background.default : t.palette.background.paper;

const sectionHeaderBg = (t: Theme): string =>
  darken(surfaceBg(t), t.palette.mode === 'dark' ? 0.32 : 0.08);

export type DetailsTableProps = {
  rows: Array<[DetailItem, DetailItem | null]>;
  title?: string;
};

type KVProps = { item: DetailItem };

function KVRight({ item }: KVProps): React.JSX.Element {
  const isBold = typeof item.label === 'string' && item.label.startsWith('Birim Ağırlık');

  const valueNode = React.useMemo(() => {
    const v = item.value;

    // React element (Chip, Typography vs.) ise aynen render et.
    if (React.isValidElement(v)) return v;

    // string/number gibi primitive ise Typography ile render et (nowrap + ellipsis)
    return (
      <Typography
        component="span"
        variant="body2"
        sx={{
          fontWeight: isBold ? 700 : 500,
          color: 'text.primary',
          lineHeight: 1.35,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: 'block',
          textAlign: 'right',
        }}
      >
        {v}
      </Typography>
    );
  }, [item.value, isBold]);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        gap: 1,
        minWidth: 0,
      }}
    >
      <Typography
        component="span"
        variant="caption"
        sx={{
          color: 'text.secondary',
          lineHeight: 1.35,
          minWidth: 0,
          flex: '1 1 auto',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
        title={typeof item.label === 'string' ? item.label : undefined}
      >
        {item.label}:
      </Typography>

      <Box
        component="span"
        sx={{
          display: 'inline-flex',
          alignItems: 'baseline',
          justifyContent: 'flex-end',
          flex: '0 0 auto',
          minWidth: 0,
          maxWidth: '62%', // value çok uzarsa label’i tamamen yok etmesin
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textAlign: 'right',
        }}
      >
        {/* Element ise (Chip) overflow/nowrap wrapper ile sağda kalır.
            Primitive ise zaten Typography içinde nowrap+ellipsis var. */}
        {React.isValidElement(item.value) ? (
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'baseline',
              justifyContent: 'flex-end',
              minWidth: 0,
              maxWidth: '100%',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            {valueNode}
          </Box>
        ) : (
          valueNode
        )}
      </Box>
    </Box>
  );
}

export function DetailsTable({
  rows,
  title = 'Teknik Özellikler',
}: DetailsTableProps): React.JSX.Element {
  return (
    <Box
      sx={(t) => ({
        border: 1,
        borderColor: 'divider',
        borderRadius: 0.5,
        overflow: 'hidden',
        bgcolor: surfaceBg(t),
      })}
    >
      <Box
        sx={(t) => ({
          px: 1.5,
          py: 1,
          bgcolor: sectionHeaderBg(t),
          borderBottom: `1px solid ${t.palette.divider}`,
        })}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
          {title}
        </Typography>
      </Box>

      <TableContainer sx={(t) => ({ bgcolor: surfaceBg(t) })}>
        <Table
          size="small"
          aria-label={title}
          sx={(t) => ({
            tableLayout: 'fixed',
            '& td, & th': { borderColor: t.palette.divider },
          })}
        >
          <TableBody>
            {rows.map(([a, b], idx) => {
              const isLast = idx === rows.length - 1;

              return (
                <TableRow
                  key={idx}
                  sx={(t) => ({
                    '& td': {
                      verticalAlign: 'top',
                      px: 1.5,
                      py: 1.25,
                      borderBottom: isLast ? 0 : `1px solid ${t.palette.divider}`,
                    },
                  })}
                >
                  <TableCell
                    sx={(t) => ({
                      width: '50%',
                      borderRight: `1px solid ${t.palette.divider}`,
                    })}
                  >
                    <KVRight item={a} />
                  </TableCell>

                  <TableCell sx={{ width: '50%' }}>
                    {b ? <KVRight item={b} /> : <Box sx={{ minHeight: 1 }} />}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default DetailsTable;
