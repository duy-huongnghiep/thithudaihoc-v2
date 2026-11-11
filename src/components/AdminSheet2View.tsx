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
  Sparkles,
  BookOpen,
  Eye,
  ArrowUpDown,
  FileText,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { LoginLogRecord, StudentInfo } from '../types';
import {
  fetchSheet2Logs,
  copyLogsTableAsTSV,
  copyPhoneListFromLogs,
  copyEmailListFromLogs,
  copySbdListFromLogs,
  exportLogsToCSV,
  clearLoginLogs,
  GOOGLE_APPS_SCRIPT_CODE,
} from '../services/loginLogger';
import { getStudentsData, setScriptUrl, getScriptUrl } from '../services/api';

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
  const [logs, setLogs] = useState<LoginLogRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeAdminTab, setActiveAdminTab] = useState<'sheet2' | 'sheet1' | 'script'>('sheet2');

  // Sheet 1 candidates data
  const [sheet1Students, setSheet1Students] = useState<StudentInfo[]>([]);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
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

  // Load initial logs from Trang tính 2
  const loadLogs = async (force = false) => {
    if (force) setIsRefreshing(true);
    try {
      const data = await fetchSheet2Logs();
      setLogs(data);
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
      const students = await getStudentsData();
      setSheet1Students(students);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadLogs();
    loadSheet1();
  }, []);

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

  // Filter & Search Logic
  const filteredLogs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const now = Date.now();

    return logs
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
  }, [logs, searchQuery, examFilter, dateFilter, deviceFilter, sortBy]);

  // Statistics
  const stats = useMemo(() => {
    const total = logs.length;
    const uniqueUsers = new Set(logs.map((l) => l.username || l.sbd).filter(Boolean)).size;
    const todayStr = new Date().toLocaleDateString('vi-VN');
    const todayCount = logs.filter((l) => l.timestamp?.includes(todayStr)).length;
    const hsaCount = logs.filter((l) => (l.monthi || '').toLowerCase().includes('hsa')).length;
    const vactCount = logs.filter((l) => (l.monthi || '').toLowerCase().includes('v-act')).length;
    const huongnghiepCount = logs.filter((l) => (l.monthi || '').toLowerCase().includes('hướng nghiệp')).length;

    return { total, uniqueUsers, todayCount, hsaCount, vactCount, huongnghiepCount };
  }, [logs]);

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
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử đăng nhập đã lưu trên hệ thống?')) {
      await clearLoginLogs();
      setLogs([]);
      triggerCopyFeedback('Đã xóa toàn bộ lịch sử đăng nhập');
    }
  };

  return (
    <div id="admin-sheet2-container" className="space-y-4 text-slate-200">
      {/* Toast Feedback Notification */}
      {copyFeedback && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-emerald-950/95 border border-emerald-500/40 text-emerald-300 font-semibold text-xs shadow-2xl flex items-center gap-2 backdrop-blur-md animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{copyFeedback}</span>
        </div>
      )}

      {/* Top Admin Header Bar */}
      <div className="bg-gradient-to-r from-[#11162d] via-[#161c38] to-[#12162b] border border-indigo-500/30 p-4 sm:p-5 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-inner">
            <ShieldCheck className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                Admin A2 - A6
              </span>
              <span className="text-[11px] text-slate-400">
                (Tài khoản: <strong className="text-white">{adminStudent.username}</strong>
                {adminStudent.rowNumber ? ` • Ô Sheet: A${adminStudent.rowNumber}` : ''})
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 mt-0.5">
              <span>Trang Tính 2: Lịch Sử Đăng Nhập Toàn Thể</span>
            </h1>
          </div>
        </div>

        {/* Action Header Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            id="btn-admin-refresh-sheet2"
            onClick={() => loadLogs(true)}
            disabled={isRefreshing}
            className="px-3 py-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            title="Tải lại dữ liệu mới nhất từ Google Sheets"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
            <span>{isRefreshing ? 'Đang đồng bộ...' : 'Làm mới'}</span>
          </button>

          <button
            type="button"
            id="btn-admin-export-csv"
            onClick={handleExportCSV}
            className="px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
            title="Tải toàn bộ file Excel/CSV về máy tính"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Xuất Excel/CSV</span>
          </button>

          {onOpenCandidateView && (
            <button
              type="button"
              id="btn-admin-switch-candidate"
              onClick={onOpenCandidateView}
              className="px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
              title="Xem giao diện của thí sinh"
            >
              <Eye className="w-3.5 h-3.5 text-blue-400" />
              <span>Giao diện thí sinh</span>
            </button>
          )}

          <button
            type="button"
            id="btn-admin-logout"
            onClick={onLogout}
            className="px-3 py-2 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 text-rose-300 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
            title="Đăng xuất khỏi tài khoản admin"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveAdminTab('sheet2')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeAdminTab === 'sheet2'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'bg-[#0f1325] text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Lịch sử đăng nhập (Trang tính 2)</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/30 font-mono">
            {logs.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminTab('sheet1')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeAdminTab === 'sheet1'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'bg-[#0f1325] text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Danh sách tài khoản (Trang tính 1)</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/30 font-mono">
            {sheet1Students.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminTab('script')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeAdminTab === 'script'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'bg-[#0f1325] text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Cấu hình Apps Script</span>
        </button>
      </div>

      {/* TAB 1: Trang tính 2 - Lịch sử đăng nhập toàn thể */}
      {activeAdminTab === 'sheet2' && (
        <div className="space-y-4">
          {/* Quick Statistics KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 bg-[#0c1022] border border-slate-800 rounded-2xl">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                Tổng lượt đăng nhập
              </span>
              <div className="text-xl font-bold font-mono text-white mt-0.5">
                {stats.total}
              </div>
              <span className="text-[10px] text-blue-400 mt-0.5 block">
                Ghi nhận vào Trang tính 2
              </span>
            </div>

            <div className="p-3 bg-[#0c1022] border border-slate-800 rounded-2xl">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                Thí sinh duy nhất
              </span>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
                {stats.uniqueUsers}
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Số người đã vào hệ thống
              </span>
            </div>

            <div className="p-3 bg-[#0c1022] border border-slate-800 rounded-2xl">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                Đăng nhập hôm nay
              </span>
              <div className="text-xl font-bold font-mono text-amber-400 mt-0.5">
                {stats.todayCount}
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Lượt truy cập ngày hôm nay
              </span>
            </div>

            <div className="p-3 bg-[#0c1022] border border-slate-800 rounded-2xl">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                Môn thi quan tâm
              </span>
              <div className="text-xs font-semibold text-fuchsia-300 mt-1 flex items-center gap-1.5 flex-wrap">
                <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[10px]">
                  HSA: {stats.hsaCount}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-fuchsia-500/20 text-fuchsia-300 font-mono text-[10px]">
                  HN: {stats.huongnghiepCount}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Số thí sinh đăng ký môn
              </span>
            </div>
          </div>

          {/* Dedicated Quick Copy Action Bar ("copy các thông tin cần thiết") */}
          <div className="p-3.5 bg-gradient-to-r from-blue-950/30 via-indigo-950/20 to-purple-950/30 border border-blue-500/30 rounded-2xl space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Copy className="w-3.5 h-3.5 text-blue-400" />
                <span>Sao chép nhanh thông tin cần thiết (Đã lọc: {filteredLogs.length} bản ghi):</span>
              </span>
              <span className="text-[11px] text-slate-400">
                Bấm nút để copy hàng loạt và dán vào Excel / Zalo / Email
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {/* Copy Full Table */}
              <button
                type="button"
                id="btn-copy-full-table"
                onClick={handleCopyTable}
                className="py-2 px-3 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 text-blue-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-[0.98]"
                title="Sao chép toàn bộ bảng dạng Excel/Sheets tab-delimited"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-blue-300" />
                <span>Copy bảng (Excel)</span>
              </button>

              {/* Copy Phone List */}
              <button
                type="button"
                id="btn-copy-phones-list"
                onClick={handleCopyPhones}
                className="py-2 px-3 bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-[0.98]"
                title="Sao chép danh sách số điện thoại phân cách bởi dấu phẩy"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-300" />
                <span>Copy DS Số ĐT</span>
              </button>

              {/* Copy Email List */}
              <button
                type="button"
                id="btn-copy-emails-list"
                onClick={handleCopyEmails}
                className="py-2 px-3 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-[0.98]"
                title="Sao chép danh sách email gửi thông báo ca thi"
              >
                <Mail className="w-3.5 h-3.5 text-purple-300" />
                <span>Copy DS Email</span>
              </button>

              {/* Copy SBD List */}
              <button
                type="button"
                id="btn-copy-sbds-list"
                onClick={handleCopySbds}
                className="py-2 px-3 bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/40 text-amber-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-[0.98]"
                title="Sao chép danh sách Số Báo Danh (SBD)"
              >
                <Users className="w-3.5 h-3.5 text-amber-300" />
                <span>Copy DS SBD</span>
              </button>
            </div>
          </div>

          {/* Comprehensive Filter Bar ("có cả bộ lọc") */}
          <div className="p-3.5 bg-[#0e1224] border border-slate-800 rounded-2xl space-y-3">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  id="input-filter-search-sheet2"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm theo Tên thí sinh, Số báo danh, SĐT/Tài khoản, Email..."
                  className="w-full pl-9 pr-3 py-2 bg-[#080b17] border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 transition"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Reset Filter Button */}
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
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold shrink-0 cursor-pointer transition"
                >
                  Đặt lại lọc
                </button>
              )}
            </div>

            {/* Filter Pills row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-1 text-xs">
              {/* Exam filter */}
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Môn thi đã đăng ký:
                </label>
                <select
                  id="select-filter-exam"
                  value={examFilter}
                  onChange={(e) => setExamFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#080b17] border border-slate-700 rounded-xl text-xs text-slate-200 outline-none focus:border-blue-500"
                >
                  <option value="all">Tất cả môn thi</option>
                  <option value="hsa">ĐGNL HSA (ĐHQGHN)</option>
                  <option value="vact">ĐGNL V-ACT (ĐHQG-HCM)</option>
                  <option value="thptqg">Kỳ thi THPTQG</option>
                  <option value="huongnghiep">Có mục Hướng nghiệp</option>
                  <option value="none">Chưa đăng ký môn</option>
                </select>
              </div>

              {/* Time filter */}
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Thời gian đăng nhập:
                </label>
                <select
                  id="select-filter-date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-[#080b17] border border-slate-700 rounded-xl text-xs text-slate-200 outline-none focus:border-blue-500"
                >
                  <option value="all">Tất cả thời gian</option>
                  <option value="today">Hôm nay</option>
                  <option value="24h">Trong 24 giờ qua</option>
                  <option value="7days">Trong 7 ngày qua</option>
                </select>
              </div>

              {/* Device filter */}
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Thiết bị truy cập:
                </label>
                <select
                  id="select-filter-device"
                  value={deviceFilter}
                  onChange={(e) => setDeviceFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#080b17] border border-slate-700 rounded-xl text-xs text-slate-200 outline-none focus:border-blue-500"
                >
                  <option value="all">Tất cả thiết bị</option>
                  <option value="windows">Windows</option>
                  <option value="mac">macOS / Apple Mac</option>
                  <option value="ios">iPhone / iPad (iOS)</option>
                  <option value="android">Android</option>
                </select>
              </div>

              {/* Sorting */}
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Sắp xếp hiển thị:
                </label>
                <select
                  id="select-sort-by"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-[#080b17] border border-slate-700 rounded-xl text-xs text-slate-200 outline-none focus:border-blue-500"
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

          {/* Table Result Header */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>
              Đang hiển thị: <strong className="text-white">{filteredLogs.length}</strong> / {logs.length} bản ghi đăng nhập của Trang tính 2
            </span>
            {logs.length > 0 && (
              <button
                type="button"
                onClick={handleClearAllLogs}
                className="text-[11px] text-rose-400 hover:text-rose-300 transition flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Xóa lịch sử</span>
              </button>
            )}
          </div>

          {/* The Data Table ("có đầy đủ các nội dung của trang tính 2") */}
          <div className="border border-slate-800 rounded-2xl overflow-hidden bg-[#0a0d1c] shadow-lg">
            <div className="overflow-x-auto max-h-[580px] overflow-y-auto">
              <table id="table-sheet2-logs" className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#12162e] text-slate-300 font-bold uppercase text-[10px] tracking-wider sticky top-0 z-20 border-b border-slate-700">
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
                    <th className="py-3 px-3 w-20 text-center">Copy</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800/80">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-12 text-center text-slate-500">
                        <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                        <p className="font-semibold text-slate-400">Không tìm thấy bản ghi đăng nhập nào</p>
                        <p className="text-[11px] text-slate-600 mt-0.5">
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
                          className="hover:bg-[#131835]/70 transition-colors group"
                        >
                          {/* STT */}
                          <td className="py-2.5 px-3 text-center text-slate-500 font-mono text-[11px]">
                            {index + 1}
                          </td>

                          {/* Thời gian */}
                          <td className="py-2.5 px-3 text-slate-300 font-mono text-[11px] whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                              <span>{log.timestamp || '---'}</span>
                            </div>
                          </td>

                          {/* Họ và tên */}
                          <td className="py-2.5 px-3 font-semibold text-white">
                            <div className="flex items-center justify-between gap-1">
                              <span>{log.hoten || 'Chưa cập nhật'}</span>
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
                            </div>
                          </td>

                          {/* SBD */}
                          <td className="py-2.5 px-3 font-mono font-bold text-blue-400 whitespace-nowrap">
                            <div className="flex items-center justify-between gap-1">
                              <span>{log.sbd || '---'}</span>
                              {log.sbd && log.sbd !== '---' && (
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
                              <span>{log.username || '---'}</span>
                              {log.username && (
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
                            {log.namsinh || '---'}
                          </td>

                          {/* Email */}
                          <td className="py-2.5 px-3 text-slate-300 text-[11px]">
                            <div className="flex items-center justify-between gap-1">
                              <span className="truncate max-w-[170px]" title={log.email}>
                                {log.email || '---'}
                              </span>
                              {log.email && (
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
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                      isHsa
                                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                        : isVact
                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                        : isThpt
                                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                        : isHn
                                        ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30'
                                        : 'bg-slate-800 text-slate-400'
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
                                <Monitor className="w-3 h-3 text-slate-400 shrink-0" />
                              ) : (
                                <Smartphone className="w-3 h-3 text-slate-400 shrink-0" />
                              )}
                              <span className="truncate max-w-[120px]" title={log.device}>
                                {log.device || 'Khác'}
                              </span>
                            </div>
                          </td>

                          {/* Trạng thái */}
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 w-max">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              <span>{log.status || 'Thành công'}</span>
                            </span>
                          </td>

                          {/* Action Copy Row */}
                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                const rowText = `${log.timestamp}\t${log.hoten}\t${log.sbd}\t${log.username}\t${log.namsinh}\t${log.email}\t${log.monthi}\t${log.device}\t${log.status}`;
                                copyToClipboard(rowText, 'toàn bộ dòng', `row_${index}`);
                              }}
                              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-blue-400 transition cursor-pointer"
                              title="Sao chép toàn bộ hàng dữ liệu này"
                            >
                              {copiedCellId === `row_${index}` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </td>
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

      {/* TAB 2: Trang tính 1 - Danh sách tài khoản (Trang tính 1 của Google Sheet) */}
      {activeAdminTab === 'sheet1' && (
        <div className="space-y-3">
          <div className="p-3.5 bg-[#0e1224] border border-slate-800 rounded-2xl flex items-center justify-between flex-wrap gap-2 text-xs">
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span>Trang Tính 1: Danh Sách Tài Khoản & Ca Thi</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Các ô từ <strong>A2 đến A6</strong> được cấp quyền <strong>Admin</strong>. Thí sinh bắt đầu từ hàng A8.
              </p>
            </div>
            <span className="text-xs text-blue-400 font-mono font-bold">
              Tổng cộng: {sheet1Students.length} tài khoản
            </span>
          </div>

          <div className="border border-slate-800 rounded-2xl overflow-hidden bg-[#0a0d1c] shadow-lg">
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#12162e] text-slate-300 font-bold uppercase text-[10px] tracking-wider sticky top-0 z-20 border-b border-slate-700">
                  <tr>
                    <th className="py-3 px-3 w-14 text-center">Ô Sheet</th>
                    <th className="py-3 px-3">Tài khoản</th>
                    <th className="py-3 px-3">Mật khẩu</th>
                    <th className="py-3 px-3">SBD</th>
                    <th className="py-3 px-3">Họ và tên</th>
                    <th className="py-3 px-3">Email</th>
                    <th className="py-3 px-3">Vai trò</th>
                    <th className="py-3 px-3">HSA</th>
                    <th className="py-3 px-3">V-ACT</th>
                    <th className="py-3 px-3">Hướng nghiệp</th>
                    <th className="py-3 px-3">Bắt đầu / Kết thúc</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {sheet1Students.map((st, i) => {
                    const rowNum = st.rowNumber ?? i + 2;
                    const isAdmin = st.isAdmin || (rowNum >= 2 && rowNum <= 6);

                    return (
                      <tr
                        key={i}
                        className={`hover:bg-[#131835]/70 transition-colors ${
                          isAdmin ? 'bg-indigo-950/20' : ''
                        }`}
                      >
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-[11px]">
                          <span
                            className={`px-1.5 py-0.5 rounded ${
                              isAdmin
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'text-slate-400'
                            }`}
                          >
                            A{rowNum}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-white">
                          {st.username || '---'}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-400">
                          {st.password ? '••••••••' : '---'}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-blue-400 font-bold">
                          {st.sbd || '---'}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-200">
                          {st.hoten || '---'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                          {st.email || '---'}
                        </td>
                        <td className="py-2.5 px-3">
                          {isAdmin ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              ADMIN
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400">
                              Thí sinh
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-300 text-[11px]">{st.hsa || '---'}</td>
                        <td className="py-2.5 px-3 text-slate-300 text-[11px]">{st.vact || '---'}</td>
                        <td className="py-2.5 px-3 text-slate-300 text-[11px]">{st.huongnghiep || '---'}</td>
                        <td className="py-2.5 px-3 font-mono text-[10px] text-slate-400">
                          {st.batdau || '0'} / {st.ketthuc || '0'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Cấu hình Apps Script */}
      {activeAdminTab === 'script' && (
        <div className="p-4 bg-[#0c1024] border border-slate-800 rounded-2xl space-y-4 text-xs">
          <div>
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              <span>Cấu Hình Tự Động Ghi Vào &quot;Trang tính 2&quot;</span>
            </h3>
            <p className="text-slate-400 mt-1 leading-relaxed">
              Hệ thống đã tự động tích hợp mã Google Apps Script hoàn chỉnh để khi thí sinh đăng nhập,
              thông tin sẽ được gửi thẳng vào <strong>Trang tính 2</strong> của file Google Sheets &quot;Admin web thi&quot;.
            </p>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">
              URL Web App của Google Apps Script:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="input-admin-script-url-setting"
                value={scriptUrlInput}
                onChange={(e) => setScriptUrlInput(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="flex-1 px-3 py-2 bg-[#080a14] border border-slate-700 rounded-xl text-slate-200 text-xs font-mono outline-none focus:border-indigo-500"
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
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Lưu URL
              </button>
            </div>
            {scriptUrlSaved && (
              <span className="text-[10px] text-emerald-400 mt-1 block">
                ✓ Đã lưu cấu hình URL Apps Script thành công!
              </span>
            )}
          </div>

          <div className="p-3 bg-[#080a14] border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <span>Mã Google Apps Script đầy đủ (Hỗ trợ Trang tính 1 & Trang tính 2):</span>
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
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs flex items-center gap-1 transition cursor-pointer"
              >
                {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedScript ? 'Đã sao chép!' : 'Sao chép mã'}</span>
              </button>
            </div>
            <pre className="p-3 bg-[#05070e] rounded-lg text-[11px] font-mono text-slate-300 max-h-56 overflow-y-auto border border-slate-800">
              {GOOGLE_APPS_SCRIPT_CODE}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
