import React from 'react';
import {
  Clock,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  X,
  Play,
} from 'lucide-react';
import { ExamSection, StudentInfo } from '../types';
import { getExamSchedule } from '../services/api';

interface ExamLauncherModalProps {
  section: ExamSection | null;
  categoryName: string;
  student?: StudentInfo;
  onClose: () => void;
}

export const ExamLauncherModal: React.FC<ExamLauncherModalProps> = ({
  section,
  categoryName,
  student,
  onClose,
}) => {
  if (!section) return null;

  const schedule = getExamSchedule(student);
  const isOpen = schedule.status === 'OPEN' || schedule.status === 'FREE_TESTING';

  const handleStartExam = () => {
    if (!isOpen) return;
    window.open(section.url, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div
      id="exam-launcher-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="exam-launcher-modal"
        className="w-full max-w-md bg-[#121629] border border-slate-700/80 rounded-3xl p-6 shadow-2xl space-y-4 text-slate-200 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-500 hover:text-slate-200 transition p-1.5 rounded-lg hover:bg-slate-800"
          title="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1 pr-6">
          <div className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
            {categoryName}
          </div>
          <h3 className="text-lg font-bold text-white leading-snug">
            {section.title}
          </h3>
          <p className="text-xs text-slate-400">{section.subtitle}</p>
        </div>

        {/* Exam Quick Specs */}
        <div className="grid grid-cols-2 gap-2.5 py-1">
          <div className="bg-[#0b0e1a] border border-slate-800 p-3 rounded-xl flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-blue-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-500 uppercase">Thời gian làm bài</div>
              <div className="text-sm font-bold text-white font-mono">
                {section.durationMinutes} Phút
              </div>
            </div>
          </div>
          <div className="bg-[#0b0e1a] border border-slate-800 p-3 rounded-xl flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-500 uppercase">Hình thức thi</div>
              <div className="text-sm font-bold text-white">Trắc nghiệm Online</div>
            </div>
          </div>
        </div>

        {/* Description & Rules */}
        <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-xs space-y-1 text-amber-200/90">
          <div className="font-bold flex items-center gap-1.5 text-amber-300">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Quy định làm bài thi:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-300 pl-1">
            <li>Hệ thống tính giờ tự động ngay sau khi mở đề.</li>
            <li>Không chuyển đổi qua lại nhiều tab trong lúc thi.</li>
            <li>Sau khi hoàn thành, bấm nút Nộp bài để xem điểm và lời giải chi tiết.</li>
          </ul>
        </div>

        {/* Schedule Notice if not open */}
        {!isOpen && (
          <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl text-xs space-y-1 text-rose-300">
            <div className="font-bold flex items-center gap-1.5 text-rose-400">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Chưa thể vào thi thử:</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {schedule.statusMessage}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="pt-2 flex items-center gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition cursor-pointer"
          >
            Đóng
          </button>
          <button
            type="button"
            id="btn-confirm-start-exam"
            disabled={!isOpen}
            onClick={handleStartExam}
            className={`flex-2 py-3 font-bold rounded-xl transition text-xs flex items-center justify-center gap-2 ${
              isOpen
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/20 cursor-pointer'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isOpen ? 'Mở Đề & Bắt Đầu Thi' : 'Phòng Thi Đang Khóa'}</span>
            {isOpen && <ExternalLink className="w-3 h-3 text-white/80" />}
          </button>
        </div>
      </div>
    </div>
  );
};
