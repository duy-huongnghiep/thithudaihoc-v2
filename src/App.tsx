/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Header } from './components/Header';
import { LoginForm } from './components/LoginForm';
import { RegisterSection } from './components/RegisterSection';
import { SearchSection } from './components/SearchSection';
import { StudentDashboard } from './components/StudentDashboard';
import { ExamGuideSection } from './components/ExamGuideSection';
import { UserGuideModal } from './components/UserGuideModal';
import { Footer } from './components/Footer';
import { ActiveTab, SheetGlobalConfig, StudentInfo } from './types';
import {
  getStudentsData,
  prefetchData,
  isStudentAdmin,
  getGlobalNotice,
  subscribeGlobalNotice,
  getGlobalSheetConfig,
  subscribeGlobalConfig,
  getExamSchedule,
} from './services/api';
import { recordLoginToSheet2 } from './services/loginLogger';
import { AdminSheet2View } from './components/AdminSheet2View';
import { SheetNoticeBanner } from './components/SheetNoticeBanner';
import { CareerTestModal } from './components/CareerTestModal';
import {
  CheckCircle2,
  AlertCircle,
  LogIn,
  UserPlus,
  Search,
  Compass,
  BookOpen,
  ChevronRight,
  Calendar,
  GraduationCap,
} from 'lucide-react';

