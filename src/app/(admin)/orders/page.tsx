// app/(admin)/orders/page.tsx
import { Paper } from '@mui/material';
import { createSupabaseRSCClient } from '@/lib/supabase/supabaseServer';
import OrdersGrid from '@/features/orders/components/OrdersGrid.client';
import type { Database } from '@/types/supabase';

type OrdersRow = Database['public']['Tables']['orders']['Row'] & {
  title?: string | null;
  tille?: string | null; // kolon yok ama client kodu bunu opsiyonel olarak tolere ediyor
};

export default async function OrdersPage() {
  const supabase = await createSupabaseRSCClient();

  const { data, error } = await supabase
    .from('orders')
    // 'tille' YOK. Çıkardık.
    .select('id,user_id,message,is_read,type,created_at,title')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Orders fetch failed: ${error.message}`);
  }

  const rows: OrdersRow[] = Array.isArray(data) ? data : [];

  return (
    <Paper elevation={0} variant="outlined">
        <OrdersGrid initialRows={rows} />
    </Paper>
  );
}
