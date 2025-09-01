// src/features/products/print/ProductPDF.tsx
'use client';

import * as React from 'react';

type Row = { label: string; value: React.ReactNode };

type Props = {
  rows: Row[];
  title: string;
  columns?: 2 | 3;
  showDate?: boolean;
};

function chunkPairs<T>(arr: T[], size: number) {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function formatSlashDate(d = new Date()) {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export default function ProductPrintBlock({
  rows,
  title,
  columns = 2,
  showDate = true,
}: Props) {
  const headerRows: Row[] = [
    { label: 'İsim', value: title },
    showDate ? { label: 'Tarih', value: formatSlashDate() } : null,
  ].filter(Boolean) as Row[];

  const seen = new Set<string>();
  const merged: Row[] = [...headerRows, ...rows].filter(r => {
    const key = String(r.label).toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const perRow = columns;
  const grouped = chunkPairs(merged, perRow);

  const pairWidthPct = 100 / perRow;
  const labelPctOfPair = 0.35;
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
    color: '#000', // koyu temayı bastır
  };

  return (
    <div
      id="print-area"
      style={{
        // DİKKAT: display:none YOK
        font: '12pt/1.4 system-ui, -apple-system, Segoe UI, Roboto, Arial',
      }}
    >
      <style>{`
        /* Ekranda sakla */
        @media screen {
          #print-area { display: none; }
        }

        /* YAZDIRMA MODU */
        @media print {
          /* Kağıt ayarı (isteğe bağlı) */
          @page { margin: 12mm; }

          /* Önce her şeyi gizle, sonra sadece print-area'yı göster */
          body * { visibility: hidden !important; }

          #print-area,
          #print-area * {
            visibility: visible !important;
          }

          /* Print alanını sayfanın en üstüne al */
          #print-area {
            display: block !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            color: #000 !important; /* temayı bastır */
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          /* Tablo satırlarında sayfa kırılmalarını düzelt */
          #print-area .avoid-break { break-inside: avoid; page-break-inside: avoid; }
          #print-area table { page-break-inside: auto; }
          #print-area tr { break-inside: avoid; page-break-inside: avoid; }
        }
      `}</style>

      {/* Başlık */}
      <section className="avoid-break" style={{ marginBottom: '6mm', color: '#000' }}>
        <h2 style={{ margin: 0, fontSize: '14pt', color: '#000' }}>{title}</h2>
      </section>

      {/* Bilgi tablosu */}
      <section className="avoid-break">
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
                      <td
                        style={{
                          ...cellBase,
                          width: `${valueColPct}%`,
                        }}
                      >
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
    </div>
  );
}
