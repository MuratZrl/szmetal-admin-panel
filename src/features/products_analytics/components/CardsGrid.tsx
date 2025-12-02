// src/features/products_analytics/components/CardsGrid.tsx
import { Grid } from '@mui/material';
import StatCard from '@/components/ui/cards/StatCard.client';
import {
  getProductStats,
  computeChangePercentage,
} from '@/features/products_analytics/services/cards.server';

export default async function CardsGrid() {
  const {
    totalCount,
    thisMonthCount,
    // prevMonthCount, // artık kullanmıyoruz
    // prevPrevMonthCount,
    totalWithCustomerMold,
    totalAvailable,
    thisMonthWithCustomerMoldCount,
    thisMonthAvailableCount,
    // prevMonthWithCustomerMoldCount,
    // prevMonthAvailableCount,
  } = await getProductStats();

  // 1) Toplam ürün için: geçen ay sonundaki toplamı hesapla
  const prevTotal = Math.max(0, totalCount - thisMonthCount);
  const totalPct = computeChangePercentage(totalCount, prevTotal);

  // 2) Kullanılabilir ürünler için: geçen ay sonundaki toplam kullanılabilir
  const prevAvailableTotal = Math.max(
    0,
    totalAvailable - thisMonthAvailableCount,
  );
  const availablePct = computeChangePercentage(
    totalAvailable,
    prevAvailableTotal,
  );

  // 3) Müşteri kalıbı profilleri için: geçen ay sonundaki toplam MK sayısı
  const prevCustomerMoldTotal = Math.max(
    0,
    totalWithCustomerMold - thisMonthWithCustomerMoldCount,
  );
  const customerMoldPct = computeChangePercentage(
    totalWithCustomerMold,
    prevCustomerMoldTotal,
  );

  return (
    <Grid
      container
      spacing={2}
      sx={{ mb: 3 }}
    >
      {/* 1) Toplam ürün */}
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <StatCard
          title="Toplam ürün"
          value={totalCount}
          // Bu ay hiç yeni ürün yoksa yüzdeyi gizle, sadece "Bu ay yeni kayıt yok." yazsın
          percentage={thisMonthCount === 0 ? undefined : totalPct}
          delta={thisMonthCount}
          percentDecimals={1}
          emptyPctLabel="Bu ay yeni kayıt yok."
        />
      </Grid>

      {/* 2) Kullanılabilir ürünler */}
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <StatCard
          title="Kullanılabilir ürünler"
          value={totalAvailable}
          percentage={
            thisMonthAvailableCount === 0 ? undefined : availablePct
          }
          delta={thisMonthAvailableCount}
          percentDecimals={1}
          emptyPctLabel="Bu ay yeni kayıt yok."
        />
      </Grid>

      {/* 3) Müşteri Kalıbı profilleri */}
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <StatCard
          title="Müşteri Kalıbı Profilleri"
          value={totalWithCustomerMold}
          percentage={
            thisMonthWithCustomerMoldCount === 0
              ? undefined
              : customerMoldPct
          }
          delta={thisMonthWithCustomerMoldCount}
          percentDecimals={1}
          emptyPctLabel="Bu ay yeni kayıt yok."
        />
      </Grid>
    </Grid>
  );
}
