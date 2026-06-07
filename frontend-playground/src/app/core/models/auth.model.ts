export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface JwtPayload {
  sub: string;
  role: string;
  exp: number;
  jti?: string;
}