import React, { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { useAuth } from "@/store/AuthContext";
import { adminApi, AdminUser } from "@/api/admin";
import {
  MdAdminPanelSettings,
  MdSchool,
  MdPayments,
  MdMedicalServices,
} from "react-icons/md";
import {
  FaUsers,
  FaUserShield,
  FaUserCheck,
  FaUserTimes,
} from "react-icons/fa";
import { roleLabels } from "@/components/sections/Admin/shared";
import type { AdminTab } from "@/components/sections/Admin/shared";
import UsersTab, {
  usersTabKpiData,
} from "@/components/sections/Admin/UsersTab";
import ModeratorsTab from "@/components/sections/Admin/ModeratorsTab";
import {
  CollegesTab,
  MajorsTab,
  ScholarshipsTab,
} from "@/components/sections/Admin/DataTabs";

import { MdDescription } from "react-icons/md";
import ContentTab from "@/components/sections/Admin/ContentTabs";
const cardPopUp: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      duration: 0.6,
    },
  },
};
const container: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.2 },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
  { id: "users", label: "المستخدمون", icon: <FaUsers size={16} /> },
  { id: "moderators", label: "تعيين المشرفين", icon: <FaUserShield size={16} /> },
  { id: "colleges", label: "الكليات", icon: <MdMedicalServices size={16} /> },
  { id: "majors", label: "التخصصات", icon: <MdSchool size={16} /> },
  { id: "scholarships", label: "المنح", icon: <MdPayments size={16} /> },
  { id: "content", label: "المحتوى", icon: <MdDescription size={14} /> },
];

const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("users");
  const [users, setUsers] = useState<AdminUser[]>([]);

  const refreshKpi = async () => {
    try {
      const r = await adminApi.getUsers(1);
      setUsers(r.data?.items || r.data || []);
    } catch {}
  };
  useEffect(() => {
    refreshKpi();
  }, []);

  const kpi = usersTabKpiData(users);
  const kpis = [
    {
      label: "إجمالي المستخدمين",
      value: kpi.total,
      icon: <FaUsers size={25} />,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "المشرفون",
      value: kpi.moderators,
      icon: <FaUserShield size={25} />,
      color: "bg-purple-100 text-purple-600",
    },
    {
      label: "النشطون",
      value: kpi.active,
      icon: <FaUserCheck size={25} />,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "المعلقون",
      value: kpi.inactive,
      icon: <FaUserTimes size={25} />,
      color: "bg-red-100 text-red-600",
    },
  ];

  return (
    <div className="min-h-screen bg-bgSection">
      <div className="container py-8">
        {/* Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <MdAdminPanelSettings size={28} />
            </div>
            <div>
              <h1 className="font-bold text-3xl text-primary">لوحة التحكم</h1>
              <p className="text-gray-500 text-md font-semibold mt-2">
                مرحباً {user?.fullName} —{" "}
                {roleLabels[user?.role || ""] || user?.role}
              </p>
            </div>
          </div>
        </motion.div>

        {/* KPIs */}
        <motion.div
          initial="hidden"
          variants={container}
          viewport={{ once: false, amount: 0.5 }}
          whileInView="visible"
          className="  grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {kpis.map((k) => (
            <motion.div
              key={k.label}
              variants={cardPopUp}
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3 }}
              className=" flex flex-col justify-center items-center bg-white rounded-2xl border border-gray-200 p-5 shadow-sm  hover:border-primary"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${k.color}`}
              >
                {k.icon}
              </div>
              <div className="font-bold text-2xl text-primary">{k.value}</div>
              <div className="text-gray-500 text-md font-semibold mt-1">
                {k.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-colors ${activeTab === tab.id ? "bg-primary text-paragraph" : "bg-white border border-gray-300 text-primary hover:border-primary"}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "users" && <UsersTab onRefresh={refreshKpi} />}
        {activeTab === "moderators" && <ModeratorsTab onRefresh={refreshKpi} />}
        {activeTab === "colleges" && <CollegesTab onRefresh={refreshKpi} />}
        {activeTab === "majors" && <MajorsTab onRefresh={refreshKpi} />}
        {activeTab === "scholarships" && (
          <ScholarshipsTab onRefresh={refreshKpi} />
        )}
        {activeTab === "content" && <ContentTab />}
      </div>
    </div>
  );
};

export default AdminPage;
