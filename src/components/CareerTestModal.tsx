import React, { useState } from 'react';
import {
  Compass,
  X,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  RotateCcw,
  GraduationCap,
  Briefcase,
  Layers,
  Building2,
} from 'lucide-react';
import { StudentInfo } from '../types';

interface CareerTestModalProps {
  student: StudentInfo;
  onClose: () => void;
}

interface Question {
  id: number;
  type: 'R' | 'I' | 'A' | 'S' | 'E' | 'C';
  typeName: string;
  question: string;
}

const QUESTIONS: Question[] = [
  // R - Realistic (Thực tế, Kỹ thuật)
  {
    id: 1,
    type: 'R',
    typeName: 'Kỹ thuật / Thực tế',
    question: 'Bạn thích lắp ráp, sửa chữa thiết bị công nghệ, đồ điện tử hoặc máy móc.',
  },
  {
    id: 2,
    type: 'R',
    typeName: 'Kỹ thuật / Thực tế',
    question: 'Bạn thích các hoạt động thực hành, đo đạc trực quan hơn là nghe lý thuyết dài dòng.',
  },
  {
    id: 3,
    type: 'R',
    typeName: 'Kỹ thuật / Thực tế',
    question: 'Bạn có hứng thú khám phá cơ chế phần cứng máy tính, robot hoặc các thiết bị tự động.',
  },

  // I - Investigative (Nghiên cứu, Khoa học)
  {
    id: 4,
    type: 'I',
    typeName: 'Nghiên cứu / Khoa học',
    question: 'Bạn say mê tìm lời giải cho các bài toán hóc búa, câu hỏi logic hoặc các định luật tự nhiên.',
  },
  {
    id: 5,
    type: 'I',
    typeName: 'Nghiên cứu / Khoa học',
    question: 'Bạn thích đào sâu tìm hiểu nguyên nhân gốc rễ và phân tích dữ liệu trước khi đưa ra nhận định.',
  },
  {
    id: 6,
    type: 'I',
    typeName: 'Nghiên cứu / Khoa học',
    question: 'Bạn hứng thú với trí tuệ nhân tạo (AI), thuật toán số hóa hoặc các nghiên cứu sinh - y học.',
  },

  // A - Artistic (Nghệ thuật, Sáng tạo)
  {
    id: 7,
    type: 'A',
    typeName: 'Nghệ thuật / Sáng tạo',
    question: 'Bạn thích vẽ tranh, chụp ảnh, dựng video, thiết kế hoặc các công việc giàu tính thẩm mỹ.',
  },
  {
    id: 8,
    type: 'A',
    typeName: 'Nghệ thuật / Sáng tạo',
    question: 'Bạn thích viết lách, sáng tạo nội dung và thể hiện cảm xúc cá nhân độc đáo.',
  },
  {
    id: 9,
    type: 'A',
    typeName: 'Nghệ thuật / Sáng tạo',
    question: 'Bạn thấy khó chịu với những quy tắc gò bó rập khuôn và luôn muốn tự do đổi mới phong cách.',
  },

  // S - Social (Xã hội, Tương tác)
  {
    id: 10,
    type: 'S',
    typeName: 'Xã hội / Hỗ trợ',
    question: 'Bạn thích lắng nghe, an ủi, tư vấn và giúp đỡ bạn bè vượt qua khó khăn trong học tập và cuộc sống.',
  },
  {
    id: 11,
    type: 'S',
    typeName: 'Xã hội / Hỗ trợ',
    question: 'Bạn hào hứng tham gia các hoạt động tình nguyện, câu lạc bộ thiện nguyện hoặc dự án cộng đồng.',
  },
  {
    id: 12,
    type: 'S',
    typeName: 'Xã hội / Hỗ trợ',
    question: 'Bạn có mong muốn giảng dạy, truyền cảm hứng hoặc chăm sóc sức khỏe cộng đồng.',
  },

  // E - Enterprising (Quản lý, Kinh doanh)
  {
    id: 13,
    type: 'E',
    typeName: 'Quản lý / Kinh doanh',
    question: 'Bạn thích kinh doanh, đàm phán thuyết phục hoặc quản lý nguồn tài chính cá nhân hiệu quả.',
  },
  {
    id: 14,
    type: 'E',
    typeName: 'Quản lý / Kinh doanh',
    question: 'Bạn thường tự tin nhận vai trò nhóm trưởng, tổ chức sự kiện và phân chia công việc cho thành viên.',
  },
  {
    id: 15,
    type: 'E',
    typeName: 'Quản lý / Kinh doanh',
    question: 'Bạn có đam mê xây dựng thương hiệu cá nhân, tham gia thi khởi nghiệp hoặc làm marketing.',
  },

  // C - Conventional (Nghiệp vụ, Tổ chức)
  {
    id: 16,
    type: 'C',
    typeName: 'Nghiệp vụ / Quy chuẩn',
    question: 'Bạn luôn làm việc có kế hoạch, ghi chép ngăn nắp và chú ý đến từng tiểu tiết nhỏ nhất.',
  },
  {
    id: 17,
    type: 'C',
    typeName: 'Nghiệp vụ / Quy chuẩn',
    question: 'Bạn thích làm việc với các bảng biểu số liệu Excel, hóa đơn, thống kê và quy trình chuẩn chỉ.',
  },
  {
    id: 18,
    type: 'C',
    typeName: 'Nghiệp vụ / Quy chuẩn',
    question: 'Bạn tôn trọng tính kỷ luật, đúng hạn chót và quy định chung của tập thể.',
  },
];

