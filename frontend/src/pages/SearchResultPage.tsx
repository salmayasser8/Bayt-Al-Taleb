import React, { useState, useEffect, useMemo } from "react";
import { motion, Variants } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import { IoChevronBack } from "react-icons/io5";
import { GrLinkPrevious } from "react-icons/gr";
import { MdSchool, MdPayments } from "react-icons/md";
import { FaUniversity } from "react-icons/fa";
import SearchBar from "@/components/common/SearchBar";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import api from "@/api/axios";
import Pagination from "@/components/common/Pagination";

// ── Types ─────────────────────────────────────────────────────────────
interface MajorResult { id: string; name: string; degree: string; slug: string; }
interface ScholarshipResult { id: string; name: string; slug: string; isActive: boolean; }
interface CollegeResult { id: string; name: string; category: string; slug: string; }

interface SearchResponse {
  query: string;
  majors: MajorResult[];
  scholarships: ScholarshipResult[];
  colleges?: CollegeResult[];
  total: number;
}

// ── Filter tabs ───────────────────────────────────────────────────────
type FilterTab = "all" | "majors" | "scholarships" | "colleges";
const filterTabs: { value: FilterTab; label: string }[] = [
  { value: "all", label: "الكل" },
  { value: "majors", label: "التخصصات" },
  { value: "scholarships", label: "المنح" },
  { value: "colleges", label: "الكليات" },
];

// ── Animations ────────────────────────────────────────────────────────
const fadeUp: Variants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const container: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const cardPop: Variants = { hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } } };

