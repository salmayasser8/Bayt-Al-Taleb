import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import Home from "../pages/HomePage";
import Auth from "../pages/AuthPage";
import CollegesPage from "../pages/CollegesPage";
import ScrollToTop from "../components/common/ScrollToTop";
import CollegeDetailPage from "../pages/CollegeDetailPage";
import MajorDetailPage from "../pages/MajorDetailPage";
import ScholarshipsPage from "../pages/ScholarshipsPage";
const AppLayout = () => {
  return (
    <>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<AuthLayout />}>
            <Route index element={<Home />} />
            <Route path="/colleges" element={<CollegesPage />} />
            <Route path="/colleges/:id" element={<CollegeDetailPage />} />
            <Route path="/majors/:id" element={<MajorDetailPage />} />
            <Route path="/scholarships" element={<ScholarshipsPage />} />
          </Route>
          {/* <Route path="*" element={<NotFound />} /> */}
          <Route path="/auth" element={<Auth />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default AppLayout;