const TRAIT_INFO: Record<
  'R' | 'I' | 'A' | 'S' | 'E' | 'C',
  {
    name: string;
    fullName: string;
    color: string;
    badgeBg: string;
    summary: string;
    majors: string[];
    universities: string[];
    examFocus: string;
  }
> = {
  R: {
    name: 'Realistic',
    fullName: 'Nhóm Kỹ thuật & Thực tế',
    color: 'from-orange-500 to-amber-500',
    badgeBg: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    summary:
      'Bạn là người thực tế, hành động độc lập, có năng khiếu thao tác với máy móc, phần cứng kỹ thuật và công cụ chính xác.',
    majors: [
      'Công nghệ Kỹ thuật Cơ điện tử & Ô tô',
      'Kỹ thuật Điện - Điện tử & Vi mạch bán dẫn',
      'Kỹ thuật Xây dựng & Kiến trúc công trình',
      'Công nghệ phần cứng & Mạng máy tính',
      'Nông nghiệp công nghệ cao & Lâm nghiệp',
    ],
    universities: [
      'Đại học Bách Khoa Hà Nội & ĐHBK ĐHQG-HCM',
      'Trường ĐH Công nghệ - ĐHQGHN (UET)',
      'Đại học Sư phạm Kỹ thuật TP.HCM / Hà Nội',
      'Đại học Giao thông Vận tải',
    ],
    examFocus: 'HSA (Định lượng + KHTN), VACT (Toán + KHTN), THPTQG Khối A00, A01',
  },
  I: {
    name: 'Investigative',
    fullName: 'Nhóm Nghiên cứu & Khoa học',
    color: 'from-blue-500 to-cyan-500',
    badgeBg: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    summary:
      'Bạn sở hữu tư duy phân tích sắc bén, logic logic cao, tò mò khám phá quy luật tự nhiên và say mê giải quyết bài toán phức tạp.',
    majors: [
      'Khoa học máy tính & Trí tuệ nhân tạo (AI)',
      'Khoa học Dữ liệu & Toán Tin ứng dụng',
      'Y Đa khoa, Răng Hàm Mặt & Dược học',
      'Công nghệ Sinh học & Công nghệ Hóa dược',
      'Vật lý bán dẫn & Kỹ thuật Hạt nhân',
    ],
    universities: [
      'Trường ĐH Khoa học Tự nhiên (ĐHQGHN & ĐHQG-HCM)',
      'Đại học Y Hà Nội / ĐH Y Dược TP.HCM',
      'Đại học Bách Khoa (Hà Nội / HCM)',
      'Học viện Quân Y / Học viện Công nghệ Bưu chính Viễn thông (PTIT)',
    ],
    examFocus: 'HSA (Toán + Khoa học), VACT (Tư duy Logic + Giải quyết vấn đề), THPTQG A00, B00',
  },
  A: {
    name: 'Artistic',
    fullName: 'Nhóm Nghệ thuật & Sáng tạo',
    color: 'from-pink-500 to-rose-500',
    badgeBg: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    summary:
      'Bạn là người giàu cảm xúc, tư duy trực quan nhạy bén, thích sáng tạo cái đẹp và không ngừng tìm tòi ý tưởng khác biệt.',
    majors: [
      'Thiết kế Đồ họa & Thiết kế UI/UX',
      'Truyền thông Đa phương tiện & Sản xuất Video',
      'Kiến trúc & Thiết kế Nội thất',
      'Biên kịch, Báo chí & Đạo diễn truyền hình',
      'Thiết kế Thời trang & Nghệ thuật Thị giác',
    ],
    universities: [
      'Trường ĐH Kiến trúc Hà Nội / ĐH Kiến trúc TP.HCM',
      'Trường ĐH Mỹ thuật Công nghiệp',
      'Học viện Báo chí và Tuyên truyền (AJC)',
      'Trường ĐH Sân khấu Điện ảnh',
      'ĐH RMIT / FPT University',
    ],
    examFocus: 'HSA (Định tính + Ngoại ngữ), THPTQG Khối H, V, D01, C00',
  },
  S: {
    name: 'Social',
    fullName: 'Nhóm Xã hội & Giáo dục',
    color: 'from-emerald-500 to-teal-500',
    badgeBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    summary:
      'Bạn có trí tuệ cảm xúc cao, năng khiếu giao tiếp, thấu hiểu con người và luôn khát khao đóng góp giá trị tốt đẹp cho cộng đồng.',
    majors: [
      'Sư phạm (Toán, Văn, Anh, KHTN)',
      'Tâm lý học ứng dụng & Tư vấn học đường',
      'Y tế công cộng & Điều dưỡng chuyên nghiệp',
      'Công tác xã hội & Phát triển cộng đồng',
      'Quản trị Du lịch, Lữ hành & Nhà hàng Khách sạn',
    ],
    universities: [
      'Trường ĐH Sư phạm Hà Nội / ĐH Sư phạm TP.HCM',
      'Trường ĐH Khoa học Xã hội & Nhân văn (ĐHQGHN / ĐHQG-HCM)',
      'Đại học Y tế Công cộng',
      'Học viện Phụ nữ Việt Nam / ĐH Hà Nội (HANU)',
    ],
    examFocus: 'HSA (Định tính + Ngoại ngữ), VACT (Ngôn ngữ + Xã hội), THPTQG C00, D01',
  },
  E: {
    name: 'Enterprising',
    fullName: 'Nhóm Quản lý & Kinh doanh',
    color: 'from-purple-500 to-indigo-500',
    badgeBg: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    summary:
      'Bạn có tư chất lãnh đạo, khả năng thuyết phục đàm phán, dám nghĩ dám làm và quyết đoán trong việc nắm bắt cơ hội kinh doanh.',
    majors: [
      'Quản trị Kinh doanh & Khởi nghiệp',
      'Marketing số & Thương mại Điện tử (E-Commerce)',
      'Kinh tế Đối ngoại & Ngoại thương',
      'Tài chính - Ngân hàng & Đầu tư Chứng khoán',
      'Luật Kinh tế & Quan hệ Quốc tế',
    ],
    universities: [
      'Đại học Ngoại Thương (FTU)',
      'Đại học Kinh tế Quốc dân (NEU)',
      'Trường ĐH Kinh tế - ĐHQGHN & ĐH Kinh tế TP.HCM (UEH)',
      'Học viện Tài chính (AOF) / Học viện Ngân hàng',
    ],
    examFocus: 'HSA (Định lượng + Tiếng Anh), VACT (Toán + Ngôn ngữ), THPTQG D01, A01',
  },
  C: {
    name: 'Conventional',
    fullName: 'Nhóm Nghiệp vụ & Tổ chức',
    color: 'from-cyan-500 to-sky-500',
    badgeBg: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    summary:
      'Bạn là người chu đáo, tỉ mỉ, tôn trọng quy chuẩn, có năng lực sắp xếp dữ liệu có hệ thống và làm việc chuẩn xác cao độ.',
    majors: [
      'Kế toán - Kiểm toán chuyên nghiệp (ACCA/CPA)',
      'Quản trị Chuỗi cung ứng & Logistics quốc tế',
      'Hệ thống Thông tin Quản lý (MIS)',
      'Quản trị văn phòng & Thư ký hành chính',
      'Thẩm định giá & Quản trị Rủi ro tài chính',
    ],
    universities: [
      'Đại học Kinh tế Quốc dân (NEU)',
      'Học viện Tài chính (AOF)',
      'Trường ĐH Kinh tế - Luật (ĐHQG-HCM)',
      'Đại học Thương Mại (TMU)',
      'Đại học Kinh tế TP.HCM (UEH)',
    ],
    examFocus: 'HSA (Định lượng + Xử lý số liệu), THPTQG A00, A01, D01',
  },
};

