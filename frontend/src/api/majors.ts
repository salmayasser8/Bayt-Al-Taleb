// api/majors.ts
import api from "./axios";
export const getMajorById = async (id: string) => {
  const res = await api.get(`/majors/${id}`);
  return res.data;
};

export const createMajor = async (major: any) => {
  const res = await api.post("/majors", major);
  return res.data;
};

export const getMajors = async () => {
  const res = await api.get("/majors");
  return res.data;
};
