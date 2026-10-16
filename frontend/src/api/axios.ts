import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4001/api/v1";

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

// Automatically add token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Auto-refresh on 401 ──────────────────────────────────────────
// Access tokens live 15 minutes. When one expires, we silently get a
// new one with the refresh token and retry the original request.
// Only ONE refresh runs at a time; others wait in a queue (the backend
// rotates refresh tokens, so parallel refreshes would fail).

let isRefreshing = false;
let waitQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

async function refreshAccessToken(): Promise<string> {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) throw new Error("No refresh token");

  // Plain axios: must NOT go through our own interceptors
  const res = await axios.post(`${baseURL}/auth/refresh`, { refreshToken });
  const tokens = res.data?.data?.tokens;
  if (!tokens?.accessToken) throw new Error("Refresh failed");

  localStorage.setItem("token", tokens.accessToken);
  if (tokens.refreshToken) {
    localStorage.setItem("refreshToken", tokens.refreshToken);
  }
  return tokens.accessToken;
}

function forceLogout() {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  if (!window.location.pathname.startsWith("/auth")) {
    window.location.href = "/auth";
  }
}

// Auth endpoints that must NOT trigger a refresh (refresh itself,
// login, OTP — a 401 there means wrong credentials, not expiry).
const NO_REFRESH_PATHS = [
  "/auth/login",
  "/auth/refresh",
  "/auth/verify-otp",
  "/auth/register",
  "/auth/2fa/",
];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const url: string = original?.url ?? "";

    const skipRefresh = NO_REFRESH_PATHS.some((p) => url.includes(p));

    if (status !== 401 || original._retry || skipRefresh) {
      return Promise.reject(error);
    }

    original._retry = true;

    // A refresh is already running → wait for it
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        waitQueue.push({ resolve, reject });
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      });
    }

    isRefreshing = true;
    try {
      const token = await refreshAccessToken();
      waitQueue.forEach((w) => w.resolve(token));
      waitQueue = [];
      original.headers.Authorization = `Bearer ${token}`;
      return api(original);
    } catch (refreshError) {
      waitQueue.forEach((w) => w.reject(refreshError));
      waitQueue = [];
      forceLogout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
