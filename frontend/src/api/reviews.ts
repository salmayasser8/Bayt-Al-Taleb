import api from "./axios";

export const getReviewQueue = async () => {
  const res = await api.get("/files?pageSize=100");
  return res.data;
};

export const approveFile = async (fileId: string) => {
  const res = await api.post(`/files/${fileId}/reviews`, { action: "APPROVE" });
  return res.data;
};

export const rejectFile = async (fileId: string, reason: string) => {
  const res = await api.post(`/files/${fileId}/reviews`, {
    action: "REJECT",
    comment: reason,
  });
  return res.data;
};
