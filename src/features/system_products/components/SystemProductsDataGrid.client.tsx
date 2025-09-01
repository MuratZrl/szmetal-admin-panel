// src/features/system_products/components/SystemProductsDataGrid.client.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Box, Button, IconButton, Tooltip } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {
  DataGrid,
  type GridColDef,
  GridToolbar,
  type GridRowParams,
} from "@mui/x-data-grid";

const THUMB = {
  colWidth: 180,          // kolonda ne kadar genişlik istiyorsun
  rowHeight: 140,         // satır yüksekliği (colWidth 180 ve 4/3 oranı için ~135, yuvarladım)
  aspect: "4 / 3" as const, // oranı değiştir: "16 / 9", "1 / 1" vs.
};

export type SystemProductRow = {
  slug: string;
  title: string;
  imageSrc: string;
};

export default function SystemProductsDataGrid({
  rows,
}: {
  rows: SystemProductRow[];
}) {
  const columns = React.useMemo<GridColDef<SystemProductRow>[]>(
    () => [
      {
        field: "imageSrc",
        headerName: "Görsel",
        sortable: false,
        filterable: false,
        width: THUMB.colWidth,
        renderCell: (params) => (
          <Box sx={{ width: "100%", py: 0.5, height: '100%' }}>
            <Box
              sx={{
                position: "relative",
                width: "100%",
                height: '100%',
                aspectRatio: THUMB.aspect,     // oran koruma burada
                borderRadius: 1.5,
                overflow: "hidden",
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.default",
              }}
            >
              <Image
                src={params.row.imageSrc}
                alt={params.row.title}
                fill
                sizes={`${THUMB.colWidth}px`}   // Next/Image'e gerçek genişliği söyle
                style={{ objectFit: "cover" }}
              />
            </Box>
          </Box>
        ),
      },
      {
        field: "title",
        headerName: "Sistem Adı",
        flex: 1,
        minWidth: 220,
      },
      {
        field: "slug",
        headerName: "Slug",
        minWidth: 240,
        flex: 0.5,
        renderCell: (params) => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box component="code" sx={{ fontSize: 13 }} >
              {params.row.slug}
            </Box>
            <Tooltip title="Kopyala">
              <IconButton
                size="small"
                onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    await navigator.clipboard.writeText(params.row.slug);
                  } catch {
                    /* telefon/https değilse clipboard patlayabilir; görmezden geliyoruz */
                  }
                }}
              >
                <ContentCopyIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      },
      {
        field: "actions",
        headerName: "İşlemler",
        sortable: false,
        filterable: false,
        minWidth: 220,
        renderCell: (params) => (
          <Box sx={{ display: "flex", alignItems: 'center', gap: 1, height: '100%' }}>
            <Button
              component={Link}
              href={`/system_products/${params.row.slug}`}
              size="small"
              variant="outlined"
              sx={{ px: 2, borderRadius: 4, textTransform: 'capitalize' }}
            >
              Aç
            </Button>
            <Button
              component={Link}
              href={`/system_products/${params.row.slug}/edit`}
              size="small"
              variant="contained"
              sx={{ px: 2, borderRadius: 4, textTransform: 'capitalize' }}
            >
              Düzenle
            </Button>
          </Box>
        ),
      },
    ],
    []
  );

  const getRowId = React.useCallback((r: SystemProductRow) => r.slug, []);

  const onRowClick = React.useCallback((params: GridRowParams<SystemProductRow>) => {
    // Satıra tıklayınca detay sayfasına git. Aşağıdaki butonlar zaten kendi link'leriyle gidiyor.
    window.location.href = `/system_products/${params.row.slug}`;
  }, []);

  return (
    <DataGrid
      rows={rows}
      columns={columns}
      getRowId={getRowId}
      autoHeight
      disableRowSelectionOnClick
      onRowClick={onRowClick}
      rowHeight={THUMB.rowHeight}   // satır yüksekliği büyütüldü 
      initialState={{
        pagination: { paginationModel: { page: 0, pageSize: 8 } },
        columns: { columnVisibilityModel: { imageSrc: true } },
      }}
      hideFooter
      pageSizeOptions={[8, 16, 32]}
      slots={{ toolbar: GridToolbar }}
      slotProps={{ toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 300 } } }}
      sx={{
        "& .MuiDataGrid-cell:focus, & .MuiDataGrid-columnHeader:focus": { outline: "none" },
        borderRadius: 2,
      }}
    />
  );
}
