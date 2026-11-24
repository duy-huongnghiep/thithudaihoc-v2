import React from 'react';
import { Facebook } from 'lucide-react';

interface FooterProps {
  maxWidthClass?: string;
}

export const Footer: React.FC<FooterProps> = () => {
  return (
    <footer
      id="app-footer"
      className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs"
    >
      <a
        id="link-support-facebook"
        href="https://www.facebook.com/nptd2006"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-400 transition font-medium"
      >
        <Facebook className="w-4 h-4 text-blue-400 shrink-0" />
        <span>Liên hệ hỗ trợ kỹ thuật</span>
      </a>
      <p className="text-slate-500">
        Phát triển bởi Trường Duy
      </p>
    </footer>
  );
};
