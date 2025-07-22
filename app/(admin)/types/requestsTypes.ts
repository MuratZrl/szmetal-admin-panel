// app/(admin)/_constants_/systems/types/requestsTypes.ts

import { SistemOzet } from './systemTypes';
import { GiyotinProfilHesapli } from './systemTypes';
// İleride diğer sistemler için de import edebilirsin:
// import { KapiProfilHesapli } from '../systems/kapi-sistemi/types';


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

  users?: {
    username: string;
    email: string;
    company: string;
  };
};


// ✅ Sistem bazlı union tipi
export type RequestRowUnion =
  | (RequestRow<GiyotinProfilHesapli> & { system_slug: 'giyotin-sistemi' })

  // | (RequestRow<KapiProfilHesapli> & { system_slug: 'kapi-sistemi' })
  // | Diğer sistemler buraya eklenebilir...
  ;
