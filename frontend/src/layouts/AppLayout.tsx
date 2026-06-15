import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import Home from "../pages/HomePage";
import Auth from "../pages/AuthPage";
const AppLayout = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AuthLayout />}>
            <Route index element={<Home />} />
          </Route>
          {/* <Route path="*" element={<NotFound />} /> */}
          <Route path="/auth" element={<Auth />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default AppLayout;
