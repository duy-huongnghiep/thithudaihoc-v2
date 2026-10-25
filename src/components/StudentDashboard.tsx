import React, { useState, useEffect } from 'react';
import {
  LogOut,
  ChevronRight,
  GraduationCap,
  Brain,
  BookOpenCheck,
  IdCard,
  ChevronDown,
  Info,
  ExternalLink,
  Copy,
  Check,
  Play,
  Clock,
  Lock,
  Sparkles,
  Compass,
  ArrowRight,
  Timer,
  AlertCircle,
  Calendar,
  Settings,
  Code2,
  RefreshCw,
} from 'lucide-react';
import { isYes, getExamSchedule, getScriptUrl, setScriptUrl, getStudentsData } from '../services/api';
import { GOOGLE_APPS_SCRIPT_CODE } from '../services/loginLogger';
import { EXAM_GROUPS, EXAM_TIPS } from '../data/examsData';
import { ExamSection, StudentInfo } from '../types';
import { ExamBadges } from './Badges';
import { ExamLauncherModal } from './ExamLauncherModal';
import { CareerTestModal } from './CareerTestModal';
import { BookOpen } from 'lucide-react';

interface StudentDashboardProps {
  student: StudentInfo;
  onLogout: () => void;
  onOpenGuide?: () => void;
  onOpenUserGuide?: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  student,
  onLogout,
  onOpenGuide,
  onOpenUserGuide,
}) => {
  const [showExams, setShowExams] = useState(true);
  const [showTips, setShowTips] = useState(false);
  const [showCareerModal, setShowCareerModal] = useState(false);
  const [selectedExamForModal, setSelectedExamForModal] = useState<{
    section: ExamSection;
    categoryName: string;
  } | null>(null);
  const [copiedSbd, setCopiedSbd] = useState(false);
  const [, setTick] = useState(0);

  // Admin panel states
  const isAdmin = student.username === 'admin' || student.sbd === '0003';
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminScriptUrl, setAdminScriptUrl] = useState(() => getScriptUrl());
  const [copiedScript, setCopiedScript] = useState(false);
  const [urlSavedNotice, setUrlSavedNotice] = useState(false);
  const [testSyncStatus, setTestSyncStatus] = useState<string | null>(null);
  const [isTestingSync, setIsTestingSync] = useState(false);

  // Live timer interval to update countdown smoothly every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const schedule = getExamSchedule(student);
  const isOpen = schedule.status === 'OPEN' || schedule.status === 'FREE_TESTING';

  const hasHsa = isYes(student.hsa);
  const hasVact = isYes(student.vact);
  const hasThptqg = isYes(student.thptqg);
  const hasHuongnghiep = isYes(student.huongnghiep);
  const hasAnyExam = hasHsa || hasVact || hasThptqg;

  const handleCopySbd = () => {
    if (!student.sbd) return;
    navigator.clipboard.writeText(student.sbd);
    setCopiedSbd(true);
    setTimeout(() => setCopiedSbd(false), 2000);
  };

  return (
    <div id="student-dashboard-section" className="space-y-4">
      {/* Student Profile Card */}
      <div className="bg-[#0b0e1a] border border-[#1f2747] p-4 rounded-2xl space-y-3 text-xs shadow-md">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs">
              <IdCard className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">
                Thí sinh
              </span>
              <span id="display-student-name" className="font-bold text-white text-sm">
                {student.hoten || 'Chưa cập nhật'}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">
              Số Báo Danh
            </span>
            <div className="flex items-center gap-1.5 justify-end">
              <span id="display-student-sbd" className="font-mono font-bold text-blue-400 text-sm">
                {student.sbd || '---'}
              </span>
              {student.sbd && (
                <button
                  type="button"
                  onClick={handleCopySbd}
                  className="text-slate-500 hover:text-blue-400 transition"
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

        {/* Details row */}
        <div className="space-y-2 pt-1">
          {student.email && (
            <div className="flex justify-between items-center text-slate-400 border-b border-slate-800/40 pb-1.5">
              <span>Email:</span>
              <span className="text-slate-300 font-medium">{student.email}</span>
            </div>
          )}

          {student.namsinh && (
            <div className="flex justify-between items-center text-slate-400 border-b border-slate-800/40 pb-1.5">
              <span>Năm sinh:</span>
              <span className="text-slate-300 font-medium">{student.namsinh}</span>
            </div>
          )}

          <div className="pt-0.5">
            <span className="text-slate-400 block mb-1.5 text-[11px] font-semibold">
              Kỳ thi đã đăng ký:
            </span>
            <ExamBadges student={student} size="sm" />
          </div>
        </div>
      </div>

      {/* Exam Schedule Time Status Card (ONLY SHOWN WHEN SCHEDULE IS CONFIGURED - HIDDEN ON FREE TESTING '0') */}
      {schedule.status !== 'FREE_TESTING' && schedule.status !== 'NO_SCHEDULE' && (
        <div
          id="exam-schedule-banner"
          className={`p-3.5 rounded-2xl border text-xs shadow-md transition-all ${
            schedule.status === 'OPEN'
              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
              : schedule.status === 'UPCOMING'
              ? 'bg-amber-950/35 border-amber-500/50 text-amber-300'
              : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                  schedule.status === 'OPEN'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : schedule.status === 'UPCOMING'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}
              >
                {schedule.status === 'OPEN' ? (
                  <Clock className="w-4 h-4" />
                ) : schedule.status === 'UPCOMING' ? (
                  <Timer className="w-4 h-4" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider block opacity-80">
                  Lịch mở thi thử (Áp dụng chung)
                </span>
                <span className="font-bold text-white text-xs sm:text-sm">
                  {schedule.status === 'OPEN' && 'Ca thi đang mở cửa'}
                  {schedule.status === 'UPCOMING' && 'Chưa đến thời gian mở ca thi'}
                  {schedule.status === 'CLOSED' && 'Đã hết hạn thi thử'}
                </span>
              </div>
            </div>

            {/* Time remaining pill */}
            {schedule.timeRemainingText && (
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold shrink-0 border ${
                  schedule.status === 'OPEN'
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : schedule.status === 'UPCOMING'
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                }`}
              >
                {schedule.timeRemainingText}
              </span>
            )}
          </div>

          {/* Dedicated Live Countdown Clock for Upcoming opening time */}
          {schedule.status === 'UPCOMING' && schedule.countdown && (
            <div className="my-2.5 p-2.5 bg-[#0b0e1a]/80 border border-amber-500/30 rounded-xl">
              <div className="text-[10px] uppercase font-bold tracking-wider text-amber-400 text-center mb-1.5 flex items-center justify-center gap-1.5">
                <Timer className="w-3.5 h-3.5 text-amber-400" />
                <span>Đang đếm ngược đến giờ mở đề thi:</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-[#121629] p-2 rounded-lg border border-slate-800">
                  <div className="font-mono font-black text-amber-300 text-base sm:text-lg">
                    {schedule.countdown.days}
                  </div>
                  <div className="text-[9px] uppercase font-semibold text-slate-400">Ngày</div>
                </div>
                <div className="bg-[#121629] p-2 rounded-lg border border-slate-800">
                  <div className="font-mono font-black text-amber-300 text-base sm:text-lg">
                    {String(schedule.countdown.hours).padStart(2, '0')}
                  </div>
                  <div className="text-[9px] uppercase font-semibold text-slate-400">Giờ</div>
                </div>
                <div className="bg-[#121629] p-2 rounded-lg border border-slate-800">
                  <div className="font-mono font-black text-amber-300 text-base sm:text-lg">
                    {String(schedule.countdown.minutes).padStart(2, '0')}
                  </div>
                  <div className="text-[9px] uppercase font-semibold text-slate-400">Phút</div>
                </div>
                <div className="bg-[#121629] p-2 rounded-lg border border-amber-500/40">
                  <div className="font-mono font-black text-amber-400 text-base sm:text-lg animate-pulse">
                    {String(schedule.countdown.seconds).padStart(2, '0')}
                  </div>
                  <div className="text-[9px] uppercase font-semibold text-amber-400">Giây</div>
                </div>
              </div>
            </div>
          )}

          {/* Schedule Range & Status note */}
          <div className="mt-2 pt-2 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] gap-1 opacity-90">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span>
                Thời gian: <strong>{schedule.formattedRange}</strong>
              </span>
            </div>
            <div>
              {schedule.status === 'OPEN' && (
                <span className="text-emerald-400 font-semibold">
                  ✓ Được phép vào làm bài thi
                </span>
              )}
              {schedule.status === 'UPCOMING' && (
                <span className="text-amber-400 font-semibold">
                  ⏳ Hệ thống sẽ tự mở khi hết đếm ngược
                </span>
              )}
              {schedule.status === 'CLOSED' && (
                <span className="text-rose-400 font-semibold">
                  ✕ Hệ thống đã khóa làm bài thi
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Career Guidance Module (Only shown if student registered for Huongnghiep) */}
      {hasHuongnghiep && (
        <div
          id="card-career-guidance"
          className="p-4 rounded-2xl bg-gradient-to-r from-fuchsia-950/40 via-purple-950/30 to-[#0e1224] border border-fuchsia-500/40 shadow-lg space-y-2.5 relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-fuchsia-500/20 border border-fuchsia-500/30 flex items-center justify-center text-fuchsia-400">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-fuchsia-400 block uppercase font-bold tracking-wider">
                  Mục hướng nghiệp
                </span>
                <h3 className="font-bold text-white text-xs sm:text-sm">
                  Trắc Nghiệm Định Hướng Nghề Nghiệp (RIASEC)
                </h3>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 font-mono">
              KHẢO SÁT
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Tài khoản của bạn đã được kích hoạt mục Hướng nghiệp! Thực hiện bài test hướng nghiệp trực tuyến để nhận kết quả phân tích thế mạnh và định hướng ngành học ĐH 2026.
          </p>

          <div className="space-y-2 pt-1">
            <a
              id="link-career-test-official"
              href="https://huongnghiep.daisugiaoduc.vn/?utm_source=13837"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-bold rounded-xl transition text-xs flex items-center justify-center gap-2 shadow-md shadow-fuchsia-600/25 cursor-pointer active:scale-[0.98]"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Làm Bài Test Hướng Nghiệp Ngay</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              type="button"
              id="btn-open-career-modal"
              onClick={() => setShowCareerModal(true)}
              className="w-full py-1.5 text-[11px] text-fuchsia-400 hover:text-fuchsia-300 transition text-center underline cursor-pointer"
            >
              Hoặc làm khảo sát nhanh 18 câu RIASEC trực tiếp trên web
            </button>
          </div>
        </div>
      )}

      {/* Main Exam Action Button */}
      {!showExams ? (
        <button
          type="button"
          id="btn-show-exam-selection"
          disabled={!isOpen}
          onClick={() => isOpen && setShowExams(true)}
          className={`w-full py-3.5 font-bold rounded-xl transition text-sm flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] ${
            isOpen
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/20 cursor-pointer'
              : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-75'
          }`}
        >
          {isOpen ? (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Bắt Đầu Làm Bài Thi</span>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 text-slate-400" />
              <span>
                {schedule.status === 'UPCOMING'
                  ? 'Phòng Thi Chưa Mở (Chưa Đến Giờ)'
                  : schedule.status === 'CLOSED'
                  ? 'Ca Thi Đã Kết Thúc (Hết Hạn)'
                  : 'Chưa Có Lịch Thi'}
              </span>
            </>
          )}
        </button>
      ) : (
        <div id="exam-catalog" className="space-y-4 pt-1">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>Danh sách môn thi của bạn</span>
            </h2>
            <button
              type="button"
              id="btn-toggle-exam-view"
              onClick={() => setShowExams(false)}
              className="text-xs text-slate-500 hover:text-slate-300 transition cursor-pointer"
            >
              Thu gọn
            </button>
          </div>

          {!hasAnyExam ? (
            <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl text-center space-y-2">
              <p className="text-xs text-slate-400">
                Tài khoản của bạn hiện chưa được ghi nhận đăng ký môn thi nào.
              </p>
              <a
                href="https://forms.gle/wMqrZrqWD4RL68Az8"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-amber-400 hover:underline font-semibold"
              >
                <span>Bấm vào đây để đăng ký kỳ thi</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ) : (
            <div className="space-y-3.5">
              {/* 1. HSA EXAM CATEGORY */}
              {hasHsa && (
                <div
                  id="exam-group-hsa"
                  className="space-y-2 p-3.5 bg-[#0e1224] rounded-2xl border border-blue-500/30 hover:border-blue-500/50 transition shadow-md"
                >
                  <div className="font-bold text-xs text-blue-400 uppercase tracking-wider flex items-center justify-between border-b border-blue-500/20 pb-2">
                    <span className="flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4" />
                      <span>Kỳ Thi ĐGNL HSA (ĐHQGHN)</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                      3 Phần thi
                    </span>
                  </div>

                  <div className="space-y-2 pt-1">
                    {EXAM_GROUPS.hsa.sections.map((section) => (
                      <div
                        key={section.id}
                        id={`btn-open-${section.id}`}
                        onClick={() =>
                          setSelectedExamForModal({
                            section,
                            categoryName: 'Kỳ thi ĐGNL HSA',
                          })
                        }
                        className="group flex items-center justify-between p-2.5 bg-[#0b0e1a] hover:bg-[#141a30] border border-slate-800 hover:border-blue-500/60 rounded-xl text-xs transition cursor-pointer"
                      >
                        <div className="space-y-0.5">
                          <div className="font-semibold text-white group-hover:text-blue-300 transition flex items-center gap-1.5">
                            <span>{section.title}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2">
                            <span>{section.subtitle}</span>
                            <span className="text-slate-600">•</span>
                            <span className="font-mono text-blue-400/90 font-medium">
                              {section.durationMinutes} phút
                            </span>
                          </div>
                        </div>
                        <div className="w-7 h-7 rounded-lg bg-slate-800/80 group-hover:bg-blue-600 text-slate-400 group-hover:text-white flex items-center justify-center transition shrink-0 ml-2">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. VACT EXAM CATEGORY */}
              {hasVact && (
                <div
                  id="exam-group-vact"
                  className="space-y-2 p-3.5 bg-[#0e1224] rounded-2xl border border-emerald-500/30 hover:border-emerald-500/50 transition shadow-md"
                >
                  <div className="font-bold text-xs text-emerald-400 uppercase tracking-wider flex items-center justify-between border-b border-emerald-500/20 pb-2">
                    <span className="flex items-center gap-1.5">
                      <Brain className="w-4 h-4" />
                      <span>Kỳ Thi ĐGNL VACT (ĐHQG-HCM)</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      3 Phần thi
                    </span>
                  </div>

                  <div className="space-y-2 pt-1">
                    {EXAM_GROUPS.vact.sections.map((section) => (
                      <div
                        key={section.id}
                        id={`btn-open-${section.id}`}
                        onClick={() =>
                          setSelectedExamForModal({
                            section,
                            categoryName: 'Kỳ thi ĐGNL VACT',
                          })
                        }
                        className="group flex items-center justify-between p-2.5 bg-[#0b0e1a] hover:bg-[#141a30] border border-slate-800 hover:border-emerald-500/60 rounded-xl text-xs transition cursor-pointer"
                      >
                        <div className="space-y-0.5">
                          <div className="font-semibold text-white group-hover:text-emerald-300 transition">
                            {section.title}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2">
                            <span>{section.subtitle}</span>
                            <span className="text-slate-600">•</span>
                            <span className="font-mono text-emerald-400/90 font-medium">
                              {section.durationMinutes} phút
                            </span>
                          </div>
                        </div>
                        <div className="w-7 h-7 rounded-lg bg-slate-800/80 group-hover:bg-emerald-600 text-slate-400 group-hover:text-white flex items-center justify-center transition shrink-0 ml-2">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. THPTQG EXAM CATEGORY */}
              {hasThptqg && (
                <div
                  id="exam-group-thptqg"
                  className="space-y-2 p-3.5 bg-[#0e1224] rounded-2xl border border-purple-500/30 hover:border-purple-500/50 transition shadow-md"
                >
                  <div className="font-bold text-xs text-purple-400 uppercase tracking-wider flex items-center justify-between border-b border-purple-500/20 pb-2">
                    <span className="flex items-center gap-1.5">
                      <BookOpenCheck className="w-4 h-4" />
                      <span>Kỳ Thi THPT Quốc Gia</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                      4 Môn thi
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {EXAM_GROUPS.thptqg.sections.map((section) => (
                      <div
                        key={section.id}
                        id={`btn-open-${section.id}`}
                        onClick={() =>
                          setSelectedExamForModal({
                            section,
                            categoryName: 'Kỳ thi THPTQG',
                          })
                        }
                        className="group p-2.5 bg-[#0b0e1a] hover:bg-[#141a30] border border-slate-800 hover:border-purple-500/60 rounded-xl text-xs transition cursor-pointer flex flex-col justify-between"
                      >
                        <div>
                          <div className="font-semibold text-white group-hover:text-purple-300 transition">
                            {section.title}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Thời gian: {section.durationMinutes} phút
                          </div>
                        </div>
                        <div className="mt-2 pt-1 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-purple-400 font-medium">
                          <span>Vào thi</span>
                          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Rules & Tips Accordion and Exam Guide */}
      <div className="space-y-2">
        {onOpenUserGuide && (
          <button
            type="button"
            id="btn-dashboard-open-user-guide"
            onClick={onOpenUserGuide}
            className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-[#0e1224] hover:from-emerald-900/40 hover:to-teal-900/40 text-emerald-300 border border-emerald-500/30 rounded-2xl transition text-xs flex items-center justify-between group cursor-pointer"
          >
            <span className="flex items-center gap-2 font-semibold">
              <BookOpen className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition" />
              <span>Hướng dẫn sử dụng</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-0.5 transition" />
          </button>
        )}

        {onOpenGuide && (
          <button
            type="button"
            id="btn-dashboard-open-guide"
            onClick={onOpenGuide}
            className="w-full py-2.5 px-3 bg-gradient-to-r from-blue-900/30 to-indigo-900/30 hover:from-blue-900/50 hover:to-indigo-900/50 text-blue-300 border border-blue-500/25 rounded-2xl transition text-xs flex items-center justify-between group cursor-pointer"
          >
            <span className="flex items-center gap-2 font-semibold">
              <BookOpen className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition" />
              <span>Tìm hiểu cấu trúc & cẩm nang các kỳ thi</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-blue-400 group-hover:translate-x-0.5 transition" />
          </button>
        )}

        <div className="border border-slate-800/80 rounded-2xl overflow-hidden bg-[#0b0e1a]/60">
          <button
            type="button"
            id="btn-toggle-tips"
            onClick={() => setShowTips(!showTips)}
            className="w-full p-3 flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            <span className="flex items-center gap-1.5 font-medium">
              <Info className="w-3.5 h-3.5 text-blue-400" />
              <span>Lưu ý & Quy chế phòng thi</span>
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                showTips ? 'rotate-180 text-blue-400' : ''
              }`}
            />
          </button>

          {showTips && (
            <div className="px-3.5 pb-3 text-[11px] text-slate-400 space-y-1.5 border-t border-slate-800/60 pt-2 animate-fadeIn">
              {EXAM_TIPS.map((tip, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">•</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Admin Control Panel for Google Sheets integration & Apps Script code */}
      {isAdmin && (
        <div id="admin-google-sheet-panel" className="border border-indigo-500/40 rounded-2xl overflow-hidden bg-[#0c1024] p-3.5 space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-bold text-xs text-indigo-300">
              <Settings className="w-4 h-4 text-indigo-400" />
              <span>Quản trị: Đồng bộ Google Sheets</span>
            </span>
            <button
              type="button"
              id="btn-toggle-admin-panel"
              onClick={() => setShowAdminPanel(!showAdminPanel)}
              className="text-xs text-indigo-400 hover:text-indigo-200 transition font-medium cursor-pointer"
            >
              {showAdminPanel ? 'Ẩn cài đặt' : 'Mở cài đặt'}
            </button>
          </div>

          {showAdminPanel && (
            <div className="space-y-3 pt-2 border-t border-slate-800 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  URL Google Apps Script Web App:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="input-admin-script-url"
                    value={adminScriptUrl}
                    onChange={(e) => setAdminScriptUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="flex-1 px-3 py-2 bg-[#080a14] border border-slate-700 rounded-xl text-slate-200 text-xs font-mono outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    id="btn-save-admin-script-url"
                    onClick={() => {
                      setScriptUrl(adminScriptUrl);
                      setUrlSavedNotice(true);
                      setTimeout(() => setUrlSavedNotice(false), 3000);
                    }}
                    className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition cursor-pointer"
                  >
                    Lưu URL
                  </button>
                </div>
                {urlSavedNotice && (
                  <span className="text-[10px] text-emerald-400 mt-1 block">
                    ✓ Đã lưu URL kết nối Google Apps Script thành công!
                  </span>
                )}
              </div>

              <div className="p-3 bg-[#080a14] border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>Mã Google Apps Script hoàn chỉnh:</span>
                  </span>
                  <button
                    type="button"
                    id="btn-copy-apps-script-code"
                    onClick={() => {
                      navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
                      setCopiedScript(true);
                      setTimeout(() => setCopiedScript(false), 2500);
                    }}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-[11px] flex items-center gap-1 transition cursor-pointer"
                  >
                    {copiedScript ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedScript ? 'Đã sao chép!' : 'Sao chép mã'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Dán mã này vào <strong>Tiện ích mở rộng → Apps Script</strong> trong Google Trang tính &quot;Admin web thi&quot;.
                  Sau đó bấm <strong>Triển khai → Quản lý bản triển khai → Chọn biểu tượng cây bút ✎ → Phiên bản: Phiên bản mới → Triển khai</strong>.
                </p>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  id="btn-admin-test-sync"
                  disabled={isTestingSync}
                  onClick={async () => {
                    setIsTestingSync(true);
                    setTestSyncStatus(null);
                    try {
                      const data = await getStudentsData(true);
                      setTestSyncStatus(`✓ Kết nối thành công! Đã tải ${data.length} thí sinh.`);
                    } catch (e) {
                      setTestSyncStatus(`✕ Lỗi: ${e instanceof Error ? e.message : 'Không kết nối được'}`);
                    } finally {
                      setIsTestingSync(false);
                    }
                  }}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTestingSync ? 'animate-spin' : ''}`} />
                  <span>Kiểm tra kết nối</span>
                </button>
                {testSyncStatus && (
                  <span className={`text-[11px] font-medium ${testSyncStatus.startsWith('✓') ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {testSyncStatus}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Logout Action */}
      <div className="pt-2">
        <button
          type="button"
          id="btn-logout"
          onClick={onLogout}
          className="w-full py-2.5 text-xs text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition text-center flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Đăng xuất tài khoản</span>
        </button>
      </div>

      {/* Exam Launcher Confirmation Modal */}
      {selectedExamForModal && (
        <ExamLauncherModal
          section={selectedExamForModal.section}
          categoryName={selectedExamForModal.categoryName}
          student={student}
          onClose={() => setSelectedExamForModal(null)}
        />
      )}

      {/* Career Guidance Assessment Test Modal */}
      {showCareerModal && (
        <CareerTestModal
          student={student}
          onClose={() => setShowCareerModal(false)}
        />
      )}
    </div>
  );
};
