// api/auth.ts
import api from "./axios";
export const loginApi = async (email: string, password: string) => {
  const res = await api.post("/auth/login", { email, password });
  return res.data; 
};

export const registerApi = async (email: string, password: string, fullName: string) => {
  const res = await api.post("/auth/register", { email, password, fullName });
  return res.data;
};

export const logoutApi = async (refreshToken: string) => {
  const res = await api.post("/auth/logout", { refreshToken });
  return res.data;
};

// ── Two-factor (email OTP) ──────────────────────────────────────
export const verifyOtpApi = async (tempToken: string, code: string) => {
  const res = await api.post("/auth/verify-otp", { tempToken, code });
  return res.data;
};

export const setupTwoFactorApi = async () => {
  const res = await api.post("/auth/2fa/setup");
  return res.data;
};

export const confirmTwoFactorApi = async (code: string) => {
  const res = await api.post("/auth/2fa/confirm", { code });
  return res.data;
};

export const disableTwoFactorApi = async () => {
  const res = await api.post("/auth/2fa/disable");
  return res.data;
};