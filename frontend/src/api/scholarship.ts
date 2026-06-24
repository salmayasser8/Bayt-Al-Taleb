import api from "./axios";

export const getScholarships = async () => {
  const res = await api.get("/scholarships");
  return res.data;
};
