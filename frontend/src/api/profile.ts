// api/profile.ts
import api from "./axios";

export const getProfile = async () => {
  const res = await api.get("/users/me"); // check if this endpoint exists
  return res.data;
};

export const updateProfile = async (data: {
  fullName?: string;
  email?: string;
}) => {
  const res = await api.patch("/users/me", data);
  return res.data;
};

export const changePassword = async (data: {
  currentPassword: string;
  newPassword: string;
}) => {
  const res = await api.patch("/users/me/password", data);
  return res.data;
};
