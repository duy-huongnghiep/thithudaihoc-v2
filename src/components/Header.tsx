import React from 'react';
import { RefreshCw, BookOpen } from 'lucide-react';

interface HeaderProps {
  onRefreshData?: () => void;
  onOpenUserGuide?: () => void;
  isRefreshing?: boolean;
  lastUpdated?: Date | null;
}

export const Header: React.FC<HeaderProps> = ({
  onRefreshData,
  onOpenUserGuide,
  isRefreshing = false,
}) => {
  return (
    <header
      id="app-header"
      className="flex items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-800/80"
    >
      {/* Left Brand Lockup */}
      <div className="flex items-center gap-3 min-w-0">
        <div
          aria-hidden="true"
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-600 text-white font-black text-sm sm:text-base tracking-wider flex items-center justify-center shrink-0 shadow-sm shadow-blue-600/30 border border-blue-400/20"
        >
          TD
        </div>
        <div className="min-w-0">
          <h1 className="text-sm sm:text-lg font-extrabold text-white tracking-tight uppercase truncate">
            HỆ THỐNG THI THỬ VÀ HƯỚNG NGHIỆP
          </h1>
          <p className="text-slate-400 text-[11px] sm:text-xs truncate">
            Cổng thông tin &amp; thi đánh giá năng lực trực tuyến
          </p>
        </div>
      </div>

      {/* Right Utility Actions (Mobile-safe >=44px hit targets) */}
      <div className="flex items-center gap-1.5 shrink-0">
        {onOpenUserGuide && (
          <button
            type="button"
            id="btn-header-open-guide"
            onClick={onOpenUserGuide}
            title="Hướng dẫn sử dụng"
            className="min-h-[40px] sm:min-h-[36px] px-2.5 sm:px-3 rounded-xl bg-[#0b0e1c] hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 text-emerald-400 transition text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Hướng dẫn</span>
          </button>
        )}

        {onRefreshData && (
          <button
            type="button"
            id="btn-refresh-cache"
            onClick={onRefreshData}
            disabled={isRefreshing}
            title="Làm mới dữ liệu từ Google Sheets"
            className="min-w-[40px] min-h-[40px] sm:min-w-[36px] sm:min-h-[36px] px-2.5 rounded-xl bg-[#0b0e1c] hover:bg-slate-800 border border-slate-800 hover:border-blue-500/40 text-slate-300 hover:text-blue-400 transition text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 shrink-0 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
            <span className="hidden md:inline text-[11px]">Đồng bộ</span>
            <span className="sr-only">Làm mới dữ liệu</span>
          </button>
        )}
      </div>
    </header>
  );
};
