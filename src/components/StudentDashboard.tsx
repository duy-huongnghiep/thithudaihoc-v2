import React, { useState, useEffect } from 'react';
import {
  LogOut,
  ChevronRight,
  GraduationCap,
  Brain,
  BookOpenCheck,
  ChevronDown,
  Info,
  Copy,
  Check,
  Play,
  Clock,
  Lock,
  Compass,
  ArrowRight,
  Timer,
  Calendar,
  Settings,
  Code2,
  RefreshCw,
  BookOpen,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import {
  isYes,
  getExamSchedule,
  getScriptUrl,
  setScriptUrl,
  getStudentsData,
  isStudentAdmin,
  getGlobalSheetConfig,
  subscribeGlobalConfig,
  getAdminPermissions,
} from '../services/api';
import { GOOGLE_APPS_SCRIPT_CODE } from '../services/loginLogger';
import { EXAM_GROUPS, EXAM_TIPS } from '../data/examsData';
import { ExamSection, SheetGlobalConfig, StudentInfo } from '../types';
import { ExamBadges } from './Badges';
import { ExamLauncherModal } from './ExamLauncherModal';
import { CareerTestModal } from './CareerTestModal';

interface StudentDashboardProps {
  student: StudentInfo;
  onLogout: () => void;
  onOpenGuide?: () => void;
  onOpenUserGuide?: () => void;
  onOpenAdminLogs?: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  student,
  onLogout,
  onOpenGuide,
  onOpenUserGuide,
  onOpenAdminLogs,
}) => {
  const [showExams, setShowExams] = useState(true);
  const [examFilterTab, setExamFilterTab] = useState<'all' | 'hsa' | 'vact' | 'thptqg'>('all');
  const [showTips, setShowTips] = useState(false);
  const [showCareerModal, setShowCareerModal] = useState(false);
  const [selectedExamForModal, setSelectedExamForModal] = useState<{
    section: ExamSection;
    categoryName: string;
  } | null>(null);
  const [copiedSbd, setCopiedSbd] = useState(false);
  const [, setTick] = useState(0);

  const isAdmin = isStudentAdmin(student);
  const adminPerms = getAdminPermissions(student);
  const [globalConfig, setGlobalConfig] = useState<SheetGlobalConfig>(() => getGlobalSheetConfig());
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminScriptUrl, setAdminScriptUrl] = useState(() => getScriptUrl());
  const [copiedScript, setCopiedScript] = useState(false);
  const [urlSavedNotice, setUrlSavedNotice] = useState(false);
  const [testSyncStatus, setTestSyncStatus] = useState<string | null>(null);
  const [isTestingSync, setIsTestingSync] = useState(false);

  useEffect(() => {
    const unsub = subscribeGlobalConfig((cfg) => setGlobalConfig(cfg));
    const timer = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);
    return () => {
      unsub();
      clearInterval(timer);
    };
  }, []);

  const schedule = getExamSchedule(student);
  const isOpen = schedule.status === 'OPEN' || schedule.status === 'FREE_TESTING';

  const gateLoaded = globalConfig.loadedFromSheet4;
  const hasHsa = isYes(student.hsa) && (!gateLoaded || globalConfig.enableHsa);
  const hasVact = isYes(student.vact) && (!gateLoaded || globalConfig.enableVact);
  const hasThptqg = isYes(student.thptqg) && (!gateLoaded || globalConfig.enableThptqg);
  const hasHuongnghiep =
    (isYes(student.huongnghiep) && (!gateLoaded || globalConfig.enableHuongnghiep)) || isAdmin;
  const hasAnyExam = hasHsa || hasVact || hasThptqg;
  const enabledGroupCount = [hasHsa, hasVact, hasThptqg].filter(Boolean).length;

  const handleCopySbd = () => {
    if (!student.sbd) return;
    navigator.clipboard.writeText(student.sbd);
    setCopiedSbd(true);
    setTimeout(() => setCopiedSbd(false), 2000);
  };

  return (
    <div id="student-dashboard-section" className="space-y-5">
      {/* Admin Quick Jump Banner */}
      {isAdmin && onOpenAdminLogs && (
        <div className="p-4 bg-[#11152c] border border-indigo-500/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/35 flex items-center justify-center text-indigo-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] uppercase font-bold tracking-wider text-indigo-400 block">
                Quyền Quản trị viên
              </span>
              <span className="text-sm font-bold text-white">
                Quay lại bảng điều khiển &amp; dữ liệu hệ thống
              </span>
            </div>
          </div>
          <button
            type="button"
            id="btn-goto-sheet2-logs"
            onClick={onOpenAdminLogs}
            className="min-h-[42px] px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/20 transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap"
          >
            <span>Mở Bảng Quản Trị</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Responsive 2-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT RAIL */}
        <aside className="lg:col-span-4 space-y-4">
          {/* Candidate Card */}
          <div className="bg-[#0c1020] border border-slate-800 p-4 sm:p-5 rounded-2xl space-y-4 text-xs">
            <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-3.5">
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  Thí sinh dự thi
                </span>
                <span
                  id="display-student-name"
                  className="font-extrabold text-white text-base block truncate mt-0.5"
                >
                  {student.hoten || 'Chưa cập nhật'}
                </span>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  SBD
                </span>
                <div className="flex items-center gap-1 justify-end mt-0.5">
                  <span
                    id="display-student-sbd"
                    className="font-mono tabular-nums font-extrabold text-blue-400 text-base"
                  >
                    {student.sbd || '---'}
                  </span>
                  {student.sbd && (
                    <button
                      type="button"
                      onClick={handleCopySbd}
                      className="p-1 text-slate-500 hover:text-blue-400 transition cursor-pointer"
                      title="Sao chép SBD"
                    >
                      {copiedSbd ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="divide-y divide-slate-800/80">
              {student.email && (
                <div className="flex justify-between items-center text-slate-400 py-2 gap-2">
                  <span className="shrink-0">Email:</span>
                  <span className="text-slate-200 font-medium truncate text-right">
                    {student.email}
                  </span>
                </div>
              )}

              {student.namsinh && (
                <div className="flex justify-between items-center text-slate-400 py-2">
                  <span>Năm sinh:</span>
                  <span className="text-slate-200 font-mono tabular-nums font-semibold">
                    {student.namsinh}
                  </span>
                </div>
              )}

              <div className="pt-2.5 space-y-1.5">
                <span className="text-slate-400 block text-xs">
                  Kỳ thi đã đăng ký:
                </span>
                <ExamBadges student={student} size="sm" globalConfig={globalConfig} />
              </div>
            </div>
          </div>

          {/* Exam Schedule Card */}
          {schedule.status !== 'FREE_TESTING' && schedule.status !== 'NO_SCHEDULE' && (
            <div
              id="exam-schedule-banner"
              className={`p-4 rounded-2xl border text-xs space-y-3 ${
                schedule.status === 'OPEN'
                  ? 'bg-emerald-950/30 border-emerald-500/35 text-emerald-300'
                  : schedule.status === 'UPCOMING'
                  ? 'bg-amber-950/30 border-amber-500/35 text-amber-300'
                  : 'bg-rose-950/30 border-rose-500/35 text-rose-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {schedule.status === 'OPEN' ? (
                  <Clock className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : schedule.status === 'UPCOMING' ? (
                  <Timer className="w-5 h-5 text-amber-400 shrink-0" />
                ) : (
                  <Lock className="w-5 h-5 text-rose-400 shrink-0" />
                )}
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 block">
                    Lịch mở thi thử
                  </span>
                  <span className="font-bold text-white text-sm">
                    {schedule.status === 'OPEN' && 'Ca thi đang mở cửa'}
                    {schedule.status === 'UPCOMING' && 'Chưa đến giờ mở đề'}
                    {schedule.status === 'CLOSED' && 'Đã hết hạn thi thử'}
                  </span>
                </div>
              </div>

              {schedule.status === 'UPCOMING' && schedule.countdown && (
                <div className="grid grid-cols-4 gap-2 text-center tabular-nums pt-1">
                  <div className="bg-[#080b16] p-2 rounded-xl border border-slate-800">
                    <div className="font-mono font-bold text-amber-300 text-base">
                      {schedule.countdown.days}
                    </div>
                    <div className="text-[10px] text-slate-400">Ngày</div>
                  </div>
                  <div className="bg-[#080b16] p-2 rounded-xl border border-slate-800">
                    <div className="font-mono font-bold text-amber-300 text-base">
                      {String(schedule.countdown.hours).padStart(2, '0')}
                    </div>
                    <div className="text-[10px] text-slate-400">Giờ</div>
                  </div>
                  <div className="bg-[#080b16] p-2 rounded-xl border border-slate-800">
                    <div className="font-mono font-bold text-amber-300 text-base">
                      {String(schedule.countdown.minutes).padStart(2, '0')}
                    </div>
                    <div className="text-[10px] text-slate-400">Phút</div>
                  </div>
                  <div className="bg-[#080b16] p-2 rounded-xl border border-amber-500/40">
                    <div className="font-mono font-bold text-amber-400 text-base">
                      {String(schedule.countdown.seconds).padStart(2, '0')}
                    </div>
                    <div className="text-[10px] text-amber-400">Giây</div>
                  </div>
                </div>
              )}

              <div className="pt-2.5 border-t border-white/10 space-y-1 text-xs">
                <div className="flex items-center gap-1.5 text-slate-200 font-mono tabular-nums">
                  <Calendar className="w-3.5 h-3.5 shrink-0 opacity-80" />
                  <span>{schedule.formattedRange}</span>
                </div>
                {schedule.timeRemainingText && (
                  <div className="font-mono tabular-nums font-bold">
                    {schedule.timeRemainingText}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Utility Menu */}
          <div className="bg-[#0c1020] border border-slate-800 rounded-2xl p-2 space-y-1">
            {onOpenUserGuide && (
              <button
                type="button"
                id="btn-dashboard-open-user-guide"
                onClick={onOpenUserGuide}
                className="w-full min-h-[42px] px-3 py-2 text-slate-200 hover:bg-slate-800/70 rounded-xl transition text-xs flex items-center justify-between cursor-pointer font-semibold"
              >
                <span className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Hướng dẫn sử dụng (B1–B7)</span>
                </span>
                <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
              </button>
            )}

            {onOpenGuide && (
              <button
                type="button"
                id="btn-dashboard-open-guide"
                onClick={onOpenGuide}
                className="w-full min-h-[42px] px-3 py-2 text-slate-200 hover:bg-slate-800/70 rounded-xl transition text-xs flex items-center justify-between cursor-pointer font-semibold"
              >
                <span className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Cẩm nang &amp; Cấu trúc kỳ thi</span>
                </span>
                <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
              </button>
            )}

            <div>
              <button
                type="button"
                id="btn-toggle-tips"
                onClick={() => setShowTips(!showTips)}
                className="w-full min-h-[42px] px-3 py-2 text-slate-200 hover:bg-slate-800/70 rounded-xl transition text-xs flex items-center justify-between cursor-pointer font-semibold"
              >
                <span className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Lưu ý &amp; Quy chế phòng thi</span>
                </span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    showTips ? 'rotate-180 text-blue-400' : 'text-slate-500'
                  }`}
                />
              </button>

              {showTips && (
                <div className="px-3 pb-2.5 text-xs text-slate-400 space-y-1.5 pt-1 animate-fadeIn">
                  {EXAM_TIPS.map((tip, index) => (
                    <div key={index} className="flex items-start gap-2 leading-relaxed">
                      <span className="text-blue-400 font-bold">•</span>
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              id="btn-logout"
              onClick={onLogout}
              className="w-full min-h-[42px] px-3 py-2 text-xs font-bold text-rose-400 hover:bg-rose-950/40 rounded-xl transition flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Đăng xuất tài khoản</span>
            </button>
          </div>
        </aside>

        {/* RIGHT STAGE */}
        <section className="lg:col-span-8 space-y-4">
          {/* Career Guidance Banner */}
          {hasHuongnghiep && (
            <div
              id="card-career-guidance"
              className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#161029] to-[#111226] border border-fuchsia-500/35 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-fuchsia-500/15 border border-fuchsia-500/35 flex items-center justify-center text-fuchsia-400 shrink-0">
                  <Compass className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-fuchsia-300 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Trắc nghiệm trực tiếp trên web</span>
                  </span>
                  <h3 className="font-bold text-white text-base leading-snug mt-0.5">
                    Định hướng nghề nghiệp RIASEC (18 câu)
                  </h3>
                  <p className="text-xs text-slate-300/90 mt-1 leading-relaxed">
                    Khám phá nhóm tính cách, ngành học đại học (Tuyển sinh 2027) và tổ hợp THPTQG nên tập trung.
                  </p>
                </div>
              </div>

              <button
                type="button"
                id="btn-open-career-modal"
                onClick={() => setShowCareerModal(true)}
                className="min-h-[42px] px-4 py-2 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-fuchsia-600/25 transition text-xs sm:text-[13px] flex items-center justify-center gap-2 shrink-0 whitespace-nowrap cursor-pointer"
              >
                <span>Làm bài test ngay</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>
            </div>
          )}

          {/* Exam Catalog */}
          {!showExams ? (
            <button
              type="button"
              id="btn-show-exam-selection"
              disabled={!isOpen}
              onClick={() => isOpen && setShowExams(true)}
              className={`w-full min-h-[50px] py-3 px-4 font-bold rounded-2xl transition text-sm flex items-center justify-center gap-2 ${
                isOpen
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/25 cursor-pointer'
                  : 'bg-[#0c1020] text-slate-500 border border-slate-800 cursor-not-allowed opacity-75'
              }`}
            >
              {isOpen ? (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Mở danh sách môn thi</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-slate-400" />
                  <span>
                    {schedule.status === 'UPCOMING'
                      ? 'Phòng thi chưa mở (Chưa đến giờ)'
                      : schedule.status === 'CLOSED'
                      ? 'Ca thi đã kết thúc'
                      : 'Chưa có lịch thi'}
                  </span>
                </>
              )}
            </button>
          ) : (
            <div
              id="exam-catalog"
              className="bg-[#0c1020] border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3.5">
                <div>
                  <h2 className="text-base font-bold text-white">
                    Danh sách Phòng thi của bạn
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Chọn phần thi tương ứng để xem quy chế và bắt đầu làm bài.
                  </p>
                </div>

                <button
                  type="button"
                  id="btn-toggle-exam-view"
                  onClick={() => setShowExams(false)}
                  className="self-start sm:self-auto text-xs text-slate-400 hover:text-slate-200 transition cursor-pointer"
                >
                  Thu gọn
                </button>
              </div>

              {/* Filter Tabs */}
              {enabledGroupCount > 1 && (
                <div className="flex items-center gap-1.5 p-1 bg-[#080b16] border border-slate-800 rounded-xl overflow-x-auto no-scrollbar">
                  <button
                    type="button"
                    onClick={() => setExamFilterTab('all')}
                    className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition cursor-pointer ${
                      examFilterTab === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Tất cả kỳ thi
                  </button>
                  {hasHsa && (
                    <button
                      type="button"
                      onClick={() => setExamFilterTab('hsa')}
                      className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition cursor-pointer ${
                        examFilterTab === 'hsa'
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      ĐGNL HSA
                    </button>
                  )}
                  {hasVact && (
                    <button
                      type="button"
                      onClick={() => setExamFilterTab('vact')}
                      className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition cursor-pointer ${
                        examFilterTab === 'vact'
                          ? 'bg-emerald-600 text-white'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      ĐGNL V-ACT
                    </button>
                  )}
                  {hasThptqg && (
                    <button
                      type="button"
                      onClick={() => setExamFilterTab('thptqg')}
                      className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition cursor-pointer ${
                        examFilterTab === 'thptqg'
                          ? 'bg-purple-600 text-white'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      THPT Quốc Gia
                    </button>
                  )}
                </div>
              )}

              {!hasAnyExam ? (
                <div className="p-6 bg-[#080b16] border border-slate-800 rounded-xl text-center space-y-2">
                  <p className="text-xs text-slate-400">
                    Tài khoản của bạn hiện chưa được ghi nhận đăng ký môn thi nào hoặc kỳ thi đang tạm đóng.
                  </p>
                  <button
                    type="button"
                    onClick={onLogout}
                    className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-bold cursor-pointer"
                  >
                    <span>Quay lại để đăng ký tài khoản mới</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* 1. HSA */}
                  {hasHsa && (examFilterTab === 'all' || examFilterTab === 'hsa') && (
                    <div id="exam-group-hsa" className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
                        <span className="font-bold text-blue-300 flex items-center gap-2 uppercase tracking-wider">
                          <GraduationCap className="w-4 h-4 text-blue-400 shrink-0" />
                          <span>Kỳ thi ĐGNL HSA (ĐHQGHN)</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-300 text-[11px] font-mono tabular-nums font-bold">
                          3 phần thi
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {EXAM_GROUPS.hsa.sections.map((section) => (
                          <button
                            key={section.id}
                            type="button"
                            id={`btn-open-${section.id}`}
                            onClick={() =>
                              setSelectedExamForModal({
                                section,
                                categoryName: 'Kỳ thi ĐGNL HSA',
                              })
                            }
                            className="group min-h-[60px] flex items-center justify-between px-3.5 py-3 bg-[#080b16] hover:bg-blue-950/30 border border-slate-800 hover:border-blue-500/50 rounded-xl text-left transition cursor-pointer"
                          >
                            <div className="min-w-0 space-y-0.5">
                              <div className="font-bold text-white text-xs sm:text-sm group-hover:text-blue-300 transition truncate">
                                {section.title}
                              </div>
                              <div className="text-[11px] text-slate-400 truncate">
                                {section.subtitle} ·{' '}
                                <span className="font-mono tabular-nums text-blue-400 font-bold">
                                  {section.durationMinutes} phút
                                </span>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition shrink-0 ml-2" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 2. VACT */}
                  {hasVact && (examFilterTab === 'all' || examFilterTab === 'vact') && (
                    <div id="exam-group-vact" className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
                        <span className="font-bold text-emerald-300 flex items-center gap-2 uppercase tracking-wider">
                          <Brain className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Kỳ thi ĐGNL V-ACT (ĐHQG-HCM)</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 text-[11px] font-mono tabular-nums font-bold">
                          3 phần thi
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {EXAM_GROUPS.vact.sections.map((section) => (
                          <button
                            key={section.id}
                            type="button"
                            id={`btn-open-${section.id}`}
                            onClick={() =>
                              setSelectedExamForModal({
                                section,
                                categoryName: 'Kỳ thi ĐGNL V-ACT',
                              })
                            }
                            className="group min-h-[60px] flex items-center justify-between px-3.5 py-3 bg-[#080b16] hover:bg-emerald-950/30 border border-slate-800 hover:border-emerald-500/50 rounded-xl text-left transition cursor-pointer"
                          >
                            <div className="min-w-0 space-y-0.5">
                              <div className="font-bold text-white text-xs sm:text-sm group-hover:text-emerald-300 transition truncate">
                                {section.title}
                              </div>
                              <div className="text-[11px] text-slate-400 truncate">
                                {section.subtitle} ·{' '}
                                <span className="font-mono tabular-nums text-emerald-400 font-bold">
                                  {section.durationMinutes} phút
                                </span>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition shrink-0 ml-2" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 3. THPTQG */}
                  {hasThptqg && (examFilterTab === 'all' || examFilterTab === 'thptqg') && (
                    <div id="exam-group-thptqg" className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
                        <span className="font-bold text-purple-300 flex items-center gap-2 uppercase tracking-wider">
                          <BookOpenCheck className="w-4 h-4 text-purple-400 shrink-0" />
                          <span>Kỳ thi THPT Quốc Gia</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-300 text-[11px] font-mono tabular-nums font-bold">
                          4 môn thi
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {EXAM_GROUPS.thptqg.sections.map((section) => (
                          <button
                            key={section.id}
                            type="button"
                            id={`btn-open-${section.id}`}
                            onClick={() =>
                              setSelectedExamForModal({
                                section,
                                categoryName: 'Kỳ thi THPTQG',
                              })
                            }
                            className="group min-h-[60px] flex items-center justify-between px-3.5 py-3 bg-[#080b16] hover:bg-purple-950/30 border border-slate-800 hover:border-purple-500/50 rounded-xl text-left transition cursor-pointer"
                          >
                            <div className="min-w-0 space-y-0.5">
                              <div className="font-bold text-white text-xs sm:text-sm group-hover:text-purple-300 transition truncate">
                                {section.title}
                              </div>
                              <div className="text-[11px] text-slate-400 truncate">
                                Trắc nghiệm ·{' '}
                                <span className="font-mono tabular-nums text-purple-400 font-bold">
                                  {section.durationMinutes} phút
                                </span>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition shrink-0 ml-2" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Admin Control Panel */}
      {isAdmin && adminPerms.cauhinh && (
        <div
          id="admin-google-sheet-panel"
          className="border border-indigo-500/35 rounded-2xl overflow-hidden bg-[#0c1020] p-4 sm:p-5 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 font-bold text-xs text-indigo-300">
              <Settings className="w-4 h-4 text-indigo-400" />
              <span>Quản trị: Đồng bộ Google Sheets</span>
            </span>
            <button
              type="button"
              id="btn-toggle-admin-panel"
              onClick={() => setShowAdminPanel(!showAdminPanel)}
              className="text-xs text-blue-400 hover:text-blue-300 transition font-semibold cursor-pointer"
            >
              {showAdminPanel ? 'Ẩn cài đặt' : 'Mở cài đặt'}
            </button>
          </div>

          {showAdminPanel && (
            <div className="space-y-3 pt-3 border-t border-slate-800 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  URL Google Apps Script Web App
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    id="input-admin-script-url"
                    value={adminScriptUrl}
                    onChange={(e) => setAdminScriptUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="flex-1 min-h-[42px] px-3 py-2 bg-[#080b16] border border-slate-700 rounded-xl text-slate-200 text-xs font-mono outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    id="btn-save-admin-script-url"
                    onClick={() => {
                      setScriptUrl(adminScriptUrl);
                      setUrlSavedNotice(true);
                      setTimeout(() => setUrlSavedNotice(false), 3000);
                    }}
                    className="min-h-[42px] px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition cursor-pointer"
                  >
                    Lưu URL
                  </button>
                </div>
                {urlSavedNotice && (
                  <span className="text-xs text-emerald-400 mt-1.5 block">
                    ✓ Đã lưu URL kết nối Google Apps Script thành công.
                  </span>
                )}
              </div>

              <div className="p-3.5 bg-[#080b16] border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>Mã Google Apps Script hoàn chỉnh</span>
                  </span>
                  <button
                    type="button"
                    id="btn-copy-apps-script-code"
                    onClick={() => {
                      navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
                      setCopiedScript(true);
                      setTimeout(() => setCopiedScript(false), 2500);
                    }}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs flex items-center gap-1 transition cursor-pointer shrink-0"
                  >
                    {copiedScript ? (
                      <Check className="w-3 h-3 text-emerald-300" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copiedScript ? 'Đã sao chép' : 'Sao chép mã'}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Dán mã này vào <strong>Tiện ích mở rộng → Apps Script</strong> trong Google Trang tính &quot;Admin web thi&quot;.
                  Sau đó bấm <strong>Triển khai → Quản lý bản triển khai → Chỉnh sửa → Phiên bản mới → Triển khai</strong>.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  id="btn-admin-test-sync"
                  disabled={isTestingSync}
                  onClick={async () => {
                    setIsTestingSync(true);
                    setTestSyncStatus(null);
                    try {
                      const data = await getStudentsData(true);
                      setTestSyncStatus(`Kết nối thành công! Đã tải ${data.length} thí sinh.`);
                    } catch (e) {
                      setTestSyncStatus(
                        `Lỗi: ${e instanceof Error ? e.message : 'Không kết nối được'}`
                      );
                    } finally {
                      setIsTestingSync(false);
                    }
                  }}
                  className="min-h-[40px] px-3.5 py-2 bg-[#141931] hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTestingSync ? 'animate-spin' : ''}`} />
                  <span>Kiểm tra kết nối</span>
                </button>
                {testSyncStatus && (
                  <span
                    className={`text-xs font-semibold ${
                      testSyncStatus.startsWith('Kết nối') ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {testSyncStatus}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Exam Launcher Modal */}
      {selectedExamForModal && (
        <ExamLauncherModal
          section={selectedExamForModal.section}
          categoryName={selectedExamForModal.categoryName}
          student={student}
          onClose={() => setSelectedExamForModal(null)}
        />
      )}

      {/* Career Guidance Modal */}
      {showCareerModal && (
        <CareerTestModal
          student={student}
          onClose={() => setShowCareerModal(false)}
        />
      )}
    </div>
  );
};
