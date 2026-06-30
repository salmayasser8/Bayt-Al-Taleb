export interface ScholarshipView {
  id: string;
  slug: string;
  name: string;
  isActive: boolean;
  startDate?: Date | null;
  endDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateScholarshipData {
  slug: string;
  name: string;
  startDate?: Date | null;
  endDate?: Date | null;
}

export interface UpdateScholarshipData {
  slug?: string;
  name?: string;
  isActive?: boolean;
  startDate?: Date | null;
  endDate?: Date | null;
}
