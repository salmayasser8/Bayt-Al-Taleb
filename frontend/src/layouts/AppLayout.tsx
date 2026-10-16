// ... other imports ...
import { useAuth } from "@/store/AuthContext";
import { Navigate } from "react-router-dom";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import Home from "../pages/HomePage";
import Auth from "../pages/AuthPage";
import CollegesPage from "../pages/CollegesPage";
import CollegeDetailPage from "../pages/CollegeDetailPage";
import ScrollToTop from "../components/common/ScrollToTop";
import StudentDashboard from "../pages/StudentDashboard";
import UploadFile from "../pages/UploadFile";
import SupervisorReview from "../pages/SupervisorReview";
import AdminPanel from "../pages/AdminPanel";
import ScholarshipsPage from "../pages/ScholarshipsPage";
import MajorDetailPage from "../pages/MajorDetailPage";
import ScholarshipDetailPage from "../pages/ScolarshipsDetailsPage";
import CourseSummariesPage from "../pages/CourseSummarizePage";
import SearchResultPage from "../pages/SearchResultPage";
import ProfilePage from "../pages/ProfilePage";
import NotFound from "../pages/NotFoundPage";
import AuthCallback from "../pages/AuthCallback";
const AppLayout = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bgSection">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<AuthLayout />}>
            <Route index element={<Home />} />
            <Route path="/colleges" element={<CollegesPage />} />
            <Route path="/colleges/:id" element={<CollegeDetailPage />} />
            <Route path="/dashboard" element={<StudentDashboard />} />
            <Route path="/upload" element={<UploadFile />} />
            <Route path="/scholarships" element={<ScholarshipsPage />} />
            <Route
              path="/scholarships/:id"
              element={<ScholarshipDetailPage />}
            />
            <Route path="/majors/:id" element={<MajorDetailPage />} />
            <Route
              path="/majors/:id/summaries"
              element={<CourseSummariesPage />}
            />
            <Route path="/search" element={<SearchResultPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route
              path="/admin"
              element={
                isLoading ? (
                  <div className="min-h-screen flex items-center justify-center bg-bgSection">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary"></div>
                  </div>
                ) : user?.role === "ADMIN" || user?.role === "SUPER_ADMIN" ? (
                  <AdminPanel />
                ) : (
                  <Navigate to="/" />
                )
              }
            />
            <Route
              path="/supervisor"
              element={
                user?.role === "MODERATOR" ||
                user?.role === "ADMIN" ||
                user?.role === "SUPER_ADMIN" ? (
                  <SupervisorReview />
                ) : (
                  <Navigate to="/" />
                )
              }
            />
          </Route>
          <Route path="/auth" element={<Auth />} />
          <Route path="/*" element={<NotFound />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default AppLayout;
