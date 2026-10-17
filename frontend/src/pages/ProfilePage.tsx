import React, { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/store/AuthContext";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FaUserCircle, FaEdit, FaLock, FaCheck, FaShieldAlt } from "react-icons/fa";
import api from "@/api/axios";
import Button from "@/components/common/Button";
import {
  setupTwoFactorApi,
  confirmTwoFactorApi,
  disableTwoFactorApi,
} from "@/api/auth";

// ── Types ─────────────────────────────────────────────────────────────

interface ProfileData {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

// ── Schemas ───────────────────────────────────────────────────────────

const profileSchema = z.object({
  fullName: z.string().min(3, "الاسم يجب أن يكون 3 أحرف على الأقل"),
  email: z.string().email("صيغة البريد الإلكتروني غير صحيحة"),
});

const passwordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
    newPassword: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
    confirmPassword: z.string().min(1, "تأكيد كلمة المرور مطلوب"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "كلمتا المرور غير متطابقتان",
    path: ["confirmPassword"],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

// ── Animations ────────────────────────────────────────────────────────

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// ── Role labels ───────────────────────────────────────────────────────

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: "سوبر أدمن",
  ADMIN: "مشرف عام",
  MODERATOR: "مشرف مراجعة",
  MEMBER: "عضو",
};

const roleColors: Record<string, string> = {
  SUPER_ADMIN: "bg-red-100 text-red-600",
  ADMIN: "bg-purple-100 text-purple-600",
  MODERATOR: "bg-blue-100 text-blue-600",
  MEMBER: "bg-gray-100 text-gray-600",
};

// ── Main Page ─────────────────────────────────────────────────────────

const ProfilePage: React.FC = () => {
  const { user, login, token } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [activeTab, setActiveTab] = useState<"info" | "password" | "security">(
    "info",
  );
  const [loading, setLoading] = useState(true);

  // Two-factor (email OTP) state
  const [twoFaEnabled, setTwoFaEnabled] = useState(false);
  const [twoFaFlow, setTwoFaFlow] = useState<
    "idle" | "sending" | "confirming" | "disabling"
  >("idle");
  const [twoFaCode, setTwoFaCode] = useState("");
  const [twoFaSubmitting, setTwoFaSubmitting] = useState(false);

  const inputStyle =
    "w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors text-primary bg-white";

  // Profile form
  const {
    register: regProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors: profileErrors, isSubmitting: profileSaving },
  } = useForm<ProfileFormData>({ resolver: zodResolver(profileSchema) });

  // Password form
  const {
    register: regPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors, isSubmitting: passwordSaving },
  } = useForm<PasswordFormData>({ resolver: zodResolver(passwordSchema) });

  // Fetch profile
  useEffect(() => {
    api
      .get("/users/me")
      .then((res) => {
        const data = res.data?.data || res.data;
        setProfile(data);
        resetProfile({ fullName: data.fullName, email: data.email });
      })
      .catch(() =>
        toast({
          variant: "destructive",
          title: "خطأ",
          description: "فشل تحميل الملف الشخصي",
        }),
      )
      .finally(() => setLoading(false));

    // Fetch 2FA status
    api
      .get("/auth/2fa/status")
      .then((res) => {
        const data = res.data?.data || res.data;
        setTwoFaEnabled(Boolean(data.enabled));
      })
      .catch(() => {});
  }, []);

  // Save profile
  const onSaveProfile = async (data: ProfileFormData) => {
    try {
      const res = await api.patch(`/users/${user?.id}`, data);
      const updated = res.data?.data || res.data;
      setProfile(updated);

      // Update auth context
      if (user && token) {
        login({ ...user, fullName: updated.fullName }, token);
      }

      toast({
        title: "تم التحديث",
        description: "تم تحديث بياناتك الشخصية بنجاح",
      });
    } catch {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل تحديث البيانات",
      });
    }
  };

  // Change password
  const onChangePassword = async (data: PasswordFormData) => {
    try {
      await api.patch(`/users/${user?.id}/password`, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast({ title: "تم التغيير", description: "تم تغيير كلمة المرور بنجاح" });
      resetPassword();
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || "فشل تغيير كلمة المرور";
      toast({ variant: "destructive", title: "خطأ", description: msg });
    }
  };

  // ── Two-factor (email OTP) handlers ───────────────────────────
  const onEnableTwoFa = async () => {
    setTwoFaFlow("sending");
    try {
      await setupTwoFactorApi();
      setTwoFaFlow("confirming");
      toast({
        title: "تم إرسال الكود",
        description: "أدخل الكود المرسل إلى بريدك الإلكتروني",
      });
    } catch {
      setTwoFaFlow("idle");
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل إرسال كود التحقق",
      });
    }
  };

  const onConfirmTwoFa = async (e: React.FormEvent) => {
    e.preventDefault();
    setTwoFaSubmitting(true);
    try {
      await confirmTwoFactorApi(twoFaCode);
      setTwoFaEnabled(true);
      setTwoFaFlow("idle");
      setTwoFaCode("");
      toast({
        title: "تم التفعيل",
        description: "تم تفعيل التحقق بخطوتين بنجاح",
      });
    } catch {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "كود التحقق غير صحيح",
      });
    } finally {
      setTwoFaSubmitting(false);
    }
  };

  const onDisableTwoFa = async () => {
    setTwoFaFlow("disabling");
    try {
      await disableTwoFactorApi();
      setTwoFaEnabled(false);
      setTwoFaFlow("idle");
      toast({
        title: "تم الإلغاء",
        description: "تم إلغاء التحقق بخطوتين",
      });
    } catch {
      setTwoFaFlow("idle");
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل إلغاء التحقق بخطوتين",
      });
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-bgSection flex items-center justify-center">
        <p className="text-primary font-bold">جاري التحميل...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-bgSection">
      <div className="container py-8 max-w-2xl">
        {/* Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <FaUserCircle size={48} />
            </div>
            <div>
              <h1 className="font-bold text-2xl text-primary">
                {profile?.fullName}
              </h1>
              <p className="text-gray-500 text-sm mb-2">{profile?.email}</p>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full ${roleColors[profile?.role || "MEMBER"]}`}
              >
                {roleLabels[profile?.role || "MEMBER"]}
              </span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <FaCheck className="text-green-500" size={14} />
              <span>{profile?.isActive ? "حساب نشط" : "حساب معلق"}</span>
            </div>
            <div>
              تاريخ التسجيل:{" "}
              {profile?.createdAt
                ? new Date(profile.createdAt).toLocaleDateString("ar")
                : "—"}
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
        >
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setActiveTab("info")}
              className={`flex-1 flex items-center justify-center gap-2 py-4 font-bold text-sm transition-colors ${activeTab === "info" ? "text-primary border-b-2 border-primary" : "text-gray-400 hover:text-primary"}`}
            >
              <FaEdit size={14} /> تعديل البيانات
            </button>
            <button
              onClick={() => setActiveTab("password")}
              className={`flex-1 flex items-center justify-center gap-2 py-4 font-bold text-sm transition-colors ${activeTab === "password" ? "text-primary border-b-2 border-primary" : "text-gray-400 hover:text-primary"}`}
            >
              <FaLock size={14} /> تغيير كلمة المرور
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`flex-1 flex items-center justify-center gap-2 py-4 font-bold text-sm transition-colors ${activeTab === "security" ? "text-primary border-b-2 border-primary" : "text-gray-400 hover:text-primary"}`}
            >
              <FaShieldAlt size={14} /> الأمان
            </button>
          </div>

          {/* Profile Info Tab */}
          {activeTab === "info" && (
            <form
              onSubmit={handleProfileSubmit(onSaveProfile)}
              className="p-6 flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-primary text-sm">
                  الاسم الكامل
                </label>
                <input
                  type="text"
                  className={inputStyle}
                  {...regProfile("fullName")}
                />
                {profileErrors.fullName && (
                  <p className="text-red-400 text-xs">
                    {profileErrors.fullName.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-primary text-sm">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  className={inputStyle}
                  {...regProfile("email")}
                />
                {profileErrors.email && (
                  <p className="text-red-400 text-xs">
                    {profileErrors.email.message}
                  </p>
                )}
              </div>

              <motion.button
                type="submit"
                disabled={profileSaving}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-primary text-paragraph font-bold py-3 rounded-xl hover:bg-primaryLight transition-colors disabled:opacity-60 mt-2"
              >
                {profileSaving ? "جاري الحفظ..." : "حفظ التغييرات"}
              </motion.button>
            </form>
          )}

          {/* Password Tab */}
          {activeTab === "password" && (
            <form
              onSubmit={handlePasswordSubmit(onChangePassword)}
              className="p-6 flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-primary text-sm">
                  كلمة المرور الحالية
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className={inputStyle}
                  {...regPassword("currentPassword")}
                />
                {passwordErrors.currentPassword && (
                  <p className="text-red-400 text-xs">
                    {passwordErrors.currentPassword.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-primary text-sm">
                  كلمة المرور الجديدة
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className={inputStyle}
                  {...regPassword("newPassword")}
                />
                {passwordErrors.newPassword && (
                  <p className="text-red-400 text-xs">
                    {passwordErrors.newPassword.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-primary text-sm">
                  تأكيد كلمة المرور الجديدة
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className={inputStyle}
                  {...regPassword("confirmPassword")}
                />
                {passwordErrors.confirmPassword && (
                  <p className="text-red-400 text-xs">
                    {passwordErrors.confirmPassword.message}
                  </p>
                )}
              </div>

              <motion.button
                type="submit"
                disabled={passwordSaving}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-primary text-paragraph font-bold py-3 rounded-xl hover:bg-primaryLight transition-colors disabled:opacity-60 mt-2"
              >
                {passwordSaving ? "جاري التغيير..." : "تغيير كلمة المرور"}
              </motion.button>
            </form>
          )}

          {/* Security Tab — Two-factor (email OTP) */}
          {activeTab === "security" && (
            <div className="p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                <div>
                  <p className="font-bold text-primary text-md">
                    التحقق بخطوتين
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    {twoFaEnabled
                      ? "مفعّل — سيُطلب كود مرسل إلى بريدك عند تسجيل الدخول"
                      : "معطّل — يمكنك تفعيله لحماية حسابك"}
                  </p>
                </div>
                <span
                  className={`text-sm font-bold px-3 py-1 rounded-full ${
                    twoFaEnabled
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {twoFaEnabled ? "مفعّل" : "معطّل"}
                </span>
              </div>

              {!twoFaEnabled && twoFaFlow !== "confirming" && (
                <Button
                  onClick={onEnableTwoFa}
                  disabled={twoFaFlow === "sending"}
                  className="w-full"
                >
                  {twoFaFlow === "sending"
                    ? "جاري الإرسال..."
                    : "تفعيل التحقق بخطوتين"}
                </Button>
              )}

              {twoFaFlow === "confirming" && (
                <form onSubmit={onConfirmTwoFa} className="flex flex-col gap-3">
                  <p className="text-gray-500 text-md">
                    تم إرسال كود مكوّن من 6 أرقام إلى بريدك الإلكتروني. أدخله
                    للتأكيد.
                  </p>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    value={twoFaCode}
                    onChange={(e) =>
                      setTwoFaCode(e.target.value.replace(/\D/g, ""))
                    }
                    className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors text-primary text-center text-xl tracking-[0.4em] font-bold"
                  />
                  <Button
                    type="submit"
                    disabled={twoFaCode.length !== 6 || twoFaSubmitting}
                    className="w-full"
                  >
                    {twoFaSubmitting ? "جاري التأكيد..." : "تأكيد التفعيل"}
                  </Button>
                  <button
                    type="button"
                    onClick={() => {
                      setTwoFaFlow("idle");
                      setTwoFaCode("");
                    }}
                    className="w-fit mx-auto text-primary text-sm font-semibold hover:text-accent transition-colors"
                  >
                    إلغاء
                  </button>
                </form>
              )}

              {twoFaEnabled && (
                <Button
                  onClick={onDisableTwoFa}
                  disabled={twoFaFlow === "disabling"}
                  className="w-full"
                >
                  {twoFaFlow === "disabling"
                    ? "جاري الإلغاء..."
                    : "إلغاء التحقق بخطوتين"}
                </Button>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
