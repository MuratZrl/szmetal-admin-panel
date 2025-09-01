'use client';
// ****************************************************************************************************
import { useEffect, useState } from 'react';
// ****************************************************************************************************
import { Box } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
// ****************************************************************************************************
import { ordersColumns } from '@/constants/orders/columns';
// ****************************************************************************************************
import { supabase } from '@/lib/supabase/supabaseClient';
// ****************************************************************************************************
type Notification = {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  type: 'success' | 'rejected' | 'info' | null;
  created_at: string;
};
// ****************************************************************************************************
export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // ****************************************************************************************************

  // useEffect hook'ları
  useEffect(() => {
    const fetchNotifications = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      if (!userId) return;

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setNotifications(data);
      }

      setLoading(false);
    };

    fetchNotifications();
  }, []);

  useEffect(() => {
    const markAsRead = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('orders')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
    };

    markAsRead();
  }, []);

  return (
    <Box py={{ xs: 2, sm: 3 }} >

      <Box sx={{ height: { xs: 400, sm: 500, md: 600 } }}>
        <DataGrid
          rows={notifications}
          columns={ordersColumns}
          getRowId={(row) => row.id}
          hideFooter
          disableRowSelectionOnClick
          loading={loading} // ← sadece bu satırla loading skeleton gösterilir
        />
      </Box>
    </Box>
  );
}
