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
import { getExamSchedule, getExamSectionUrl } from '../services/api';

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
  const targetUrl = getExamSectionUrl(section.id, section.url);

  return (
    <div
      id="exam-launcher-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="exam-launcher-modal"
        className="w-full max-w-md bg-[#111526] border border-slate-700/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 text-slate-200 relative max-h-[92dvh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 min-w-[40px] min-h-[40px] flex items-center justify-center text-slate-400 hover:text-white transition rounded-xl hover:bg-slate-800 cursor-pointer"
          title="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1 pr-10">
          <div className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
            {categoryName}
          </div>
          <h3 className="text-lg font-bold text-white leading-snug">
            {section.title}
          </h3>
          <p className="text-xs text-slate-400">{section.subtitle}</p>
        </div>

        {/* Exam Quick Specs */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-[#080b16] border border-slate-800 p-3 rounded-xl flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-blue-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Thời gian</div>
              <div className="text-sm font-bold text-white font-mono tabular-nums">
                {section.durationMinutes} phút
              </div>
            </div>
          </div>
          <div className="bg-[#080b16] border border-slate-800 p-3 rounded-xl flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Hình thức</div>
              <div className="text-sm font-bold text-white">Trực tuyến</div>
            </div>
          </div>
        </div>

        {/* Description & Rules */}
        <div className="bg-amber-950/25 border border-amber-500/25 p-3.5 rounded-xl text-xs space-y-1.5 text-amber-200/90">
          <div className="font-bold flex items-center gap-1.5 text-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>Quy định làm bài thi</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-300 pl-0.5 leading-relaxed">
            <li>Hệ thống tính giờ tự động ngay sau khi mở đề.</li>
            <li>Hạn chế chuyển tab liên tục trong lúc làm bài.</li>
            <li>Bấm Nộp bài sau khi hoàn thành để xem điểm và lời giải chi tiết.</li>
          </ul>
        </div>

        {!isOpen && (
          <div className="bg-rose-950/25 border border-rose-500/30 p-3.5 rounded-xl text-xs space-y-1 text-rose-300">
            <div className="font-bold flex items-center gap-1.5 text-rose-400">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>Chưa thể vào thi thử</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {schedule.statusMessage}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="pt-1 flex items-center gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[46px] px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition cursor-pointer"
          >
            Đóng
          </button>
          {isOpen ? (
            <a
              id="btn-confirm-start-exam"
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="flex-1 min-h-[46px] px-4 py-2.5 font-bold rounded-xl transition text-xs sm:text-sm flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current shrink-0" />
              <span>Mở Đề &amp; Bắt Đầu Thi</span>
              <ExternalLink className="w-3.5 h-3.5 text-white/80 shrink-0" />
            </a>
          ) : (
            <button
              type="button"
              id="btn-confirm-start-exam"
              disabled
              className="flex-1 min-h-[46px] px-4 py-2.5 font-bold rounded-xl transition text-xs sm:text-sm flex items-center justify-center gap-2 bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Phòng Thi Đang Khóa</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
