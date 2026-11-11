/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Header } from './components/Header';
import { LoginForm } from './components/LoginForm';
import { SearchSection } from './components/SearchSection';
import { StudentDashboard } from './components/StudentDashboard';
import { ExamGuideSection } from './components/ExamGuideSection';
import { UserGuideModal } from './components/UserGuideModal';
import { Footer } from './components/Footer';
import { ActiveTab, StudentInfo } from './types';
import { getStudentsData, prefetchData, isStudentAdmin } from './services/api';
import { recordLoginToSheet2 } from './services/loginLogger';
import { AdminSheet2View } from './components/AdminSheet2View';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const SESSION_STUDENT_KEY = 'td_mock_exam_current_student';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('login');
  const [previousTab, setPreviousTab] = useState<ActiveTab>('login');
  const [showUserGuideModal, setShowUserGuideModal] = useState(false);
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
  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Show Toast helper
  const showToast = useCallback((text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  }, []);

  // Prefetch student dataset on initial mount
  useEffect(() => {
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
  }, []);

  // Open Exam Guide
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

  // Back from Exam Guide
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

  // Handle Manual Data Refresh
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

  // Handle Login
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
        `Chào mừng Quản trị viên ${student.hoten || student.username} (Admin A2 - A6)!`,
        'success'
      );
    } else {
      setActiveTab('dashboard');
      setPreviousTab('dashboard');
      showToast(`Xin chào thí sinh ${student.hoten || student.username}!`, 'success');
    }

    // Automatically record student login into Trang tính 2 (Google Sheets)
    recordLoginToSheet2(student).catch(() => {});
  };

  // Handle Quick Login from Search
  const handleSelectStudentToLogin = (student: StudentInfo) => {
    setPrefillCredentials({
      user: student.username,
      pass: student.password,
    });
    handleLoginSuccess(student);
  };

  // Handle Logout
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

  return (
    <main className="min-h-screen flex items-center justify-center p-3 sm:p-6 bg-[#0b0d17] text-slate-200 relative selection:bg-blue-600 selection:text-white">
      {/* Background ambient glow effects */}
      <div className="fixed top-1/4 -left-32 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 -right-32 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Floating notification toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-semibold backdrop-blur-md border ${
              toastMessage.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/30'
                : 'bg-rose-950/90 text-rose-300 border-rose-500/30'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container Card */}
      <div
        id="app-main-card"
        className={`w-full transition-all duration-300 ${
          activeTab === 'admin-logs'
            ? 'max-w-6xl'
            : activeTab === 'guide'
            ? 'max-w-xl'
            : 'max-w-md'
        } bg-[#121629] border border-[#1e2540] rounded-3xl p-4 sm:p-7 shadow-2xl shadow-black/60 relative z-10`}
      >
        <Header
          onRefreshData={handleRefreshData}
          onOpenUserGuide={() => setShowUserGuideModal(true)}
          isRefreshing={isRefreshing}
        />

        <AnimatePresence mode="wait">
          {activeTab === 'login' && (
            <motion.div
              key="login-tab"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <LoginForm
                onLoginSuccess={handleLoginSuccess}
                onSwitchToSearch={() => {
                  setPreviousTab('login');
                  setActiveTab('search');
                }}
                onOpenGuide={handleOpenGuide}
                onOpenUserGuide={() => setShowUserGuideModal(true)}
                initialUsername={prefillCredentials.user}
                initialPassword={prefillCredentials.pass}
              />
            </motion.div>
          )}

          {activeTab === 'search' && (
            <motion.div
              key="search-tab"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <SearchSection
                onBackToLogin={() => setActiveTab('login')}
                onSelectStudentToLogin={handleSelectStudentToLogin}
                onOpenGuide={handleOpenGuide}
                onOpenUserGuide={() => setShowUserGuideModal(true)}
              />
            </motion.div>
          )}

          {activeTab === 'admin-logs' && currentStudent && (
            <motion.div
              key="admin-logs-tab"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
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
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
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
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <ExamGuideSection onBack={handleBackFromGuide} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* User Guide Interactive Modal (B1, B2, B3, B4, B5, B6, B7) */}
        {showUserGuideModal && (
          <UserGuideModal
            onClose={() => setShowUserGuideModal(false)}
            onGoToSearch={() => setActiveTab('search')}
            onGoToLogin={() => setActiveTab('login')}
          />
        )}

        <Footer />
      </div>
    </main>
  );
}

