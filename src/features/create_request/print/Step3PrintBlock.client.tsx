'use client';

import * as React from 'react';

// Özet için KV satır tipi (ProductPrintBlock’taki Row ile aynı)
export type KvRow = { label: string; value: React.ReactNode };

// Malzeme tablosu için yazdırmada gerçekten gereken minimum alanlar
export type PrintMaterial = {
  profil_resmi: string | null;
  profil_kodu: string;
  profil_adi: string;
  kesim_olcusu: string;
  verilecek_adet: number | string;
};

type Props = {
  title: string;
  summaryRows: KvRow[];                 // key-value olarak düz liste
  materials: ReadonlyArray<PrintMaterial>;
  columns?: 2 | 3;                      // KV tablo sütun sayısı
  showDate?: boolean;
};

function chunk<T>(arr: T[], size: number) {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function formatDate(d = new Date()) {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export default function Step3PrintBlock({
  title,
  summaryRows,
  materials,
  columns = 3,
  showDate = true,
}: Props) {
  // Başlığı ve tarihi en üste KV gibi ekle
  const headerRows: KvRow[] = [
    { label: 'Başlık', value: title },
    showDate ? { label: 'Tarih', value: formatDate() } : null,
  ].filter(Boolean) as KvRow[];

  // Aynı etiketleri tekrarlama
  const seen = new Set<string>();
  const merged: KvRow[] = [...headerRows, ...summaryRows].filter(r => {
    const key = String(r.label).toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const perRow = columns;
  const grouped = chunk(merged, perRow);
  const pairWidthPct = 100 / perRow;
  const labelPctOfPair = 0.35;                // KV çiftinde label oranı
  const labelColPct = pairWidthPct * labelPctOfPair;
  const valueColPct = pairWidthPct * (1 - labelPctOfPair);

  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '10pt',
    tableLayout: 'fixed',
  };

  const cellBase: React.CSSProperties = {
    border: '1px solid #888',
    padding: '2mm',
    verticalAlign: 'top',
    wordBreak: 'break-word',
    color: '#000',
  };

  return (
    <div
      id="print-area"
      style={{
        // ekranda görünmeyecek, sadece print’te açılacak
        font: '12pt/1.4 system-ui, -apple-system, Segoe UI, Roboto, Arial',
      }}
    >

      <style>{`
        @media screen { #print-area { display: none; } }

        @media print {
          @page { size: A4; margin: 12mm; }

          body * { visibility: hidden !important; }
          #print-area, #print-area * { visibility: visible !important; }

          #print-area {
            display: block !important;
            position: absolute;
            inset: 0;
            width: 100%;
            color: #000 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          /* SAFE CONTAINER: iç genişlik ve ortalama */
          #print-area .print-container {
            width: 250mm;           /* ← güvenli içerik genişliği */
            margin: 0 auto;         /* ← ortala */
          }

          #print-area .avoid-break { break-inside: avoid; page-break-inside: avoid; }
          #print-area table { page-break-inside: auto; }
          #print-area tr { break-inside: avoid; page-break-inside: avoid; }
        }
      `}
      </style>

      <div className="print-container">

        {/* Başlık */}
        <section className="avoid-break" style={{ marginBottom: '6mm', color: '#000' }}>
          <h2 style={{ margin: 0, fontSize: '14pt', color: '#000' }}>{title}</h2>
        </section>

        {/* Özet: KV tablo (Excel gibi hücreli) */}
        <section className="avoid-break" style={{ marginBottom: '6mm' }}>
          <table style={tableStyle}>
            <tbody>
              {grouped.map((rowPairs, i) => {
                const padded = [...rowPairs];
                while (padded.length < perRow) padded.push({ label: '', value: '' });

                return (
                  <tr key={i}>
                    {padded.map((p, j) => (
                      <React.Fragment key={j}>
                        <td
                          style={{
                            ...cellBase,
                            width: `${labelColPct}%`,
                            background: '#f5f5f5',
                            fontWeight: 600,
                          }}
                        >
                          {p.label}
                        </td>
                        <td style={{ ...cellBase, width: `${valueColPct}%` }}>
                          {p.value}
                        </td>
                      </React.Fragment>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        {/* Malzeme tablosu */}
        <section className="avoid-break">
          <table style={{ ...tableStyle, fontSize: '9.8pt' }}>
            <colgroup>
              <col style={{ width: '13%' }} />
              <col style={{ width: '22%' }} />
              <col />
              <col style={{ width: '18%' }} />
              <col style={{ width: '15%' }} />
            </colgroup>
            <thead>
              <tr>
                <th style={{ ...cellBase, background: '#f5f5f5', fontWeight: 700, textAlign: 'left' }}>Profil Resmi</th>
                <th style={{ ...cellBase, background: '#f5f5f5', fontWeight: 700, textAlign: 'left' }}>Profil Kodu</th>
                <th style={{ ...cellBase, background: '#f5f5f5', fontWeight: 700, textAlign: 'left' }}>Profil Adı</th>
                <th style={{ ...cellBase, background: '#f5f5f5', fontWeight: 700, textAlign: 'left' }}>Kesim Ölçüsü</th>
                <th style={{ ...cellBase, background: '#f5f5f5', fontWeight: 700, textAlign: 'left' }}>Verilecek Olan Adet</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((m, idx) => (
                <tr key={`${m.profil_kodu}-${idx}`}>
                  <td style={cellBase}>
                    <img
                      src={m.profil_resmi || 'https://placehold.co/80x60'}
                      alt=""
                      style={{ width: 115, height: 70, objectFit: 'cover', aspectRatio: '16:9' }}
                    />
                  </td>
                  <td style={cellBase}>{m.profil_kodu}</td>
                  <td style={cellBase}>{m.profil_adi}</td>
                  <td style={cellBase}>{m.kesim_olcusu}</td>
                  <td style={cellBase}>{m.verilecek_adet}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

      </div>

    </div>
  );
}
