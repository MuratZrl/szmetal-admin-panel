// app/(admin)/_utils_/giyotin-formulas.ts
export function hesaplaKesimAdet(profilKodu: string, sistemAdet: number): number {
  switch (profilKodu) {

    case 'T3147': // Kasa Profili
      return sistemAdet * 1;

    case 'T3148': // Kanat Profili
      return sistemAdet * 1;

    case 'T3149': // Kilit Profili
      return sistemAdet * 1;

    case 'T3150': // Fitil Kanalı
      return sistemAdet * 1;

    case 'T3151': // Cam Tutucu
      return sistemAdet * 3;

    case 'T3152': // Üst Kapak
      return sistemAdet * 1;

    case 'T3153': // Motor Kapak
      return sistemAdet * 2;

    case 'T3153_': // Cam Rayı
      return sistemAdet * 4;

    case 'T3154': // Ön Panel Profili
      return sistemAdet * 2;

    case 'T3155': // Kilit Rayı
      return sistemAdet * 2;

    case 'T3156': // Dikey Taşıyıcı
      return sistemAdet * 2;

    case 'T3157': // Köşe Tapası
      return sistemAdet * 2;
      
    case 'T3158': // Yan Kapak
      return sistemAdet * 1;

    case 'T1256': // Yatak Profili
      return sistemAdet * 2;

    default:
      return sistemAdet; // varsayılan olarak 1 adet varsay
  }
}

// ****************************************************************************************************

export function hesaplaKesimOlcusu(profilKodu: string, yukseklik: number, genislik: number): string {
  switch (profilKodu) {

    case 'T3147': // Kasa Profili
      return `${Math.floor(genislik - 25)} mm`;

    case 'T3148': // Orta Kayıt Profili
      return `${Math.floor(genislik - 26)} mm`;

    case 'T3149': // Alt Ray Profili
      return `${Math.floor(genislik - 210)} mm`;

    case 'T3150': // Üst Kayıt Profili
      return `${Math.floor(genislik - 28)} mm`;

    case 'T3151': // Yan Dikey Profil
      return `${Math.floor(genislik - 210)} mm`;

    case 'T3152': // Orta Kilit Profili
      return `${Math.floor(genislik - 210)} mm`;

    case 'T3153': // Fitil Profili
      return `${Math.floor(genislik - 210)} mm`;

    case 'T3153_': // Cam Taşıyıcı Profil
      return `${Math.floor( ( (yukseklik - 197) / 3) + 32)} mm`;

    case 'T3154': // Alt Conta
      return `${Math.floor( ( (yukseklik - 197) / 3) + 32)} mm`;

    case 'T3155': // Üst Conta
      return `${Math.floor(yukseklik - 134)} mm`;

    case 'T3156': // Cam Kilidi
      return `${Math.floor(yukseklik - 134)} mm`;

    case 'T3157': // Yan Kapama
      return `${Math.floor( ( ( (yukseklik - 197) / 3) * 2) + 13)} mm`;

    case 'T3158': // Üst Kasa Profili
      return `${Math.floor(genislik - 60)} mm`;

    case 'T1256': // Sürgü Profili
      return `${Math.floor( ( (yukseklik - 197) / 3) + 11)} mm`;

    default:
      return '';
  }
}

// ****************************************************************************************************

export function parseKesimOlcusu(kesimOlcusu: string): number {
  // "1283 mm" → 1283
  const parsed = parseFloat(kesimOlcusu.replace(/[^\d.]/g, ''));
  return isNaN(parsed) ? 0 : parsed;
}

// ****************************************************************************************************

export function hesaplaVerilecekAdet(
  profilKodu: string, 
  adet: number, 
  kesimOlcusu?: string // opsiyonel parametre
): string {
  const kesim_mm = kesimOlcusu ? parseKesimOlcusu(kesimOlcusu) : 0;

  switch (profilKodu) {
    case 'T3147':
    case 'T3148':
    case 'T3149':
    case 'T3150':
    case 'T3152':
    case 'T3158':
      return Math.ceil((adet * kesim_mm) / 7000).toString();

    case 'T3151':
      return Math.ceil((adet * kesim_mm * 3) / 7000).toString();

    case 'T3153':
      return Math.ceil((adet * kesim_mm * 2) / 7000).toString();

    case 'T3153_':
      return Math.ceil((adet * kesim_mm * 4) / 7000).toString();

    case 'T3154':
    case 'T3155':
    case 'T3156':
    case 'T3157':
    case 'T1256':
      return Math.ceil((adet * kesim_mm * 2) / 6000).toString();

    default:
      return '';
  }
}

// ****************************************************************************************************

export function hesaplaSistemMetraj(yukseklik: number, genislik: number, adet: number): string {
  const metrekare = (yukseklik * genislik * adet) / 1_000_000;
  return metrekare.toFixed(2);
}

// ****************************************************************************************************

export function hesaplaKayarCamGenislik(genislik: number): string {
  return (genislik - 174).toFixed(0);
}

// ****************************************************************************************************

export function hesaplaKayarCamYukseklik(yukseklik: number): string {
  return ((yukseklik - 197) / 3).toFixed(0);
}

// ****************************************************************************************************

export function hesaplaKayarCamAdedi(adet: number): string {
  return (adet * 3).toString();
}

// ****************************************************************************************************

export function hesaplaCamMetraj(adet: number, yukseklik: number, genislik: number): string {
  const camYuk = (yukseklik - 197) / 3;
  const camGen = genislik - 174;
  const metrekare = (adet * 3) * camYuk * camGen / 1000000;
  return metrekare.toFixed(2);
}

// ****************************************************************************************************

export function hesaplaToplamKg(birimAgirlik: number, adet: number): number {
  return birimAgirlik * adet;
}