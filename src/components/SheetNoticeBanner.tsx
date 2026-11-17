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
      className="mb-5 px-3.5 py-3 rounded-xl bg-amber-950/30 border border-amber-500/35 flex items-start gap-3 animate-fadeIn"
    >
      <Megaphone className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
      <div className="min-w-0 flex-1 space-y-0.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block">
          Thông báo hệ thống
        </span>
        <p className="text-xs sm:text-[13px] text-amber-100/95 leading-relaxed whitespace-pre-line font-medium">
          {cleanNotice}
        </p>
      </div>
    </div>
  );
};
