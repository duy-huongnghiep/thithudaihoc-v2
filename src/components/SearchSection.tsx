import React, { useState } from 'react';
import {
  ArrowLeft,
  Phone,
  Search,
  Copy,
  Check,
  IdCard,
  LogIn,
  AlertCircle,
  Loader2,
  Calendar,
  BookOpen,
} from 'lucide-react';
import { searchStudentByPhoneOrUser, isZeroValue } from '../services/api';
import { StudentInfo } from '../types';
import { ExamBadges } from './Badges';

interface SearchSectionProps {
  onBackToLogin: () => void;
  onSelectStudentToLogin: (student: StudentInfo) => void;
  onOpenGuide?: () => void;
  onOpenUserGuide?: () => void;
}

export const SearchSection: React.FC<SearchSectionProps> = ({
  onBackToLogin,
  onSelectStudentToLogin,
  onOpenGuide,
  onOpenUserGuide,
}) => {
  const [searchPhone, setSearchPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resultStudent, setResultStudent] = useState<StudentInfo | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (key: string, value: string) => {
    if (!value || value === '---') return;
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchPhone.trim()) {
      setErrorMessage('Vui lòng nhập số điện thoại hoặc tài khoản');
      return;
    }

    setErrorMessage(null);
    setResultStudent(null);
    setIsLoading(true);

    try {
      const student = await searchStudentByPhoneOrUser(searchPhone);
      if (student) {
        setResultStudent(student);
      } else {
        setErrorMessage(
          'Không tìm thấy thông tin cho số điện thoại/tài khoản này! Hãy kiểm tra lại hoặc liên hệ hỗ trợ kỹ thuật.'
        );
      }
    } catch {
      setErrorMessage('Không thể kết nối máy chủ dữ liệu. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="search-section" className="space-y-4">
      {/* Search Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <Search className="w-4 h-4 text-blue-400" />
          <span>Tra cứu thông tin</span>
        </h2>
        <button
          type="button"
          id="btn-back-to-login"
          onClick={onBackToLogin}
          className="text-xs text-slate-400 hover:text-white transition flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Quay lại</span>
        </button>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="space-y-3">
        <div>
          <label
            htmlFor="input-search-phone"
            className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5"
          >
            Số điện thoại / Tài khoản / SBD
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              id="input-search-phone"
              type="text"
              required
              value={searchPhone}
              onChange={(e) => {
                setSearchPhone(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="Nhập số điện thoại đã đăng ký..."
              className="w-full pl-11 pr-4 py-3 bg-[#0b0e1a] border border-[#1f2747] focus:border-indigo-500 rounded-xl text-white text-sm transition outline-none placeholder:text-slate-600 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <button
          type="submit"
          id="btn-search-submit"
          disabled={isLoading}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/25 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Đang tra cứu dữ liệu...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Tra cứu ngay</span>
            </>
          )}
        </button>
      </form>

      {/* Error Message */}
      {errorMessage && (
        <div
          id="search-error-msg"
          className="flex items-start gap-2 text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Search Result Card */}
      {resultStudent && (
        <div
          id="search-result-box"
          className="bg-[#0b0e1a] border border-indigo-500/30 p-4 rounded-2xl space-y-3 text-xs shadow-xl animate-fadeIn"
        >
          <div className="font-bold text-indigo-400 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <IdCard className="w-4 h-4 text-indigo-400" />
              <span>Thông tin thí sinh</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              SBD: {resultStudent.sbd || 'N/A'}
            </span>
          </div>

          <div className="space-y-2">
            {/* SBD */}
            <div className="flex justify-between items-center border-b border-slate-800/50 pb-2">
              <span className="text-slate-400">Số báo danh:</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-blue-400 font-mono text-sm">
                  {resultStudent.sbd || '---'}
                </span>
                {resultStudent.sbd && (
                  <button
                    type="button"
                    onClick={() => handleCopy('sbd', resultStudent.sbd)}
                    className="text-slate-500 hover:text-blue-400 transition p-1"
                    title="Sao chép SBD"
                  >
                    {copiedKey === 'sbd' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Họ tên */}
            <div className="flex justify-between items-center border-b border-slate-800/50 pb-2">
              <span className="text-slate-400">Họ và tên:</span>
              <span className="font-bold text-white text-sm">
                {resultStudent.hoten || '---'}
              </span>
            </div>

            {/* Năm sinh if present */}
            {resultStudent.namsinh && (
              <div className="flex justify-between items-center border-b border-slate-800/50 pb-2">
                <span className="text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  <span>Năm sinh:</span>
                </span>
                <span className="text-slate-300 font-medium">
                  {resultStudent.namsinh}
                </span>
              </div>
            )}

            {/* Email */}
            <div className="flex justify-between items-center border-b border-slate-800/50 pb-2">
              <span className="text-slate-400">Email:</span>
              <span className="text-slate-300 font-medium truncate max-w-[180px]">
                {resultStudent.email || '---'}
              </span>
            </div>

            {/* Tài khoản */}
            <div className="flex justify-between items-center border-b border-slate-800/50 pb-2">
              <span className="text-slate-400">Tài khoản:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-emerald-400 font-bold">
                  {resultStudent.username || '---'}
                </span>
                {resultStudent.username && (
                  <button
                    type="button"
                    onClick={() => handleCopy('user', resultStudent.username)}
                    className="text-slate-500 hover:text-emerald-400 transition p-1"
                    title="Sao chép tài khoản"
                  >
                    {copiedKey === 'user' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Mật khẩu */}
            <div className="flex justify-between items-center border-b border-slate-800/50 pb-2">
              <span className="text-slate-400">Mật khẩu:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-emerald-400 font-bold">
                  {resultStudent.password || '---'}
                </span>
                {resultStudent.password && (
                  <button
                    type="button"
                    onClick={() => handleCopy('pass', resultStudent.password)}
                    className="text-slate-500 hover:text-emerald-400 transition p-1"
                    title="Sao chép mật khẩu"
                  >
                    {copiedKey === 'pass' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Thời gian ca thi (Chỉ hiện khi có thời gian thực sự, ẩn khi là 0 thi tự do) */}
            {(!isZeroValue(resultStudent.batdau) || !isZeroValue(resultStudent.ketthuc)) && (
              <div className="flex justify-between items-center border-b border-slate-800/50 pb-2 text-[11px]">
                <span className="text-slate-400">Thời gian mở thi:</span>
                <span className="font-medium text-amber-300 font-mono">
                  {resultStudent.batdau || '...'} → {resultStudent.ketthuc || '...'}
                </span>
              </div>
            )}

            {/* Kỳ thi đã đăng ký */}
            <div className="pt-1">
              <span className="text-slate-400 block mb-1.5 text-[11px] font-semibold uppercase tracking-wider">
                Kỳ thi đã đăng ký:
              </span>
              <ExamBadges student={resultStudent} size="sm" />
            </div>
          </div>

          {/* Quick 1-Click Login */}
          <button
            type="button"
            id="btn-login-found-student"
            onClick={() => onSelectStudentToLogin(resultStudent)}
            className="w-full mt-3 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl transition text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-600/20"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Đăng nhập ngay với tài khoản này</span>
          </button>
        </div>
      )}

      {/* Guide Links */}
      <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-center border-t border-slate-800/60">
        {onOpenUserGuide && (
          <button
            type="button"
            id="btn-search-open-user-guide"
            onClick={onOpenUserGuide}
            className="text-xs text-emerald-400 hover:text-emerald-300 transition inline-flex items-center gap-1.5 cursor-pointer font-medium"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span>Hướng dẫn sử dụng</span>
          </button>
        )}
        {onOpenGuide && (
          <button
            type="button"
            id="btn-search-open-exam-guide"
            onClick={onOpenGuide}
            className="text-xs text-slate-400 hover:text-blue-400 transition inline-flex items-center gap-1.5 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            <span>Tìm hiểu cấu trúc kỳ thi</span>
          </button>
        )}
      </div>
    </div>
  );
};

