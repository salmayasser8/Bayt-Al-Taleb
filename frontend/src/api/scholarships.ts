import api from "./axios";

export const getScholarships = async () => {
  const res = await api.get("/scholarships");
  return res.data;
};

export const getScholarshipById = async (id: string) => {
  const res = await api.get(`/scholarships/${id}`);
  return res.data;
};

export const createScholarship = async (scholarship: any) => {
  const res = await api.post("/scholarships", scholarship);
  return res.data;
};
