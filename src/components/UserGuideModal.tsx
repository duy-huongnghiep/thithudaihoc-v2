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
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

interface UserGuideModalProps {
  onClose: () => void;
  onGoToRegister?: () => void;
  onGoToSearch?: () => void;
  onGoToLogin?: () => void;
}

export const UserGuideModal: React.FC<UserGuideModalProps> = ({
  onClose,
  onGoToSearch,
  onGoToLogin,
}) => {
  const [activeStep, setActiveStep] = useState<number>(1);

  const steps = [
    {
      id: 1,
      badge: 'B1',
      title: 'Đăng Ký Ca Thi Test',
      icon: PenTool,
      color: 'amber',
      shortDesc: 'Điền form đăng ký, chọn kỳ thi & mục Hướng nghiệp',
      content: {
        heading: 'Bước 1: Đăng ký tham gia thi thử & định hướng',
        description:
          'Để được cấp tài khoản, Số Báo Danh và quyền truy cập vào các đề thi thử, thí sinh cần điền vào biểu mẫu đăng ký chính thức của Ban tổ chức.',
        bulletPoints: [
          'Truy cập link Google Form đăng ký của Ban tổ chức.',
          'Điền thông tin cá nhân: Họ và tên, Năm sinh, Email, Số điện thoại (SĐT chính là Tài khoản đăng nhập).',
          'Chọn các kỳ thi bạn muốn tham gia: ĐGNL HSA (ĐHQGHN), ĐGNL VACT (ĐHQG-HCM), THPT Quốc Gia.',
          'Đặc biệt: Chọn "Có" tại mục Hướng nghiệp nếu bạn muốn làm bài trắc nghiệm chọn ngành ĐH chuẩn Holland RIASEC.',
          'Sau khi gửi form, dữ liệu sẽ tự động được đồng bộ vào hệ thống trong vòng vài phút.',
        ],
        actionLabel: 'Mở Form Đăng Ký Google Form',
        actionUrl: 'https://forms.gle/wMqrZrqWD4RL68Az8',
        actionExternal: true,
      },
    },
    {
      id: 2,
      badge: 'B2',
      title: 'Tra Cứu Thông Tin',
      icon: Search,
      color: 'blue',
      shortDesc: 'Tìm Số Báo Danh, Tài khoản, Mật khẩu theo SĐT',
      content: {
        heading: 'Bước 2: Tra cứu thông tin dự thi và mật khẩu',
        description:
          'Sau khi đã đăng ký trên form, bạn sử dụng công cụ tra cứu tích hợp sẵn trên website để nhận thông tin đăng nhập và kiểm tra phân quyền môn thi.',
        bulletPoints: [
          'Tại trang chủ, nhấn vào liên kết "Tra cứu thông tin dự thi tại đây".',
          'Nhập Số điện thoại bạn đã dùng khi đăng ký (hoặc Số Báo Danh nếu đã biết).',
          'Nhấn "Tra cứu ngay", hệ thống sẽ trích xuất ngay:',
          '  • Số Báo Danh (SBD) chính thức',
          '  • Tên đăng nhập và Mật khẩu thi trực tuyến',
          '  • Các kỳ thi & mục Hướng nghiệp bạn đã được phân quyền',
          '  • Thời gian bắt đầu và kết thúc ca thi (nếu có lịch hẹn)',
          'Nhấn nút "Sao chép" để lưu nhanh mật khẩu, hoặc nhấn "Đăng nhập ngay với tài khoản này" để vào thẳng phòng thi!',
        ],
        actionLabel: 'Đến Trang Tra Cứu Ngay',
        actionCallback: () => {
          onClose();
          if (onGoToSearch) onGoToSearch();
        },
      },
    },
    {
      id: 3,
      badge: 'B3',
      title: 'Đăng Nhập Hệ Thống',
      icon: LogIn,
      color: 'indigo',
      shortDesc: 'Nhập TK & MK hoặc đăng nhập 1 chạm',
      content: {
        heading: 'Bước 3: Đăng nhập vào cổng thí sinh',
        description:
          'Thí sinh sử dụng tài khoản và mật khẩu vừa tra cứu được để đăng nhập vào giao diện quản lý cá nhân.',
        bulletPoints: [
          'Nhập Tài khoản (thường là Số điện thoại của bạn).',
          'Nhập Mật khẩu được cấp trong bảng tra cứu.',
          'Bấm biểu tượng con mắt để kiểm tra lại mật khẩu đã gõ chính xác chưa.',
          'Bấm nút "Đăng Nhập" để truy cập vào Bảng điều khiển thí sinh cá nhân.',
          'Gợi ý: Nếu dùng nút "Đăng nhập ngay" ở Bước 2, bạn không cần phải gõ lại mật khẩu!',
          'Hệ thống tự động đồng bộ hóa phiên làm việc và bảo mật thông tin dự thi của bạn.',
        ],
        actionLabel: 'Về Giao Diện Đăng Nhập',
        actionCallback: () => {
          onClose();
          if (onGoToLogin) onGoToLogin();
        },
      },
    },
    {
      id: 4,
      badge: 'B4',
      title: 'Đếm Ngược & Mở Đề',
      icon: Timer,
      color: 'emerald',
      shortDesc: 'Đồng hồ đếm ngược từng giây đến giờ thi',
      content: {
        heading: 'Bước 4: Theo dõi lịch thi & Đồng hồ đếm ngược',
        description:
          'Hệ thống tích hợp đồng hồ đếm ngược thông minh đến từng giây (`00:00:00`) giúp bạn chủ động thời gian.',
        bulletPoints: [
          'Chế độ có lịch thi (Ấn định ngày giờ): Đồng hồ đếm ngược từng giây đến thời điểm mở đề. Đúng giờ hẹn, phòng thi sẽ tự động mở khóa!',
          'Chế độ Thi tự do (Ban tổ chức nhập số 0): Khi bắt đầu và kết thúc là số 0, toàn bộ thông báo ca thi và hạn chế sẽ được ẩn đi. Bạn được vào làm bài bất cứ lúc nào!',
          'Thời gian làm bài: Mỗi môn thi có quy định thời gian làm bài riêng biệt (Toán, Văn, Lý, Hóa, Sinh, Tiếng Anh...).',
          'Khi hết thời gian ca thi quy định, hệ thống sẽ tự động khóa bài để đảm bảo tính công bằng.',
        ],
      },
    },
    {
      id: 5,
      badge: 'B5',
      title: 'Vào Thi Trực Tuyến',
      icon: PlayCircle,
      color: 'teal',
      shortDesc: 'Chọn môn thi, làm bài trắc nghiệm & xem điểm',
      content: {
        heading: 'Bước 5: Bắt đầu làm bài thi trắc nghiệm',
        description:
          'Sau khi phòng thi mở, bạn có thể lựa chọn các bài thi trong phạm vi đã đăng ký để bắt đầu làm bài.',
        bulletPoints: [
          'Nhấn nút "Bắt Đầu Làm Bài Thi" tại giao diện chính.',
          'Hệ thống hiển thị danh sách các môn thi bạn được phép thi (HSA / VACT / THPTQG).',
          'Bấm vào môn thi bạn muốn làm, đọc kỹ quy chế phòng thi và thời gian làm bài.',
          'Nhấn "Mở Đề & Bắt Đầu Thi" để chuyển tới phòng thi trắc nghiệm trực tuyến.',
          'Làm bài cẩn thận, không chuyển đổi tab liên tục để tránh vi phạm quy chế.',
          'Nhấn "Nộp bài" sau khi hoàn thành để nhận ngay điểm số và lời giải chi tiết!',
        ],
      },
    },
    {
      id: 6,
      badge: 'B6',
      title: 'Test Hướng Nghiệp',
      icon: Compass,
      color: 'fuchsia',
      shortDesc: 'Khảo sát 18 câu Holland RIASEC & chọn ngành ĐH',
      content: {
        heading: 'Bước 6: Trắc nghiệm hướng nghiệp RIASEC (Nếu có đăng ký)',
        description:
          'Dành cho các thí sinh có tích chọn mục Hướng nghiệp khi điền form đăng ký.',
        bulletPoints: [
          'Tại Dashboard, bạn sẽ thấy thẻ nổi bật "Trắc Nghiệm Định Hướng Nghề Nghiệp (RIASEC)".',
          'Nhấn "Làm Bài Test Hướng Nghiệp Ngay" để mở cổng trắc nghiệm hướng nghiệp chính thức của Đại Sứ Giáo Dục.',
          'Đánh giá mức độ phù hợp với bản thân qua các câu hỏi khảo sát chuẩn khoa học.',
          'Hệ thống tính điểm và phân tích chi tiết nhóm tính cách và thiên hướng nghề nghiệp của bạn.',
          'Nhận ngay gợi ý danh sách ngành nghề phù hợp xu hướng tuyển sinh 2026 và các trường ĐH đào tạo top đầu Việt Nam!',
        ],
        actionLabel: 'Mở Cổng Hướng Nghiệp (daisugiaoduc.vn)',
        actionUrl: 'https://huongnghiep.daisugiaoduc.vn/?utm_source=13837',
        actionExternal: true,
      },
    },
    {
      id: 7,
      badge: 'B7',
      title: 'Lưu Ý & Hỗ Trợ',
      icon: HelpCircle,
      color: 'purple',
      shortDesc: 'Làm mới dữ liệu, quên mật khẩu & hotline hỗ trợ',
      content: {
        heading: 'Bước 7: Hỗ trợ kỹ thuật & Các lưu ý quan trọng',
        description:
          'Giải quyết các tình huống thường gặp khi sử dụng cổng thông tin thi thử.',
        bulletPoints: [
          'Vừa đăng ký form xong? Hệ thống tự động đồng bộ tức thì, bạn có thể tra cứu hoặc đăng nhập ngay lập tức mà không cần phải tải lại trang web!',
          'Bạn cũng có thể bấm biểu tượng xoay (Làm mới) ở góc trên bên phải bất cứ lúc nào để chủ động cập nhật dữ liệu mới nhất.',
          'Quên mật khẩu hoặc nhập sai SĐT? Liên hệ ngay Fanpage hoặc Hotline của Ban tổ chức để được hỗ trợ cấp lại.',
          'Thiết bị khuyến nghị: Máy tính để bàn, laptop hoặc máy tính bảng màn hình lớn để có trải nghiệm đọc đề tốt nhất.',
          'Đường truyền internet: Đảm bảo kết nối mạng ổn định trong suốt thời gian làm bài.',
        ],
      },
    },
  ];

  const currentStepData = steps.find((s) => s.id === activeStep) || steps[0];

  return (
    <div
      id="user-guide-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="user-guide-modal"
        className="w-full max-w-2xl bg-[#121629] border border-blue-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-4 text-slate-200 relative max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3.5 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-blue-400 uppercase font-bold tracking-wider block">
                Cẩm nang toàn tập
              </span>
              <h2 className="text-base sm:text-lg font-extrabold text-white">
                Hướng Dẫn Sử Dụng Cổng Thi Thử
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition p-1.5 rounded-xl hover:bg-slate-800 cursor-pointer"
            title="Đóng hướng dẫn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Navigation Bar (Scrollable on small screens) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0 scrollbar-none border-b border-slate-800/60">
          {steps.map((s) => {
            const Icon = s.icon;
            const isActive = s.id === activeStep;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveStep(s.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 border border-blue-400/40'
                    : 'bg-[#0b0e1a] text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-mono font-black ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-blue-400'
                  }`}
                >
                  {s.badge}
                </span>
                <span className="hidden sm:inline">{s.title}</span>
                <Icon className="w-3.5 h-3.5 sm:hidden" />
              </button>
            );
          })}
        </div>

        {/* Step Detail Content (Scrollable) */}
        <div className="overflow-y-auto pr-1 space-y-4 flex-1 text-xs">
          <div className="p-4 rounded-2xl bg-[#0b0e1a] border border-slate-800/90 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md font-mono font-bold text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {currentStepData.badge}
                </span>
                <h3 className="text-sm font-bold text-white">
                  {currentStepData.content.heading}
                </h3>
              </div>
              <span className="text-[11px] text-slate-500">
                {currentStepData.id} / {steps.length}
              </span>
            </div>

            <p className="text-slate-300 leading-relaxed text-xs">
              {currentStepData.content.description}
            </p>

            {/* Bullet Points */}
            <div className="space-y-2 pt-1">
              {currentStepData.content.bulletPoints.map((point, idx) => (
                <div key={idx} className="flex items-start gap-2 text-slate-300 leading-normal">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="font-sans">{point}</span>
                </div>
              ))}
            </div>

            {/* Step Action Button if available */}
            {currentStepData.content.actionLabel && (
              <div className="pt-2">
                {currentStepData.content.actionUrl ? (
                  <a
                    href={currentStepData.content.actionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-md shadow-amber-500/20 cursor-pointer"
                  >
                    <span>{currentStepData.content.actionLabel}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : currentStepData.content.actionCallback ? (
                  <button
                    type="button"
                    onClick={currentStepData.content.actionCallback}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs transition shadow-md shadow-blue-600/20 cursor-pointer"
                  >
                    <span>{currentStepData.content.actionLabel}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : null}
              </div>
            )}
          </div>

          {/* Quick Tips Box */}
          <div className="p-3 bg-blue-950/20 border border-blue-500/25 rounded-xl flex items-start gap-2.5 text-blue-200">
            <Sparkles className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <strong>Mẹo hay:</strong> Bạn có thể theo dõi tiến độ thi và làm lại đề thi trong suốt khoảng thời gian mở ca thi. Nếu có bất kỳ thắc mắc nào, hãy nhấn nút làm mới hoặc liên hệ ngay ban quản trị!
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between shrink-0">
          <button
            type="button"
            disabled={activeStep === 1}
            onClick={() => setActiveStep((curr) => Math.max(1, curr - 1))}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            ← Bước trước
          </button>

          <div className="flex items-center gap-1.5">
            {steps.map((s) => (
              <span
                key={s.id}
                onClick={() => setActiveStep(s.id)}
                className={`w-2 h-2 rounded-full cursor-pointer transition-all ${
                  s.id === activeStep ? 'w-5 bg-blue-500' : 'bg-slate-700 hover:bg-slate-500'
                }`}
              />
            ))}
          </div>

          {activeStep < steps.length ? (
            <button
              type="button"
              onClick={() => setActiveStep((curr) => Math.min(steps.length, curr + 1))}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition shadow-md shadow-blue-600/20 flex items-center gap-1 cursor-pointer"
            >
              <span>Bước tiếp theo</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition shadow-md shadow-emerald-400/20 flex items-center gap-1 cursor-pointer"
            >
              <span>Đã hiểu, Bắt đầu</span>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