export const CareerTestModal: React.FC<CareerTestModalProps> = ({ student, onClose }) => {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const answeredCount = Object.keys(answers).length;
  const isComplete = answeredCount === QUESTIONS.length;

  const handleSelectAnswer = (questionId: number, score: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: score,
    }));
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
  };

  // Calculate scores per dimension
  const scores: Record<'R' | 'I' | 'A' | 'S' | 'E' | 'C', number> = {
    R: 0,
    I: 0,
    A: 0,
    S: 0,
    E: 0,
    C: 0,
  };

  QUESTIONS.forEach((q) => {
    const val = answers[q.id] || 0;
    scores[q.type] += val;
  });

  // Sort traits by highest score
  const allTraits: Array<'R' | 'I' | 'A' | 'S' | 'E' | 'C'> = ['R', 'I', 'A', 'S', 'E', 'C'];
  const sortedTraits = [...allTraits].sort((a, b) => scores[b] - scores[a]);
  const primaryTrait = sortedTraits[0];
  const secondaryTrait = sortedTraits[1];
  const tertiaryTrait = sortedTraits[2];

  const primaryInfo = TRAIT_INFO[primaryTrait];
  const secondaryInfo = TRAIT_INFO[secondaryTrait];

  return (
    <div
      id="career-test-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-sm animate-fadeIn overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="career-test-modal-content"
        className="w-full max-w-2xl bg-[#0e1224] border border-fuchsia-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-fuchsia-950/40 space-y-5 text-slate-200 relative my-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white transition p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 z-10"
          title="Đóng cửa sổ"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="border-b border-slate-800 pb-4 pr-10">
          <div className="flex items-center gap-2 text-fuchsia-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4 text-fuchsia-400 animate-spin-slow" />
            <span>Trắc Nghiệm Định Hướng Nghề Nghiệp (Holland RIASEC)</span>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>Khám phá năng lực & ngành học phù hợp</span>
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Dành cho thí sinh <strong className="text-white">{student.hoten || student.username}</strong> (SBD: {student.sbd || '---'}). Bài trắc nghiệm chuẩn giúp bạn chọn đúng tổ hợp kỳ thi HSA, VACT, THPTQG và ngành trường Đại học mục tiêu.
          </p>
        </div>

        {!submitted ? (
          /* Question Form */
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="bg-[#0b0e1a] p-3 rounded-2xl border border-slate-800 space-y-1.5">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Tiến độ hoàn thành:</span>
                <span className="font-mono font-bold text-fuchsia-400">
                  {answeredCount} / {QUESTIONS.length} câu ({Math.round((answeredCount / QUESTIONS.length) * 100)}%)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-fuchsia-500 to-indigo-500 transition-all duration-300"
                  style={{ width: `${(answeredCount / QUESTIONS.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-3">
              {QUESTIONS.map((q, idx) => {
                const currentVal = answers[q.id];
                return (
                  <div
                    key={q.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      currentVal !== undefined
                        ? 'bg-[#12162e] border-fuchsia-500/30'
                        : 'bg-[#0b0e1a] border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-slate-800 text-fuchsia-400 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div className="flex-1 space-y-2">
                        <p className="text-xs sm:text-sm font-medium text-slate-100 leading-snug">
                          {q.question}
                        </p>
                        <div className="grid grid-cols-3 gap-2 pt-1">
                          {[
                            { label: 'Không thích / Không đúng', score: 0 },
                            { label: 'Bình thường / Phân vân', score: 1 },
                            { label: 'Rất thích / Đúng với tôi', score: 2 },
                          ].map((opt) => {
                            const isSelected = currentVal === opt.score;
                            return (
                              <button
                                key={opt.score}
                                type="button"
                                onClick={() => handleSelectAnswer(q.id, opt.score)}
                                className={`py-2 px-2 rounded-xl text-[11px] font-semibold transition border text-center cursor-pointer ${
                                  isSelected
                                    ? opt.score === 2
                                      ? 'bg-fuchsia-600 text-white border-fuchsia-400 shadow-sm shadow-fuchsia-600/30'
                                      : opt.score === 1
                                      ? 'bg-indigo-600 text-white border-indigo-400'
                                      : 'bg-slate-700 text-slate-200 border-slate-500'
                                    : 'bg-[#080a14] border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                                }`}
                              >
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <span className="text-xs text-slate-400">
                {isComplete
                  ? 'Tuyệt vời! Bạn đã trả lời đủ tất cả các câu hỏi.'
                  : `Còn ${QUESTIONS.length - answeredCount} câu chưa đánh giá.`}
              </span>

              <button
                type="button"
                id="btn-submit-career-test"
                disabled={!isComplete}
                onClick={() => setSubmitted(true)}
                className="py-3 px-6 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-bold rounded-xl transition text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-fuchsia-600/30 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>Xem Kết Quả Định Hướng</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Results Analysis View */
          <div className="space-y-5 animate-fadeIn">
            {/* Top Match Banner */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-fuchsia-950/60 via-purple-950/40 to-indigo-950/60 border border-fuchsia-500/40 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-fuchsia-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Mã tính cách nghề nghiệp của bạn:</span>
                </span>
                <span className="px-3 py-1 rounded-full bg-fuchsia-500/20 text-fuchsia-300 font-mono font-bold text-sm border border-fuchsia-500/40">
                  {primaryTrait}
                  {secondaryTrait}
                  {tertiaryTrait}
                </span>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  {primaryInfo.fullName} & {secondaryInfo.fullName}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                  {primaryInfo.summary} Kết hợp với thiên hướng {secondaryInfo.name.toLowerCase()} giúp bạn có thế mạnh nổi trội trong việc kết nối giải pháp và ứng dụng thực tiễn.
                </p>
              </div>
            </div>

            {/* Score Breakdown Bars */}
            <div className="bg-[#0b0e1a] p-4 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Chi tiết điểm số 6 nhóm RIASEC</span>
              </h4>

              <div className="space-y-2">
                {(['R', 'I', 'A', 'S', 'E', 'C'] as const).map((trait) => {
                  const score = scores[trait];
                  const maxPossible = 6; // 3 questions * 2 points
                  const percent = Math.round((score / maxPossible) * 100);
                  const info = TRAIT_INFO[trait];
                  return (
                    <div key={trait} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-300">
                          {trait} - {info.fullName}
                        </span>
                        <span className="font-mono font-bold text-slate-400">
                          {score}/{maxPossible} điểm ({percent}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${info.color} transition-all duration-500`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recommended Majors */}
            <div className="bg-[#0b0e1a] p-4 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-emerald-400" />
                <span>Top ngành học Đại học phù hợp nhất (Tuyển sinh 2026)</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[...primaryInfo.majors.slice(0, 3), ...secondaryInfo.majors.slice(0, 2)].map(
                  (major, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-[#12162e] border border-slate-800 text-xs flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-slate-200 font-medium">{major}</span>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Recommended Universities & Exam Blocks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-[#0b0e1a] p-4 rounded-2xl border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" />
                  <span>Trường Đại học đề xuất</span>
                </h4>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                  {primaryInfo.universities.map((uni, i) => (
                    <li key={i}>{uni}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#0b0e1a] p-4 rounded-2xl border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4" />
                  <span>Khối thi & Kỳ thi nên tập trung</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {primaryInfo.examFocus}
                </p>
                <div className="pt-1 text-[11px] text-slate-400">
                  Thí sinh có thể luyện tập trực tiếp các phần thi này trong danh sách môn thi ở trang cá nhân.
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800">
              <button
                type="button"
                onClick={handleReset}
                className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Làm lại bài trắc nghiệm</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto py-2.5 px-6 rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-fuchsia-600/20 transition cursor-pointer text-center"
              >
                <span>Xác nhận & Quay lại phòng thi</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
