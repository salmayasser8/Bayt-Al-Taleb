import { BrowserRouter, Routes, Route } from "react-router-dom";
import SharedLayout from "./AuthLayout";
import Home from "../pages/HomePage";
const MainLayout = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SharedLayout />}>
            <Route index element={<Home />} />
          </Route>
          {/* <Route path="*" element={<NotFound />} /> */}
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default MainLayout;
