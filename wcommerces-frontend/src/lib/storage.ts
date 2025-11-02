const AT_KEY = "access_token";
const RT_KEY = "refresh_token";

export function saveTokens(accessToken: string, refreshToken?: string) {
  localStorage.setItem(AT_KEY, accessToken);
  if (refreshToken) localStorage.setItem(RT_KEY, refreshToken);
}

export function getAccessToken(): string | null {
  return localStorage.getItem(AT_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(RT_KEY);
}

export function clearTokens() {
  localStorage.removeItem(AT_KEY);
  localStorage.removeItem(RT_KEY);
}
