import { Role } from './user.model';

export interface AuditLog {
  id: number;
  timestamp: string;
  actor_user_id: number | null;
  actor_email: string | null;
  actor_role: Role | null;
  method: string;
  path: string;
  status_code: number;
  client_ip: string | null;
  user_agent: string | null;
  duration_ms: number | null;
  request_id: string | null;
}

export interface AuditLogQuery {
  actor_user_id?: number | null;
  method?: string | null;
  status_code?: number | null;
  skip?: number;
  limit?: number;
}
