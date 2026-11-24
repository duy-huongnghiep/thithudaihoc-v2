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
      className="mb-5 p-4 rounded-2xl bg-[#1a1412] border border-amber-500/40 flex items-start gap-3 animate-fadeIn"
    >
      <Megaphone className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
      <div className="min-w-0 flex-1 space-y-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block">
          THÔNG BÁO HỆ THỐNG
        </span>
        <p className="text-xs sm:text-sm text-amber-100 leading-relaxed whitespace-pre-line font-medium">
          {cleanNotice}
        </p>
      </div>
    </div>
  );
};
