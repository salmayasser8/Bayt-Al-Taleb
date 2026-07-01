import React, { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { Link, useParams, useNavigate } from "react-router-dom";
import { IoChevronBack } from "react-icons/io5";
import { FaDownload, FaStar, FaFilePdf } from "react-icons/fa";
import { MdError } from "react-icons/md";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { getCoursesByMajor, getCourseFiles } from "../api/courses";
import { getMajorById } from "../api/majors";
import Button from "../components/common/Button";
import SideBar from "../components/common/SideBar";
// ── Types ─────────────────────────────────────────────────────────────

interface Course {
  id: string;
  name: string;
  nameAr: string;
  code: string;
  year: number;
  semester: string;
  icon: string;
}

interface FileView {
  id: string;
  title: string;
  description?: string;
  type: "SUMMARY" | "PREVIOUS_EXAM" | "SYLLABUS" | "OTHER";
  status: string;
  storageKey: string;
  tags: string[];
  rating: number;
  downloads: number;
  createdAt: string;
  uploadedBy: { fullName: string };
}

interface MajorView {
  id: string;
  name: string;
  degree?: string;
  college?: { id: string; name: string };
}

// ── Animation variants ────────────────────────────────────────────────

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// ── File type label ───────────────────────────────────────────────────

const fileTypeLabel = (type: string) => {
  switch (type) {
    case "SUMMARY":
      return "ملخص";
    case "PREVIOUS_EXAM":
      return "امتحان سابق";
    case "SYLLABUS":
      return "خطة مساق";
    default:
      return "ملف";
  }
};

const fileTypeBadgeColor = (type: string) => {
  switch (type) {
    case "SUMMARY":
      return "bg-blue-100 text-blue-600";
    case "PREVIOUS_EXAM":
      return "bg-orange-100 text-orange-600";
    case "SYLLABUS":
      return "bg-green-100 text-green-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

// ── Main Page ─────────────────────────────────────────────────────────

const CourseSummariesPage: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // major id
  const navigate = useNavigate();
  const [major, setMajor] = useState<MajorView | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [files, setFiles] = useState<FileView[]>([]);
  const [loadingMajor, setLoadingMajor] = useState(true);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch major + courses on mount
  useEffect(() => {
    if (!id) return;
    Promise.all([getMajorById(id), getCoursesByMajor(id)])
      .then(([majorRes, coursesRes]) => {
        setMajor(majorRes.data || majorRes);
        const courseList = coursesRes.data?.items || coursesRes.data || [];
        setCourses(courseList);
        // Auto-select first course
        if (courseList.length > 0) setSelectedCourse(courseList[0]);
      })
      .catch(() => setError("فشل في تحميل البيانات"))
      .finally(() => setLoadingMajor(false));
  }, [id]);

  // Fetch files when selected course changes
  useEffect(() => {
    if (!selectedCourse) return;
    setLoadingFiles(true);
    getCourseFiles(selectedCourse.id)
      .then((res) => {
        setFiles(res.data?.items || res.data || []);
      })
      .catch(() => setFiles([]))
      .finally(() => setLoadingFiles(false));
  }, [selectedCourse]);

  // Split files by type
  // Split files by type
  const summaries = files.filter((f) => f.type === "SUMMARY");
  const exams = files.filter((f) => f.type === "PREVIOUS_EXAM");
  const syllabi = files.filter((f) => f.type === "SYLLABUS");

  const courseSidebarItems = courses.map((course) => ({
    id: course.id,
    label: `${course.icon} ${course.nameAr}`,
    icon: <span className="text-xs opacity-70 font-mono">{course.code}</span>,
  }));

  const handleSidebarClick = (id: string) => {
    const course = courses.find((c) => c.id === id);
    if (course) setSelectedCourse(course);
  };

  if (loadingMajor)
    return (
      <div className="min-h-screen bg-bgSection flex items-center justify-center">
        <LoadingSpinner size="lg" text="جاري تحميل المساقات..." />
      </div>
    );

  if (error || !major)
    return (
      <div className="min-h-screen bg-bgSection flex flex-col items-center justify-center gap-4">
        <MdError size={50} className="text-primary" />
        <p className="text-gray-500 text-lg">{error || "التخصص غير موجود"}</p>
        <Button onClick={() => navigate(-1)}>العودة للتخصصات</Button>
      </div>
    );

  return (
    <div className="min-h-screen bg-bgSection">
      <div className="container py-8">
        {/* Breadcrumb */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex items-center gap-2 text-sm font-semibold mb-6 flex-wrap"
        >
          <Link
            to="/"
            className="text-gray-400 hover:text-primary transition-colors"
          >
            الرئيسية
          </Link>
          <IoChevronBack className="text-gray-400" />
          <Link
            to="/colleges"
            className="text-gray-400 hover:text-primary transition-colors"
          >
            الكليات
          </Link>
          <IoChevronBack className="text-gray-400" />
          {major.college && (
            <>
              <Link
                to={`/colleges/${major.college.id}`}
                className="text-gray-400 hover:text-primary transition-colors"
              >
                {major.college.name}
              </Link>
              <IoChevronBack className="text-gray-400" />
            </>
          )}
          <Link
            to={`/majors/${major.id}`}
            className="text-gray-400 hover:text-primary transition-colors"
          >
            {major.name}
          </Link>
          <IoChevronBack className="text-gray-400" />
          <span className="text-primary">ملخصات المساقات</span>
        </motion.div>

        {/* Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <h1 className="font-bold text-3xl md:text-4xl text-primary mb-2">
            ملخصات مساقات {major.name}
          </h1>
          <p className="text-gray-500">
            اختر المساق من القائمة لعرض الملخصات والامتحانات السابقة المتاحة
          </p>
        </motion.div>

        {/* Layout: Sidebar + Main */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Courses Sidebar */}
          {/* Courses Sidebar - NEW CODE USING SHARED COMPONENT */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="lg:col-span-1"
          >
            {courses.length > 0 ? (
              <SideBar
                items={courseSidebarItems}
                activeSection={selectedCourse?.id || ""}
                onItemClick={handleSidebarClick}
              />
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center text-gray-400 text-sm shadow-sm">
                لا توجد مساقات مضافة بعد
              </div>
            )}
          </motion.div>

          {/* Main content */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            {loadingFiles ? (
              <div className="flex items-center justify-center py-20">
                <LoadingSpinner text="جاري تحميل الملفات..." />
              </div>
            ) : selectedCourse ? (
              <>
                {/* Course header */}
                <motion.div
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{selectedCourse.icon}</span>
                    <div>
                      <h2 className="font-bold text-xl text-primary">
                        {selectedCourse.nameAr}
                      </h2>
                      <p className="text-gray-500 text-sm">
                        {selectedCourse.code} · السنة {selectedCourse.year} ·{" "}
                        {selectedCourse.semester}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Summaries Table */}
                {summaries.length > 0 && (
                  <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
                  >
                    <div className="px-6 py-4 border-b border-gray-100">
                      <h3 className="font-bold text-primary">الملخصات</h3>
                    </div>
                    <table className="w-full text-right">
                      <thead className="bg-primary/5">
                        <tr>
                          <th className="px-4 py-3 text-sm font-bold text-primary">
                            العنوان
                          </th>
                          <th className="px-4 py-3 text-sm font-bold text-primary">
                            رافع الملف
                          </th>
                          <th className="px-4 py-3 text-sm font-bold text-primary">
                            التقييم
                          </th>
                          <th className="px-4 py-3 text-sm font-bold text-primary">
                            التحميلات
                          </th>
                          <th className="px-4 py-3" />
                        </tr>
                      </thead>
                      <tbody>
                        {summaries.map((file, i) => (
                          <tr
                            key={file.id}
                            className={`border-t border-gray-100 hover:bg-bgSection transition-colors ${i === summaries.length - 1 ? "border-b-0" : ""}`}
                          >
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <FaFilePdf className="text-red-400 flex-shrink-0" />
                                <span className="font-semibold text-primary text-sm">
                                  {file.title}
                                </span>
                              </div>
                              {file.tags.length > 0 && (
                                <div className="flex gap-1 mt-1 flex-wrap">
                                  {file.tags.map((tag, j) => (
                                    <span
                                      key={j}
                                      className="text-xs bg-bgSection text-gray-500 px-2 py-0.5 rounded-full"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-4 text-gray-500 text-sm">
                              {file.uploadedBy?.fullName}
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-1 text-accent">
                                <FaStar size={14} />
                                <span className="text-sm font-semibold text-gray-600">
                                  {file.rating.toFixed(1)}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-gray-500 text-sm">
                              {file.downloads}
                            </td>
                            <td className="px-4 py-4">
                              <a
                                href={`/api/v1/files/${file.id}/download`}
                                className="flex items-center gap-1 text-primary hover:text-accent transition-colors no-underline text-sm font-semibold"
                              >
                                <FaDownload size={14} />
                                تحميل
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </motion.div>
                )}

                {/* Past Exams */}
                {exams.length > 0 && (
                  <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
                  >
                    <div className="px-6 py-4 border-b border-gray-100">
                      <h3 className="font-bold text-primary">امتحانات سابقة</h3>
                    </div>
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                      {exams.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between border border-gray-100 rounded-xl p-4 hover:bg-bgSection transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <FaFilePdf className="text-red-400" />
                            <span className="font-semibold text-primary text-sm">
                              {file.title}
                            </span>
                          </div>
                          <a
                            href={`/api/v1/files/${file.id}/download`}
                            className="text-primary hover:text-accent transition-colors no-underline"
                          >
                            <FaDownload size={16} />
                          </a>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Empty state */}
                {files.length === 0 && (
                  <div className="text-center py-20 text-gray-400">
                    <div className="text-5xl mb-4">📂</div>
                    <p className="font-semibold">
                      لا توجد ملفات لهذا المساق بعد
                    </p>
                    <p className="text-sm mt-2">كن أول من يشارك ملخصاً!</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20 text-gray-400">
                <p className="font-semibold">اختر مساقاً من القائمة</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseSummariesPage;
