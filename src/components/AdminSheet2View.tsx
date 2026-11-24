import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  Copy,
  Check,
  Download,
  RefreshCw,
  LogOut,
  Users,
  Clock,
  Calendar,
  Smartphone,
  Monitor,
  Mail,
  Phone,
  FileSpreadsheet,
  CheckCircle2,
  Trash2,
  BookOpen,
  Eye,
  ArrowUpDown,
  FileText,
  AlertCircle,
  ExternalLink,
  Compass,
  Megaphone,
  Lock,
} from 'lucide-react';
import { LoginLogRecord, StudentInfo, CareerResultRecord, SheetGlobalConfig } from '../types';
import {
  fetchSheet2Logs,
  fetchCareerResults,
  copyLogsTableAsTSV,
  copyCareerResultsAsTSV,
  copyPhoneListFromLogs,
  copyEmailListFromLogs,
  copySbdListFromLogs,
  exportLogsToCSV,
  exportCareerResultsToCSV,
  clearLoginLogs,
  GOOGLE_APPS_SCRIPT_CODE,
} from '../services/loginLogger';
import {
  getStudentsData,
  setScriptUrl,
  getScriptUrl,
  getGlobalNotice,
  subscribeGlobalNotice,
  getAdminPermissions,
  getGlobalSheetConfig,
  subscribeGlobalConfig,
  parseVietnamDateCutoff,
  parseVietnamTimestampMs,
  syncPendingRegistrations,
} from '../services/api';

interface AdminSheet2ViewProps {
  adminStudent: StudentInfo;
  onLogout: () => void;
  onOpenCandidateView?: () => void;
  onOpenGuide?: () => void;
}

