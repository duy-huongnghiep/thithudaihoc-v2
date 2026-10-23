import React from 'react';
import { isYes } from '../services/api';
import { StudentInfo } from '../types';
import { BookOpenCheck, Brain, GraduationCap, Compass } from 'lucide-react';

interface ExamBadgesProps {
  student: StudentInfo;
  size?: 'sm' | 'md';
}

export const ExamBadges: React.FC<ExamBadgesProps> = ({ student, size = 'sm' }) => {
  const hasHsa = isYes(student.hsa);
  const hasVact = isYes(student.vact);
  const hasThptqg = isYes(student.thptqg);
  const hasHuongnghiep = isYes(student.huongnghiep);

  if (!hasHsa && !hasVact && !hasThptqg && !hasHuongnghiep) {
    return (
      <span className="text-slate-400 text-xs italic">Chưa đăng ký môn thi nào</span>
    );
  }

  const paddingClass = size === 'sm' ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs';

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {hasHsa && (
        <span
          id="badge-hsa"
          className={`inline-flex items-center gap-1.5 font-bold rounded-lg border bg-blue-500/15 text-blue-400 border-blue-500/30 shadow-xs ${paddingClass}`}
          title="Đã đăng ký ĐGNL HSA - ĐHQGHN"
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>HSA</span>
        </span>
      )}
      {hasVact && (
        <span
          id="badge-vact"
          className={`inline-flex items-center gap-1.5 font-bold rounded-lg border bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-xs ${paddingClass}`}
          title="Đã đăng ký ĐGNL VACT - ĐHQG-HCM"
        >
          <Brain className="w-3.5 h-3.5" />
          <span>VACT</span>
        </span>
      )}
      {hasThptqg && (
        <span
          id="badge-thptqg"
          className={`inline-flex items-center gap-1.5 font-bold rounded-lg border bg-purple-500/15 text-purple-400 border-purple-500/30 shadow-xs ${paddingClass}`}
          title="Đã đăng ký Thi thử Tốt Nghiệp THPTQG"
        >
          <BookOpenCheck className="w-3.5 h-3.5" />
          <span>THPTQG</span>
        </span>
      )}
      {hasHuongnghiep && (
        <span
          id="badge-huongnghiep"
          className={`inline-flex items-center gap-1.5 font-bold rounded-lg border bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30 shadow-xs ${paddingClass}`}
          title="Đã kích hoạt mục Test Hướng nghiệp"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>HƯỚNG NGHIỆP</span>
        </span>
      )}
    </div>
  );
};