const SESSION_STUDENT_KEY = 'td_mock_exam_current_student';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('login');
  const [previousTab, setPreviousTab] = useState<ActiveTab>('login');
  const [showUserGuideModal, setShowUserGuideModal] = useState(false);
  const [showGuestCareerModal, setShowGuestCareerModal] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<StudentInfo | null>(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_STUDENT_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return null;
  });

  const [prefillCredentials, setPrefillCredentials] = useState<{
    user: string;
    pass: string;
  }>({ user: '', pass: '' });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [globalNotice, setGlobalNotice] = useState<string>(() => getGlobalNotice());
  const [globalConfig, setGlobalConfig] = useState<SheetGlobalConfig>(() =>
    getGlobalSheetConfig()
  );
  const [, setScheduleTick] = useState(0);
  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  }, []);

  useEffect(() => {
    const unsubscribeNotice = subscribeGlobalNotice((notice) => {
      setGlobalNotice(notice);
    });
    const unsubscribeConfig = subscribeGlobalConfig((cfg) => {
      setGlobalConfig(cfg);
    });
    const timer = setInterval(() => setScheduleTick((t) => t + 1), 1000);
    prefetchData();
    if (currentStudent) {
      if (isStudentAdmin(currentStudent)) {
        setActiveTab('admin-logs');
        setPreviousTab('admin-logs');
      } else {
        setActiveTab('dashboard');
        setPreviousTab('dashboard');
      }
    }
    return () => {
      unsubscribeNotice();
      unsubscribeConfig();
      clearInterval(timer);
    };
  }, []);

  const handleOpenGuide = () => {
    setPreviousTab(
      activeTab === 'guide'
        ? currentStudent
          ? isStudentAdmin(currentStudent)
            ? 'admin-logs'
            : 'dashboard'
          : 'login'
        : activeTab
    );
    setActiveTab('guide');
  };

  const handleBackFromGuide = () => {
    if (previousTab === 'guide') {
      setActiveTab(
        currentStudent
          ? isStudentAdmin(currentStudent)
            ? 'admin-logs'
            : 'dashboard'
          : 'login'
      );
    } else {
      setActiveTab(previousTab);
    }
  };

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    try {
      await getStudentsData(true);
      showToast('Đã làm mới dữ liệu hệ thống thành công!', 'success');
    } catch {
      showToast('Không thể làm mới dữ liệu từ Google Sheets', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLoginSuccess = (student: StudentInfo) => {
    setCurrentStudent(student);
    try {
      sessionStorage.setItem(SESSION_STUDENT_KEY, JSON.stringify(student));
    } catch {
      // ignore
    }

    const admin = isStudentAdmin(student);
    if (admin) {
      setActiveTab('admin-logs');
      setPreviousTab('admin-logs');
      showToast(
        `Chào mừng Quản trị viên ${student.hoten || student.username}!`,
        'success'
      );
    } else {
      setActiveTab('dashboard');
      setPreviousTab('dashboard');
      showToast(`Xin chào thí sinh ${student.hoten || student.username}!`, 'success');
    }

    recordLoginToSheet2(student).catch(() => {});
  };

  const handleSelectStudentToLogin = (student: StudentInfo) => {
    setPrefillCredentials({
      user: student.username,
      pass: student.password,
    });
    handleLoginSuccess(student);
  };

  const handleLogout = () => {
    setCurrentStudent(null);
    try {
      sessionStorage.removeItem(SESSION_STUDENT_KEY);
    } catch {
      // ignore
    }
    setActiveTab('login');
    setPreviousTab('login');
    showToast('Đã đăng xuất tài khoản thành công', 'success');
  };

  const isAuthPortal =
    activeTab === 'login' || activeTab === 'register' || activeTab === 'search';

  const schedule = getExamSchedule();
  const isCareerEnabled =
    !globalConfig.loadedFromSheet4 || globalConfig.enableHuongnghiep;

  const containerMaxWidth =
    activeTab === 'admin-logs'
      ? 'max-w-7xl'
      : activeTab === 'guide'
      ? 'max-w-4xl'
      : 'max-w-5xl';

  return (
    <main className="min-h-screen flex flex-col justify-center py-4 px-3 sm:py-8 sm:px-6 bg-[#090c16] text-slate-200 selection:bg-blue-600 selection:text-white">
      {/* Floating notification toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.96 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold backdrop-blur-md border max-w-[92vw] ${
              toastMessage.type === 'success'
                ? 'bg-emerald-950/95 text-emerald-200 border-emerald-500/35'
                : 'bg-rose-950/95 text-rose-200 border-rose-500/35'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span className="truncate">{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Application Shell */}
      <div
        id="app-main-card"
        className={`w-full mx-auto transition-all duration-200 ${containerMaxWidth} bg-[#111526] border border-slate-800/90 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-7 shadow-xl shadow-black/40`}
      >
        <Header
          onRefreshData={handleRefreshData}
          onOpenUserGuide={() => setShowUserGuideModal(true)}
          isRefreshing={isRefreshing}
        />

        {(isAuthPortal || activeTab === 'dashboard') && (
          <SheetNoticeBanner notice={globalNotice} />
        )}

        {/* UNIFIED RESPONSIVE AUTH PORTAL (2-column on desktop, single-column form-first on mobile) */}
        {isAuthPortal && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
            {/* Right Stage on Desktop / First on Mobile: Segmented Mode Switcher + Active Form */}
            <section className="order-1 lg:order-2 lg:col-span-7 bg-[#0c1020] border border-slate-800/90 rounded-2xl p-4 sm:p-6 space-y-5">
              {/* 3-Mode Segmented Navigation */}
              <div
                role="tablist"
                aria-label="Chế độ cổng thí sinh"
                className="grid grid-cols-3 gap-1 p-1 bg-[#080b16] border border-slate-800 rounded-xl"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'login'}
                  id="tab-auth-login"
                  onClick={() => setActiveTab('login')}
                  className={`min-h-[42px] px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'login'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5 shrink-0" />
                  <span>Đăng nhập</span>
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'register'}
                  id="btn-switch-to-register"
                  onClick={() => {
                    setPreviousTab(activeTab);
                    setActiveTab('register');
                  }}
                  className={`min-h-[42px] px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'register'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5 shrink-0" />
                  <span>Đăng ký</span>
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'search'}
                  id="btn-switch-to-search"
                  onClick={() => {
                    setPreviousTab(activeTab);
                    setActiveTab('search');
                  }}
                  className={`min-h-[42px] px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'search'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Search className="w-3.5 h-3.5 shrink-0" />
                  <span>Tra cứu SBD</span>
                </button>
              </div>

              <AnimatePresence mode="wait">
                {activeTab === 'login' && (
                  <motion.div
                    key="login-tab"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.16 }}
                  >
                    <LoginForm
                      onLoginSuccess={handleLoginSuccess}
                      onSwitchToRegister={() => {
                        setPreviousTab('login');
                        setActiveTab('register');
                      }}
                      onSwitchToSearch={() => {
                        setPreviousTab('login');
                        setActiveTab('search');
                      }}
                      initialUsername={prefillCredentials.user}
                      initialPassword={prefillCredentials.pass}
                    />
                  </motion.div>
                )}

                {activeTab === 'register' && (
                  <motion.div
                    key="register-tab"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.16 }}
                  >
                    <RegisterSection
                      onBackToLogin={() => setActiveTab('login')}
                      onRegisterSuccessLogin={handleSelectStudentToLogin}
                    />
                  </motion.div>
                )}

                {activeTab === 'search' && (
                  <motion.div
                    key="search-tab"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.16 }}
                  >
                    <SearchSection
                      onBackToLogin={() => setActiveTab('login')}
                      onSelectStudentToLogin={handleSelectStudentToLogin}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* Left Rail on Desktop / Below Form on Mobile: Schedule + Career Test + Exam Resources */}
            <aside className="order-2 lg:order-1 lg:col-span-5 space-y-4">
              {/* Contest Schedule Card (Shown only when schedule is explicitly configured) */}
              {schedule.status !== 'NO_SCHEDULE' && schedule.status !== 'FREE_TESTING' && (
                <div className="p-4 rounded-2xl bg-[#0c1020] border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span>Lịch ca thi</span>
                    </span>
                    <span
                      className={`text-xs font-bold tabular-nums ${
                        schedule.status === 'OPEN'
                          ? 'text-emerald-400'
                          : schedule.status === 'UPCOMING'
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {schedule.status === 'OPEN'
                        ? 'Đang mở cửa'
                        : schedule.status === 'UPCOMING'
                        ? 'Sắp diễn ra'
                        : 'Đã kết thúc'}
                    </span>
                  </div>
                  <div className="text-xs font-mono tabular-nums text-slate-200">
                    {schedule.formattedRange}
                  </div>
                  {schedule.timeRemainingText && (
                    <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono tabular-nums">
                      <span className="text-amber-300 font-semibold">
                        {schedule.timeRemainingText}
                      </span>
                      {schedule.status === 'UPCOMING' && (
                        <span className="text-slate-500 font-sans">Tự mở khi đến giờ</span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Direct RIASEC Career Assessment Card (No login required) */}
              {isCareerEnabled && (
                <div className="p-4 sm:p-5 rounded-2xl bg-[#141129] border border-fuchsia-500/35 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-fuchsia-500/15 border border-fuchsia-500/30 flex items-center justify-center text-fuchsia-400 shrink-0">
                      <Compass className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-fuchsia-400 block">
                        Làm bài trực tiếp · Không cần tài khoản
                      </span>
                      <h2 className="text-sm sm:text-base font-bold text-white leading-snug mt-0.5">
                        Trắc nghiệm Hướng nghiệp RIASEC
                      </h2>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Hoàn thành 18 câu đánh giá sở thích nghề nghiệp để nhận gợi ý ngành học Đại học, trường phù hợp và tổ hợp xét tuyển THPTQG.
                  </p>
                  <button
                    type="button"
                    id="btn-login-career-test"
                    onClick={() => setShowGuestCareerModal(true)}
                    className="w-full min-h-[44px] px-4 py-2.5 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold rounded-xl transition text-xs sm:text-sm flex items-center justify-between cursor-pointer"
                  >
                    <span>Vào làm bài test Hướng nghiệp</span>
                    <ChevronRight className="w-4 h-4 shrink-0" />
                  </button>
                </div>
              )}

              {/* Portal Overview & Quick Guides */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#0c1020] border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                  <GraduationCap className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Kỳ thi hỗ trợ trực tuyến</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  HSA (ĐHQGHN) · V-ACT (ĐHQG-HCM) · Tốt nghiệp THPTQG (Toán, Lý, Hóa, Sinh). Đăng ký trực tiếp để nhận Số Báo Danh 5 số tự động.
                </p>

                <div className="pt-2 border-t border-slate-800/80 space-y-2">
                  <button
                    type="button"
                    id="btn-open-exam-guide"
                    onClick={handleOpenGuide}
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-[#090c16] hover:bg-slate-800/80 border border-slate-800 text-slate-200 hover:text-blue-300 transition text-xs font-semibold flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>Cấu trúc &amp; cẩm nang các kỳ thi</span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                  </button>

                  <button
                    type="button"
                    id="btn-open-user-guide"
                    onClick={() => setShowUserGuideModal(true)}
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-[#090c16] hover:bg-slate-800/80 border border-slate-800 text-slate-200 hover:text-emerald-300 transition text-xs font-semibold flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Hướng dẫn sử dụng (B1 – B7)</span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                  </button>
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* AUTHENTICATED / GUIDE VIEWS */}
        {!isAuthPortal && (
          <AnimatePresence mode="wait">
            {activeTab === 'admin-logs' && currentStudent && (
              <motion.div
                key="admin-logs-tab"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.16 }}
              >
                <AdminSheet2View
                  adminStudent={currentStudent}
                  onLogout={handleLogout}
                  onOpenCandidateView={() => setActiveTab('dashboard')}
                  onOpenGuide={handleOpenGuide}
                />
              </motion.div>
            )}

            {activeTab === 'dashboard' && currentStudent && (
              <motion.div
                key="dashboard-tab"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.16 }}
              >
                <StudentDashboard
                  student={currentStudent}
                  onLogout={handleLogout}
                  onOpenGuide={handleOpenGuide}
                  onOpenUserGuide={() => setShowUserGuideModal(true)}
                  onOpenAdminLogs={
                    isStudentAdmin(currentStudent)
                      ? () => setActiveTab('admin-logs')
                      : undefined
                  }
                />
              </motion.div>
            )}

            {activeTab === 'guide' && (
              <motion.div
                key="guide-tab"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.16 }}
              >
                <ExamGuideSection onBack={handleBackFromGuide} />
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* User Guide Interactive Modal */}
        {showUserGuideModal && (
          <UserGuideModal
            onClose={() => setShowUserGuideModal(false)}
            onGoToRegister={() => setActiveTab('register')}
            onGoToSearch={() => setActiveTab('search')}
            onGoToLogin={() => setActiveTab('login')}
          />
        )}

        {/* Guest Career Guidance Test Modal */}
        {showGuestCareerModal && (
          <CareerTestModal
            student={null}
            onClose={() => setShowGuestCareerModal(false)}
            onResultSaved={() => {
              showToast('Đã lưu thông tin & kết quả Hướng nghiệp của bạn!', 'success');
            }}
          />
        )}

        <Footer />
      </div>
    </main>
  );
}
