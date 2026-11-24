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
  prefetchData,
  refreshSystemCache,
  isStudentAdmin,
  getGlobalNotice,
  subscribeGlobalNotice,
  getGlobalSheetConfig,
  subscribeGlobalConfig,
  getExamSchedule,
  clearAuthSession,
} from './services/api';
import { recordLoginToSheet2 } from './services/loginLogger';
import { AdminSheet2View } from './components/AdminSheet2View';
import { SheetNoticeBanner } from './components/SheetNoticeBanner';
import { CareerTestModal } from './components/CareerTestModal';
import {
  CheckCircle2,
  AlertCircle,
  Compass,
  BookOpen,
  ChevronRight,
  Calendar,
  LogIn,
  UserPlus,
  Search,
  GraduationCap,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('login');
  const [previousTab, setPreviousTab] = useState<ActiveTab>('login');
  const [showUserGuideModal, setShowUserGuideModal] = useState(false);
  const [showGuestCareerModal, setShowGuestCareerModal] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<StudentInfo | null>(null);

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

  const handleGoHome = () => {
    if (currentStudent) {
      setActiveTab(isStudentAdmin(currentStudent) ? 'admin-logs' : 'dashboard');
    } else {
      setActiveTab('login');
    }
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
      await refreshSystemCache();
      showToast('Đã đồng bộ dữ liệu hệ thống thành công!', 'success');
    } catch (err) {
      const msg =
        err instanceof Error && err.message
          ? err.message
          : 'Không thể làm mới dữ liệu từ Google Sheets';
      showToast(msg, 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLoginSuccess = (student: StudentInfo) => {
    setCurrentStudent(student);

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

  const handlePrefillUsernameForLogin = (student: StudentInfo) => {
    setPrefillCredentials({
      user: student.username || '',
      pass: '',
    });
    setActiveTab('login');
    showToast('Đã điền tài khoản. Vui lòng nhập mật khẩu để đăng nhập.', 'success');
  };

  const handleLogout = () => {
    clearAuthSession();
    setCurrentStudent(null);
    setPrefillCredentials({ user: '', pass: '' });
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
      : activeTab === 'dashboard' || activeTab === 'guide'
      ? 'max-w-5xl'
      : 'max-w-5xl';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#080a14] text-slate-200 p-3 sm:p-6 selection:bg-blue-600 selection:text-white">
      {/* Floating notification toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.16 }}
            className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-semibold backdrop-blur-md border max-w-[92vw] ${
              toastMessage.type === 'success'
                ? 'bg-emerald-950/95 text-emerald-200 border-emerald-500/40'
                : 'bg-rose-950/95 text-rose-200 border-rose-500/40'
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

      {/* Main Centered Application Card */}
      <main
        id="app-main-card"
        className={`w-full ${containerMaxWidth} bg-[#0e1120] border border-slate-800/90 rounded-3xl p-4 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.65)] transition-all duration-300`}
      >
        <Header
          onRefreshData={handleRefreshData}
          onOpenUserGuide={() => setShowUserGuideModal(true)}
          onOpenExamGuide={handleOpenGuide}
          onGoHome={handleGoHome}
          isRefreshing={isRefreshing}
          maxWidthClass={containerMaxWidth}
        />

        {(isAuthPortal || activeTab === 'dashboard') && (
          <SheetNoticeBanner notice={globalNotice} />
        )}

        {/* AUTH PORTAL (2-column desktop layout matching screenshot) */}
        {isAuthPortal && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* LEFT COLUMN: RIASEC Career Card + Supported Exams + Quick Guides */}
            <div className="lg:col-span-5 space-y-4">
              {/* Direct RIASEC Career Guidance Card outside login */}
              {isCareerEnabled && (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-[#170f2b] to-[#111224] border border-fuchsia-500/35 space-y-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-fuchsia-500/20 border border-fuchsia-500/30 flex items-center justify-center text-fuchsia-400 shrink-0">
                      <Compass className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-fuchsia-400">
                        LÀM BÀI TRỰC TIẾP · KHÔNG CẦN TÀI KHOẢN
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-white mt-0.5">
                        Trắc nghiệm Hướng nghiệp RIASEC
                      </h3>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300/90 leading-relaxed">
                    Hoàn thành 18 câu đánh giá sở thích nghề nghiệp để nhận gợi ý ngành học Đại học, trường phù hợp và tổ hợp xét tuyển THPTQG.
                  </p>
                  <button
                    type="button"
                    id="btn-login-career-test"
                    onClick={() => setShowGuestCareerModal(true)}
                    className="w-full min-h-[44px] px-4 py-2.5 bg-gradient-to-r from-purple-600 to-fuchsia-500 hover:from-purple-500 hover:to-fuchsia-400 text-white font-bold rounded-xl shadow-lg shadow-fuchsia-600/25 transition text-xs sm:text-sm flex items-center justify-between gap-2 cursor-pointer"
                  >
                    <span>Vào làm bài test Hướng nghiệp</span>
                    <ChevronRight className="w-4 h-4 shrink-0" />
                  </button>
                </div>
              )}

              {/* Supported Exams + Guides Card */}
              <div className="p-5 rounded-2xl bg-[#0c1020] border border-slate-800 space-y-3.5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                  <GraduationCap className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>KỲ THI HỖ TRỢ TRỰC TUYẾN</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  HSA (ĐHQGHN) · V-ACT (ĐHQG-HCM) · Tốt nghiệp THPTQG (Toán, Lý, Hóa, Sinh). Đăng ký trực tiếp để nhận Số Báo Danh 5 số tự động.
                </p>

                <div className="space-y-2">
                  <button
                    type="button"
                    id="btn-open-exam-guide"
                    onClick={handleOpenGuide}
                    className="w-full min-h-[42px] px-3.5 py-2.5 bg-[#080b16] hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500/35 rounded-xl text-left text-xs font-semibold text-slate-200 flex items-center justify-between gap-2 transition cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5 min-w-0">
                      <BookOpen className="w-4 h-4 text-blue-400 shrink-0" />
                      <span className="truncate">Cấu trúc &amp; cẩm nang các kỳ thi</span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                  </button>

                  <button
                    type="button"
                    id="btn-open-user-guide"
                    onClick={() => setShowUserGuideModal(true)}
                    className="w-full min-h-[42px] px-3.5 py-2.5 bg-[#080b16] hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/35 rounded-xl text-left text-xs font-semibold text-slate-200 flex items-center justify-between gap-2 transition cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5 min-w-0">
                      <BookOpen className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="truncate">Hướng dẫn sử dụng (B1 – B7)</span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                  </button>
                </div>
              </div>

              {/* Schedule Alert on Auth Portal if active */}
              {schedule.status !== 'NO_SCHEDULE' && schedule.status !== 'FREE_TESTING' && (
                <div className="p-4 rounded-2xl bg-[#0c1020] border border-slate-800 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-300 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span>Lịch mở ca thi hệ thống</span>
                    </span>
                    <span
                      className={`font-bold tabular-nums ${
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
                  <div className="font-mono tabular-nums text-slate-200 text-xs">
                    {schedule.formattedRange}
                  </div>
                  {schedule.timeRemainingText && (
                    <div className="text-[11px] font-mono tabular-nums text-amber-300 font-semibold">
                      {schedule.timeRemainingText}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: 3-Tab Auth Switcher + Form */}
            <div className="lg:col-span-7 bg-[#0c1020] border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5">
              <div
                role="tablist"
                aria-label="Chế độ cổng thí sinh"
                className="grid grid-cols-3 gap-1.5 p-1 bg-[#080b16] border border-slate-800/80 rounded-xl"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'login'}
                  id="tab-auth-login"
                  onClick={() => setActiveTab('login')}
                  className={`min-h-[40px] px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    activeTab === 'login'
                      ? 'bg-[#3b6ff5] text-white shadow-md shadow-blue-600/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
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
                  className={`min-h-[40px] px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    activeTab === 'register'
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
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
                  className={`min-h-[40px] px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    activeTab === 'search'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
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
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.14 }}
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
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.14 }}
                  >
                    <RegisterSection
                      onBackToLogin={() => setActiveTab('login')}
                      onRegisterSuccessLogin={handleLoginSuccess}
                    />
                  </motion.div>
                )}

                {activeTab === 'search' && (
                  <motion.div
                    key="search-tab"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.14 }}
                  >
                    <SearchSection
                      onBackToLogin={() => setActiveTab('login')}
                      onSelectStudentToLogin={handlePrefillUsernameForLogin}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* AUTHENTICATED / GUIDE VIEWS */}
        {!isAuthPortal && (
          <AnimatePresence mode="wait">
            {activeTab === 'admin-logs' && currentStudent && (
              <motion.div
                key="admin-logs-tab"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.14 }}
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
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.14 }}
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
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.14 }}
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

        <Footer maxWidthClass={containerMaxWidth} />
      </main>
    </div>
  );
}
