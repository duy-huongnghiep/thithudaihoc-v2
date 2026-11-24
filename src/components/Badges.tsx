import React from 'react';
import { isYes } from '../services/api';
import { SheetGlobalConfig, StudentInfo } from '../types';

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

  const items: Array<{ id: string; label: string; title: string; classes: string }> = [];
  if (hasHsa) {
    items.push({
      id: 'badge-hsa',
      label: 'ĐGNL HSA',
      title: 'Đã đăng ký ĐGNL HSA - ĐHQGHN',
      classes: 'bg-blue-500/15 text-blue-300 border-blue-500/35',
    });
  }
  if (hasVact) {
    items.push({
      id: 'badge-vact',
      label: 'ĐGNL V-ACT',
      title: 'Đã đăng ký ĐGNL V-ACT - ĐHQG-HCM',
      classes: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35',
    });
  }
  if (hasThptqg) {
    items.push({
      id: 'badge-thptqg',
      label: 'THPT Quốc Gia',
      title: 'Đã đăng ký Thi thử Tốt Nghiệp THPTQG',
      classes: 'bg-purple-500/15 text-purple-300 border-purple-500/35',
    });
  }
  if (hasHuongnghiep) {
    items.push({
      id: 'badge-huongnghiep',
      label: 'Hướng nghiệp',
      title: 'Đã kích hoạt mục Test Hướng nghiệp',
      classes: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/35',
    });
  }

  if (items.length === 0) {
    return (
      <span className="text-slate-500 text-xs italic">Chưa đăng ký môn thi nào</span>
    );
  }

  const sizeClass =
    size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item.id}
          id={item.id}
          title={item.title}
          className={`inline-flex items-center rounded-lg border font-bold ${sizeClass} ${item.classes}`}
        >
          {item.label}
        </span>
      ))}
    </div>
  );
};
