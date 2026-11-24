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
          badge: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
        };
      case 'emerald':
        return {
          border: 'border-emerald-500/35',
          text: 'text-emerald-400',
          badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        };
      case 'purple':
        return {
          border: 'border-purple-500/35',
          text: 'text-purple-400',
          badge: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
        };
    }
  };

  const theme = getThemeClasses(currentExam.colorScheme);

  return (
    <div id="exam-guide-section" className="space-y-5 text-slate-200">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
        <button
          type="button"
          id="btn-back-from-guide"
          onClick={onBack}
          className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#0c1020] hover:bg-slate-800 border border-slate-700 text-slate-200 transition flex items-center gap-1.5 text-xs font-bold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
          <BookOpen className="w-4 h-4 text-blue-400" />
          <span>Cẩm nang Các Kỳ Thi</span>
        </div>
      </div>

      {/* Exam Selector Tabs */}
      <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-[#090b16] border border-slate-800 rounded-2xl">
        <button
          type="button"
          id="tab-guide-hsa"
          onClick={() => setSelectedExamId('hsa')}
          className={`min-h-[42px] py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
            selectedExamId === 'hsa'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
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
          className={`min-h-[42px] py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
            selectedExamId === 'vact'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Brain className="w-4 h-4 shrink-0" />
          <span>V-ACT (HCM)</span>
        </button>

        <button
          type="button"
          id="tab-guide-thptqg"
          onClick={() => setSelectedExamId('thptqg')}
          className={`min-h-[42px] py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
            selectedExamId === 'thptqg'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
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
        <div className={`p-5 bg-[#0c1020] border ${theme.border} rounded-2xl space-y-3`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className={`inline-block px-2 py-0.5 rounded-md border text-[11px] font-bold mb-1.5 ${theme.badge}`}>
                {currentExam.shortName}
              </span>
              <h2 className="text-lg font-extrabold text-white leading-snug">
                {currentExam.fullName}
              </h2>
            </div>
            <div className="text-slate-400 shrink-0 mt-1">
              {selectedExamId === 'hsa' && <GraduationCap className="w-6 h-6 text-blue-400" />}
              {selectedExamId === 'vact' && <Brain className="w-6 h-6 text-emerald-400" />}
              {selectedExamId === 'thptqg' && <BookOpenCheck className="w-6 h-6 text-purple-400" />}
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {currentExam.description}
          </p>

          <div className="text-xs text-slate-400 pt-2.5 border-t border-slate-800 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
            <span>
              Đơn vị tổ chức: <strong className="text-slate-200">{currentExam.organizer}</strong>
            </span>
          </div>
        </div>

        {/* 4-Column Quick Specs Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3.5 bg-[#0c1020] border border-slate-800 rounded-2xl space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold uppercase">
              <Award className={`w-3.5 h-3.5 ${theme.text}`} />
              <span>Thang điểm</span>
            </div>
            <div className="text-sm font-extrabold text-white font-mono tabular-nums">
              {currentExam.scaleScore}
            </div>
          </div>

          <div className="p-3.5 bg-[#0c1020] border border-slate-800 rounded-2xl space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold uppercase">
              <Clock className={`w-3.5 h-3.5 ${theme.text}`} />
              <span>Thời gian</span>
            </div>
            <div className="text-sm font-extrabold text-white tabular-nums">
              {currentExam.totalTime}
            </div>
          </div>

          <div className="p-3.5 bg-[#0c1020] border border-slate-800 rounded-2xl space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold uppercase">
              <HelpCircle className={`w-3.5 h-3.5 ${theme.text}`} />
              <span>Số câu hỏi</span>
            </div>
            <div className="text-sm font-extrabold text-white tabular-nums">
              {currentExam.totalQuestions}
            </div>
          </div>

          <div className="p-3.5 bg-[#0c1020] border border-slate-800 rounded-2xl space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold uppercase">
              <Layers className={`w-3.5 h-3.5 ${theme.text}`} />
              <span>Hình thức</span>
            </div>
            <div className="text-sm font-extrabold text-white truncate" title={currentExam.format}>
              {currentExam.format.includes('máy tính') ? 'Thi trên máy tính' : 'Trắc nghiệm chuẩn'}
            </div>
          </div>
        </div>

        {/* Detailed Structure Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className={`w-4 h-4 ${theme.text}`} />
              <span>Cấu trúc đề thi &amp; Các phần thi</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono tabular-nums">
              {currentExam.subjectsBreakdown.length} phần thi
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {currentExam.subjectsBreakdown.map((subject, idx) => (
              <div
                key={idx}
                className="p-4 bg-[#0c1020] border border-slate-800 rounded-2xl space-y-3 text-xs"
              >
                <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="font-bold text-white text-sm">
                      {subject.name}
                    </h4>
                    <div className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                      <span className={`font-mono tabular-nums font-bold ${theme.text}`}>
                        {subject.duration}
                      </span>
                      <span>•</span>
                      <span>{subject.questions}</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500 tabular-nums shrink-0">
                    #{String(idx + 1).padStart(2, '0')}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 block">
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
                  <div className="pt-2 border-t border-slate-800 text-xs text-amber-200/90 leading-relaxed">
                    <strong className="text-amber-300">Lưu ý: </strong>
                    {subject.note}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Universities & Scoring 2-Column */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div className="p-4 sm:p-5 bg-[#0c1020] border border-slate-800 rounded-2xl space-y-2 text-xs">
            <div className="font-bold text-blue-300 uppercase tracking-wider text-[11px] flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-400" />
              <span>Phạm vi công nhận &amp; Xét tuyển</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              {currentExam.acceptedUniversities}
            </p>
          </div>

          <div className="p-4 sm:p-5 bg-[#0c1020] border border-slate-800 rounded-2xl space-y-2 text-xs">
            <div className="font-bold text-amber-300 uppercase tracking-wider text-[11px] flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Phương thức tính điểm</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              {currentExam.scoringDetails}
            </p>
          </div>
        </div>

        {/* Strategies */}
        <div className="p-4 sm:p-5 bg-[#0c1020] border border-slate-800 rounded-2xl space-y-3 text-xs">
          <div className="font-bold text-amber-300 uppercase tracking-wider text-[11px] flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span>Chiến thuật làm bài hiệu quả</span>
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
          <div className="p-4 bg-[#141028] border border-purple-500/30 rounded-2xl space-y-1 text-xs">
            <div className="font-bold text-purple-300">
              Lưu ý về hỗ trợ thi thử trực tuyến
            </div>
            <p className="text-slate-300 leading-relaxed">
              Kỳ thi tốt nghiệp THPT bao gồm đầy đủ các môn học như trên. Hệ thống web hiện hỗ trợ thi thử trực tuyến cho <strong>4 môn trọng tâm: Toán học, Vật lý, Hóa học và Sinh học</strong>.
            </p>
          </div>
        )}

        {selectedExamId === 'vact' && (
          <div className="p-4 bg-[#0d1c19] border border-emerald-500/30 rounded-2xl space-y-1 text-xs">
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
          className="w-full min-h-[46px] py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại</span>
        </button>
      </div>
    </div>
  );
};
