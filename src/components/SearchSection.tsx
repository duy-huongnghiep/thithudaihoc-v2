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
} from 'lucide-react';
import { searchStudentByPhoneOrUser, isZeroValue } from '../services/api';
import { StudentInfo } from '../types';
import { ExamBadges } from './Badges';

interface SearchSectionProps {
  onBackToLogin: () => void;
  onSelectStudentToLogin: (student: StudentInfo) => void;
}

export const SearchSection: React.FC<SearchSectionProps> = ({
  onBackToLogin,
  onSelectStudentToLogin,
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
      setErrorMessage('Vui lòng nhập số điện thoại, tài khoản hoặc SBD');
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
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white">
            Tra cứu thông tin dự thi
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Tìm Số Báo Danh, Tài khoản, Mật khẩu và các môn thi đã đăng ký.
          </p>
        </div>
        <button
          type="button"
          id="btn-back-to-login"
          onClick={onBackToLogin}
          className="min-h-[36px] text-xs text-slate-400 hover:text-white transition flex items-center gap-1 cursor-pointer shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Đăng nhập</span>
        </button>
      </div>

      <form onSubmit={handleSearch} className="space-y-3">
        <div>
          <label
            htmlFor="input-search-phone"
            className="block text-xs font-semibold text-slate-300 mb-1.5"
          >
            Số điện thoại / Tài khoản / SBD
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="input-search-phone"
              type="text"
              required
              value={searchPhone}
              onChange={(e) => {
                setSearchPhone(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="Nhập số điện thoại hoặc SBD đã đăng ký..."
              className="w-full min-h-[46px] pl-10 pr-4 py-2.5 bg-[#080b16] border border-slate-800 focus:border-indigo-500 rounded-xl text-white text-base sm:text-sm transition outline-none placeholder:text-slate-600"
            />
          </div>
        </div>

        <button
          type="submit"
          id="btn-search-submit"
          disabled={isLoading}
          className="w-full min-h-[48px] py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
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

      {errorMessage && (
        <div
          id="search-error-msg"
          className="flex items-start gap-2 text-rose-300 text-xs bg-rose-500/10 border border-rose-500/25 p-3 rounded-xl"
        >
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {resultStudent && (
        <div
          id="search-result-box"
          className="bg-[#080b16] border border-indigo-500/35 p-4 rounded-xl space-y-3 text-xs animate-fadeIn"
        >
          <div className="font-bold text-indigo-400 uppercase tracking-wider border-b border-slate-800 pb-2.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <IdCard className="w-4 h-4 text-indigo-400" />
              <span>Thông tin thí sinh</span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono tabular-nums">
              SBD: {resultStudent.sbd || 'N/A'}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center border-b border-slate-800/60 pb-2">
              <span className="text-slate-400">Số báo danh:</span>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-blue-400 font-mono tabular-nums text-sm">
                  {resultStudent.sbd || '---'}
                </span>
                {resultStudent.sbd && (
                  <button
                    type="button"
                    onClick={() => handleCopy('sbd', resultStudent.sbd)}
                    className="min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-500 hover:text-blue-400 transition cursor-pointer"
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

            <div className="flex justify-between items-center border-b border-slate-800/60 pb-2 gap-3">
              <span className="text-slate-400 shrink-0">Họ và tên:</span>
              <span className="font-bold text-white text-sm text-right">
                {resultStudent.hoten || '---'}
              </span>
            </div>

            {resultStudent.namsinh && (
              <div className="flex justify-between items-center border-b border-slate-800/60 pb-2">
                <span className="text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Năm sinh:</span>
                </span>
                <span className="text-slate-200 font-mono tabular-nums font-medium">
                  {resultStudent.namsinh}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center border-b border-slate-800/60 pb-2 gap-3">
              <span className="text-slate-400 shrink-0">Email:</span>
              <span className="text-slate-300 font-medium truncate text-right">
                {resultStudent.email || '---'}
              </span>
            </div>

            <div className="flex justify-between items-center border-b border-slate-800/60 pb-2">
              <span className="text-slate-400">Tài khoản:</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono tabular-nums text-emerald-400 font-bold">
                  {resultStudent.username || '---'}
                </span>
                {resultStudent.username && (
                  <button
                    type="button"
                    onClick={() => handleCopy('user', resultStudent.username)}
                    className="min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-500 hover:text-emerald-400 transition cursor-pointer"
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

            <div className="flex justify-between items-center border-b border-slate-800/60 pb-2">
              <span className="text-slate-400">Mật khẩu:</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-emerald-400 font-bold">
                  {resultStudent.password || '---'}
                </span>
                {resultStudent.password && (
                  <button
                    type="button"
                    onClick={() => handleCopy('pass', resultStudent.password)}
                    className="min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-500 hover:text-emerald-400 transition cursor-pointer"
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

            {(!isZeroValue(resultStudent.batdau) || !isZeroValue(resultStudent.ketthuc)) && (
              <div className="flex justify-between items-center border-b border-slate-800/60 pb-2 gap-2">
                <span className="text-slate-400 shrink-0">Thời gian mở thi:</span>
                <span className="font-medium text-amber-300 font-mono tabular-nums text-right">
                  {resultStudent.batdau || '...'} → {resultStudent.ketthuc || '...'}
                </span>
              </div>
            )}

            <div className="pt-1">
              <span className="text-slate-400 block mb-1.5 text-[11px] font-semibold uppercase tracking-wider">
                Kỳ thi đã đăng ký:
              </span>
              <ExamBadges student={resultStudent} size="sm" />
            </div>
          </div>

          <button
            type="button"
            id="btn-login-found-student"
            onClick={() => onSelectStudentToLogin(resultStudent)}
            className="w-full min-h-[46px] mt-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Đăng nhập ngay với tài khoản này</span>
          </button>
        </div>
      )}
    </div>
  );
};
