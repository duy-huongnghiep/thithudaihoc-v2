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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="exam-launcher-modal"
        className="w-full max-w-md bg-[#0e1120] border border-blue-500/35 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 text-slate-200 relative max-h-[92dvh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3.5 top-3.5 min-w-[38px] min-h-[38px] flex items-center justify-center text-slate-400 hover:text-white transition rounded-xl hover:bg-slate-800 cursor-pointer"
          title="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1 pr-10">
          <div className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
            {categoryName}
          </div>
          <h3 className="text-lg font-extrabold text-white leading-snug">
            {section.title}
          </h3>
          <p className="text-xs text-slate-400">{section.subtitle}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#080b16] border border-slate-800 p-3 rounded-2xl flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-blue-400 shrink-0" />
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Thời gian</div>
              <div className="text-sm font-extrabold text-white font-mono tabular-nums">
                {section.durationMinutes} phút
              </div>
            </div>
          </div>
          <div className="bg-[#080b16] border border-slate-800 p-3 rounded-2xl flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Hình thức</div>
              <div className="text-sm font-extrabold text-white">Trực tuyến</div>
            </div>
          </div>
        </div>

        <div className="bg-amber-950/30 border border-amber-500/30 p-3.5 rounded-2xl text-xs space-y-1.5 text-slate-200">
          <div className="font-bold flex items-center gap-1.5 text-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>Quy định làm bài thi</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-xs text-slate-300 pl-0.5 leading-relaxed">
            <li>Hệ thống tính giờ tự động ngay sau khi mở đề.</li>
            <li>Hạn chế chuyển tab liên tục trong lúc làm bài.</li>
            <li>Bấm Nộp bài sau khi hoàn thành để xem điểm và lời giải chi tiết.</li>
          </ul>
        </div>

        {!isOpen && (
          <div className="bg-rose-950/35 border border-rose-500/35 p-3.5 rounded-2xl text-xs space-y-1 text-rose-300">
            <div className="font-bold flex items-center gap-1.5 text-rose-400">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>Chưa thể vào thi thử</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {schedule.statusMessage}
            </p>
          </div>
        )}

        <div className="pt-1 flex items-center gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 py-2 bg-[#14182b] hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition cursor-pointer"
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
              className="flex-1 min-h-[44px] px-4 py-2 font-bold rounded-xl transition text-xs sm:text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/25 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current shrink-0" />
              <span>Mở đề &amp; Bắt đầu thi</span>
              <ExternalLink className="w-3.5 h-3.5 text-white/80 shrink-0" />
            </a>
          ) : (
            <button
              type="button"
              id="btn-confirm-start-exam"
              disabled
              className="flex-1 min-h-[44px] px-4 py-2 font-bold rounded-xl transition text-xs sm:text-sm flex items-center justify-center gap-2 bg-[#080b16] text-slate-500 border border-slate-800 cursor-not-allowed opacity-60"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Phòng thi đang khóa</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
