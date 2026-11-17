import React, { useState } from 'react';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  Loader2,
  UserPlus,
  Search,
} from 'lucide-react';
import { authenticateStudent } from '../services/api';
import { StudentInfo } from '../types';

interface LoginFormProps {
  onLoginSuccess: (student: StudentInfo) => void;
  onSwitchToRegister?: () => void;
  onSwitchToSearch: () => void;
  initialUsername?: string;
  initialPassword?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onLoginSuccess,
  onSwitchToRegister,
  onSwitchToSearch,
  initialUsername = '',
  initialPassword = '',
}) => {
  const [username, setUsername] = useState(initialUsername);
  const [password, setPassword] = useState(initialPassword);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
          'Tài khoản hoặc mật khẩu không chính xác! Hãy kiểm tra lại hoặc chuyển sang tab "Tra cứu SBD".'
        );
      }
    } catch {
      setErrorMessage(
        'Không thể kết nối máy chủ dữ liệu. Vui lòng kiểm tra lại mạng hoặc bấm nút đồng bộ.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="login-section" className="space-y-5">
      <div>
        <h2 className="text-base sm:text-lg font-bold text-white">
          Đăng nhập cổng thí sinh
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Sử dụng Số điện thoại hoặc Tài khoản đã được cấp để vào phòng thi.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Username Field */}
        <div>
          <label
            htmlFor="input-username"
            className="block text-xs font-semibold text-slate-300 mb-1.5"
          >
            Tài khoản / Số điện thoại
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
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
              placeholder="Nhập số điện thoại hoặc tên đăng nhập..."
              className="w-full min-h-[46px] pl-10 pr-4 py-2.5 bg-[#080b16] border border-slate-800 focus:border-blue-500 rounded-xl text-white text-base sm:text-sm transition outline-none placeholder:text-slate-600"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label
            htmlFor="input-password"
            className="block text-xs font-semibold text-slate-300 mb-1.5"
          >
            Mật khẩu
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
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
              className="w-full min-h-[46px] pl-10 pr-12 py-2.5 bg-[#080b16] border border-slate-800 focus:border-blue-500 rounded-xl text-white text-base sm:text-sm transition outline-none placeholder:text-slate-600 font-mono"
            />
            <button
              type="button"
              id="btn-toggle-password"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-1 top-1/2 -translate-y-1/2 min-w-[40px] min-h-[40px] flex items-center justify-center text-slate-500 hover:text-slate-200 transition cursor-pointer"
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
            className="flex items-start gap-2 text-rose-300 text-xs bg-rose-500/10 border border-rose-500/25 p-3 rounded-xl animate-fadeIn"
          >
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          id="btn-login-submit"
          disabled={isLoading}
          className="w-full min-h-[48px] py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition active:scale-[0.99] text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Đang kiểm tra dữ liệu...</span>
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              <span>Đăng Nhập</span>
            </>
          )}
        </button>
      </form>

      {/* Helpful Secondary Links */}
      <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
        {onSwitchToRegister && (
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="min-h-[36px] inline-flex items-center gap-1.5 text-amber-300 hover:text-amber-200 font-semibold transition cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Chưa có tài khoản? Đăng ký</span>
          </button>
        )}
        <button
          type="button"
          onClick={onSwitchToSearch}
          className="min-h-[36px] inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-semibold transition cursor-pointer"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Quên SBD / Mật khẩu?</span>
        </button>
      </div>
    </div>
  );
};
