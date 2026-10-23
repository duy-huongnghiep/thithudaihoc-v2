import React from 'react';
import { Facebook } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer id="app-footer" className="mt-8 pt-4 border-t border-slate-800/80 text-center space-y-2">
      <div>
        <a
          id="link-support-facebook"
          href="https://www.facebook.com/nptd2006"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-400 transition group"
        >
          <Facebook className="w-3.5 h-3.5 text-blue-500 group-hover:scale-110 transition" />
          <span>Liên hệ hỗ trợ kỹ thuật</span>
        </a>
      </div>
      <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
        <span>Phát triển bởi Trường Duy</span>
      </p>
    </footer>
  );
};

