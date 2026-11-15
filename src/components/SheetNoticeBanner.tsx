import React from 'react';
import { Megaphone } from 'lucide-react';

interface SheetNoticeBannerProps {
  notice: string;
}

export const SheetNoticeBanner: React.FC<SheetNoticeBannerProps> = ({ notice }) => {
  const cleanNotice = notice.trim();
  if (!cleanNotice) return null;

  return (
    <div
      id="sheet-global-notice-banner"
      role="status"
      aria-live="polite"
      className="mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/55 via-orange-950/35 to-[#0e1224] border border-amber-500/45 shadow-lg shadow-amber-950/25 flex items-start gap-3 animate-fadeIn"
    >
      <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/35 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
        <Megaphone className="w-4 h-4" />
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
          Thông báo hệ thống
        </span>
        <p className="text-xs sm:text-[13px] text-amber-100 leading-relaxed whitespace-pre-line font-medium">
          {cleanNotice}
        </p>
      </div>
    </div>
  );
};
