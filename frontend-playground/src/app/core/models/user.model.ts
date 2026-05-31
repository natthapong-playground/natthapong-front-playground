export type Role = 'Guest' | 'Regular' | 'Admin' | 'SuperAdmin';

export interface User {
  id: number;
  email: string;
  role: Role;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}