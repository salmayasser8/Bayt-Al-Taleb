import api from "./axios";

// --- Your Existing Functions ---
export const getMajorSections = async (majorId: string) => {
  const res = await api.get(`/content/MAJOR/${majorId}/sections`);
  return res.data;
};

export const getMajorFaqs = async (majorId: string) => {
  const res = await api.get(`/content/MAJOR/${majorId}/faqs`);
  return res.data;
};

export const getMajorCourses = async (majorId: string) => {
  const res = await api.get(`/majors/${majorId}/courses`);
  return res.data;
};


export const getCourseFiles = async (courseId: string) => {
  const res = await api.get(`/files/owner/COURSE/${courseId}/approved`);
  return res.data;
};

// Download file
export const downloadFile = async (fileId: string) => {
  const res = await api.get(`/files/${fileId}/download`, {
    responseType: "blob",
  });
  return res.data;
};