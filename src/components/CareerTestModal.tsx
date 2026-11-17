import React, { useState } from 'react';
import {
  Compass,
  X,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  GraduationCap,
  Briefcase,
  Layers,
  Building2,
  Loader2,
  User,
  Phone,
  Mail,
  IdCard,
  AlertCircle,
} from 'lucide-react';
import { StudentInfo, CareerResultRecord } from '../types';
import { recordCareerResultToSheet } from '../services/loginLogger';

interface CareerTestModalProps {
  student?: StudentInfo | null;
  onClose: () => void;
  onResultSaved?: (record: CareerResultRecord) => void;
}

interface Question {
  id: number;
  type: 'R' | 'I' | 'A' | 'S' | 'E' | 'C';
  typeName: string;
  question: string;
}

const QUESTIONS: Question[] = [
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
    examFocus: 'Tổ hợp THPTQG: A00 (Toán, Lý, Hóa), A01 (Toán, Lý, Anh), C01 (Toán, Văn, Lý)',
  },
  I: {
    name: 'Investigative',
    fullName: 'Nhóm Nghiên cứu & Khoa học',
    color: 'from-blue-500 to-cyan-500',
    summary:
      'Bạn sở hữu tư duy phân tích sắc bén, logic cao, tò mò khám phá quy luật tự nhiên và say mê giải quyết bài toán phức tạp.',
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
    examFocus: 'Tổ hợp THPTQG: A00 (Toán, Lý, Hóa), A01 (Toán, Lý, Anh), B00 (Toán, Hóa, Sinh)',
  },
  A: {
    name: 'Artistic',
    fullName: 'Nhóm Nghệ thuật & Sáng tạo',
    color: 'from-pink-500 to-rose-500',
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
    examFocus: 'Tổ hợp THPTQG: D01 (Toán, Văn, Anh), C00 (Văn, Sử, Địa), Khối H00, V00',
  },
  S: {
    name: 'Social',
    fullName: 'Nhóm Xã hội & Giáo dục',
    color: 'from-emerald-500 to-teal-500',
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
    examFocus: 'Tổ hợp THPTQG: C00 (Văn, Sử, Địa), D01 (Toán, Văn, Anh), D14, D15',
  },
  E: {
    name: 'Enterprising',
    fullName: 'Nhóm Quản lý & Kinh doanh',
    color: 'from-purple-500 to-indigo-500',
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
    examFocus: 'Tổ hợp THPTQG: D01 (Toán, Văn, Anh), A01 (Toán, Lý, Anh), A00 (Toán, Lý, Hóa)',
  },
  C: {
    name: 'Conventional',
    fullName: 'Nhóm Nghiệp vụ & Tổ chức',
    color: 'from-cyan-500 to-sky-500',
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
    examFocus: 'Tổ hợp THPTQG: A00 (Toán, Lý, Hóa), A01 (Toán, Lý, Anh), D01 (Toán, Văn, Anh)',
  },
};

