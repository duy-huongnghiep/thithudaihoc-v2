import React from 'react';
import { Facebook } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer
      id="app-footer"
      className="mt-6 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500"
    >
      <a
        id="link-support-facebook"
        href="https://www.facebook.com/nptd2006"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-slate-400 hover:text-blue-400 transition py-1"
      >
        <Facebook className="w-3.5 h-3.5 text-blue-500 shrink-0" />
        <span>Liên hệ hỗ trợ kỹ thuật</span>
      </a>
      <p className="text-[11px] text-slate-500">
        Phát triển bởi Trường Duy
      </p>
    </footer>
  );
};
