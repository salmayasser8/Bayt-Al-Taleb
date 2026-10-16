import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/store/AuthContext";
import { useToast } from "@/hooks/use-toast";
import api from "@/api/axios";

const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");

    if (!accessToken || !refreshToken) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل تسجيل الدخول باستخدام جوجل",
      });
      navigate("/auth");
      return;
    }

    localStorage.setItem("token", accessToken);
    localStorage.setItem("refreshToken", refreshToken);

    api
      .get("/users/me")
      .then((res) => {
        const user = res.data.data;
        login(user, accessToken);
        toast({
          title: "تم تسجيل الدخول",
          description: `مرحباً ${user.fullName}`,
        });
        navigate("/");
      })
      .catch(() => {
        toast({
          variant: "destructive",
          title: "خطأ",
          description: "فشل تسجيل الدخول باستخدام جوجل",
        });
        navigate("/auth");
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-lg font-semibold text-primary">جارٍ تسجيل الدخول...</p>
    </div>
  );
};

export default AuthCallback;