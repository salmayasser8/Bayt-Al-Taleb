import api from "./axios";

export const uploadFile = async (data: FormData) => {
  const res = await api.post("/files", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const getMyFiles = async (userId: string) => {
  const res = await api.get(`/files`, {
    params: {
      uploadedById: userId,
      pageSize: 100,
    },
  });
  return res.data;
};
