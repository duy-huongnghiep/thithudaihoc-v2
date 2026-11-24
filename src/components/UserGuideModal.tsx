import React, { useState } from 'react';
import {
  X,
  BookOpen,
  PenTool,
  Search,
  LogIn,
  Timer,
  PlayCircle,
  Compass,
  HelpCircle,
  ChevronRight,
  CheckCircle2,
  Info,
} from 'lucide-react';

interface UserGuideModalProps {
  onClose: () => void;
  onGoToRegister?: () => void;
  onGoToSearch?: () => void;
  onGoToLogin?: () => void;
}

export const UserGuideModal: React.FC<UserGuideModalProps> = ({
  onClose,
  onGoToRegister,
  onGoToSearch,
  onGoToLogin,
}) => {
  const [activeStep, setActiveStep] = useState<number>(1);

  const steps = [
    {
      id: 1,
      badge: 'B1',
      title: 'Đăng ký tài khoản',
      icon: PenTool,
      content: {
        heading: 'Bước 1: Đăng ký tài khoản thi thử trực tiếp trên Web',
        description:
          'Thí sinh đăng ký tài khoản ngay trên cổng thi thử để được cấp Số Báo Danh (SBD) tự động và tham gia làm bài ngay lập tức.',
        bulletPoints: [
          'Chuyển sang tab "Đăng ký" ngay trên màn hình chính.',
          'Điền đầy đủ thông tin cá nhân: Số điện thoại (làm Tài khoản), Mật khẩu tự đặt, Họ và tên, Email, Năm sinh.',
          'Tích chọn các kỳ thi đang mở đăng ký mà bạn muốn tham gia (ĐGNL HSA, V-ACT, THPT Quốc Gia, Hướng nghiệp).',
          'Nhấn "Hoàn tất đăng ký tài khoản", hệ thống tự động cấp SBD 5 số và lưu dữ liệu lên hệ thống.',
          'Sau khi đăng ký xong, nhấn "Đăng nhập ngay" để vào phòng thi!',
        ],
        actionLabel: 'Đăng ký tài khoản ngay',
        actionCallback: () => {
          onClose();
          if (onGoToRegister) onGoToRegister();
        },
      },
    },
    {
      id: 2,
      badge: 'B2',
      title: 'Tra cứu thông tin',
      icon: Search,
      content: {
        heading: 'Bước 2: Tra cứu thông tin dự thi và mật khẩu',
        description:
          'Sau khi đã đăng ký tài khoản hoặc được Ban tổ chức cấp tài khoản, bạn có thể tra cứu nhanh thông tin dự thi và kiểm tra môn thi.',
        bulletPoints: [
          'Chọn tab "Tra cứu SBD" tại màn hình chính.',
          'Nhập Số điện thoại bạn đã dùng khi đăng ký (hoặc Số Báo Danh).',
          'Nhấn "Tra cứu ngay" để xem Số Báo Danh, Tên đăng nhập, Mật khẩu và các kỳ thi đã đăng ký.',
          'Nhấn "Đăng nhập ngay với tài khoản này" để vào thẳng phòng thi!',
        ],
        actionLabel: 'Đến trang tra cứu ngay',
        actionCallback: () => {
          onClose();
          if (onGoToSearch) onGoToSearch();
        },
      },
    },
    {
      id: 3,
      badge: 'B3',
      title: 'Đăng nhập hệ thống',
      icon: LogIn,
      content: {
        heading: 'Bước 3: Đăng nhập vào cổng thí sinh',
        description:
          'Thí sinh sử dụng tài khoản và mật khẩu để đăng nhập vào giao diện phòng thi cá nhân.',
        bulletPoints: [
          'Nhập Tài khoản (Số điện thoại) và Mật khẩu đã đăng ký.',
          'Bấm biểu tượng con mắt để kiểm tra lại mật khẩu nếu cần.',
          'Bấm "Đăng nhập" để truy cập phòng thi cá nhân.',
        ],
        actionLabel: 'Về giao diện đăng nhập',
        actionCallback: () => {
          onClose();
          if (onGoToLogin) onGoToLogin();
        },
      },
    },
    {
      id: 4,
      badge: 'B4',
      title: 'Đếm ngược & Mở đề',
      icon: Timer,
      content: {
        heading: 'Bước 4: Theo dõi lịch thi & Đồng hồ đếm ngược',
        description:
          'Hệ thống tích hợp đồng hồ đếm ngược thông minh từng giây khi Ban tổ chức cấu hình lịch ca thi.',
        bulletPoints: [
          'Chế độ có lịch thi: Đồng hồ đếm ngược đến giờ mở đề. Đúng giờ hẹn phòng thi sẽ tự động mở khóa.',
          'Chế độ Thi tự do: Khi không giới hạn giờ, bạn có thể vào làm bài bất cứ lúc nào.',
          'Mỗi môn thi có thời lượng quy định riêng biệt.',
        ],
      },
    },
    {
      id: 5,
      badge: 'B5',
      title: 'Vào thi trực tuyến',
      icon: PlayCircle,
      content: {
        heading: 'Bước 5: Bắt đầu làm bài thi trắc nghiệm',
        description:
          'Sau khi phòng thi mở, chọn các môn thi trong phạm vi đã đăng ký để bắt đầu làm bài.',
        bulletPoints: [
          'Chọn kỳ thi (HSA / V-ACT / THPTQG) và phần thi muốn làm.',
          'Đọc kỹ quy chế và nhấn "Mở đề & Bắt đầu thi".',
          'Nhấn Nộp bài sau khi hoàn thành để xem điểm và lời giải chi tiết.',
        ],
      },
    },
    {
      id: 6,
      badge: 'B6',
      title: 'Test Hướng nghiệp',
      icon: Compass,
      content: {
        heading: 'Bước 6: Trắc nghiệm hướng nghiệp RIASEC trực tiếp trên web',
        description:
          'Làm bài test 18 câu RIASEC ngay ngoài trang chủ hoặc trong phòng thi để khám phá nhóm tính cách, ngành học và tổ hợp THPTQG phù hợp.',
        bulletPoints: [
          'Nhấn "Vào làm bài test Hướng nghiệp" ngay trang chủ (nhập nhanh thông tin) hoặc trong phòng thi.',
          'Trả lời lần lượt 18 câu hỏi đánh giá sở thích.',
          'Bấm "Xem kết quả định hướng" để nhận phân tích RIASEC, ngành học, trường ĐH và tổ hợp THPTQG.',
        ],
      },
    },
    {
      id: 7,
      badge: 'B7',
      title: 'Lưu ý & Hỗ trợ',
      icon: HelpCircle,
      content: {
        heading: 'Bước 7: Hỗ trợ kỹ thuật & Các lưu ý quan trọng',
        description:
          'Giải quyết các tình huống thường gặp khi sử dụng cổng thông tin thi thử.',
        bulletPoints: [
          'Bạn có thể bấm nút Đồng bộ ở góc trên bên phải bất cứ lúc nào để cập nhật dữ liệu mới nhất.',
          'Quên mật khẩu? Dùng tab "Tra cứu SBD" hoặc liên hệ Ban tổ chức qua liên kết hỗ trợ ở cuối trang.',
          'Đảm bảo kết nối mạng ổn định trong suốt thời gian làm bài.',
        ],
      },
    },
  ];

  const currentStepData = steps.find((s) => s.id === activeStep) || steps[0];

  return (
    <div
      id="user-guide-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-5 bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="user-guide-modal"
        className="w-full max-w-2xl bg-[#0e1120] border border-emerald-500/35 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4 text-slate-200 relative max-h-[92dvh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3.5 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/35 flex items-center justify-center text-emerald-400 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block">
                Cẩm nang sử dụng
              </span>
              <h2 className="text-sm sm:text-lg font-extrabold text-white truncate">
                Hướng dẫn Cổng Thi thử (B1 – B7)
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="min-w-[38px] min-h-[38px] flex items-center justify-center text-slate-400 hover:text-white transition rounded-xl hover:bg-slate-800 cursor-pointer shrink-0"
            title="Đóng hướng dẫn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Navigation Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2 shrink-0 border-b border-slate-800">
          {steps.map((s) => {
            const Icon = s.icon;
            const isActive = s.id === activeStep;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveStep(s.id)}
                className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                    : 'bg-[#080b16] text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <span className="font-mono text-[11px]">{s.badge}</span>
                <span className="hidden sm:inline">{s.title}</span>
                <Icon className="w-3.5 h-3.5 sm:hidden" />
              </button>
            );
          })}
        </div>

        {/* Step Detail Content */}
        <div className="overflow-y-auto pr-1 space-y-4 flex-1 text-xs">
          <div className="p-4 sm:p-5 rounded-2xl bg-[#080b16] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 gap-2">
              <h3 className="text-sm font-bold text-white">
                {currentStepData.content.heading}
              </h3>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 font-mono tabular-nums font-bold shrink-0">
                {currentStepData.id}/{steps.length}
              </span>
            </div>

            <p className="text-slate-300 leading-relaxed">
              {currentStepData.content.description}
            </p>

            <div className="space-y-2 pt-1">
              {currentStepData.content.bulletPoints.map((point, idx) => (
                <div key={idx} className="flex items-start gap-2 text-slate-300 leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{point}</span>
                </div>
              ))}
            </div>

            {currentStepData.content.actionLabel && currentStepData.content.actionCallback && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={currentStepData.content.actionCallback}
                  className="min-h-[40px] inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-lg shadow-emerald-600/20"
                >
                  <span>{currentStepData.content.actionLabel}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="p-3.5 bg-[#0a1024] border border-blue-500/30 rounded-2xl flex items-start gap-2.5 text-slate-300">
            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <strong className="text-blue-300">Mẹo hay:</strong> Bạn có thể theo dõi tiến độ thi và làm lại đề thi trong suốt khoảng thời gian mở ca thi.
            </div>
          </div>
        </div>

        {/* Footer Controls */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            disabled={activeStep === 1}
            onClick={() => setActiveStep((curr) => Math.max(1, curr - 1))}
            className="min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-bold text-slate-200 bg-[#14182b] hover:bg-slate-800 border border-slate-700 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            ← Bước trước
          </button>

          <span className="text-xs font-mono tabular-nums text-slate-400">
            Bước {activeStep} / {steps.length}
          </span>

          {activeStep < steps.length ? (
            <button
              type="button"
              onClick={() => setActiveStep((curr) => Math.min(steps.length, curr + 1))}
              className="min-h-[40px] px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition flex items-center gap-1 cursor-pointer"
            >
              <span>Tiếp theo</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="min-h-[40px] px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>Đã hiểu</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