export const CareerTestModal: React.FC<CareerTestModalProps> = ({
  student: initialStudent,
  onClose,
  onResultSaved,
}) => {
  const isGuestMode = !initialStudent;
  const [step, setStep] = useState<'info' | 'test' | 'result'>(
    initialStudent ? 'test' : 'info'
  );

  const [guestHoten, setGuestHoten] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestNamsinh, setGuestNamsinh] = useState('2009');
  const [guestSbd, setGuestSbd] = useState('');
  const [infoError, setInfoError] = useState<string | null>(null);
  const [activeStudent, setActiveStudent] = useState<StudentInfo>(
    initialStudent || {
      username: '',
      password: '',
      sbd: '',
      hoten: '',
      email: '',
      namsinh: '2009',
      hsa: 'Không',
      vact: 'Không',
      thptqg: 'Không',
      huongnghiep: 'Có',
    }
  );

  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSaving, setIsSaving] = useState(false);

  const answeredCount = Object.keys(answers).length;
  const isComplete = answeredCount === QUESTIONS.length;

  const handleStartTestFromInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setInfoError(null);

    const cleanName = guestHoten.trim();
    const cleanPhone = guestPhone.trim();
    const digitsOnly = cleanPhone.replace(/\D/g, '');
    const cleanEmail = guestEmail.trim();
    const cleanYear = guestNamsinh.trim();

    if (cleanName.length < 2) {
      setInfoError('Vui lòng nhập đầy đủ Họ và tên của bạn.');
      return;
    }
    if (digitsOnly.length < 9 || digitsOnly.length > 12) {
      setInfoError('Vui lòng nhập Số điện thoại hợp lệ (9–11 chữ số).');
      return;
    }
    const yNum = Number(cleanYear);
    if (!cleanYear || isNaN(yNum) || yNum < 1995 || yNum > 2015) {
      setInfoError('Vui lòng nhập Năm sinh hợp lệ (ví dụ: 2009).');
      return;
    }
    if (cleanEmail && !cleanEmail.includes('@')) {
      setInfoError('Địa chỉ Email chưa đúng định dạng.');
      return;
    }

    setActiveStudent({
      username: cleanPhone,
      password: '',
      sbd: guestSbd.trim() || 'Tự do',
      hoten: cleanName,
      email: cleanEmail,
      namsinh: cleanYear,
      hsa: 'Không',
      vact: 'Không',
      thptqg: 'Không',
      huongnghiep: 'Có',
    });
    setStep('test');
  };

  const handleSelectAnswer = (questionId: number, score: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: score,
    }));
  };

  const handleReset = () => {
    setAnswers({});
    setStep('test');
  };

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

  const allTraits: Array<'R' | 'I' | 'A' | 'S' | 'E' | 'C'> = ['R', 'I', 'A', 'S', 'E', 'C'];
  const sortedTraits = [...allTraits].sort((a, b) => scores[b] - scores[a]);
  const primaryTrait = sortedTraits[0];
  const secondaryTrait = sortedTraits[1];
  const tertiaryTrait = sortedTraits[2];

  const primaryInfo = TRAIT_INFO[primaryTrait];
  const secondaryInfo = TRAIT_INFO[secondaryTrait];

  const handleSaveToGoogleSheet = async () => {
    setIsSaving(true);
    try {
      const riasecCode = `${primaryTrait}${secondaryTrait}${tertiaryTrait}`;
      const recommendedMajors = [
        ...primaryInfo.majors.slice(0, 3),
        ...secondaryInfo.majors.slice(0, 2),
      ];
      const rec = await recordCareerResultToSheet(activeStudent, {
        riasecCode,
        primaryTrait: `${primaryTrait} - ${primaryInfo.fullName}`,
        secondaryTrait: `${secondaryTrait} - ${secondaryInfo.fullName}`,
        scores,
        recommendedMajors,
        recommendedUniversities: primaryInfo.universities,
        examFocus: primaryInfo.examFocus,
      });
      onResultSaved?.(rec);
    } catch {
      // ignore
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitTest = async () => {
    if (!isComplete) return;
    setStep('result');
    await handleSaveToGoogleSheet();
  };

  return (
    <div
      id="career-test-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-5 bg-black/85 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="career-test-modal-content"
        className="w-full max-w-2xl bg-[#111526] border border-fuchsia-500/35 rounded-2xl sm:rounded-3xl shadow-2xl text-slate-200 relative max-h-[92dvh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 shrink-0 relative pr-14 bg-[#111526]">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 min-w-[42px] min-h-[42px] flex items-center justify-center text-slate-400 hover:text-white transition rounded-xl bg-slate-800/70 hover:bg-slate-800 cursor-pointer"
            title="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-fuchsia-400 text-[11px] font-bold uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4 shrink-0" />
            <span>Trắc nghiệm hướng nghiệp (Holland RIASEC)</span>
          </div>
          <h2 className="text-base sm:text-xl font-bold text-white leading-snug">
            Khám phá năng lực &amp; ngành học phù hợp
          </h2>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            {step === 'info' ? (
              'Nhập nhanh thông tin cá nhân bên dưới để bắt đầu làm bài trắc nghiệm (không cần đăng nhập tài khoản).'
            ) : (
              <>
                Thí sinh <strong className="text-white">{activeStudent.hoten || activeStudent.username}</strong>
                {activeStudent.sbd && activeStudent.sbd !== '---' ? ` · SBD: ${activeStudent.sbd}` : ''}
                {activeStudent.namsinh ? ` · Sinh năm: ${activeStudent.namsinh}` : ''}.
              </>
            )}
          </p>

          {/* Compact Progress Bar when in Test Step */}
          {step === 'test' && (
            <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-1.5">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Tiến độ hoàn thành</span>
                <span className="font-mono tabular-nums font-bold text-fuchsia-400">
                  {answeredCount} / {QUESTIONS.length} câu ({Math.round((answeredCount / QUESTIONS.length) * 100)}%)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-fuchsia-500 transition-all duration-300"
                  style={{ width: `${(answeredCount / QUESTIONS.length) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {step === 'info' ? (
            <form onSubmit={handleStartTestFromInfo} className="space-y-4 animate-fadeIn" noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label
                    htmlFor="career-guest-hoten"
                    className="block text-xs font-semibold text-slate-300 mb-1.5"
                  >
                    Họ và tên <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="career-guest-hoten"
                      type="text"
                      required
                      value={guestHoten}
                      onChange={(e) => {
                        setGuestHoten(e.target.value);
                        if (infoError) setInfoError(null);
                      }}
                      placeholder="VD: Nguyễn Văn An"
                      className="w-full min-h-[46px] pl-10 pr-3 py-2.5 bg-[#080b16] border border-slate-800 focus:border-fuchsia-500 rounded-xl text-white text-base sm:text-sm outline-none placeholder:text-slate-600"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="career-guest-phone"
                    className="block text-xs font-semibold text-slate-300 mb-1.5"
                  >
                    Số điện thoại <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="career-guest-phone"
                      type="tel"
                      required
                      value={guestPhone}
                      onChange={(e) => {
                        setGuestPhone(e.target.value);
                        if (infoError) setInfoError(null);
                      }}
                      placeholder="VD: 0912345678"
                      className="w-full min-h-[46px] pl-10 pr-3 py-2.5 bg-[#080b16] border border-slate-800 focus:border-fuchsia-500 rounded-xl text-white text-base sm:text-sm outline-none placeholder:text-slate-600 font-mono tabular-nums"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label
                    htmlFor="career-guest-namsinh"
                    className="block text-xs font-semibold text-slate-300 mb-1.5"
                  >
                    Năm sinh <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="career-guest-namsinh"
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    required
                    value={guestNamsinh}
                    onChange={(e) => {
                      setGuestNamsinh(e.target.value.replace(/\D/g, ''));
                      if (infoError) setInfoError(null);
                    }}
                    placeholder="2009"
                    className="w-full min-h-[46px] px-3.5 py-2.5 bg-[#080b16] border border-slate-800 focus:border-fuchsia-500 rounded-xl text-white text-base sm:text-sm outline-none placeholder:text-slate-600 font-mono tabular-nums"
                  />
                </div>

                <div>
                  <label
                    htmlFor="career-guest-email"
                    className="block text-xs font-semibold text-slate-300 mb-1.5"
                  >
                    Email (nếu có)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="career-guest-email"
                      type="email"
                      value={guestEmail}
                      onChange={(e) => {
                        setGuestEmail(e.target.value);
                        if (infoError) setInfoError(null);
                      }}
                      placeholder="name@gmail.com"
                      className="w-full min-h-[46px] pl-10 pr-3 py-2.5 bg-[#080b16] border border-slate-800 focus:border-fuchsia-500 rounded-xl text-white text-base sm:text-sm outline-none placeholder:text-slate-600"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="career-guest-sbd"
                    className="block text-xs font-semibold text-slate-300 mb-1.5"
                  >
                    Số báo danh (nếu có)
                  </label>
                  <div className="relative">
                    <IdCard className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="career-guest-sbd"
                      type="text"
                      value={guestSbd}
                      onChange={(e) => setGuestSbd(e.target.value)}
                      placeholder="Không bắt buộc"
                      className="w-full min-h-[46px] pl-10 pr-3 py-2.5 bg-[#080b16] border border-slate-800 focus:border-fuchsia-500 rounded-xl text-white text-base sm:text-sm outline-none placeholder:text-slate-600 font-mono"
                    />
                  </div>
                </div>
              </div>

              {infoError && (
                <div className="flex items-start gap-2 text-rose-300 text-xs bg-rose-500/10 border border-rose-500/25 p-3 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{infoError}</span>
                </div>
              )}

              <div className="pt-2 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-2.5 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="min-h-[44px] py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  id="btn-career-start-test"
                  className="min-h-[46px] py-2.5 px-6 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold rounded-xl transition text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Bắt Đầu Làm Bài (18 Câu)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : step === 'test' ? (
            <div className="space-y-3.5">
              {QUESTIONS.map((q, idx) => {
                const currentVal = answers[q.id];
                return (
                  <div
                    key={q.id}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-colors ${
                      currentVal !== undefined
                        ? 'bg-[#141730] border-fuchsia-500/35'
                        : 'bg-[#080b16] border-slate-800'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xs font-mono tabular-nums font-bold text-fuchsia-400 shrink-0 mt-0.5">
                        {String(idx + 1).padStart(2, '0')}.
                      </span>
                      <div className="flex-1 space-y-2.5">
                        <p className="text-xs sm:text-sm font-medium text-slate-100 leading-snug">
                          {q.question}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
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
                                className={`min-h-[44px] py-2 px-3 rounded-xl text-xs font-semibold transition border text-center cursor-pointer ${
                                  isSelected
                                    ? opt.score === 2
                                      ? 'bg-fuchsia-600 text-white border-fuchsia-400'
                                      : opt.score === 1
                                      ? 'bg-indigo-600 text-white border-indigo-400'
                                      : 'bg-slate-700 text-white border-slate-500'
                                    : 'bg-[#0d1122] border-slate-800 text-slate-300 hover:border-slate-600'
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

              <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-xs text-slate-400">
                  {isComplete
                    ? 'Bạn đã hoàn thành toàn bộ 18 câu hỏi.'
                    : `Còn ${QUESTIONS.length - answeredCount} câu chưa chọn.`}
                </span>

                <button
                  type="button"
                  id="btn-submit-career-test"
                  disabled={!isComplete || isSaving}
                  onClick={handleSubmitTest}
                  className="min-h-[46px] py-2.5 px-6 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold rounded-xl transition text-xs sm:text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang phân tích kết quả...</span>
                    </>
                  ) : (
                    <>
                      <span>Xem Kết Quả Định Hướng</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-fadeIn">
              {/* Top Match */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#16122c] border border-fuchsia-500/35 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-fuchsia-300 uppercase tracking-wider">
                    Mã tính cách nghề nghiệp
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-fuchsia-500/20 text-fuchsia-200 font-mono font-bold text-sm border border-fuchsia-500/35">
                    {primaryTrait}
                    {secondaryTrait}
                    {tertiaryTrait}
                  </span>
                </div>

                <div>
                  <h3 className="text-base sm:text-xl font-bold text-white">
                    {primaryInfo.fullName} &amp; {secondaryInfo.fullName}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
                    {primaryInfo.summary} Kết hợp với thiên hướng {secondaryInfo.name.toLowerCase()} giúp bạn có thế mạnh nổi trội trong việc kết nối giải pháp và ứng dụng thực tiễn.
                  </p>
                </div>
              </div>

              {/* Score Bars */}
              <div className="bg-[#080b16] p-4 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span>Điểm số 6 nhóm RIASEC</span>
                </h4>

                <div className="space-y-2.5">
                  {(['R', 'I', 'A', 'S', 'E', 'C'] as const).map((trait) => {
                    const score = scores[trait];
                    const maxPossible = 6;
                    const percent = Math.round((score / maxPossible) * 100);
                    const info = TRAIT_INFO[trait];
                    return (
                      <div key={trait} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-slate-200">
                            {trait} · {info.fullName}
                          </span>
                          <span className="font-mono tabular-nums font-bold text-slate-400">
                            {score}/{maxPossible} ({percent}%)
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

              {/* Majors */}
              <div className="bg-[#080b16] p-4 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-emerald-400" />
                  <span>Ngành học Đại học phù hợp (Tuyển sinh 2026)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[...primaryInfo.majors.slice(0, 3), ...secondaryInfo.majors.slice(0, 2)].map(
                    (major, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl bg-[#111526] border border-slate-800 text-xs flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-slate-200 font-medium">{major}</span>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Universities & THPTQG Exam Focus */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-[#080b16] p-4 rounded-2xl border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" />
                    <span>Trường Đại học đề xuất</span>
                  </h4>
                  <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside leading-relaxed">
                    {primaryInfo.universities.map((uni, i) => (
                      <li key={i}>{uni}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#080b16] p-4 rounded-2xl border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4" />
                    <span>Tổ hợp thi THPTQG nên tập trung</span>
                  </h4>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">
                    {primaryInfo.examFocus}
                  </p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Thí sinh có thể luyện tập các môn thi THPT Quốc Gia tương ứng trong phòng thi.
                  </p>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-between gap-2.5 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full sm:w-auto min-h-[44px] py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Làm lại bài trắc nghiệm</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto min-h-[44px] py-2.5 px-6 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-xs sm:text-sm font-bold transition cursor-pointer text-center"
                >
                  <span>{isGuestMode ? 'Hoàn tất & Quay lại trang chủ' : 'Xác nhận & Quay lại phòng thi'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
