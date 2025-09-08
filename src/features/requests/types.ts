// features/requests/types/types.ts

import { SistemOzet } from '@/features/create_request/types/system';
import { GiyotinProfilHesapli } from '@/features/create_request/types/system';

// İleride diğer sistemler için de import edebilirsin:
// import { CamBalkonProfilHesapli } from '../systems/cam-balkon-sistemi/types';

// ✅ Genel Request tipi (generic)
export type RequestRow<T = unknown> = {
  id: string;
  user_id: string;
  system_slug: string;
  
  form_data: Record<string, string>;
  summary_data: SistemOzet[];
  material_data: T[];

  created_at: string;

  status: 'pending' | 'approved' | 'rejected';
  description: string;

  users?: {
    username: string;
    email: string;
    company: string;
    country: string;
  };
};


// ✅ Sistem bazlı union tipi
export type RequestRowUnion =
  | (RequestRow<GiyotinProfilHesapli> & { system_slug: 'giyotin-sistemi' })

  // | (RequestRow<KapiProfilHesapli> & { system_slug: 'cam-balkon-sistemi' })
  // | Diğer sistemler buraya eklenebilir...
  ;
