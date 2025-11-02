import axios from "axios";
import { getAccessToken, getRefreshToken, saveTokens } from "./storage";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});

// Attach Authorization header
api.interceptors.request.use((config) => {
  const t = getAccessToken();
  if (t) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${t}`;
  }
  return config;
});

// Optional: refresh on 401, then retry once
let isRefreshing = false;
let pending: Array<() => void> = [];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error?.response?.status;
    const original = error.config;

    if (status === 401 && !original._retry) {
      const rt = getRefreshToken();
      if (!rt || isRefreshing) {
        // if a refresh is already ongoing, queue the retry
        if (isRefreshing) {
          await new Promise<void>((resolve) => pending.push(resolve));
          return api(original);
        }
        // clearTokens();
        return Promise.reject(error);
      }

      try {
        isRefreshing = true;
        original._retry = true;
        const r = await axios.post(
          "/api/refresh",
          { refreshToken: rt },
          { timeout: 8000 }
        );

        const newAccess: string = r.data?.accessToken;
        const newRefresh: string | undefined = r.data?.refreshToken;
        if (newAccess) {
          saveTokens(newAccess, newRefresh);
          // drain queue
          pending.forEach((fn) => fn());
          pending = [];
          return api(original);
        }
      } catch {
        // clearTokens();
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
