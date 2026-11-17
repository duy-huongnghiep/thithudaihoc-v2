import React from 'react';
import { isYes } from '../services/api';
import { SheetGlobalConfig, StudentInfo } from '../types';
import { BookOpenCheck, Brain, GraduationCap, Compass } from 'lucide-react';

interface ExamBadgesProps {
  student: StudentInfo;
  size?: 'sm' | 'md';
  globalConfig?: SheetGlobalConfig;
}

export const ExamBadges: React.FC<ExamBadgesProps> = ({ student, size = 'sm', globalConfig }) => {
  const gateLoaded = Boolean(globalConfig?.loadedFromSheet4);
  const hasHsa = isYes(student.hsa) && (!gateLoaded || Boolean(globalConfig?.enableHsa));
  const hasVact = isYes(student.vact) && (!gateLoaded || Boolean(globalConfig?.enableVact));
  const hasThptqg = isYes(student.thptqg) && (!gateLoaded || Boolean(globalConfig?.enableThptqg));
  const hasHuongnghiep =
    isYes(student.huongnghiep) && (!gateLoaded || Boolean(globalConfig?.enableHuongnghiep));

  if (!hasHsa && !hasVact && !hasThptqg && !hasHuongnghiep) {
    return (
      <span className="text-slate-400 text-xs italic">Chưa đăng ký môn thi nào</span>
    );
  }

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {hasHsa && (
        <span
          id="badge-hsa"
          className={`inline-flex items-center gap-1.5 font-semibold rounded-md bg-blue-500/12 text-blue-300 ${sizeClass}`}
          title="Đã đăng ký ĐGNL HSA - ĐHQGHN"
        >
          <GraduationCap className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span>HSA</span>
        </span>
      )}
      {hasVact && (
        <span
          id="badge-vact"
          className={`inline-flex items-center gap-1.5 font-semibold rounded-md bg-emerald-500/12 text-emerald-300 ${sizeClass}`}
          title="Đã đăng ký ĐGNL VACT - ĐHQG-HCM"
        >
          <Brain className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>VACT</span>
        </span>
      )}
      {hasThptqg && (
        <span
          id="badge-thptqg"
          className={`inline-flex items-center gap-1.5 font-semibold rounded-md bg-purple-500/12 text-purple-300 ${sizeClass}`}
          title="Đã đăng ký Thi thử Tốt Nghiệp THPTQG"
        >
          <BookOpenCheck className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span>THPTQG</span>
        </span>
      )}
      {hasHuongnghiep && (
        <span
          id="badge-huongnghiep"
          className={`inline-flex items-center gap-1.5 font-semibold rounded-md bg-fuchsia-500/12 text-fuchsia-300 ${sizeClass}`}
          title="Đã kích hoạt mục Test Hướng nghiệp"
        >
          <Compass className="w-3.5 h-3.5 text-fuchsia-400 shrink-0" />
          <span>Hướng nghiệp</span>
        </span>
      )}
    </div>
  );
};
