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
  Target,
  BookOpen,
} from 'lucide-react';
import { EXAMS_DETAILED_GUIDE } from '../data/examsGuideData';

interface ExamGuideSectionProps {
  onBack: () => void;
  initialExamId?: 'hsa' | 'vact' | 'thptqg';
}

export const ExamGuideSection: React.FC<ExamGuideSectionProps> = ({
  onBack,
  initialExamId = 'hsa',
}) => {
  const [selectedExamId, setSelectedExamId] = useState<'hsa' | 'vact' | 'thptqg'>(initialExamId);
  const currentExam = EXAMS_DETAILED_GUIDE[selectedExamId];

  const getThemeClasses = (scheme: 'blue' | 'emerald' | 'purple') => {
    switch (scheme) {
      case 'blue':
        return {
          border: 'border-blue-500/35',
          text: 'text-blue-400',
          iconBg: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
        };
      case 'emerald':
        return {
          border: 'border-emerald-500/35',
          text: 'text-emerald-400',
          iconBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        };
      case 'purple':
        return {
          border: 'border-purple-500/35',
          text: 'text-purple-400',
          iconBg: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
        };
    }
  };

  const theme = getThemeClasses(currentExam.colorScheme);

  return (
    <div id="exam-guide-section" className="space-y-5 text-slate-200">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <button
          type="button"
          id="btn-back-from-guide"
          onClick={onBack}
          className="min-h-[40px] px-3 py-1.5 rounded-xl bg-[#0c1020] hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại</span>
        </button>

        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider">
          <BookOpen className="w-4 h-4 text-blue-400" />
          <span>Cẩm nang kỳ thi</span>
        </div>
      </div>

      {/* Interactive Tabs */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#080b16] border border-slate-800 rounded-xl">
        <button
          type="button"
          id="tab-guide-hsa"
          onClick={() => setSelectedExamId('hsa')}
          className={`min-h-[44px] py-2 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            selectedExamId === 'hsa'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <GraduationCap className="w-4 h-4 shrink-0" />
          <span>HSA (HN)</span>
        </button>

        <button
          type="button"
          id="tab-guide-vact"
          onClick={() => setSelectedExamId('vact')}
          className={`min-h-[44px] py-2 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            selectedExamId === 'vact'
              ? 'bg-emerald-600 text-white'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Brain className="w-4 h-4 shrink-0" />
          <span>VACT (HCM)</span>
        </button>

        <button
          type="button"
          id="tab-guide-thptqg"
          onClick={() => setSelectedExamId('thptqg')}
          className={`min-h-[44px] py-2 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            selectedExamId === 'thptqg'
              ? 'bg-purple-600 text-white'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpenCheck className="w-4 h-4 shrink-0" />
          <span>THPTQG</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="space-y-4 animate-fadeIn">
        {/* Overview */}
        <div className={`p-4 sm:p-5 bg-[#0c1020] border ${theme.border} rounded-2xl space-y-3`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className={`text-[11px] font-bold uppercase tracking-wider ${theme.text} block mb-1`}>
                {currentExam.shortName}
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white leading-snug">
                {currentExam.fullName}
              </h2>
            </div>
            <div className={`w-10 h-10 rounded-xl ${theme.iconBg} border flex items-center justify-center shrink-0`}>
              {selectedExamId === 'hsa' && <GraduationCap className="w-5 h-5" />}
              {selectedExamId === 'vact' && <Brain className="w-5 h-5" />}
              {selectedExamId === 'thptqg' && <BookOpenCheck className="w-5 h-5" />}
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {currentExam.description}
          </p>

          <div className="text-xs text-slate-400 pt-2 border-t border-slate-800/80 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
            <span>
              Đơn vị tổ chức: <strong className="text-slate-200">{currentExam.organizer}</strong>
            </span>
          </div>
        </div>

        {/* 4-Column Quick Specs Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          <div className="p-3.5 bg-[#0c1020] border border-slate-800 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
              <Award className={`w-3.5 h-3.5 ${theme.text}`} />
              <span>Thang điểm</span>
            </div>
            <div className="text-xs sm:text-sm font-bold text-white font-mono tabular-nums">
              {currentExam.scaleScore}
            </div>
          </div>

          <div className="p-3.5 bg-[#0c1020] border border-slate-800 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
              <Clock className={`w-3.5 h-3.5 ${theme.text}`} />
              <span>Thời gian thi</span>
            </div>
            <div className="text-xs sm:text-sm font-bold text-white tabular-nums">
              {currentExam.totalTime}
            </div>
          </div>

          <div className="p-3.5 bg-[#0c1020] border border-slate-800 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
              <HelpCircle className={`w-3.5 h-3.5 ${theme.text}`} />
              <span>Số câu hỏi</span>
            </div>
            <div className="text-xs sm:text-sm font-bold text-white tabular-nums">
              {currentExam.totalQuestions}
            </div>
          </div>

          <div className="p-3.5 bg-[#0c1020] border border-slate-800 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
              <Layers className={`w-3.5 h-3.5 ${theme.text}`} />
              <span>Hình thức thi</span>
            </div>
            <div className="text-xs sm:text-sm font-bold text-white truncate" title={currentExam.format}>
              {currentExam.format.includes('máy tính') ? 'Thi trên máy tính' : 'Trắc nghiệm chuẩn'}
            </div>
          </div>
        </div>

        {/* Detailed Structure Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Layers className={`w-4 h-4 ${theme.text}`} />
              <span>Cấu trúc đề thi &amp; Các môn liên quan</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono tabular-nums">
              {currentExam.subjectsBreakdown.length} phần thi
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentExam.subjectsBreakdown.map((subject, idx) => (
              <div
                key={idx}
                className="p-4 bg-[#0c1020] border border-slate-800 rounded-2xl space-y-2.5 text-xs"
              >
                <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                  <div>
                    <h4 className="font-bold text-white text-sm">
                      {subject.name}
                    </h4>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-1">
                      <span className="font-mono tabular-nums text-blue-400 font-semibold">
                        {subject.duration}
                      </span>
                      <span>·</span>
                      <span>{subject.questions}</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500 tabular-nums shrink-0">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Nội dung trọng tâm
                  </span>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {subject.topics.map((t, tIdx) => (
                      <li key={tIdx} className="flex items-start gap-2 leading-relaxed">
                        <span className={`${theme.text} font-bold`}>•</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {subject.note && (
                  <div className="p-2.5 bg-amber-950/20 rounded-xl text-[11px] text-amber-200/90 border border-amber-500/20 leading-relaxed">
                    <strong className="text-amber-400">Lưu ý: </strong>
                    {subject.note}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Universities & Scoring 2-Column */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-4 bg-[#0c1020] border border-slate-800 rounded-2xl space-y-2 text-xs">
            <div className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Target className="w-4 h-4 text-indigo-400" />
              <span>Phạm vi công nhận &amp; Xét tuyển</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              {currentExam.acceptedUniversities}
            </p>
          </div>

          <div className="p-4 bg-[#0c1020] border border-slate-800 rounded-2xl space-y-2 text-xs">
            <div className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Phương thức tính điểm</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              {currentExam.scoringDetails}
            </p>
          </div>
        </div>

        {/* Strategies */}
        <div className="p-4 bg-[#0c1020] border border-blue-500/25 rounded-2xl space-y-2.5 text-xs">
          <div className="font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span>Chiến thuật đạt điểm cao</span>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-300">
            {currentExam.strategies.map((strategy, sIdx) => (
              <li key={sIdx} className="flex items-start gap-2 leading-relaxed">
                <span className="text-emerald-400 font-bold shrink-0">✓</span>
                <span>{strategy}</span>
              </li>
            ))}
          </ul>
        </div>

        {selectedExamId === 'thptqg' && (
          <div className="p-4 bg-purple-950/25 border border-purple-500/30 rounded-2xl space-y-1 text-xs">
            <div className="font-bold text-purple-300">
              Lưu ý về hỗ trợ thi thử trực tuyến
            </div>
            <p className="text-slate-300 leading-relaxed">
              Kỳ thi tốt nghiệp THPT bao gồm đầy đủ các môn học như trên. Hệ thống web hiện hỗ trợ thi thử trực tuyến cho <strong>4 môn trọng tâm: Toán học, Vật lý, Hóa học và Sinh học</strong>.
            </p>
          </div>
        )}

        {selectedExamId === 'vact' && (
          <div className="p-4 bg-emerald-950/25 border border-emerald-500/30 rounded-2xl space-y-1 text-xs">
            <div className="font-bold text-emerald-300">
              Quy chế thời gian &amp; Hình thức thi V-ACT
            </div>
            <p className="text-slate-300 leading-relaxed">
              Bài thi gồm <strong>120 câu hỏi trắc nghiệm</strong> làm liên tục trong <strong>150 phút trên giấy (tô phiếu trắc nghiệm)</strong>. Đề thi không chia khung giờ riêng cho từng phần, thí sinh chủ động phân bổ thời gian.
            </p>
          </div>
        )}

        <button
          type="button"
          id="btn-back-to-home-from-guide"
          onClick={onBack}
          className="w-full min-h-[46px] py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại</span>
        </button>
      </div>
    </div>
  );
};
