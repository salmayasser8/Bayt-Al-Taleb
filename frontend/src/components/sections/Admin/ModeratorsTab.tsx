import React, { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { adminApi, ModeratorInfo, EntityInfo } from "@/api/admin";
import {
  FaUserShield,
  FaPlus,
  FaTrash,
  FaSearch,
} from "react-icons/fa";
import { ConfirmModal } from "./shared";
import { Button } from "@/components/ui/button";
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

type EntityType = "MAJOR" | "SCHOLARSHIP" | "COURSE";

const entityTypeLabels: Record<EntityType, string> = {
  MAJOR: "التخصص",
  SCHOLARSHIP: "المنحة",
  COURSE: "المساق",
};

// const entityTypeLabelsPlural: Record<EntityType, string> = {
//   MAJOR: "التخصصات",
//   SCHOLARSHIP: "المنح",
//   COURSE: "المساقات",
// };

interface Props {
  onRefresh: () => void;
}

const ModeratorsTab: React.FC<Props> = ({ onRefresh }) => {
  const { toast } = useToast();

  // Data
  const [moderators, setModerators] = useState<ModeratorInfo[]>([]);
  const [majors, setMajors] = useState<EntityInfo[]>([]);
  const [scholarships, setScholarships] = useState<EntityInfo[]>([]);
  const [courses, setCourses] = useState<EntityInfo[]>([]);

  // Selection state
  const [entityType, setEntityType] = useState<EntityType>("MAJOR");
  const [selectedEntityId, setSelectedEntityId] = useState("");
  const [assignedModerators, setAssignedModerators] = useState<ModeratorInfo[]>(
    [],
  );
  const [selectedModeratorId, setSelectedModeratorId] = useState("");

  // UI state
  const [loading, setLoading] = useState(true);
  const [loadingAssigned, setLoadingAssigned] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<ModeratorInfo | null>(null);
  const [search, setSearch] = useState("");

  // Fetch initial data
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [modsRes, majorsRes, scholRes, coursesRes] = await Promise.all([
          adminApi.getModerators(),
          adminApi.getMajors(),
          adminApi.getScholarships(),
          adminApi.getCourses(),
        ]);
        setModerators(modsRes.data || []);
        setMajors(majorsRes.data || []);
        setScholarships(scholRes.data || []);
        setCourses(coursesRes.data || []);
      } catch {
        toast({
          variant: "destructive",
          title: "خطأ",
          description: "فشل تحميل البيانات",
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Fetch assigned moderators when entity changes
  useEffect(() => {
    if (!selectedEntityId) {
      setAssignedModerators([]);
      return;
    }
    const loadAssigned = async () => {
      setLoadingAssigned(true);
      try {
        let res;
        if (entityType === "MAJOR") {
          res = await adminApi.getMajorModerators(selectedEntityId);
        } else if (entityType === "SCHOLARSHIP") {
          res = await adminApi.getScholarshipModerators(selectedEntityId);
        } else {
          res = await adminApi.getCourseModerators(selectedEntityId);
        }
        setAssignedModerators(res.data || []);
      } catch {
        setAssignedModerators([]);
      } finally {
        setLoadingAssigned(false);
      }
    };
    loadAssigned();
  }, [entityType, selectedEntityId]);

  // Get entities for current type
  const getEntities = (): EntityInfo[] => {
    if (entityType === "MAJOR") return majors;
    if (entityType === "SCHOLARSHIP") return scholarships;
    return courses;
  };

  const getEntityLabel = (entity: EntityInfo): string => {
    if (entityType === "COURSE") {
      return `${entity.nameAr || entity.name} (${entity.code || ""})`;
    }
    return entity.name;
  };

  // Filter moderators not yet assigned
  const availableModerators = moderators.filter(
    (m) => !assignedModerators.some((a) => a.id === m.id),
  );

  // Filter search
  const filteredModerators = availableModerators.filter(
    (m) =>
      m.fullName.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()),
  );

  // Assign handler
  const handleAssign = async () => {
    if (!selectedEntityId || !selectedModeratorId) return;
    setAssigning(true);
    try {
      if (entityType === "MAJOR") {
        await adminApi.assignMajorModerator(
          selectedEntityId,
          selectedModeratorId,
        );
      } else if (entityType === "SCHOLARSHIP") {
        await adminApi.assignScholarshipModerator(
          selectedEntityId,
          selectedModeratorId,
        );
      } else {
        await adminApi.assignCourseModerator(
          selectedEntityId,
          selectedModeratorId,
        );
      }
      toast({ title: "تم التعيين", description: "تم تعيين المشرف بنجاح" });
      setSelectedModeratorId("");
      setSearch("");
      // Refresh assigned list
      const res =
        entityType === "MAJOR"
          ? await adminApi.getMajorModerators(selectedEntityId)
          : entityType === "SCHOLARSHIP"
            ? await adminApi.getScholarshipModerators(selectedEntityId)
            : await adminApi.getCourseModerators(selectedEntityId);
      setAssignedModerators(res.data || []);
      onRefresh();
    } catch {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل تعيين المشرف",
      });
    } finally {
      setAssigning(false);
    }
  };

  // Remove handler
  const handleRemove = async () => {
    if (!removeTarget || !selectedEntityId) return;
    try {
      if (entityType === "MAJOR") {
        await adminApi.removeMajorModerator(selectedEntityId, removeTarget.id);
      } else if (entityType === "SCHOLARSHIP") {
        await adminApi.removeScholarshipModerator(
          selectedEntityId,
          removeTarget.id,
        );
      } else {
        await adminApi.removeCourseModerator(selectedEntityId, removeTarget.id);
      }
      toast({ title: "تم الإزالة", description: "تم إزالة المشرف بنجاح" });
      setRemoveTarget(null);
      // Refresh assigned list
      const res =
        entityType === "MAJOR"
          ? await adminApi.getMajorModerators(selectedEntityId)
          : entityType === "SCHOLARSHIP"
            ? await adminApi.getScholarshipModerators(selectedEntityId)
            : await adminApi.getCourseModerators(selectedEntityId);
      setAssignedModerators(res.data || []);
      onRefresh();
    } catch {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل إزالة المشرف",
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm text-center py-16 text-gray-400">
        جاري التحميل...
      </div>
    );
  }

  return (
    <>
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-xl text-primary">
            إدارة تعيين المشرفين
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            تعيين مشرفين مراجعة للتصنيفات المختلفة لمراجعة واعتماد الملفات
            المرفوعة من الطلاب
          </p>
        </div>

        <div className="p-6">
          {/* Entity Type Selector */}
          <div className="flex gap-2 mb-4">
            {(Object.keys(entityTypeLabels) as EntityType[]).map((type) => (
              <button
                key={type}
                onClick={() => {
                  setEntityType(type);
                  setSelectedEntityId("");
                  setAssignedModerators([]);
                  setSelectedModeratorId("");
                  setSearch("");
                }}
                className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors ${
                  entityType === type
                    ? "bg-primary text-paragraph"
                    : "bg-bgSection text-primary hover:bg-gray-200"
                }`}
              >
                {entityTypeLabels[type]}
              </button>
            ))}
          </div>

          {/* Entity Selector */}
          <div className="mb-6">
            <label className="text-sm font-semibold text-primary mb-2 block">
              اختر {entityTypeLabels[entityType]}
            </label>
            <select
              value={selectedEntityId}
              onChange={(e) => setSelectedEntityId(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors text-primary bg-white"
            >
              <option value="">
                -- اختر {entityTypeLabels[entityType]} --
              </option>
              {getEntities().map((entity) => (
                <option key={entity.id} value={entity.id}>
                  {getEntityLabel(entity)}
                </option>
              ))}
            </select>
          </div>

          {selectedEntityId && (
            <>
              {/* Assigned Moderators */}
              <div className="mb-6">
                <h3 className="font-bold text-primary mb-3">
                  المشرفون المعينون ({assignedModerators.length})
                </h3>
                {loadingAssigned ? (
                  <div className="text-gray-400 text-sm py-4">
                    جاري التحميل...
                  </div>
                ) : assignedModerators.length === 0 ? (
                  <div className="bg-bgSection rounded-xl p-6 text-center text-gray-400">
                    <FaUserShield
                      size={32}
                      className="mx-auto mb-2 text-primary"
                    />
                    <p className="font-semibold">لا يوجد مشرفون معينون</p>
                    <p className="text-sm mt-1 text-primary">
                      استخدم القائمة أدناه لتعيين مشرف لهذا{" "}
                      {entityTypeLabels[entityType]}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {assignedModerators.map((mod) => (
                      <div
                        key={mod.id}
                        className="flex items-center justify-between bg-bgSection rounded-xl px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                            {getInitials(mod.fullName)}
                          </div>
                          <div>
                            <div className="font-bold text-primary text-sm">
                              {mod.fullName}
                            </div>
                            <div className="text-gray-400 text-xs">
                              {mod.email}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => setRemoveTarget(mod)}
                          className="text-red-400 hover:text-red-600 transition-colors p-2"
                          title="إزالة المشرف"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Assign New Moderator */}
              <div className="border-t border-gray-100 pt-4">
                <h3 className="font-bold text-primary mb-3">إضافة مشرف</h3>
                {availableModerators.length === 0 ? (
                  <div className="bg-bgSection rounded-xl p-4 text-center text-gray-400 text-sm">
                    جميع المشرفين معينون بالفعل لهذا{" "}
                    {entityTypeLabels[entityType]}
                  </div>
                ) : (
                  <>
                    <div className="relative mb-3">
                      <FaSearch
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={14}
                      />
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="ابحث عن مشرف..."
                        className="w-full border border-gray-300 rounded-xl px-4 py-2 pr-9 outline-none focus:border-primary text-sm text-primary"
                      />
                    </div>

                    <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl">
                      {filteredModerators.length === 0 ? (
                        <div className="p-4 text-center text-gray-400 text-sm">
                          لا توجد نتائج
                        </div>
                      ) : (
                        filteredModerators.map((mod) => (
                          <button
                            key={mod.id}
                            onClick={() => setSelectedModeratorId(mod.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-right transition-colors border-b border-gray-50 last:border-b-0 ${
                              selectedModeratorId === mod.id
                                ? "bg-primary/10 border-primary"
                                : "hover:bg-bgSection"
                            }`}
                          >
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                              {getInitials(mod.fullName)}
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-primary text-sm">
                                {mod.fullName}
                              </div>
                              <div className="text-gray-400 text-xs">
                                {mod.email}
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>

                    {selectedModeratorId && (
                      <div className="flex items-center justify-center">
                        <Button
                          onClick={handleAssign}
                          disabled={assigning}
                          className="mt-5 gap-2"
                        >
                          <span className="flex items-center justify-center gap-2">
                            <FaPlus size={14} />
                            {assigning ? "جاري التعيين..." : "تعيين المشرف"}
                          </span>
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Remove confirmation modal */}
      <ConfirmModal
        show={!!removeTarget}
        onConfirm={handleRemove}
        onCancel={() => setRemoveTarget(null)}
      />
    </>
  );
};

export default ModeratorsTab;
