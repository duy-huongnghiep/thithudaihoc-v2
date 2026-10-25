import React from 'react';
import { RefreshCw, Sparkles, BookOpen } from 'lucide-react';

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
    <header id="app-header" className="text-center mb-6 relative">
      {onOpenUserGuide && (
        <button
          type="button"
          id="btn-header-open-guide"
          onClick={onOpenUserGuide}
          title="Hướng dẫn sử dụng"
          className="absolute left-0 top-0 text-slate-400 hover:text-emerald-400 transition p-1.5 rounded-lg hover:bg-slate-800/60 text-xs flex items-center gap-1.5 cursor-pointer"
        >
          <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline font-bold text-[11px] text-emerald-400">Hướng dẫn sử dụng</span>
        </button>
      )}

      <div className="absolute right-0 top-0 flex items-center gap-1">

        {onRefreshData && (
          <button
            type="button"
            id="btn-refresh-cache"
            onClick={onRefreshData}
            disabled={isRefreshing}
            title="Làm mới dữ liệu từ Google Sheets"
            className="text-slate-500 hover:text-blue-400 transition p-1.5 rounded-lg hover:bg-slate-800/60 text-xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
            <span className="sr-only">Làm mới dữ liệu</span>
          </button>
        )}
      </div>

      {/* Monogram Logo */}
      <div
        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-3 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xl tracking-wider shadow-lg shadow-blue-500/25 border border-blue-400/20 relative"
      >
        <span className="relative z-10 font-bold">TD</span>
      </div>

      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-wide uppercase flex items-center justify-center gap-2">
          <span>HỆ THỐNG THI THỬ VÀ HƯỚNG NGHIỆP</span>
        </h1>
        <p className="text-slate-400 text-xs flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Cổng thông tin & thi đánh giá năng lực</span>
        </p>
      </div>
    </header>
  );
};

