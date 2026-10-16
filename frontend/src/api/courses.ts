import api from "./axios";

export const getCoursesByMajor = async (majorId: string) => {
  const res = await api.get(`/majors/${majorId}/courses`);
  return res.data;
};

export const getCourseFiles = async (courseId: string) => {
  const res = await api.get(`/files/owner/COURSE/${courseId}/approved`);
  return res.data;
};

export const getCourseModerators = async (courseId: string) => {
  const res = await api.get(`/courses/${courseId}/moderators`);
  return res.data;
};

export const assignCourseModerator = async (courseId: string, userId: string) => {
  const res = await api.post(`/courses/${courseId}/moderators/${userId}`);
  return res.data;
};

export const revokeCourseModerator = async (courseId: string, userId: string) => {
  const res = await api.delete(`/courses/${courseId}/moderators/${userId}`);
  return res.data;
};
