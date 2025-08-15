// app/_constants_/systems/step3/systemConfigs.ts
// ****************************************************************************************************
// Giyotin Sistemi İçin:
import {
  giyotinGenelBilgiColumns,
  giyotinMalzemeColumns,
} from '../system-columns/giyotin-sistemi';
import {
  hesaplaCamMetraj,
  hesaplaKayarCamAdedi,
  hesaplaKayarCamGenislik,
  hesaplaKayarCamYukseklik,
  hesaplaSistemMetraj,
  hesaplaKesimOlcusu,
  hesaplaKesimAdet,
  hesaplaVerilecekAdet,
  parseKesimOlcusu,
} from '../../../utils/giyotin-formulas';
import { SystemStep3Config } from '../../../types/systemTypes';
import { GiyotinFormData } from '../../../types/systemTypes';
// ****************************************************************************************************
// ****************************************************************************************************
// ****************************************************************************************************
export const systemStep3Configs: Record<string, SystemStep3Config<GiyotinFormData>> = {
  // ****************************************************************************************************
  'giyotin-sistemi': {
    summaryColumns: giyotinGenelBilgiColumns,
    materialColumns: giyotinMalzemeColumns,
    supabaseTable: 'system_profiles',
    supabaseFilterColumn: 'system_slug',
    // ****************************************************************************************************
    summaryCalculator: (form, rows2) => {
      const adet = parseInt(form.sistem_adet || '0');
      const yukseklik = parseInt(form.sistem_yukseklik || '0');
      const genislik = parseInt(form.sistem_genislik || '0');

      const toplamKg = rows2.reduce((total, row) => {
        const kesimOlcu = parseKesimOlcusu(row.kesim_olcusu);
        return total + (row.birim_agirlik * kesimOlcu * row.kesim_adet) / 1000;
      }, 0);

      return [
        {
          id: 1,
          sistem_metraj: hesaplaSistemMetraj(yukseklik, genislik, adet),
          cam_metraj: hesaplaCamMetraj(adet, yukseklik, genislik),
          kayar_cam_adet: hesaplaKayarCamAdedi(adet),
          kayar_cam_genislik: hesaplaKayarCamGenislik(genislik),
          kayar_cam_yukseklik: hesaplaKayarCamYukseklik(yukseklik),
          toplam_kg: toplamKg.toFixed(2) + ' kg',
        },
      ];
    },
    // ****************************************************************************************************
    materialCalculator: (form, profiles) => {
      const adet = parseInt(form.sistem_adet || '0');
      const yukseklik = parseInt(form.sistem_yukseklik || '0');
      const genislik = parseInt(form.sistem_genislik || '0');

      return profiles.map((profil) => {
        const kesim_adet = hesaplaKesimAdet(profil.profil_kodu, adet);
        const kesim_olcusu = hesaplaKesimOlcusu(profil.profil_kodu, yukseklik, genislik);
        const verilecek_adet = Number(hesaplaVerilecekAdet(profil.profil_kodu, adet, kesim_olcusu)); // ✅ force-cast

        return {
          ...profil,
          kesim_adet,
          kesim_olcusu,
          verilecek_adet, // ✅ artık number
        };
      });
    },
  },
  // ****************************************************************************************************
  // Diğer sistemler...
};
