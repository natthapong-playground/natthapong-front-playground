export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface RefreshRequest {
  refresh_token: string;
}

export interface JwtPayload {
  sub: string;
  role: string;
  exp: number;
  jti?: string;
  type?: 'access' | 'refresh';
}
