import React from 'react';
import { RefreshCw, BookOpen } from 'lucide-react';

interface HeaderProps {
  onRefreshData?: () => void;
  onOpenUserGuide?: () => void;
  onOpenExamGuide?: () => void;
  onGoHome?: () => void;
  isRefreshing?: boolean;
  maxWidthClass?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onRefreshData,
  onOpenUserGuide,
  onGoHome,
  isRefreshing = false,
}) => {
  return (
    <header
      id="app-header"
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-5 mb-5 border-b border-slate-800/80"
    >
      <button
        type="button"
        onClick={onGoHome}
        className="flex items-center gap-3 text-left cursor-pointer group min-w-0"
      >
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-extrabold text-white text-base shadow-[0_0_20px_rgba(59,130,246,0.45)] shrink-0">
          TD
        </div>
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight uppercase truncate">
            HỆ THỐNG THI THỬ VÀ HƯỚNG NGHIỆP
          </h1>
          <p className="text-xs text-slate-400 truncate">
            Cổng thông tin &amp; thi đánh giá năng lực trực tuyến
          </p>
        </div>
      </button>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
        {onOpenUserGuide && (
          <button
            type="button"
            id="btn-header-open-guide"
            onClick={onOpenUserGuide}
            className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#121629] hover:bg-slate-800 border border-slate-700/80 text-emerald-300 hover:text-emerald-200 transition text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Hướng dẫn</span>
          </button>
        )}

        {onRefreshData && (
          <button
            type="button"
            id="btn-refresh-cache"
            onClick={onRefreshData}
            disabled={isRefreshing}
            title="Đồng bộ dữ liệu mới nhất"
            className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#121629] hover:bg-slate-800 border border-slate-700/80 text-slate-200 hover:text-white transition text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 shrink-0 ${isRefreshing ? 'animate-spin text-blue-400' : 'text-slate-300'}`}
            />
            <span>{isRefreshing ? 'Đang tải...' : 'Đồng bộ'}</span>
          </button>
        )}
      </div>
    </header>
  );
};
