import React, { useState, useEffect } from 'react';
import {
  Phone,
  Lock,
  Eye,
  EyeOff,
  User,
  Mail,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  ArrowLeft,
  UserPlus,
  LogIn,
} from 'lucide-react';
import {
  getGlobalSheetConfig,
  subscribeGlobalConfig,
  registerStudentAccount,
} from '../services/api';
import { RegistrationExamConfig, SheetGlobalConfig, StudentInfo } from '../types';

interface RegisterSectionProps {
  onBackToLogin: () => void;
  onRegisterSuccessLogin: (student: StudentInfo) => void;
}

export const RegisterSection: React.FC<RegisterSectionProps> = ({
  onBackToLogin,
  onRegisterSuccessLogin,
}) => {
  const [globalConfig, setGlobalConfig] = useState<SheetGlobalConfig>(() =>
    getGlobalSheetConfig()
  );

  useEffect(() => {
    const unsub = subscribeGlobalConfig((cfg) => setGlobalConfig(cfg));
    return () => unsub();
  }, []);

  const regConfig: RegistrationExamConfig = globalConfig.registrationConfig || {
    enableHsa: true,
    enableVact: true,
    enableThptqg: true,
    enableHuongnghiep: true,
  };

  const hasAnyOpenExam =
    regConfig.enableHsa ||
    regConfig.enableVact ||
    regConfig.enableThptqg ||
    regConfig.enableHuongnghiep;

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [hoten, setHoten] = useState('');
  const [email, setEmail] = useState('');
  const [namsinh, setNamsinh] = useState('2009');

  const [pickHsa, setPickHsa] = useState(false);
  const [pickVact, setPickVact] = useState(false);
  const [pickThptqg, setPickThptqg] = useState(false);
  const [pickHuongnghiep, setPickHuongnghiep] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdStudent, setCreatedStudent] = useState<StudentInfo | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (!regConfig.enableHsa) setPickHsa(false);
    if (!regConfig.enableVact) setPickVact(false);
    if (!regConfig.enableThptqg) setPickThptqg(false);
    if (!regConfig.enableHuongnghiep) setPickHuongnghiep(false);
  }, [
    regConfig.enableHsa,
    regConfig.enableVact,
    regConfig.enableThptqg,
    regConfig.enableHuongnghiep,
  ]);

  const handleCopy = (key: string, value: string) => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!hasAnyOpenExam) {
      setErrorMessage('Cổng đăng ký hiện đang đóng. Vui lòng quay lại sau.');
      return;
    }

    const cleanPhone = phone.trim();
    const digitsOnly = cleanPhone.replace(/\D/g, '');
    if (digitsOnly.length < 9 || digitsOnly.length > 12) {
      setErrorMessage('Vui lòng nhập Số điện thoại hợp lệ (9–11 chữ số).');
      return;
    }
    if (password.trim().length < 4) {
      setErrorMessage('Mật khẩu cần có ít nhất 4 ký tự.');
      return;
    }
    if (hoten.trim().length < 2) {
      setErrorMessage('Vui lòng nhập đầy đủ Họ và tên.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Vui lòng nhập địa chỉ Email hợp lệ.');
      return;
    }
    const yearNum = Number(namsinh.trim());
    if (!namsinh.trim() || isNaN(yearNum) || yearNum < 1995 || yearNum > 2015) {
      setErrorMessage('Vui lòng nhập Năm sinh hợp lệ (ví dụ: 2009).');
      return;
    }

    const effectiveHsa = regConfig.enableHsa && pickHsa;
    const effectiveVact = regConfig.enableVact && pickVact;
    const effectiveThptqg = regConfig.enableThptqg && pickThptqg;
    const effectiveHn = regConfig.enableHuongnghiep && pickHuongnghiep;

    if (!effectiveHsa && !effectiveVact && !effectiveThptqg && !effectiveHn) {
      setErrorMessage('Vui lòng chọn ít nhất một kỳ thi hoặc mục Hướng nghiệp muốn đăng ký.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await registerStudentAccount({
        username: cleanPhone,
        password: password.trim(),
        hoten: hoten.trim(),
        email: email.trim(),
        namsinh: namsinh.trim(),
        hsa: effectiveHsa,
        vact: effectiveVact,
        thptqg: effectiveThptqg,
        huongnghiep: effectiveHn,
      });

      if (!res.success || !res.student) {
        setErrorMessage(res.message || 'Không thể đăng ký tài khoản lúc này.');
      } else {
        setCreatedStudent(res.student);
      }
    } catch {
      setErrorMessage('Lỗi kết nối máy chủ. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (createdStudent) {
    const registeredList = [
      createdStudent.hsa === 'Có' ? 'ĐGNL HSA' : null,
      createdStudent.vact === 'Có' ? 'ĐGNL V-ACT' : null,
      createdStudent.thptqg === 'Có' ? 'THPT Quốc Gia' : null,
      createdStudent.huongnghiep === 'Có' ? 'Hướng nghiệp' : null,
    ]
      .filter(Boolean)
      .join(' · ');

    return (
      <div id="register-success-view" className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <h2 className="text-base font-bold text-white">
              Đăng ký tài khoản thành công
            </h2>
          </div>
          <button
            type="button"
            onClick={onBackToLogin}
            className="text-xs text-slate-400 hover:text-white transition flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Đăng nhập</span>
          </button>
        </div>

        <div className="bg-[#080b16] border border-emerald-500/35 rounded-2xl px-4 py-1 divide-y divide-slate-800/80 text-xs">
          <div className="flex items-center justify-between py-2.5">
            <span className="text-slate-400">Số báo danh (SBD):</span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono tabular-nums font-extrabold text-base text-blue-400">
                {createdStudent.sbd}
              </span>
              <button
                type="button"
                onClick={() => handleCopy('sbd', createdStudent.sbd)}
                className="p-1 text-slate-500 hover:text-blue-400 transition cursor-pointer"
                title="Sao chép SBD"
              >
                {copiedKey === 'sbd' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between py-2.5">
            <span className="text-slate-400">Thời gian đăng ký:</span>
            <span className="font-mono tabular-nums text-white font-semibold">
              {createdStudent.registeredAt || 'Vừa xong'}
            </span>
          </div>

          <div className="flex items-center justify-between py-2.5">
            <span className="text-slate-400">Họ và tên:</span>
            <span className="font-bold text-white">{createdStudent.hoten}</span>
          </div>

          <div className="flex items-center justify-between py-2.5">
            <span className="text-slate-400">Tài khoản (SĐT):</span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono tabular-nums font-bold text-emerald-400">
                {createdStudent.username}
              </span>
              <button
                type="button"
                onClick={() => handleCopy('user', createdStudent.username)}
                className="p-1 text-slate-500 hover:text-emerald-400 transition cursor-pointer"
                title="Sao chép tài khoản"
              >
                {copiedKey === 'user' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between py-2.5">
            <span className="text-slate-400">Mật khẩu:</span>
            <span className="font-mono font-bold text-emerald-400">
              {password.trim() || 'Đã thiết lập'}
            </span>
          </div>

          <div className="flex items-center justify-between py-2.5 gap-3">
            <span className="text-slate-400 shrink-0">Năm sinh · Email:</span>
            <span className="text-slate-200 truncate text-right">
              {createdStudent.namsinh} · {createdStudent.email}
            </span>
          </div>

          <div className="py-2.5 flex items-start justify-between gap-3">
            <span className="text-slate-400 shrink-0">Kỳ thi đã chọn:</span>
            <span className="text-blue-400 font-bold text-right">
              {registeredList || 'Chưa chọn'}
            </span>
          </div>
        </div>

        <button
          type="button"
          id="btn-register-login-now"
          onClick={() => onRegisterSuccessLogin(createdStudent)}
          className="w-full min-h-[46px] py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/25 transition text-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          <LogIn className="w-4 h-4 shrink-0" />
          <span>Đăng nhập ngay vào hệ thống</span>
        </button>
      </div>
    );
  }

  return (
    <div id="register-section" className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-amber-400" />
            <span>Đăng ký Tài khoản Thi thử</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Tạo tài khoản mới và nhận Số Báo Danh 5 số ngay lập tức.
          </p>
        </div>
        <button
          type="button"
          id="btn-register-back-login"
          onClick={onBackToLogin}
          className="text-xs text-slate-400 hover:text-white transition flex items-center gap-1 cursor-pointer shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Đăng nhập</span>
        </button>
      </div>

      {!hasAnyOpenExam && (
        <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/35 text-amber-200 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            Cổng đăng ký tài khoản hiện đang tạm đóng trên hệ thống cấu hình. Vui lòng quay lại sau hoặc đăng nhập bằng tài khoản đã cấp.
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="reg-phone"
              className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5"
            >
              Số điện thoại (Tài khoản)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="reg-phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="0912345678"
                className="w-full min-h-[44px] pl-10 pr-3 py-2 bg-[#080b16] border border-slate-700/80 focus:border-amber-500 rounded-xl text-white text-base sm:text-sm outline-none placeholder:text-slate-600 font-mono tabular-nums transition"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="reg-password"
              className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5"
            >
              Mật khẩu đăng nhập
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="Từ 4 ký tự trở lên"
                className="w-full min-h-[44px] pl-10 pr-11 py-2 bg-[#080b16] border border-slate-700/80 focus:border-amber-500 rounded-xl text-white text-base sm:text-sm outline-none placeholder:text-slate-600 font-mono transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-500 hover:text-slate-200 cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div>
          <label
            htmlFor="reg-hoten"
            className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5"
          >
            Họ và tên thí sinh
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="reg-hoten"
              type="text"
              required
              value={hoten}
              onChange={(e) => {
                setHoten(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="Nguyễn Văn An"
              className="w-full min-h-[44px] pl-10 pr-3 py-2 bg-[#080b16] border border-slate-700/80 focus:border-amber-500 rounded-xl text-white text-base sm:text-sm outline-none placeholder:text-slate-600 transition"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label
              htmlFor="reg-email"
              className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5"
            >
              Email nhận thông báo
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="reg-email"
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="name@gmail.com"
                className="w-full min-h-[44px] pl-10 pr-3 py-2 bg-[#080b16] border border-slate-700/80 focus:border-amber-500 rounded-xl text-white text-base sm:text-sm outline-none placeholder:text-slate-600 transition"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="reg-namsinh"
              className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5"
            >
              Năm sinh
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="reg-namsinh"
                type="text"
                inputMode="numeric"
                maxLength={4}
                required
                value={namsinh}
                onChange={(e) => {
                  setNamsinh(e.target.value.replace(/\D/g, ''));
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="2009"
                className="w-full min-h-[44px] pl-10 pr-3 py-2 bg-[#080b16] border border-slate-700/80 focus:border-amber-500 rounded-xl text-white text-base sm:text-sm outline-none placeholder:text-slate-600 font-mono tabular-nums transition"
              />
            </div>
          </div>
        </div>

        {hasAnyOpenExam && (
          <div className="pt-1 space-y-2">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Chọn kỳ thi &amp; mục tham gia
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {regConfig.enableHsa && (
                <label
                  className={`min-h-[44px] flex items-center gap-2.5 px-3 py-2 rounded-xl border text-xs cursor-pointer transition select-none ${
                    pickHsa
                      ? 'bg-blue-600/20 border-blue-500/60 text-white'
                      : 'bg-[#080b16] border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={pickHsa}
                    onChange={(e) => setPickHsa(e.target.checked)}
                    className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
                  />
                  <span className="font-semibold">ĐGNL HSA (ĐHQGHN)</span>
                </label>
              )}

              {regConfig.enableVact && (
                <label
                  className={`min-h-[44px] flex items-center gap-2.5 px-3 py-2 rounded-xl border text-xs cursor-pointer transition select-none ${
                    pickVact
                      ? 'bg-emerald-600/20 border-emerald-500/60 text-white'
                      : 'bg-[#080b16] border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={pickVact}
                    onChange={(e) => setPickVact(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                  />
                  <span className="font-semibold">ĐGNL V-ACT (HCM)</span>
                </label>
              )}

              {regConfig.enableThptqg && (
                <label
                  className={`min-h-[44px] flex items-center gap-2.5 px-3 py-2 rounded-xl border text-xs cursor-pointer transition select-none ${
                    pickThptqg
                      ? 'bg-purple-600/20 border-purple-500/60 text-white'
                      : 'bg-[#080b16] border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={pickThptqg}
                    onChange={(e) => setPickThptqg(e.target.checked)}
                    className="w-4 h-4 accent-purple-500 rounded cursor-pointer"
                  />
                  <span className="font-semibold">THPT Quốc Gia</span>
                </label>
              )}

              {regConfig.enableHuongnghiep && (
                <label
                  className={`min-h-[44px] flex items-center gap-2.5 px-3 py-2 rounded-xl border text-xs cursor-pointer transition select-none ${
                    pickHuongnghiep
                      ? 'bg-fuchsia-600/20 border-fuchsia-500/60 text-white'
                      : 'bg-[#080b16] border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={pickHuongnghiep}
                    onChange={(e) => setPickHuongnghiep(e.target.checked)}
                    className="w-4 h-4 accent-fuchsia-500 rounded cursor-pointer"
                  />
                  <span className="font-semibold">Hướng nghiệp</span>
                </label>
              )}
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="flex items-start gap-2 text-rose-300 text-xs bg-rose-950/50 border border-rose-500/35 p-3 rounded-xl">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <button
          type="submit"
          id="btn-register-submit"
          disabled={isSubmitting || !hasAnyOpenExam}
          className="w-full min-h-[46px] py-2.5 px-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-amber-600/25 transition text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Đang tạo tài khoản &amp; cấp SBD...</span>
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              <span>Hoàn tất đăng ký tài khoản</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
