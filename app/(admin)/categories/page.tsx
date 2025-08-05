'use client'

import { useEffect, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box } from "@mui/material";
import { Skeleton } from "@mui/material";

import { supabase } from "../../lib/supabase/supabaseClient";

type Category = {
  id: string;
  name: string;
  created_at: string;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("categories").select("*");
      if (error) {
        console.error("Kategori verisi alınamadı:", error.message);
      } else {
        setCategories(data);
      }
      setLoading(false);
    };

    fetchCategories();
  }, []);

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 200 },
    { field: "name", headerName: "Kategori Adı", flex: 1 },
    { field: "created_at", headerName: "Oluşturulma", width: 200 },
  ];

  return (
    <Box className="p-4">
      {loading ? (
        <Skeleton variant="rectangular" height={400} />
      ) : (
        <DataGrid
          rows={categories}
          columns={columns}
          getRowId={(row) => row.id}
          autoHeight
          pageSizeOptions={[5, 10, 25]}
        />
      )}
    </Box>
  );
}
