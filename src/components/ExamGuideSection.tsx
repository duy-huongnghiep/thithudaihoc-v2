import React, { useState } from 'react';
import {
  ArrowLeft,
  GraduationCap,
  Brain,
  BookOpenCheck,
  Clock,
  Award,
  HelpCircle,
  Building2,
  Lightbulb,
  Layers,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Target,
} from 'lucide-react';
import { EXAMS_DETAILED_GUIDE } from '../data/examsGuideData';
import { EXAM_GROUPS } from '../data/examsData';

interface ExamGuideSectionProps {
  onBack: () => void;
  onOpenExamLauncher?: (examId: 'hsa' | 'vact' | 'thptqg') => void;
  initialExamId?: 'hsa' | 'vact' | 'thptqg';
}

export const ExamGuideSection: React.FC<ExamGuideSectionProps> = ({
  onBack,
  onOpenExamLauncher,
  initialExamId = 'hsa',
}) => {
  const [selectedExamId, setSelectedExamId] = useState<'hsa' | 'vact' | 'thptqg'>(initialExamId);
  const currentExam = EXAMS_DETAILED_GUIDE[selectedExamId];

  const getThemeClasses = (scheme: 'blue' | 'emerald' | 'purple') => {
    switch (scheme) {
      case 'blue':
        return {
          activeTab: 'bg-blue-600 text-white shadow-lg shadow-blue-600/30',
          border: 'border-blue-500/30',
          bgLight: 'bg-blue-500/10',
          text: 'text-blue-400',
          iconBg: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
          badge: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
          accentBtn: 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/25',
        };
      case 'emerald':
        return {
          activeTab: 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30',
          border: 'border-emerald-500/30',
          bgLight: 'bg-emerald-500/10',
          text: 'text-emerald-400',
          iconBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
          badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          accentBtn: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25',
        };
      case 'purple':
        return {
          activeTab: 'bg-purple-600 text-white shadow-lg shadow-purple-600/30',
          border: 'border-purple-500/30',
          bgLight: 'bg-purple-500/10',
          text: 'text-purple-400',
          iconBg: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
          badge: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
          accentBtn: 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/25',
        };
    }
  };

  const theme = getThemeClasses(currentExam.colorScheme);

  return (
    <div id="exam-guide-section" className="space-y-4 text-slate-200">
      {/* Header bar with Back button */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            id="btn-back-from-guide"
            onClick={onBack}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition flex items-center gap-1 text-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại</span>
          </button>
        </div>
        <div className="text-right">
          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1 justify-end">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Cẩm nang kỳ thi</span>
          </span>
        </div>
      </div>

      {/* Interactive Tabs for the 3 Exams */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#0b0e1a] border border-[#1f2747] rounded-2xl">
        <button
          type="button"
          id="tab-guide-hsa"
          onClick={() => setSelectedExamId('hsa')}
          className={`py-2 px-1 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            selectedExamId === 'hsa'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5 shrink-0" />
          <span>HSA (HN)</span>
        </button>

        <button
          type="button"
          id="tab-guide-vact"
          onClick={() => setSelectedExamId('vact')}
          className={`py-2 px-1 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            selectedExamId === 'vact'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Brain className="w-3.5 h-3.5 shrink-0" />
          <span>VACT (HCM)</span>
        </button>

        <button
          type="button"
          id="tab-guide-thptqg"
          onClick={() => setSelectedExamId('thptqg')}
          className={`py-2 px-1 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            selectedExamId === 'thptqg'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <BookOpenCheck className="w-3.5 h-3.5 shrink-0" />
          <span>THPTQG</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="space-y-4 animate-fadeIn">
        {/* Exam Title & Overview Card */}
        <div className={`p-4 bg-[#0b0e1a] border ${theme.border} rounded-2xl space-y-2.5 shadow-md`}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider mb-1 ${theme.badge}`}>
                {currentExam.shortName}
              </span>
              <h2 className="text-sm sm:text-base font-bold text-white leading-snug">
                {currentExam.fullName}
              </h2>
            </div>
            <div className={`w-9 h-9 rounded-xl ${theme.iconBg} border flex items-center justify-center shrink-0`}>
              {selectedExamId === 'hsa' && <GraduationCap className="w-5 h-5" />}
              {selectedExamId === 'vact' && <Brain className="w-5 h-5" />}
              {selectedExamId === 'thptqg' && <BookOpenCheck className="w-5 h-5" />}
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {currentExam.description}
          </p>

          <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>Đơn vị tổ chức: <strong className="text-slate-300 font-semibold">{currentExam.organizer}</strong></span>
          </div>
        </div>

        {/* Quick Specs Grid (Key Figures) */}
        <div className="grid grid-cols-2 gap-2">
          {/* Scale Score */}
          <div className="p-3 bg-[#0b0e1a] border border-slate-800 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
              <Award className={`w-3.5 h-3.5 ${theme.text}`} />
              <span>Thang Điểm</span>
            </div>
            <div className="text-xs font-bold text-white font-mono">
              {currentExam.scaleScore}
            </div>
          </div>

          {/* Time Limit */}
          <div className="p-3 bg-[#0b0e1a] border border-slate-800 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
              <Clock className={`w-3.5 h-3.5 ${theme.text}`} />
              <span>Thời Gian Thi</span>
            </div>
            <div className="text-xs font-bold text-white">
              {currentExam.totalTime}
            </div>
          </div>

          {/* Total Questions */}
          <div className="p-3 bg-[#0b0e1a] border border-slate-800 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
              <HelpCircle className={`w-3.5 h-3.5 ${theme.text}`} />
              <span>Số Lượng Câu Hỏi</span>
            </div>
            <div className="text-xs font-bold text-white">
              {currentExam.totalQuestions}
            </div>
          </div>

          {/* Format */}
          <div className="p-3 bg-[#0b0e1a] border border-slate-800 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
              <Layers className={`w-3.5 h-3.5 ${theme.text}`} />
              <span>Hình Thức Thi</span>
            </div>
            <div className="text-xs font-bold text-white truncate" title={currentExam.format}>
              {currentExam.format.includes('máy tính') ? 'Thi trên máy tính' : 'Trắc nghiệm chuẩn'}
            </div>
          </div>
        </div>

        {/* Detailed Structure Section (Cấu trúc đề thi & Các môn thi liên quan) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Layers className={`w-3.5 h-3.5 ${theme.text}`} />
              <span>Cấu trúc đề thi & Các môn liên quan</span>
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">
              {currentExam.subjectsBreakdown.length} Phần thi
            </span>
          </div>

          <div className="space-y-2.5">
            {currentExam.subjectsBreakdown.map((subject, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-[#0e1224] border border-slate-800 hover:border-slate-700 rounded-2xl space-y-2 text-xs transition"
              >
                <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-2">
                  <div>
                    <h4 className="font-bold text-white text-xs sm:text-sm">
                      {subject.name}
                    </h4>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-blue-400 font-medium">{subject.duration}</span>
                      <span>•</span>
                      <span>{subject.questions}</span>
                    </div>
                  </div>
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-bold text-[10px] flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                </div>

                {/* Topics covered */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Nội dung & Dạng bài trọng tâm:
                  </span>
                  <ul className="space-y-1 text-[11px] text-slate-300">
                    {subject.topics.map((t, tIdx) => (
                      <li key={tIdx} className="flex items-start gap-1.5 leading-relaxed">
                        <span className={`${theme.text} font-bold`}>•</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Special note */}
                {subject.note && (
                  <div className="p-2 bg-slate-950/60 rounded-xl text-[11px] text-amber-300/90 border border-amber-500/20 flex items-start gap-1.5 mt-2">
                    <span className="font-bold text-amber-400 shrink-0">💡 Lưu ý:</span>
                    <span>{subject.note}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Accepted Universities (Phạm vi công nhận) */}
        <div className="p-3.5 bg-[#0b0e1a] border border-slate-800 rounded-2xl space-y-2 text-xs">
          <div className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 text-xs">
            <Target className="w-3.5 h-3.5 text-indigo-400" />
            <span>Phạm vi công nhận & Xét tuyển Đại học</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            {currentExam.acceptedUniversities}
          </p>
        </div>

        {/* Scoring Details */}
        <div className="p-3.5 bg-[#0b0e1a] border border-slate-800 rounded-2xl space-y-2 text-xs">
          <div className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 text-xs">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Phương thức tính điểm & Thang đo</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            {currentExam.scoringDetails}
          </p>
        </div>

        {/* Strategies & Tips (Chiến thuật làm bài) */}
        <div className="p-3.5 bg-gradient-to-br from-[#0b0e1a] to-[#121830] border border-blue-500/20 rounded-2xl space-y-2 text-xs">
          <div className="font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5 text-xs">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span>Chiến thuật đạt điểm cao</span>
          </div>
          <ul className="space-y-1.5 text-[11px] text-slate-300">
            {currentExam.strategies.map((strategy, sIdx) => (
              <li key={sIdx} className="flex items-start gap-1.5 leading-relaxed">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>{strategy}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Web Support Notice for THPTQG */}
        {selectedExamId === 'thptqg' && (
          <div className="p-3.5 bg-purple-950/40 border border-purple-500/30 rounded-2xl space-y-1.5 text-xs text-purple-200">
            <div className="flex items-center gap-2 font-bold text-purple-300">
              <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
              <span>Lưu ý về hỗ trợ thi thử trực tuyến:</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Kỳ thi tốt nghiệp THPT bao gồm đầy đủ các môn học như trên. Tuy nhiên, <strong>hệ thống web hiện chỉ hỗ trợ thi thử trực tuyến cho 4 môn trọng tâm: Toán học, Vật lý, Hóa học và Sinh học</strong>.
            </p>
          </div>
        )}

        {/* V-ACT Special Notice */}
        {selectedExamId === 'vact' && (
          <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl space-y-1.5 text-xs text-emerald-200">
            <div className="flex items-center gap-2 font-bold text-emerald-300">
              <Brain className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Quy chế thời gian & Hình thức thi V-ACT:</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Bài thi gồm <strong>120 câu hỏi trắc nghiệm</strong> làm liên tục trong <strong>150 phút trên giấy (tô phiếu trắc nghiệm)</strong>. Đề thi <strong>không chia khung giờ riêng cho từng phần</strong>, thí sinh hoàn toàn chủ động phân chia thời gian làm bài.
            </p>
          </div>
        )}

        {/* Login to Take Test Guide Notice */}
        <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-amber-400">
            <HelpCircle className="w-4 h-4 shrink-0" />
            <span>Bạn muốn bắt đầu thi thử?</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Hệ thống thi thử trực tuyến yêu cầu đăng nhập tài khoản thí sinh để lưu lại lịch sử làm bài và chấm điểm tự động. Vui lòng quay lại màn hình chính và đăng nhập bằng <strong>Số điện thoại</strong> hoặc <strong>Mã thí sinh</strong> của bạn.
          </p>
        </div>

        {/* Back to Home Button */}
        <button
          type="button"
          id="btn-back-to-home-from-guide"
          onClick={onBack}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-blue-600/25"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Quay lại trang Đăng nhập</span>
        </button>
      </div>
    </div>
  );
};
