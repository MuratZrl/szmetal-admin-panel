'use client';
import { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { ordersColumns } from '@/constants/orders/columns';
import { supabase } from '@/lib/supabase/supabaseClient';

type Notification = {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  type: 'success' | 'rejected' | 'info' | null;
  created_at: string;
};

function toNotifType(v: unknown): Notification['type'] {
  return v === 'success' || v === 'rejected' || v === 'info' ? v : null;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) { setLoading(false); return; }

      const { data, error } = await supabase
        .from('orders')
        .select('id,title,message,is_read,type,created_at,user_id') // ihtiyacın kadar seç
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        const normalized: Notification[] = data.map(row => ({
          id: row.id,
          title: row.title,
          message: row.message,
          is_read: row.is_read,
          type: toNotifType(row.type),          // ← union’a daraltma
          created_at: row.created_at,
        }));
        setNotifications(normalized);
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
    <Box py={{ xs: 2, sm: 3 }}>
      <Box sx={{ height: { xs: 400, sm: 500, md: 600 } }}>
        <DataGrid
          rows={notifications}
          columns={ordersColumns}
          getRowId={(row) => row.id}
          hideFooter
          disableRowSelectionOnClick
          loading={loading}
        />
      </Box>
    </Box>
  );
}
