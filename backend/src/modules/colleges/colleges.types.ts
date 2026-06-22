export interface CollegeView {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCollegeData {
  slug: string;
  name: string;
  description: string | null;
  isActive: boolean;
}

export interface UpdateCollegeData {
  slug?: string;
  name?: string;
  description?: string | null;
  isActive?: boolean;
}