// ── Result Card ───────────────────────────────────────────────────────
const ResultCard: React.FC<{
  type: "major" | "scholarship" | "college";
  title: string; subtitle?: string; badge?: string; link: string; isActive?: boolean;
}> = ({ type, title, subtitle, badge, link, isActive }) => {
  const typeConfig = {
    major: { label: "تخصص", color: "bg-blue-100 text-blue-600", icon: <MdSchool size={20} /> },
    scholarship: { label: "منحة", color: "bg-yellow-100 text-yellow-600", icon: <MdPayments size={20} /> },
    college: { label: "كلية", color: "bg-green-100 text-green-600", icon: <FaUniversity size={20} /> },
  };
  const config = typeConfig[type];

  return (
    <motion.div variants={cardPop} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:border-primary transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${config.color}`}>{config.icon}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${config.color}`}>{config.label}</span>
              {type === "scholarship" && isActive !== undefined && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isActive ? "bg-green-100 text-green-600" : "bg-red-100 text-red-400"}`}>{isActive ? "نشطة" : "منتهية"}</span>
              )}
              {badge && <span className="font-semibold text-xs bg-bgSection text-gray-500 px-2 py-0.5 rounded-full">{badge}</span>}
            </div>
            <h3 className="font-bold text-primary text-lg">{title}</h3>
            {subtitle && <p className="text-gray-500 text-sm mt-1 font-semibold">{subtitle}</p>}
          </div>
        </div>
        <Link to={link} className="flex items-center gap-1 text-primary font-semibold no-underline hover:text-accent transition-colors text-sm flex-shrink-0 group">
          عرض التفاصيل <GrLinkPrevious className="group-hover:-translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────
const SearchResultPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  // Search function
  const doSearch = async (q: string) => {
    if (!q.trim()) { setResults(null); return; }
    setLoading(true);
    try {
      const res = await api.get(`/search?q=${encodeURIComponent(q)}`);
      setResults(res.data.data);
    } catch { setResults(null); } 
    finally { setLoading(false); }
  };

  // Search on URL param change
  useEffect(() => {
    const q = searchParams.get("q") || "";
    setQuery(q);
    if (q) doSearch(q);
  }, [searchParams]);

  // Handle search submit
  const handleSearch = (value: string | React.ChangeEvent<HTMLInputElement>) => {
    const q = typeof value === "string" ? value : value.target.value;
    setQuery(q);
    if (q.trim()) { setSearchParams({ q: q }); } 
    else { setSearchParams({}); setResults(null); }
  };

  // ⬇️ 1. FLATTEN RESULTS FIRST ⬇️
  const flatResults = useMemo(() => {
    if (!results) return [];
    const majors = (results.majors || []).map((m) => ({ type: "major" as const, id: m.id, title: m.name, subtitle: `لقب أكاديمي: ${m.degree}`, badge: m.degree, link: `/majors/${m.id}` }));
    const scholarships = (results.scholarships || []).map((s) => ({ type: "scholarship" as const, id: s.id, title: s.name, subtitle: s.isActive ? "مفتوحة للتقديم" : "مغلقة", link: `/scholarships/${s.id}`, isActive: s.isActive }));
    const colleges = (results.colleges || []).map((c) => ({ type: "college" as const, id: c.id, title: c.name, subtitle: c.category, badge: c.category, link: `/colleges/${c.id}` }));

    switch (activeTab) {
      case "majors": return majors;
      case "scholarships": return scholarships;
      case "colleges": return colleges;
      default: return [...majors, ...scholarships, ...colleges];
    }
  }, [results, activeTab]);

  // ⬇️ 2. PAGINATION LOGIC SECOND (So it can use flatResults) ⬇️
  const totalPages = Math.ceil(flatResults.length / ITEMS_PER_PAGE);
  const paginatedResults = flatResults.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Reset to page 1 when the search query or tab changes
  useEffect(() => { setCurrentPage(1); }, [activeTab, results]);

  const totalCount = results ? (results.majors?.length || 0) + (results.scholarships?.length || 0) + (results.colleges?.length || 0) : 0;

  return (
    <div className="min-h-screen bg-bgSection">
      <div className="container py-8">
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex items-center gap-2 text-sm font-semibold mb-6">
          <Link to="/" className="text-gray-400 hover:text-primary transition-colors">الرئيسية</Link>
          <IoChevronBack className="text-gray-400" />
          <span className="text-primary">نتائج البحث</span>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mb-8">
          <h1 className="font-bold text-3xl md:text-4xl text-primary mb-6">البحث في المنصة</h1>
          <SearchBar value={query} onChange={handleSearch} placeholder="ابحث عن تخصص، كلية، منحة..." />
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><LoadingSpinner text="جاري البحث..." /></div>
        ) : results ? (
          <>
            <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex flex-col sm:flex-row items-center sm:justify-between gap-4 mb-6">
              <p className="text-gray-500 font-semibold">تم العثور على <span className="text-primary font-bold">{totalCount}</span> نتيجة {query && <span> لـ "<span className="text-accent">{query}</span>"</span>}</p>
              <div className="flex gap-2 flex-wrap">
                {filterTabs.map((tab) => (
                  <button key={tab.value} onClick={() => setActiveTab(tab.value)} className={`px-4 py-2 rounded-full font-semibold text-sm transition-colors ${activeTab === tab.value ? "bg-primary text-paragraph" : "bg-white border border-gray-300 text-primary hover:border-primary"}`}>
                    {tab.label}
                    {tab.value === "all" && ` (${totalCount})`}
                    {tab.value === "majors" && ` (${results.majors?.length || 0})`}
                    {tab.value === "scholarships" && ` (${results.scholarships?.length || 0})`}
                    {tab.value === "colleges" && ` (${results.colleges?.length || 0})`}
                  </button>
                ))}
              </div>
            </motion.div>

            {paginatedResults.length > 0 ? (
              <motion.div variants={container} initial="hidden" animate="visible" className="flex flex-col gap-4">
                {paginatedResults.map((result) => (
                  <ResultCard key={`${result.type}-${result.id}`} type={result.type} title={result.title} subtitle={result.subtitle} badge={"badge" in result ? result.badge : undefined} link={result.link} isActive={"isActive" in result ? result.isActive : undefined} />
                ))}
              </motion.div>
            ) : (
              <motion.div variants={fadeUp} initial="hidden" animate="visible" className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="font-bold text-xl text-primary mb-2">لا توجد نتائج</h3>
                <p className="text-gray-500">جرب البحث بكلمات مختلفة أو اختر فلتراً آخر</p>
              </motion.div>
            )}

            {/* ⬇️ PAGINATION HIDES IF NO RESULTS ⬇️ */}
            {paginatedResults.length > 0 && (
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            )}
          </>
        ) : (
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="font-bold text-xl text-primary mb-2">ابدأ البحث</h3>
            <p className="text-gray-500">اكتب في حقل البحث للعثور على تخصصات، كليات، أو منح دراسية</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SearchResultPage;