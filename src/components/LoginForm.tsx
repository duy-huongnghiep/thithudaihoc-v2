import React, { useState } from 'react';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  Search,
  PenTool,
  ExternalLink,
  AlertCircle,
  Loader2,
  BookOpen,
  ChevronRight,
} from 'lucide-react';
import { authenticateStudent, getExamSchedule } from '../services/api';
import { StudentInfo } from '../types';
import { Calendar } from 'lucide-react';

interface LoginFormProps {
  onLoginSuccess: (student: StudentInfo) => void;
  onSwitchToSearch: () => void;
  onOpenGuide: () => void;
  onOpenUserGuide?: () => void;
  initialUsername?: string;
  initialPassword?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onLoginSuccess,
  onSwitchToSearch,
  onOpenGuide,
  onOpenUserGuide,
  initialUsername = '',
  initialPassword = '',
}) => {
  const [username, setUsername] = useState(initialUsername);
  const [password, setPassword] = useState(initialPassword);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync if initial props change
  React.useEffect(() => {
    if (initialUsername) setUsername(initialUsername);
    if (initialPassword) setPassword(initialPassword);
  }, [initialUsername, initialPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMessage('Vui lòng nhập tài khoản hoặc số điện thoại');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Vui lòng nhập mật khẩu');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const student = await authenticateStudent(username, password);
      if (student) {
        onLoginSuccess(student);
      } else {
        setErrorMessage(
          'Tài khoản hoặc mật khẩu không chính xác! Hãy kiểm tra lại hoặc bấm "Tra cứu thông tin" bên dưới.'
        );
      }
    } catch {
      setErrorMessage(
        'Không thể kết nối máy chủ dữ liệu. Vui lòng kiểm tra lại mạng hoặc bấm nút đồng bộ lại.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const [, setTick] = useState(0);
  React.useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const schedule = getExamSchedule();

  return (
    <div id="login-section" className="space-y-4">
      {/* Contest Schedule Header Notice (ONLY SHOWN IF SCHEDULE HAS TIME, HIDDEN ON 0 FREE TESTING) */}
      {schedule.status !== 'NO_SCHEDULE' && schedule.status !== 'FREE_TESTING' && (
        <div className="p-2.5 rounded-xl bg-[#0b0e1a] border border-slate-800 text-[11px] space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>
                Ca thi: <strong className="font-mono text-slate-200">{schedule.formattedRange}</strong>
              </span>
            </div>
            <span
              className={`px-2 py-0.5 rounded-md font-mono font-bold text-[10px] shrink-0 ${
                schedule.status === 'OPEN'
                  ? 'text-emerald-400 bg-emerald-500/15 border border-emerald-500/30'
                  : schedule.status === 'UPCOMING'
                  ? 'text-amber-400 bg-amber-500/15 border border-amber-500/30'
                  : 'text-rose-400 bg-rose-500/15 border border-rose-500/30'
              }`}
            >
              {schedule.status === 'OPEN'
                ? 'Đang mở'
                : schedule.status === 'UPCOMING'
                ? 'Sắp diễn ra'
                : 'Đã hết hạn'}
            </span>
          </div>

          {/* Live countdown preview if upcoming or open */}
          {schedule.timeRemainingText && (
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/60 font-mono">
              <span className="text-amber-300 font-semibold">{schedule.timeRemainingText}</span>
              <span className="text-slate-500">{schedule.status === 'UPCOMING' ? 'Tự mở khi đến giờ' : ''}</span>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Username Field */}
        <div>
          <label
            htmlFor="input-username"
            className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5"
          >
            Tài Khoản
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              id="input-username"
              type="text"
              required
              autoComplete="username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="Nhập số điện thoại/tài khoản..."
              className="w-full pl-11 pr-4 py-3 bg-[#0b0e1a] border border-[#1f2747] focus:border-blue-500 rounded-xl text-white text-sm transition outline-none placeholder:text-slate-600 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label
            htmlFor="input-password"
            className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5"
          >
            Mật Khẩu
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              id="input-password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="Nhập mật khẩu..."
              className="w-full pl-11 pr-11 py-3 bg-[#0b0e1a] border border-[#1f2747] focus:border-blue-500 rounded-xl text-white text-sm transition outline-none placeholder:text-slate-600 focus:ring-1 focus:ring-blue-500 font-mono"
            />
            <button
              type="button"
              id="btn-toggle-password"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition p-1"
              title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Error Message Box */}
        {errorMessage && (
          <div
            id="login-error-msg"
            className="flex items-start gap-2 text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl animate-fadeIn"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          id="btn-login-submit"
          disabled={isLoading}
          className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl transition shadow-lg shadow-blue-600/25 active:scale-[0.98] text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Đang kiểm tra thông tin...</span>
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              <span>Đăng Nhập</span>
            </>
          )}
        </button>
      </form>

      {/* Functional Actions Block */}
      <div className="pt-2 space-y-2 border-t border-slate-800/80">
        {/* Quick Tra Cứu Action */}
        <button
          type="button"
          id="btn-switch-to-search"
          onClick={onSwitchToSearch}
          className="w-full py-2.5 px-3.5 bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-[#0e1224] hover:from-blue-900/40 hover:to-indigo-900/40 text-blue-300 border border-blue-500/30 hover:border-blue-500/50 rounded-xl transition text-xs font-semibold flex items-center justify-between group cursor-pointer shadow-sm"
        >
          <span className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition" />
            <span>Tra cứu thông tin dự thi & SBD</span>
          </span>
          <span className="text-[10px] text-blue-400/80 group-hover:translate-x-0.5 transition flex items-center gap-0.5">
            <span>Tra cứu</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </button>

        {/* Secondary 2-Column Actions */}
        <div className="grid grid-cols-2 gap-2">
          {/* Đăng ký test */}
          <a
            id="link-register-form"
            href="https://forms.gle/wMqrZrqWD4RL68Az8"
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold rounded-xl transition text-xs flex items-center justify-center gap-1.5 group cursor-pointer text-center"
          >
            <PenTool className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition shrink-0" />
            <span>Đăng ký test</span>
            <ExternalLink className="w-3 h-3 text-amber-400/70 shrink-0" />
          </a>

          {/* Hướng dẫn sử dụng */}
          {onOpenUserGuide && (
            <button
              type="button"
              id="btn-open-user-guide"
              onClick={onOpenUserGuide}
              className="py-2.5 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold rounded-xl transition text-xs flex items-center justify-center gap-1.5 group cursor-pointer text-center"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition shrink-0" />
              <span>Hướng dẫn sử dụng</span>
            </button>
          )}
        </div>

        {/* Tìm hiểu các kỳ thi */}
        <button
          type="button"
          id="btn-open-exam-guide"
          onClick={onOpenGuide}
          className="w-full py-2 px-3 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 rounded-xl transition text-xs flex items-center justify-center gap-1.5 cursor-pointer font-medium"
        >
          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
          <span>Tìm hiểu thông tin & cấu trúc các kỳ thi</span>
        </button>
      </div>
    </div>
  );
};