export const AdminSheet2View: React.FC<AdminSheet2ViewProps> = ({
  adminStudent,
  onLogout,
  onOpenCandidateView,
  onOpenGuide,
}) => {
  const perms = getAdminPermissions(adminStudent);
  const isRestricted = perms.hanche;
  const cutoffDateStr = (perms.danhsachdkytk || '').trim();
  const cutoffMs = useMemo(() => parseVietnamDateCutoff(cutoffDateStr), [cutoffDateStr]);

  const getInitialTab = (): 'sheet2' | 'career' | 'sheet1' | 'script' | 'none' => {
    if (perms.lichsu) return 'sheet2';
    if (perms.ketquahuongnghiep) return 'career';
    if (perms.danhsachtaikhoan) return 'sheet1';
    if (perms.cauhinh) return 'script';
    return 'none';
  };

  const [logs, setLogs] = useState<LoginLogRecord[]>([]);
  const [careerResults, setCareerResults] = useState<CareerResultRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeAdminTab, setActiveAdminTab] = useState<'sheet2' | 'career' | 'sheet1' | 'script' | 'none'>(
    getInitialTab
  );

  // Sheet 1 candidates data & live global config/notice
  const [sheet1Students, setSheet1Students] = useState<StudentInfo[]>([]);
  const [globalNotice, setGlobalNotice] = useState<string>(() => getGlobalNotice());
  const [globalConfig, setGlobalConfig] = useState<SheetGlobalConfig>(() => getGlobalSheetConfig());

  // Masking helpers for restricted viewing mode ("hanche")
  const maskAccount = (val?: string | null): string => {
    const s = (val || '').trim();
    if (!s || s === '---') return '---';
    if (s.length >= 7) return `${s.slice(0, 3)}***${s.slice(-3)}`;
    if (s.length >= 3) return `${s.slice(0, 2)}***`;
    return '***';
  };

  const maskFullName = (val?: string | null): string => {
    const s = (val || '').trim();
    if (!s || s === 'Chưa cập nhật') return 'Chưa cập nhật';
    const parts = s.split(/\s+/);
    if (parts.length >= 3) return `${parts[0]} *** ${parts[parts.length - 1]}`;
    if (parts.length === 2) return `${parts[0]} ***`;
    return `${s.slice(0, 2)}***`;
  };

  const maskSbd = (val?: string | null): string => {
    const s = (val || '').trim();
    if (!s || s === '---') return '---';
    return s.length >= 3 ? `***${s.slice(-2)}` : '***';
  };

  const displayAccount = (val?: string | null) => (isRestricted ? maskAccount(val) : val || '---');
  const displayName = (val?: string | null) =>
    isRestricted ? maskFullName(val) : val || 'Chưa cập nhật';
  const displaySbd = (val?: string | null) => (isRestricted ? maskSbd(val) : val || '---');
  const displayEmail = (val?: string | null) =>
    isRestricted ? (val ? '••• (Hạn chế)' : '---') : val || '---';

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [careerSearchQuery, setCareerSearchQuery] = useState('');
  const [examFilter, setExamFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | '24h' | '7days'>('all');
  const [deviceFilter, setDeviceFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'nameAsc' | 'nameDesc' | 'sbdAsc'>('newest');

  // Copy feedback states
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedCellId, setCopiedCellId] = useState<string | null>(null);

  // Script URL config state
  const [scriptUrlInput, setScriptUrlInput] = useState(() => getScriptUrl());
  const [scriptUrlSaved, setScriptUrlSaved] = useState(false);
  const [isSyncingReg, setIsSyncingReg] = useState(false);
  const [confirmClearLogs, setConfirmClearLogs] = useState(false);

  const handleSyncPendingRegistrations = async () => {
    setIsSyncingReg(true);
    try {
      const res = await syncPendingRegistrations();
      if (res.needsGasUpdate) {
        triggerCopyFeedback(
          'Apps Script trên Google Sheet chưa được cập nhật phiên bản mới (thiếu Trang tính 3)!'
        );
      } else if (res.syncedCount > 0) {
        triggerCopyFeedback(
          `Đã đồng bộ ${res.syncedCount} tài khoản đăng ký Web sang Trang tính 3 (M–X)!`
        );
        await loadSheet1();
      } else {
        triggerCopyFeedback('Tất cả tài khoản đăng ký Web đã được đồng bộ với Trang tính 3.');
      }
    } finally {
      setIsSyncingReg(false);
    }
  };

  // Load initial logs from Trang tính 2 & Career Results
  const loadLogs = async (force = false) => {
    if (force) setIsRefreshing(true);
    try {
      const [data, careerData] = await Promise.all([
        fetchSheet2Logs(),
        fetchCareerResults(),
      ]);
      setLogs(data);
      setCareerResults(careerData);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Load sheet 1 student list for admin overview
  const loadSheet1 = async () => {
    try {
      const students = await getStudentsData(true);
      setSheet1Students(students);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadLogs();
    loadSheet1();
    const unsubNotice = subscribeGlobalNotice((notice) => setGlobalNotice(notice));
    const unsubCfg = subscribeGlobalConfig((cfg) => setGlobalConfig(cfg));
    return () => {
      unsubNotice();
      unsubCfg();
    };
  }, []);

  const cutoffLogs = useMemo(() => {
    if (cutoffMs === null) return logs;
    return logs.filter((log) => {
      const ts = parseVietnamTimestampMs(log.timestamp, log.isoDate);
      return ts !== null && ts >= cutoffMs;
    });
  }, [logs, cutoffMs]);

  const cutoffCareerResults = useMemo(() => {
    if (cutoffMs === null) return careerResults;
    return careerResults.filter((r) => {
      const ts = parseVietnamTimestampMs(r.timestamp, r.isoDate);
      return ts !== null && ts >= cutoffMs;
    });
  }, [careerResults, cutoffMs]);

  const visibleSheet1Students = useMemo(() => {
    if (cutoffMs === null) return sheet1Students;
    return sheet1Students.filter((st) => {
      const ts = parseVietnamTimestampMs(st.registeredAt);
      return ts !== null && ts >= cutoffMs;
    });
  }, [sheet1Students, cutoffMs]);

  const filteredCareerResults = useMemo(() => {
    const q = careerSearchQuery.trim().toLowerCase();
    if (!q) return cutoffCareerResults;
    return cutoffCareerResults.filter(
      (r) =>
        (r.hoten || '').toLowerCase().includes(q) ||
        (r.sbd || '').toLowerCase().includes(q) ||
        (r.username || '').toLowerCase().includes(q) ||
        (r.email || '').toLowerCase().includes(q) ||
        (r.namsinh || '').toLowerCase().includes(q) ||
        (r.riasecCode || '').toLowerCase().includes(q) ||
        (r.primaryTrait || '').toLowerCase().includes(q)
    );
  }, [cutoffCareerResults, careerSearchQuery]);

  const triggerCopyFeedback = (msg: string) => {
    setCopyFeedback(msg);
    setTimeout(() => setCopyFeedback(null), 2500);
  };

  const copyToClipboard = (text: string, label: string, cellId?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    if (cellId) {
      setCopiedCellId(cellId);
      setTimeout(() => setCopiedCellId(null), 2000);
    }
    triggerCopyFeedback(`Đã sao chép ${label}!`);
  };

  // Filter & Search Logic (respects danhsachdkytk cutoff)
  const filteredLogs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const now = Date.now();

    return cutoffLogs
      .filter((log) => {
        // Search term matching (Name, SBD, Username/Phone, Email)
        if (q) {
          const matchName = (log.hoten || '').toLowerCase().includes(q);
          const matchSbd = (log.sbd || '').toLowerCase().includes(q);
          const matchUser = (log.username || '').toLowerCase().includes(q);
          const matchEmail = (log.email || '').toLowerCase().includes(q);
          if (!matchName && !matchSbd && !matchUser && !matchEmail) {
            return false;
          }
        }

        // Exam filter
        if (examFilter !== 'all') {
          const m = (log.monthi || '').toLowerCase();
          if (examFilter === 'hsa' && !m.includes('hsa')) return false;
          if (examFilter === 'vact' && !m.includes('v-act') && !m.includes('vact')) return false;
          if (examFilter === 'thptqg' && !m.includes('thptqg') && !m.includes('thpt')) return false;
          if (examFilter === 'huongnghiep' && !m.includes('hướng nghiệp') && !m.includes('huong nghiep')) return false;
          if (examFilter === 'none' && m.trim() !== '' && !m.includes('chưa')) return false;
        }

        // Device filter
        if (deviceFilter !== 'all') {
          const d = (log.device || '').toLowerCase();
          if (deviceFilter === 'windows' && !d.includes('windows')) return false;
          if (deviceFilter === 'mac' && !d.includes('mac')) return false;
          if (deviceFilter === 'ios' && !d.includes('ios') && !d.includes('iphone') && !d.includes('ipad')) return false;
          if (deviceFilter === 'android' && !d.includes('android')) return false;
        }

        // Date range filter
        if (dateFilter !== 'all') {
          const logDate = log.isoDate ? new Date(log.isoDate).getTime() : 0;
          if (dateFilter === '24h' && logDate > 0) {
            if (now - logDate > 24 * 3600 * 1000) return false;
          } else if (dateFilter === '7days' && logDate > 0) {
            if (now - logDate > 7 * 24 * 3600 * 1000) return false;
          } else if (dateFilter === 'today') {
            const todayStr = new Date().toLocaleDateString('vi-VN');
            if (!log.timestamp?.includes(todayStr) && (!log.isoDate || new Date(log.isoDate).toDateString() !== new Date().toDateString())) {
              return false;
            }
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          const timeA = a.isoDate ? new Date(a.isoDate).getTime() : 0;
          const timeB = b.isoDate ? new Date(b.isoDate).getTime() : 0;
          return timeB - timeA;
        }
        if (sortBy === 'oldest') {
          const timeA = a.isoDate ? new Date(a.isoDate).getTime() : 0;
          const timeB = b.isoDate ? new Date(b.isoDate).getTime() : 0;
          return timeA - timeB;
        }
        if (sortBy === 'nameAsc') {
          return (a.hoten || '').localeCompare(b.hoten || '', 'vi');
        }
        if (sortBy === 'nameDesc') {
          return (b.hoten || '').localeCompare(a.hoten || '', 'vi');
        }
        if (sortBy === 'sbdAsc') {
          return (a.sbd || '').localeCompare(b.sbd || '', undefined, { numeric: true });
        }
        return 0;
      });
  }, [cutoffLogs, searchQuery, examFilter, dateFilter, deviceFilter, sortBy]);

  // Statistics (respects danhsachdkytk cutoff)
  const stats = useMemo(() => {
    const total = cutoffLogs.length;
    const uniqueUsers = new Set(cutoffLogs.map((l) => l.username || l.sbd).filter(Boolean)).size;
    const todayStr = new Date().toLocaleDateString('vi-VN');
    const todayCount = cutoffLogs.filter((l) => l.timestamp?.includes(todayStr)).length;
    const hsaCount = cutoffLogs.filter((l) => (l.monthi || '').toLowerCase().includes('hsa')).length;
    const vactCount = cutoffLogs.filter((l) => (l.monthi || '').toLowerCase().includes('v-act')).length;
    const huongnghiepCount = cutoffLogs.filter((l) => (l.monthi || '').toLowerCase().includes('hướng nghiệp')).length;

    return { total, uniqueUsers, todayCount, hsaCount, vactCount, huongnghiepCount };
  }, [cutoffLogs]);

  // Handle Bulk Copy Actions
  const handleCopyTable = () => {
    if (copyLogsTableAsTSV(filteredLogs)) {
      triggerCopyFeedback('Đã sao chép toàn bộ bảng (Dán Ctrl+V vào Excel/Sheets)!');
    }
  };

  const handleCopyPhones = () => {
    const res = copyPhoneListFromLogs(filteredLogs);
    if (res) {
      triggerCopyFeedback(`Đã sao chép danh sách ${res.split(', ').length} Số điện thoại!`);
    } else {
      triggerCopyFeedback('Không tìm thấy số điện thoại hợp lệ trong danh sách đã lọc');
    }
  };

  const handleCopyEmails = () => {
    const res = copyEmailListFromLogs(filteredLogs);
    if (res) {
      triggerCopyFeedback(`Đã sao chép danh sách ${res.split(', ').length} Email!`);
    } else {
      triggerCopyFeedback('Không tìm thấy email trong danh sách đã lọc');
    }
  };

  const handleCopySbds = () => {
    const res = copySbdListFromLogs(filteredLogs);
    if (res) {
      triggerCopyFeedback(`Đã sao chép danh sách ${res.split(', ').length} Số báo danh!`);
    } else {
      triggerCopyFeedback('Không tìm thấy SBD trong danh sách đã lọc');
    }
  };

  const handleExportCSV = () => {
    exportLogsToCSV(filteredLogs);
    triggerCopyFeedback('Đang tải file Excel/CSV về máy tính...');
  };

  const handleClearAllLogs = async () => {
    await clearLoginLogs();
    setLogs([]);
    setConfirmClearLogs(false);
    triggerCopyFeedback('Đã xóa toàn bộ lịch sử đăng nhập');
  };

  return (
    <div id="admin-sheet2-container" className="space-y-4 text-slate-200">
      {/* Toast Feedback Notification */}
      {copyFeedback && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-[#0e1226] border border-emerald-500/40 text-emerald-300 font-bold text-xs shadow-2xl flex items-center gap-2 backdrop-blur-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{copyFeedback}</span>
        </div>
      )}

      {/* Top Admin Header Bar */}
      <div className="bg-[#0c1020] border border-indigo-500/30 p-4 sm:p-5 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-indigo-500/15 border border-indigo-500/35 flex items-center justify-center text-indigo-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap text-[11px] font-bold">
              <span className="px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                Quản trị viên
              </span>
              {isRestricted && (
                <span className="px-2 py-0.5 rounded-lg bg-rose-500/15 text-rose-300 border border-rose-500/30 inline-flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>Chế độ hạn chế</span>
                </span>
              )}
              <span className="text-slate-400 font-normal">
                <strong className="text-white font-semibold">
                  {adminStudent.hoten || adminStudent.username}
                </strong>
                {adminStudent.rowNumber ? ` (A${adminStudent.rowNumber})` : ''}
                {cutoffMs !== null ? ` • Từ ${cutoffDateStr}` : ''}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-white mt-1 truncate">
              Quản trị hệ thống &amp; Dữ liệu thi
            </h2>
          </div>
        </div>

        {/* Action Header Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            id="btn-admin-refresh-sheet2"
            onClick={() => {
              loadLogs(true);
              loadSheet1();
            }}
            disabled={isRefreshing}
            className="px-3 py-2 bg-[#080b16] hover:bg-slate-800/80 border border-slate-700/80 text-slate-200 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            title="Tải lại dữ liệu mới nhất từ Google Sheets"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-400' : 'text-blue-400'}`} />
            <span>{isRefreshing ? 'Đang đồng bộ...' : 'Làm mới'}</span>
          </button>

          {!isRestricted && perms.lichsu && (
            <button
              type="button"
              id="btn-admin-export-csv"
              onClick={handleExportCSV}
              className="px-3 py-2 bg-[#080b16] hover:bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              title="Tải toàn bộ file Excel/CSV về máy tính"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Xuất CSV</span>
            </button>
          )}

          {onOpenCandidateView && (
            <button
              type="button"
              id="btn-admin-switch-candidate"
              onClick={onOpenCandidateView}
              className="px-3 py-2 bg-[#080b16] hover:bg-indigo-950/50 border border-indigo-500/35 text-indigo-300 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              title="Xem giao diện của thí sinh"
            >
              <Eye className="w-3.5 h-3.5 text-indigo-400" />
              <span>Giao diện thí sinh</span>
            </button>
          )}

          <button
            type="button"
            id="btn-admin-logout"
            onClick={onLogout}
            className="px-3 py-2 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/35 text-rose-300 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            title="Đăng xuất khỏi tài khoản admin"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Tabs (Pill buttons style) */}
      <div className="flex items-center gap-2 p-1.5 bg-[#0c1020] border border-slate-800 rounded-2xl overflow-x-auto no-scrollbar">
        {perms.lichsu && (
          <button
            type="button"
            onClick={() => setActiveAdminTab('sheet2')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
              activeAdminTab === 'sheet2'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" />
            <span>Lịch sử đăng nhập</span>
            <span className="font-mono tabular-nums text-[11px] px-1.5 py-0.5 rounded-md bg-black/25">
              {cutoffLogs.length}
            </span>
          </button>
        )}

        {perms.ketquahuongnghiep && (
          <button
            type="button"
            id="btn-tab-admin-career"
            onClick={() => {
              setActiveAdminTab('career');
              loadLogs(true);
            }}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
              activeAdminTab === 'career'
                ? 'bg-fuchsia-600 text-white shadow-md shadow-fuchsia-600/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Compass className="w-3.5 h-3.5 shrink-0" />
            <span>Kết quả hướng nghiệp</span>
            <span className="font-mono tabular-nums text-[11px] px-1.5 py-0.5 rounded-md bg-black/25">
              {cutoffCareerResults.length}
            </span>
          </button>
        )}

        {perms.danhsachtaikhoan && (
          <button
            type="button"
            onClick={() => {
              setActiveAdminTab('sheet1');
              loadSheet1();
            }}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
              activeAdminTab === 'sheet1'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-3.5 h-3.5 shrink-0" />
            <span>Danh sách tài khoản</span>
            <span className="font-mono tabular-nums text-[11px] px-1.5 py-0.5 rounded-md bg-black/25">
              {visibleSheet1Students.length}
            </span>
          </button>
        )}

        {perms.cauhinh && (
          <button
            type="button"
            onClick={() => setActiveAdminTab('script')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
              activeAdminTab === 'script'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span>Cấu hình Apps Script</span>
          </button>
        )}
      </div>

      {/* No Permissions Notice */}
      {activeAdminTab === 'none' && (
        <div className="p-8 bg-[#0c1020] border border-amber-500/30 rounded-2xl text-center space-y-2">
          <Lock className="w-7 h-7 mx-auto text-amber-400 opacity-85" />
          <h3 className="text-sm font-bold text-white">Chưa được cấp quyền xem dữ liệu</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Tài khoản quản trị viên này hiện chưa có mục nào được ghi <strong>&quot;có&quot;</strong> trên <strong>Trang tính 4</strong>. Vui lòng liên hệ Quản trị viên chính (<strong>A2</strong>) để cấp quyền.
          </p>
        </div>
      )}

      {/* TAB 1: Trang tính 2 - Lịch sử đăng nhập toàn thể */}
      {activeAdminTab === 'sheet2' && perms.lichsu && (
        <div className="space-y-4">
          {/* Quick Statistics KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-4 bg-[#0c1020] border border-slate-800 rounded-2xl">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Tổng lượt đăng nhập
              </span>
              <div className="text-2xl font-extrabold font-mono tabular-nums text-white mt-1.5">
                {stats.total}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Trang tính 2
              </span>
            </div>

            <div className="p-4 bg-[#0c1020] border border-slate-800 rounded-2xl">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Thí sinh duy nhất
              </span>
              <div className="text-2xl font-extrabold font-mono tabular-nums text-emerald-400 mt-1.5">
                {stats.uniqueUsers}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Người đã truy cập
              </span>
            </div>

            <div className="p-4 bg-[#0c1020] border border-slate-800 rounded-2xl">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Đăng nhập hôm nay
              </span>
              <div className="text-2xl font-extrabold font-mono tabular-nums text-amber-400 mt-1.5">
                {stats.todayCount}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Truy cập trong ngày
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                if (perms.ketquahuongnghiep) {
                  setActiveAdminTab('career');
                  loadLogs(true);
                }
              }}
              className={`p-4 bg-[#0c1020] border border-fuchsia-500/30 rounded-2xl text-left transition ${
                perms.ketquahuongnghiep
                  ? 'hover:border-fuchsia-400/60 hover:bg-fuchsia-950/20 cursor-pointer'
                  : 'opacity-70 cursor-default'
              }`}
              title={
                perms.ketquahuongnghiep
                  ? 'Bấm để xem toàn bộ kết quả trắc nghiệm hướng nghiệp RIASEC'
                  : 'Tài khoản chưa được cấp quyền xem tab Kết quả Hướng nghiệp'
              }
            >
              <span className="text-[11px] font-bold uppercase tracking-wider text-fuchsia-300 block">
                Bài test hướng nghiệp
              </span>
              <div className="text-2xl font-extrabold font-mono tabular-nums text-fuchsia-400 mt-1.5 flex items-baseline justify-between gap-2">
                <span>{perms.ketquahuongnghiep ? cutoffCareerResults.length : '—'}</span>
                {perms.ketquahuongnghiep && (
                  <span className="text-xs font-sans font-bold text-fuchsia-300">
                    Xem KQ →
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block font-mono tabular-nums">
                HSA: {stats.hsaCount} • HN: {stats.huongnghiepCount}
              </span>
            </button>
          </div>

          {/* Dedicated Quick Copy Action Bar (Hidden in restricted mode) */}
          {!isRestricted && (
          <div className="p-3.5 bg-[#0c1020] border border-slate-800 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Copy className="w-3.5 h-3.5 text-blue-400" />
                <span>Sao chép nhanh ({filteredLogs.length} bản ghi)</span>
              </span>
              <span className="text-[11px] text-slate-500">
                Dán trực tiếp vào Excel / Google Sheets
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                id="btn-copy-full-table"
                onClick={handleCopyTable}
                className="py-2 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
                title="Sao chép toàn bộ bảng dạng Excel/Sheets tab-delimited"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" />
                <span>Copy bảng (Excel)</span>
              </button>

              <button
                type="button"
                id="btn-copy-phones-list"
                onClick={handleCopyPhones}
                className="py-2 px-3 bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/35 text-emerald-300 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                title="Sao chép danh sách số điện thoại phân cách bởi dấu phẩy"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Copy DS SĐT</span>
              </button>

              <button
                type="button"
                id="btn-copy-emails-list"
                onClick={handleCopyEmails}
                className="py-2 px-3 bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/35 text-blue-300 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                title="Sao chép danh sách email gửi thông báo ca thi"
              >
                <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Copy DS Email</span>
              </button>

              <button
                type="button"
                id="btn-copy-sbds-list"
                onClick={handleCopySbds}
                className="py-2 px-3 bg-amber-600/15 hover:bg-amber-600/25 border border-amber-500/35 text-amber-300 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                title="Sao chép danh sách Số Báo Danh (SBD)"
              >
                <Users className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Copy DS SBD</span>
              </button>
            </div>
          </div>
          )}

          {/* Comprehensive Filter Bar */}
          <div className="p-3.5 bg-[#080b16] border border-slate-800 rounded-2xl space-y-3">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  id="input-filter-search-sheet2"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm theo Tên, SBD, SĐT/Tài khoản, Email..."
                  className="w-full min-h-[38px] pl-9 pr-8 py-1.5 bg-[#0c1020] border border-slate-800 rounded-xl text-sm sm:text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 transition"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs p-1 cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              {(searchQuery || examFilter !== 'all' || dateFilter !== 'all' || deviceFilter !== 'all' || sortBy !== 'newest') && (
                <button
                  type="button"
                  id="btn-reset-filters"
                  onClick={() => {
                    setSearchQuery('');
                    setExamFilter('all');
                    setDateFilter('all');
                    setDeviceFilter('all');
                    setSortBy('newest');
                  }}
                  className="min-h-[38px] px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold shrink-0 cursor-pointer transition"
                >
                  Đặt lại lọc
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 text-xs">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Môn thi đã đăng ký
                </label>
                <select
                  id="select-filter-exam"
                  value={examFilter}
                  onChange={(e) => setExamFilter(e.target.value)}
                  className="w-full min-h-[38px] px-2.5 py-1.5 bg-[#0c1020] border border-slate-800 rounded-xl text-sm sm:text-xs text-slate-200 outline-none focus:border-blue-500"
                >
                  <option value="all">Tất cả môn thi</option>
                  <option value="hsa">ĐGNL HSA (ĐHQGHN)</option>
                  <option value="vact">ĐGNL V-ACT (ĐHQG-HCM)</option>
                  <option value="thptqg">Kỳ thi THPTQG</option>
                  <option value="huongnghiep">Có mục Hướng nghiệp</option>
                  <option value="none">Chưa đăng ký môn</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Thời gian đăng nhập
                </label>
                <select
                  id="select-filter-date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value as any)}
                  className="w-full min-h-[38px] px-2.5 py-1.5 bg-[#0c1020] border border-slate-800 rounded-xl text-sm sm:text-xs text-slate-200 outline-none focus:border-blue-500"
                >
                  <option value="all">Tất cả thời gian</option>
                  <option value="today">Hôm nay</option>
                  <option value="24h">Trong 24 giờ qua</option>
                  <option value="7days">Trong 7 ngày qua</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Thiết bị truy cập
                </label>
                <select
                  id="select-filter-device"
                  value={deviceFilter}
                  onChange={(e) => setDeviceFilter(e.target.value)}
                  className="w-full min-h-[38px] px-2.5 py-1.5 bg-[#0c1020] border border-slate-800 rounded-xl text-sm sm:text-xs text-slate-200 outline-none focus:border-blue-500"
                >
                  <option value="all">Tất cả thiết bị</option>
                  <option value="windows">Windows</option>
                  <option value="mac">macOS / Apple Mac</option>
                  <option value="ios">iPhone / iPad (iOS)</option>
                  <option value="android">Android</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Sắp xếp hiển thị
                </label>
                <select
                  id="select-sort-by"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full min-h-[38px] px-2.5 py-1.5 bg-[#0c1020] border border-slate-800 rounded-xl text-sm sm:text-xs text-slate-200 outline-none focus:border-blue-500"
                >
                  <option value="newest">Mới nhất trước</option>
                  <option value="oldest">Cũ nhất trước</option>
                  <option value="nameAsc">Tên thí sinh (A - Z)</option>
                  <option value="nameDesc">Tên thí sinh (Z - A)</option>
                  <option value="sbdAsc">Số Báo Danh tăng dần</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table Result Header with Safe Inline Delete Confirmation */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 px-1">
            <span>
              Đang hiển thị: <strong className="text-white tabular-nums">{filteredLogs.length}</strong> /{' '}
              <span className="tabular-nums">{cutoffLogs.length}</span> bản ghi
              {isRestricted && (
                <span className="ml-2 text-rose-300">(Chế độ ẩn bớt thông tin cá nhân)</span>
              )}
            </span>
            {logs.length > 0 && !isRestricted && perms.cauhinh && (
              <div className="flex items-center gap-2">
                {confirmClearLogs ? (
                  <>
                    <button
                      type="button"
                      onClick={handleClearAllLogs}
                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[11px] font-bold transition cursor-pointer"
                    >
                      Xác nhận xóa tất cả
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmClearLogs(false)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-bold transition cursor-pointer"
                    >
                      Hủy
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmClearLogs(true)}
                    className="text-xs text-rose-400 hover:text-rose-300 font-semibold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa lịch sử</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* The Data Table ("có đầy đủ các nội dung của trang tính 2") */}
          <div className="border border-slate-800 rounded-2xl overflow-hidden bg-[#0a0d1c]">
            <div className="overflow-x-auto max-h-[580px] overflow-y-auto">
              <table id="table-sheet2-logs" className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#12162e] text-slate-300 font-bold text-[11px] uppercase tracking-wider sticky top-0 z-20 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-3 w-12 text-center">STT</th>
                    <th className="py-3 px-3 min-w-[140px]">Thời gian</th>
                    <th className="py-3 px-3 min-w-[150px]">Họ và tên</th>
                    <th className="py-3 px-3 min-w-[90px]">SBD</th>
                    <th className="py-3 px-3 min-w-[120px]">Tài khoản / SĐT</th>
                    <th className="py-3 px-3 min-w-[70px]">Năm sinh</th>
                    <th className="py-3 px-3 min-w-[180px]">Email</th>
                    <th className="py-3 px-3 min-w-[160px]">Môn thi đã đăng ký</th>
                    <th className="py-3 px-3 min-w-[130px]">Thiết bị</th>
                    <th className="py-3 px-3 min-w-[120px]">Trạng thái</th>
                    {!isRestricted && <th className="py-3 px-3 w-16 text-center">Copy</th>}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800/70">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-12 text-center text-slate-500">
                        <FileSpreadsheet className="w-7 h-7 mx-auto mb-2 opacity-40 text-blue-400" />
                        <p className="font-bold text-slate-400">Không tìm thấy bản ghi đăng nhập nào</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {searchQuery || examFilter !== 'all' || dateFilter !== 'all'
                            ? 'Thử điều chỉnh lại bộ lọc tìm kiếm'
                            : 'Khi có thí sinh đăng nhập, dữ liệu sẽ tự động xuất hiện tại đây.'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log, index) => {
                      const rowKey = `log_${log.id || index}`;
                      return (
                        <tr
                          key={rowKey}
                          className="hover:bg-slate-800/35 transition-colors group"
                        >
                          {/* STT */}
                          <td className="py-2.5 px-3 text-center text-slate-500 font-mono tabular-nums text-[11px]">
                            {index + 1}
                          </td>

                          {/* Thời gian */}
                          <td className="py-2.5 px-3 text-slate-300 font-mono text-[11px] whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3 h-3 text-blue-400/70 shrink-0" />
                              <span>{log.timestamp || '---'}</span>
                            </div>
                          </td>

                          {/* Họ và tên */}
                          <td className="py-2.5 px-3 font-semibold text-white">
                            <div className="flex items-center justify-between gap-1">
                              <span>{displayName(log.hoten)}</span>
                              {!isRestricted && (
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(log.hoten, 'Họ tên', `name_${index}`)}
                                  className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-blue-400 transition"
                                  title="Sao chép họ tên"
                                >
                                  {copiedCellId === `name_${index}` ? (
                                    <Check className="w-3 h-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              )}
                            </div>
                          </td>

                          {/* SBD */}
                          <td className="py-2.5 px-3 font-mono font-bold text-blue-400 whitespace-nowrap">
                            <div className="flex items-center justify-between gap-1">
                              <span>{displaySbd(log.sbd)}</span>
                              {!isRestricted && log.sbd && log.sbd !== '---' && (
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(log.sbd, 'SBD', `sbd_${index}`)}
                                  className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-blue-400 transition"
                                  title="Sao chép SBD"
                                >
                                  {copiedCellId === `sbd_${index}` ? (
                                    <Check className="w-3 h-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              )}
                            </div>
                          </td>

                          {/* Tài khoản / SĐT */}
                          <td className="py-2.5 px-3 font-mono text-slate-300 whitespace-nowrap">
                            <div className="flex items-center justify-between gap-1">
                              <span>{displayAccount(log.username)}</span>
                              {!isRestricted && log.username && (
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(log.username, 'Tài khoản/SĐT', `user_${index}`)}
                                  className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-blue-400 transition"
                                  title="Sao chép số điện thoại"
                                >
                                  {copiedCellId === `user_${index}` ? (
                                    <Check className="w-3 h-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              )}
                            </div>
                          </td>

                          {/* Năm sinh */}
                          <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">
                            {isRestricted ? '***' : log.namsinh || '---'}
                          </td>

                          {/* Email */}
                          <td className="py-2.5 px-3 text-slate-300 text-[11px]">
                            <div className="flex items-center justify-between gap-1">
                              <span className="truncate max-w-[170px]" title={isRestricted ? '' : log.email}>
                                {displayEmail(log.email)}
                              </span>
                              {!isRestricted && log.email && (
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(log.email || '', 'Email', `mail_${index}`)}
                                  className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-blue-400 transition shrink-0"
                                  title="Sao chép email"
                                >
                                  {copiedCellId === `mail_${index}` ? (
                                    <Check className="w-3 h-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              )}
                            </div>
                          </td>

                          {/* Môn thi đã đăng ký */}
                          <td className="py-2.5 px-3">
                            <div className="flex flex-wrap gap-1">
                              {(log.monthi || '').split(',').map((m, mIdx) => {
                                const clean = m.trim();
                                if (!clean) return null;
                                const isHsa = clean.toLowerCase().includes('hsa');
                                const isVact = clean.toLowerCase().includes('v-act');
                                const isThpt = clean.toLowerCase().includes('thpt');
                                const isHn = clean.toLowerCase().includes('hướng nghiệp') || clean.toLowerCase().includes('huong');

                                return (
                                  <span
                                    key={mIdx}
                                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                                      isHsa
                                        ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                                        : isVact
                                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                        : isThpt
                                        ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                                        : isHn
                                        ? 'bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/30'
                                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                                    }`}
                                  >
                                    {clean}
                                  </span>
                                );
                              })}
                            </div>
                          </td>

                          {/* Thiết bị */}
                          <td className="py-2.5 px-3 text-slate-400 text-[11px] whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              {log.device?.toLowerCase().includes('windows') || log.device?.toLowerCase().includes('mac') ? (
                                <Monitor className="w-3 h-3 text-indigo-400 shrink-0" />
                              ) : (
                                <Smartphone className="w-3 h-3 text-emerald-400 shrink-0" />
                              )}
                              <span className="truncate max-w-[120px]" title={log.device}>
                                {log.device || 'Khác'}
                              </span>
                            </div>
                          </td>

                          {/* Trạng thái */}
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-[11px] font-bold text-emerald-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                              <span>{log.status || 'Thành công'}</span>
                            </span>
                          </td>

                          {/* Action Copy Row */}
                          {!isRestricted && (
                            <td className="py-2.5 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => {
                                  const rowText = `${log.timestamp}\t${log.hoten}\t${log.sbd}\t${log.username}\t${log.namsinh}\t${log.email}\t${log.monthi}\t${log.device}\t${log.status}`;
                                  copyToClipboard(rowText, 'toàn bộ dòng', `row_${index}`);
                                }}
                                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-blue-400 transition cursor-pointer"
                                title="Sao chép toàn bộ hàng dữ liệu này"
                              >
                                {copiedCellId === `row_${index}` ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CAREER: Thông tin & Kết quả Hướng nghiệp (Trang tính 5) */}
      {activeAdminTab === 'career' && perms.ketquahuongnghiep && (
        <div className="space-y-4">
          <div className="p-4 bg-[#0e1224] border border-fuchsia-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <h3 className="font-bold text-fuchsia-300 text-sm flex items-center gap-2">
                <Compass className="w-4 h-4 text-fuchsia-400" />
                <span>Thông tin &amp; Kết quả hướng nghiệp RIASEC (Trang tính 5)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Thí sinh nhập thông tin &amp; làm bài trực tiếp ngoài trang chủ hoặc trong phòng thi — dữ liệu tự động lưu vào <strong>Trang tính 5</strong>.
              </p>
            </div>
            {!isRestricted && (
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    if (copyCareerResultsAsTSV(filteredCareerResults)) {
                      triggerCopyFeedback('Đã sao chép bảng kết quả hướng nghiệp (Dán Ctrl+V vào Google Sheet)!');
                    }
                  }}
                  className="px-3 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy bảng (Sheets/Excel)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    exportCareerResultsToCSV(filteredCareerResults);
                    triggerCopyFeedback('Đang tải file CSV kết quả hướng nghiệp...');
                  }}
                  className="px-3 py-2 bg-[#080b16] hover:bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Xuất CSV</span>
                </button>
              </div>
            )}
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={careerSearchQuery}
              onChange={(e) => setCareerSearchQuery(e.target.value)}
              placeholder="Tìm theo Tên thí sinh, SĐT, Email, Năm sinh, SBD, Mã RIASEC (VD: RIA)..."
              className="w-full min-h-[38px] pl-9 pr-3 py-1.5 bg-[#080b16] border border-slate-800 rounded-xl text-sm sm:text-xs text-white placeholder-slate-500 outline-none focus:border-fuchsia-500 transition"
            />
          </div>

          <div className="border border-slate-800 rounded-2xl overflow-hidden bg-[#0a0d1c]">
            <div className="overflow-x-auto max-h-[540px] overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#12162e] text-slate-300 font-bold text-[11px] uppercase tracking-wider sticky top-0 z-20 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-3 w-12 text-center">STT</th>
                    <th className="py-3 px-3 min-w-[140px]">Thời gian</th>
                    <th className="py-3 px-3 min-w-[150px]">Họ và tên</th>
                    <th className="py-3 px-3 min-w-[110px]">SĐT / Tài khoản</th>
                    <th className="py-3 px-3 min-w-[80px]">Năm sinh</th>
                    <th className="py-3 px-3 min-w-[160px]">Email</th>
                    <th className="py-3 px-3 min-w-[80px]">SBD</th>
                    <th className="py-3 px-3 min-w-[90px]">Mã RIASEC</th>
                    <th className="py-3 px-3 min-w-[160px]">Nhóm tính cách chính</th>
                    <th className="py-3 px-3 min-w-[180px]">Điểm chi tiết</th>
                    <th className="py-3 px-3 min-w-[220px]">Ngành học đề xuất</th>
                    <th className="py-3 px-3 min-w-[200px]">Khối thi tập trung</th>
                    <th className="py-3 px-3 min-w-[130px]">Thiết bị</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {filteredCareerResults.length === 0 ? (
                    <tr>
                      <td colSpan={13} className="py-12 text-center text-slate-500">
                        <Compass className="w-7 h-7 mx-auto mb-2 opacity-40 text-fuchsia-400" />
                        <p className="font-bold text-slate-400">Chưa có kết quả trắc nghiệm hướng nghiệp nào</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Khi thí sinh hoàn thành bài test trực tiếp trên web, thông tin và kết quả sẽ tự động hiển thị tại đây và lưu về Trang tính 5.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredCareerResults.map((res, idx) => (
                      <tr key={res.id || idx} className="hover:bg-slate-800/35 transition-colors">
                        <td className="py-2.5 px-3 text-center text-slate-500 font-mono tabular-nums text-[11px]">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3 text-slate-300 font-mono text-[11px] whitespace-nowrap">
                          {res.timestamp || '---'}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-white whitespace-nowrap">
                          {displayName(res.hoten)}
                        </td>
                        <td className="py-2.5 px-3 font-mono tabular-nums text-emerald-400 font-bold whitespace-nowrap">
                          {displayAccount(res.username)}
                        </td>
                        <td className="py-2.5 px-3 font-mono tabular-nums text-slate-300">
                          {res.namsinh || '---'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-300 text-[11px]">
                          {displayEmail(res.email)}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-blue-400 whitespace-nowrap">
                          {displaySbd(res.sbd)}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-lg text-[11px] font-mono font-extrabold bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/30">
                            {res.riasecCode || '---'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-200 font-medium">
                          {res.primaryTrait || '---'}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-300 whitespace-nowrap">
                          {res.scoresText || '---'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-300 text-[11px]">
                          {res.recommendedMajors || '---'}
                        </td>
                        <td className="py-2.5 px-3 text-purple-300 text-[11px]">
                          {res.examFocus || '---'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 text-[11px] whitespace-nowrap">
                          {res.device || '---'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Danh sách tài khoản (Trang tính 3 A-K & M-X + Trang tính 1) */}
      {activeAdminTab === 'sheet1' && perms.danhsachtaikhoan && (
        <div className="space-y-3.5">
          <div className="p-4 bg-[#0e1224] border border-blue-500/30 rounded-2xl flex items-center justify-between flex-wrap gap-3 text-xs">
            <div>
              <h3 className="font-bold text-blue-300 text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span>Danh sách tài khoản &amp; Đăng ký (Trang tính 3 &amp; 1)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Bao gồm tài khoản nhập tay (<strong>Trang tính 3: A–K</strong>), đăng ký trực tiếp trên Web (<strong>Trang tính 3: M–X</strong>) và Trang tính 1.
                {cutoffMs !== null && (
                  <span className="text-amber-300 font-semibold">
                    {' '}• Đang lọc từ {cutoffDateStr} trở về sau.
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {!isRestricted && (
                <button
                  type="button"
                  id="btn-sync-web-registrations"
                  onClick={handleSyncPendingRegistrations}
                  disabled={isSyncingReg}
                  className="px-3 py-2 bg-[#080b16] hover:bg-emerald-950/40 border border-emerald-500/35 text-emerald-300 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                  title="Đẩy các tài khoản đăng ký trên web chưa đồng bộ vào Trang tính 3 (M–X)"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncingReg ? 'animate-spin' : ''}`} />
                  <span>{isSyncingReg ? 'Đang đồng bộ...' : 'Đồng bộ Web → Trang tính 3'}</span>
                </button>
              )}
              <span className="px-2.5 py-1 rounded-xl bg-blue-500/15 border border-blue-500/30 text-xs text-blue-300 font-mono tabular-nums font-bold">
                {visibleSheet1Students.length} tài khoản
              </span>
            </div>
          </div>

          {!globalConfig.registrationConfig && (
            <div className="p-3.5 rounded-2xl bg-[#1a1412] border border-amber-500/40 text-amber-200 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold block text-amber-300">
                  Apps Script trên Google Sheet đang chạy phiên bản cũ (chưa hỗ trợ ghi Trang tính 3 M–X)
                </span>
                <p className="text-xs text-amber-100/85 leading-relaxed">
                  Vui lòng vào tab <strong>Cấu hình Apps Script</strong>, sao chép toàn bộ mã mới nhất dán vào Google Apps Script và chọn <strong>Triển khai → Quản lý các bản triển khai → Chỉnh sửa → Phiên bản mới → Triển khai</strong>. Sau đó bấm nút <strong>Đồng bộ Web → Trang tính 3</strong> ở trên để đẩy các tài khoản đã đăng ký sang cột M–X.
                </p>
              </div>
            </div>
          )}

          <div
            className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 ${
              globalNotice
                ? 'bg-[#1a1412] border-amber-500/40 text-amber-200'
                : 'bg-[#0c1020] border-slate-800 text-slate-400'
            }`}
          >
            <Megaphone className={`w-4 h-4 shrink-0 mt-0.5 ${globalNotice ? 'text-amber-400' : 'text-slate-500'}`} />
            <div className="min-w-0 flex-1">
              <span className="font-bold block text-xs text-slate-300 mb-0.5">
                Trạng thái mục &quot;Thongbao&quot; (QTV A2 trên Trang tính 4):
              </span>
              {globalNotice ? (
                <p className="text-amber-100 whitespace-pre-line leading-relaxed">{globalNotice}</p>
              ) : (
                <p className="text-slate-500 italic">
                  Hiện đang trống — trang web không hiển thị banner thông báo cho thí sinh.
                </p>
              )}
            </div>
          </div>

          <div className="border border-slate-800 rounded-2xl overflow-hidden bg-[#0a0d1c]">
            <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#12162e] text-slate-300 font-bold text-[11px] uppercase tracking-wider sticky top-0 z-20 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-3 min-w-[95px]">Nguồn / Dòng</th>
                    <th className="py-3 px-3 min-w-[140px]">Thời gian đăng ký</th>
                    <th className="py-3 px-3">Tài khoản</th>
                    <th className="py-3 px-3">Mật khẩu</th>
                    <th className="py-3 px-3">SBD</th>
                    <th className="py-3 px-3 min-w-[140px]">Họ và tên</th>
                    <th className="py-3 px-3">Email</th>
                    <th className="py-3 px-3">Năm sinh</th>
                    <th className="py-3 px-3">HSA</th>
                    <th className="py-3 px-3">V-ACT</th>
                    <th className="py-3 px-3">THPTQG</th>
                    <th className="py-3 px-3">Hướng nghiệp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {visibleSheet1Students.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="py-12 text-center text-slate-500">
                        <Users className="w-7 h-7 mx-auto mb-2 opacity-40 text-blue-400" />
                        <p className="font-bold text-slate-400">
                          {cutoffMs !== null
                            ? `Không có tài khoản đăng ký nào từ ${cutoffDateStr} trở về sau`
                            : 'Chưa có dữ liệu tài khoản nào'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    visibleSheet1Students.map((st, i) => {
                      const rowNum = st.rowNumber ?? i + 2;
                      const isAdmin = st.isAdmin || false;
                      const zoneLabel =
                        st.sourceZone === 'sheet3_web'
                          ? `Web M–X • ${rowNum}`
                          : st.sourceZone === 'sheet3_manual'
                          ? `Tay A–K • ${rowNum}`
                          : `Sheet 1 • ${rowNum}`;

                      return (
                        <tr
                          key={`${st.username}_${st.sbd}_${i}`}
                          className={`hover:bg-slate-800/35 transition-colors ${
                            isAdmin ? 'bg-indigo-500/[0.06]' : ''
                          }`}
                        >
                          <td className="py-2.5 px-3 font-mono tabular-nums text-[11px] whitespace-nowrap">
                            <span
                              className={
                                isAdmin
                                  ? 'text-amber-300 font-bold'
                                  : st.sourceZone === 'sheet3_web'
                                  ? 'text-emerald-400 font-semibold'
                                  : 'text-slate-400'
                              }
                            >
                              {zoneLabel}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono tabular-nums text-[11px] text-slate-300 whitespace-nowrap">
                            {st.registeredAt || '---'}
                          </td>
                          <td className="py-2.5 px-3 font-mono tabular-nums font-bold text-white">
                            {displayAccount(st.username)}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-500">
                            {st.hasPassword || st.password ? '••••••••' : '---'}
                          </td>
                          <td className="py-2.5 px-3 font-mono tabular-nums text-blue-400 font-bold">
                            {displaySbd(st.sbd)}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-200">
                            {displayName(st.hoten)}
                          </td>
                          <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                            {displayEmail(st.email)}
                          </td>
                          <td className="py-2.5 px-3 font-mono tabular-nums text-slate-300 text-[11px]">
                            {st.namsinh || '---'}
                          </td>
                          <td className="py-2.5 px-3 text-slate-300 text-[11px]">{st.hsa || '---'}</td>
                          <td className="py-2.5 px-3 text-slate-300 text-[11px]">{st.vact || '---'}</td>
                          <td className="py-2.5 px-3 text-slate-300 text-[11px]">{st.thptqg || '---'}</td>
                          <td className="py-2.5 px-3 text-slate-300 text-[11px]">{st.huongnghiep || '---'}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Cấu hình Apps Script & Trạng thái Trang tính 4 */}
      {activeAdminTab === 'script' && perms.cauhinh && (
        <div className="p-4 sm:p-5 bg-[#0c1024] border border-indigo-500/30 rounded-2xl space-y-5 text-xs">
          {/* Live Trang tính 4 (QTV A2) Status Overview */}
          <div className="p-4 bg-[#080b16] border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-bold text-white text-xs">
                Trạng thái cấu hình từ QTV A2 (Trang tính 4)
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold ${
                  globalConfig.loadedFromSheet4
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                }`}
              >
                {globalConfig.loadedFromSheet4
                  ? '✓ Đã kết nối Trang tính 4'
                  : 'Chưa kết nối Trang tính 4 — hãy cập nhật Apps Script bên dưới'}
              </span>
            </div>
            {globalConfig.loadedFromSheet4 && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1 text-xs">
                <div className="p-2.5 rounded-xl bg-[#0c1020] border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Mở kỳ thi (A2)</span>
                  <span className="font-mono font-bold text-white mt-0.5 block">
                    {[
                      globalConfig.enableHsa && 'HSA',
                      globalConfig.enableVact && 'VACT',
                      globalConfig.enableThptqg && 'THPTQG',
                      globalConfig.enableHuongnghiep && 'HN',
                    ]
                      .filter(Boolean)
                      .join(', ') || 'Tắt tất cả'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#0c1020] border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Mở Đăng ký Web</span>
                  <span className="font-mono font-bold text-amber-300 mt-0.5 block">
                    {[
                      globalConfig.registrationConfig?.enableHsa && 'HSA',
                      globalConfig.registrationConfig?.enableVact && 'VACT',
                      globalConfig.registrationConfig?.enableThptqg && 'THPTQG',
                      globalConfig.registrationConfig?.enableHuongnghiep && 'HN',
                    ]
                      .filter(Boolean)
                      .join(', ') || 'Đóng tất cả'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#0c1020] border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Bắt đầu / Kết thúc (A2)</span>
                  <span className="font-mono tabular-nums text-amber-300 mt-0.5 block">
                    {globalConfig.batdau || '0'} → {globalConfig.ketthuc || '0'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#0c1020] border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Thông báo (A2)</span>
                  <span className="text-slate-200 truncate block mt-0.5">
                    {globalConfig.thongbao ? 'Đang bật' : 'Trống'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#0c1020] border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Link bài thi (Sheet 4)</span>
                  <span className="font-mono tabular-nums font-bold text-emerald-400 mt-0.5 block">
                    {Object.keys(globalConfig.examLinks || {}).length} link tùy chỉnh
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-indigo-300 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Cấu hình Apps Script (Trang tính 1, 2, 3, 4 &amp; 5)</span>
            </h3>
            <p className="text-slate-400 leading-relaxed">
              Hệ thống đã tích hợp sẵn mã Google Apps Script hỗ trợ đọc phân quyền QTV, cấu hình A2 &amp; link bài thi từ <strong>Trang tính 4</strong>, danh sách &amp; đăng ký tài khoản trực tiếp vào <strong>Trang tính 3 (cột M–X)</strong>, danh sách từ <strong>Trang tính 1</strong>, ghi lịch sử đăng nhập vào <strong>Trang tính 2</strong> và lưu thông tin + kết quả hướng nghiệp RIASEC vào <strong>Trang tính 5</strong>.
            </p>
            <div className="p-3 rounded-xl bg-[#1a1412] border border-amber-500/35 text-amber-200 text-xs leading-relaxed">
              <strong>Lưu ý khi cập nhật mã:</strong> Sau khi dán mã mới vào trình chỉnh sửa Google Apps Script, hãy chọn <strong>Triển khai (Deploy) → Quản lý các bản triển khai (Manage deployments) → Biểu tượng chỉnh sửa (Edit) → Phiên bản: Phiên bản mới (New version) → Triển khai</strong> (giữ nguyên URL cũ để mọi thay đổi có hiệu lực ngay).
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              URL Web App của Google Apps Script
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                id="input-admin-script-url-setting"
                value={scriptUrlInput}
                onChange={(e) => setScriptUrlInput(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="flex-1 min-h-[38px] px-3 py-1.5 bg-[#080b16] border border-slate-800 rounded-xl text-slate-200 text-sm sm:text-xs font-mono outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                id="btn-save-script-url"
                onClick={() => {
                  setScriptUrl(scriptUrlInput);
                  setScriptUrlSaved(true);
                  setTimeout(() => setScriptUrlSaved(false), 3000);
                  triggerCopyFeedback('Đã cập nhật URL Google Apps Script!');
                }}
                className="min-h-[38px] px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs transition cursor-pointer shrink-0"
              >
                Lưu URL
              </button>
            </div>
            {scriptUrlSaved && (
              <span className="text-xs text-emerald-400 mt-1.5 block font-semibold">
                ✓ Đã lưu cấu hình URL Apps Script thành công!
              </span>
            )}
          </div>

          <div className="p-3.5 bg-[#080b16] border border-slate-800 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="font-bold text-slate-200 text-xs">
                Mã Google Apps Script đầy đủ (Trang tính 1–5)
              </span>
              <button
                type="button"
                id="btn-copy-gas-code"
                onClick={() => {
                  navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
                  setCopiedScript(true);
                  setTimeout(() => setCopiedScript(false), 2500);
                  triggerCopyFeedback('Đã sao chép toàn bộ mã Google Apps Script!');
                }}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedScript ? 'Đã sao chép!' : 'Sao chép mã'}</span>
              </button>
            </div>
            <pre className="p-3 bg-[#05070e] rounded-xl text-[11px] font-mono text-slate-300 max-h-56 overflow-y-auto border border-slate-800/80">
              {GOOGLE_APPS_SCRIPT_CODE}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
