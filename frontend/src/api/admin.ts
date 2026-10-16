import api from "./axios";

// ── Types ──────────────────────────────────────────────────────
export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
  roleId: string;
  role: "SUPER_ADMIN" | "ADMIN" | "MODERATOR" | "MEMBER";
  createdAt: string;
}

export interface ModeratorInfo {
  id: string;
  fullName: string;
  email: string;
}

export interface EntityInfo {
  id: string;
  name: string;
  slug?: string;
  nameAr?: string;
  code?: string;
}

// ── API Calls ──────────────────────────────────────────────────
export const adminApi = {
  // 1. Get all users (matches your backend GET /users)
  getUsers: async (page = 1, search = "") => {
    const params: any = { page, pageSize: 50 };
    if (search) params.search = search;
    const res = await api.get("/users", { params });
    return res.data;
  },

  // 2. Update user role (matches your backend PATCH /users/:id)
  updateUser: async (
    userId: string,
    data: { roleId?: string; isActive?: boolean },
  ) => {
    const res = await api.patch(`/users/${userId}`, data);
    return res.data;
  },

  // 3. Delete user (matches your backend DELETE /users/:id)
  deleteUser: async (userId: string) => {
    const res = await api.delete(`/users/${userId}`);
    return res.data;
  },
  // Get roles list (to populate role dropdown when changing user role)
  getRoles: async () => {
    const res = await api.get("/roles");
    return res.data;
  },

  // Get KPI stats (total users, total files, pending reviews etc.)
  // Check if your backend has a stats/dashboard endpoint
  getStats: async () => {
    const res = await api.get("/admin/stats"); // check if this exists
    return res.data;
  },

  // ── Moderator Assignment APIs ────────────────────────────────

  // Get all moderators (for dropdown)
  getModerators: async (): Promise<{ data: ModeratorInfo[] }> => {
    const res = await api.get("/moderators");
    return res.data;
  },

  // Get all majors (for dropdown)
  getMajors: async (): Promise<{ data: EntityInfo[] }> => {
    const res = await api.get("/moderators/majors");
    return res.data;
  },

  // Get all scholarships (for dropdown)
  getScholarships: async (): Promise<{ data: EntityInfo[] }> => {
    const res = await api.get("/moderators/scholarships");
    return res.data;
  },

  // Get all courses (for dropdown)
  getCourses: async (): Promise<{ data: EntityInfo[] }> => {
    const res = await api.get("/moderators/courses");
    return res.data;
  },

  // ── Major moderator assignments ──────────────────────────────
  getMajorModerators: async (majorId: string) => {
    const res = await api.get(`/moderators/major/${majorId}`);
    return res.data;
  },

  assignMajorModerator: async (majorId: string, userId: string) => {
    const res = await api.post(`/moderators/major/${majorId}/user/${userId}`);
    return res.data;
  },

  removeMajorModerator: async (majorId: string, userId: string) => {
    const res = await api.delete(`/moderators/major/${majorId}/user/${userId}`);
    return res.data;
  },

  // ── Scholarship moderator assignments ────────────────────────
  getScholarshipModerators: async (scholarshipId: string) => {
    const res = await api.get(`/moderators/scholarship/${scholarshipId}`);
    return res.data;
  },

  assignScholarshipModerator: async (scholarshipId: string, userId: string) => {
    const res = await api.post(`/moderators/scholarship/${scholarshipId}/user/${userId}`);
    return res.data;
  },

  removeScholarshipModerator: async (scholarshipId: string, userId: string) => {
    const res = await api.delete(`/moderators/scholarship/${scholarshipId}/user/${userId}`);
    return res.data;
  },

  // ── Course moderator assignments ─────────────────────────────
  getCourseModerators: async (courseId: string) => {
    const res = await api.get(`/moderators/course/${courseId}`);
    return res.data;
  },

  assignCourseModerator: async (courseId: string, userId: string) => {
    const res = await api.post(`/moderators/course/${courseId}/user/${userId}`);
    return res.data;
  },

  removeCourseModerator: async (courseId: string, userId: string) => {
    const res = await api.delete(`/moderators/course/${courseId}/user/${userId}`);
    return res.data;
  },
};
