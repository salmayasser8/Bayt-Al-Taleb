import api from "./axios";

export const getCoursesByMajor = async (majorId: string) => {
  const res = await api.get(`/majors/${majorId}/courses`);
  return res.data;
};

export const getCourseFiles = async (courseId: string) => {
  const res = await api.get(`/files/owner/COURSE/${courseId}/approved`);
  return res.data;
};
