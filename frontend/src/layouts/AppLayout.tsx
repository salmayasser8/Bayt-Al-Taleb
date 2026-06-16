import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import Home from "../pages/HomePage";
import Auth from "../pages/AuthPage";
import CollegesPage from "../pages/CollegesPage";
const AppLayout = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AuthLayout />}>
            <Route index element={<Home />} />
            <Route path="/colleges" element={<CollegesPage />} />
          </Route>
          {/* <Route path="*" element={<NotFound />} /> */}
          <Route path="/auth" element={<Auth />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default AppLayout;
