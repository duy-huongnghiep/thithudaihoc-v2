import { ExamDetailInfo } from '../types';

export const EXAMS_DETAILED_GUIDE: Record<'hsa' | 'vact' | 'thptqg', ExamDetailInfo> = {
  hsa: {
    id: 'hsa',
    shortName: 'HSA',
    fullName: 'Kỳ Thi Đánh Giá Năng Lực (HSA) - ĐHQG Hà Nội',
    organizer: 'Trung tâm Khảo thí - Đại học Quốc gia Hà Nội (VNU-CET)',
    scaleScore: '150 Điểm (3 phần x 50 điểm)',
    totalTime: '195 Phút (Làm liên tục trên máy tính)',
    totalQuestions: '150 Câu hỏi (gồm câu trắc nghiệm & điền đáp án)',
    format: 'Trắc nghiệm chuẩn hóa 100% trên máy tính tại phòng thi chuẩn',
    targetAudience: 'Học sinh lớp 12 và thí sinh tự do dự tuyển vào các trường ĐH',
    colorScheme: 'blue',
    description:
      'Bài thi HSA (High School Student Assessment) được thiết kế nhằm đánh giá toàn diện năng lực học sinh THPT theo 3 nhóm năng lực cốt lõi: Tư duy định lượng (Toán học), Tư duy định tính (Văn học - Ngôn ngữ), và Khoa học / Ngoại ngữ.',
    subjectsBreakdown: [
      {
        name: 'Phần 1: Tư duy Định lượng (Toán học & Xử lý số liệu)',
        duration: '75 Phút',
        questions: '50 Câu (35 câu 4 lựa chọn + 15 câu điền số)',
        topics: [
          'Đại số & Giải tích: Hàm số, tích phân, lượng giác, phương trình - hệ phương trình',
          'Hình học & Đo lường: Hình không gian Oxyz, thể tích khối đa diện, hình học phẳng',
          'Thống kê & Xác suất: Tổ hợp, chỉnh hợp, quy tắc đếm, xác suất có điều kiện',
          'Tư duy mô hình hóa: Bài toán ứng dụng thực tế, bài toán tối ưu và biểu đồ số liệu',
        ],
        note: 'Có 15 câu yêu cầu thí sinh tự tính toán và điền đáp án là số thực vào ô trống.',
      },
      {
        name: 'Phần 2: Tư duy Định tính (Văn học & Ngôn ngữ)',
        duration: '60 Phút',
        questions: '50 Câu hỏi trắc nghiệm 4 lựa chọn',
        topics: [
          'Đọc hiểu văn bản: Trích đoạn văn học hiện đại, trung đại, văn bản thông tin & nhật dụng',
          'Kiến thức tiếng Việt: Từ vựng, ngữ pháp, lỗi câu, biện pháp tu từ, ngữ cảnh giao tiếp',
          'Năng lực phân tích & lập luận: Tìm ý chính, nhận định tác giả, logic liên kết đoạn văn',
          'Vận dụng ngôn ngữ: Phong cách ngôn ngữ văn bản, sửa lỗi dùng từ và logic',
        ],
        note: 'Đề thi trích nguồn văn bản phong phú ngoài SGK, đòi hỏi tốc độ đọc nhanh và hiểu sâu.',
      },
      {
        name: 'Phần 3: Khoa học Tự nhiên & Xã hội / Ngoại ngữ (Tự chọn)',
        duration: '60 Phút',
        questions: '50 Câu hỏi trắc nghiệm',
        topics: [
          'Vật lý (10 câu): Cơ học, nhiệt, điện xoay chiều, sóng ánh sáng, vật lý hạt nhân',
          'Hóa học (10 câu): Cấu tạo chất, kim loại, phi kim, hợp chất hữu cơ, hóa thực nghiệm',
          'Sinh học (10 câu): Di truyền học, sinh học tế bào, cơ thể sinh vật, sinh thái học',
          'Lịch sử & Địa lý (10 câu mỗi môn): Lịch sử Việt Nam/thế giới hiện đại, địa lý tự nhiên/kinh tế',
          'Ngoại ngữ (Tiếng Anh - dành cho thí sinh chọn phân môn Tiếng Anh): Ngữ pháp, từ vựng, đọc hiểu',
        ],
        note: 'Thí sinh được lựa chọn phân môn phù hợp với tổ hợp ngành xét tuyển dự kiến.',
      },
    ],
    scoringDetails:
      'Mỗi câu trả lời đúng được 1 điểm, câu trả lời sai không bị trừ điểm. Điểm tối đa bài thi là 150 điểm. Thí sinh được cấp Giấy chứng nhận kết quả thi có giá trị xét tuyển trong vòng 2 năm.',
    acceptedUniversities:
      'Hơn 90+ trường Đại học, Học viện trên toàn quốc sử dụng kết quả HSA (ĐHQGHN, ĐH Ngoại Thương, ĐH Kinh Tế Quốc Dân, ĐH Bách Khoa HN, ĐH Sư Phạm HN, ĐH Thương Mại, ĐH Y Hà Nội, Học viện Tài chính, Học viện Ngân hàng...).',
    strategies: [
      'Phân bổ thời gian nghiêm ngặt: Mỗi câu chỉ có trung bình ~1.3 phút để tư duy và điền kết quả.',
      'Ở phần Định lượng, ưu tiên làm chắc 35 câu trắc nghiệm trước khi giải 15 câu điền số.',
      'Không bỏ trống bất kỳ câu hỏi nào vì không bị trừ điểm nếu chọn sai.',
      'Luyện kỹ năng sử dụng máy tính cầm tay Casio/Vinacal thành thạo để rút ngắn thời gian tính.',
    ],
  },
  vact: {
    id: 'vact',
    shortName: 'V-ACT',
    fullName: 'Kỳ Thi Đánh Giá Năng Lực (V-ACT) - ĐHQG TP. Hồ Chí Minh',
    organizer: 'Trung tâm Khảo thí & Đánh giá chất lượng đào tạo - ĐHQG TP.HCM',
    scaleScore: '1.200 Điểm (Chấm theo lý thuyết ứng đáp câu hỏi - IRT)',
    totalTime: '150 Phút (Làm bài liên tục, KHÔNG chia thời gian từng phần)',
    totalQuestions: '120 Câu hỏi trắc nghiệm 4 lựa chọn (A, B, C, D)',
    format: 'Thi trắc nghiệm trên giấy (Tô phiếu trả lời trắc nghiệm quang học)',
    targetAudience: 'Học sinh lớp 12 và thí sinh tự do xét tuyển ĐH miền Nam & miền Trung',
    colorScheme: 'emerald',
    description:
      'Bài thi V-ACT (Vietnam National University Aptitude Test) được tổ chức theo hình thức thi trắc nghiệm trên giấy với 120 câu hỏi làm liên tục trong 150 phút (thí sinh tự chủ động phân bổ thời gian cho toàn bộ đề thi, không chia khung giờ riêng từng phần). Điểm số đánh giá tổng hợp năng lực ngôn ngữ, tư duy toán học và tư duy khoa học.',
    subjectsBreakdown: [
      {
        name: 'Phần 1: Sử dụng Ngôn ngữ (60 câu)',
        duration: 'Không chia thời gian riêng (nằm trong 150 phút)',
        questions: '60 Câu hỏi trắc nghiệm (30 câu Tiếng Việt + 30 câu Tiếng Anh)',
        topics: [
          '1.1. Tiếng Việt (30 câu): Đánh giá chính tả, từ vựng, ngữ pháp, các biện pháp tu từ, phong cách ngôn ngữ và đọc hiểu phân tích văn bản',
          '1.2. Tiếng Anh (30 câu): Nhận biết lỗi ngữ pháp, cấu trúc câu, từ vựng đồng nghĩa - trái nghĩa, hoàn thành câu và đọc hiểu đoạn văn',
        ],
        note: 'Chiếm 50% số lượng câu hỏi trong đề thi. Yêu cầu vốn từ vựng phong phú, đọc hiểu nhanh và chính xác.',
      },
      {
        name: 'Phần 2: Toán học (30 câu)',
        duration: 'Không chia thời gian riêng (nằm trong 150 phút)',
        questions: '30 Câu hỏi trắc nghiệm',
        topics: [
          'Đại số, giải tích, phương trình, hàm số và lượng giác THPT',
          'Hình học không gian, thể tích, tọa độ hình học phẳng và không gian',
          'Tổ hợp, xác suất, quy tắc đếm, thống kê và mô hình toán ứng dụng',
        ],
        note: 'Tập trung kiểm tra tư duy toán học, kỹ năng biến đổi và giải quyết bài toán thực tế.',
      },
      {
        name: 'Phần 3: Tư duy Khoa học (30 câu)',
        duration: 'Không chia thời gian riêng (nằm trong 150 phút)',
        questions: '30 Câu (12 câu Logic & Số liệu + 18 câu Suy luận khoa học)',
        topics: [
          '3.1. Logic & Phân tích số liệu (12 câu): Suy luận logic mệnh đề, bài toán sắp xếp vị trí, đọc & phân tích biểu đồ (cột, tròn, đường) và bảng số liệu thống kê',
          '3.2. Suy luận khoa học (18 câu): Các câu hỏi đơn và chùm câu giải quyết vấn đề dựa trên dữ kiện khoa học thuộc Vật lý, Hóa học, Sinh học, Địa lý và Lịch sử',
        ],
        note: 'Đề thi cung cấp thông tin, số liệu hoặc giả thuyết thí nghiệm để thí sinh tư duy suy luận khoa học thay vì chỉ ghi nhớ máy móc.',
      },
    ],
    scoringDetails:
      'Điểm bài thi được tính theo phương pháp trắc nghiệm hiện đại IRT (Item Response Theory). Mỗi câu có trọng số điểm khác nhau tùy thuộc vào độ khó và độ phân hóa. Điểm tối đa là 1.200 điểm.',
    acceptedUniversities:
      'Hơn 100+ trường Đại học, Cao đẳng tại TP.HCM, miền Nam, miền Trung và Tây Nguyên (ĐHQG-HCM: Bách Khoa, KHTN, KHXH&NV, Kinh Tế - Luật, CNTT, Quốc Tế; ĐH Ngoại Thương CS2, ĐH Kinh Tế TP.HCM, ĐH Y Dược TP.HCM, ĐH Sư Phạm Kỹ Thuật...).',
    strategies: [
      'Vì 150 phút làm 120 câu liên tục trên giấy, hãy phân bổ trung bình ~75 giây/câu và luôn dành 5-10 phút cuối kiểm tra tô phiếu trả lời.',
      'Ưu tiên làm phần Ngôn ngữ và Toán học trước, sau đó giải quyết phần Logic, Phân tích số liệu và Suy luận khoa học.',
      'Với các chùm câu hỏi đọc hiểu suy luận, đọc lướt câu hỏi trước để nắm từ khóa cần tìm trong văn bản đề bài.',
    ],
  },
  thptqg: {
    id: 'thptqg',
    shortName: 'THPTQG',
    fullName: 'Kỳ Thi Tốt Nghiệp THPT Quốc Gia (Chương Trình Mới)',
    organizer: 'Bộ Giáo dục và Đào tạo (MOET)',
    scaleScore: 'Thang điểm 10/môn (Tổ hợp xét tuyển 3 môn: 30 Điểm + Điểm ưu tiên)',
    totalTime: 'Tùy môn (50 - 120 Phút/môn)',
    totalQuestions: 'Tùy môn (Toán: 90p, Văn: 120p, các môn khác: 50p/40 câu)',
    format: 'Trắc nghiệm khách quan trên giấy (riêng Ngữ Văn thi tự luận)',
    targetAudience: 'Toàn bộ học sinh lớp 12 và thí sinh tự do trên toàn quốc',
    colorScheme: 'purple',
    description:
      'Kỳ thi tốt nghiệp THPT theo Chương trình GDPT mới gồm 2 môn thi bắt buộc (Toán, Ngữ Văn) và 2 môn tự chọn trong số các môn: Ngoại ngữ, Vật lý, Hóa học, Sinh học, Lịch sử, Địa lý, GD Kinh tế & Pháp luật, Tin học, Công nghệ.',
    subjectsBreakdown: [
      {
        name: 'Môn Toán Học (Có hỗ trợ thi thử trên Web)',
        duration: '90 Phút',
        questions: 'Cấu trúc 3 dạng thức trắc nghiệm mới (4 lựa chọn, Đúng/Sai, Điền đáp án ngắn)',
        topics: [
          'Dạng 1: Trắc nghiệm nhiều lựa chọn (nhận biết, thông hiểu)',
          'Dạng 2: Trắc nghiệm Đúng/Sai (yêu cầu phân tích sâu 4 mệnh đề a, b, c, d)',
          'Dạng 3: Trắc nghiệm trả lời ngắn (yêu cầu tự tính toán điền kết quả vào ô)',
          'Chủ đề: Khảo sát hàm số, Hình không gian Oxyz, Tích phân & Ứng dụng, Xác suất & Thống kê',
        ],
        note: 'Cấu trúc đề mới hạn chế đoán mò, đánh giá thực chất năng lực toán học của học sinh.',
      },
      {
        name: 'Môn Vật Lý (Có hỗ trợ thi thử trên Web)',
        duration: '50 Phút',
        questions: '40 Câu hỏi trắc nghiệm theo dạng thức mới',
        topics: [
          'Vật lý nhiệt, Khí lý tưởng và Nhiệt động lực học',
          'Từ trường, Cảm ứng điện từ, Sóng điện từ',
          'Vật lý hạt nhân & Phóng xạ, Thí nghiệm và xử lý số liệu thực hành',
        ],
        note: 'Tăng cường các bài toán gắn liền với đời sống thực tiễn và đồ thị thực nghiệm.',
      },
      {
        name: 'Môn Hóa Học (Có hỗ trợ thi thử trên Web)',
        duration: '50 Phút',
        questions: '40 Câu hỏi trắc nghiệm theo dạng thức mới',
        topics: [
          'Hóa học đại cương: Tốc độ phản ứng, cân bằng hóa học, pin điện và điện phân',
          'Hóa học vô cơ: Phức chất, kim loại chuyển tiếp và hợp chất',
          'Hóa học hữu cơ: Polime, Este - Lipit, Hợp chất thiên nhiên, Hóa dược và môi trường',
        ],
        note: 'Chú trọng vào kỹ năng đọc hiểu sơ đồ thí nghiệm và tính chất thực tế của chất.',
      },
      {
        name: 'Môn Sinh Học (Có hỗ trợ thi thử trên Web)',
        duration: '50 Phút',
        questions: '40 Câu hỏi trắc nghiệm theo dạng thức mới',
        topics: [
          'Di truyền phân tử và tế bào: DNA, RNA, Protein, đột biến gen và nhiễm sắc thể',
          'Di truyền quần thể, chọn giống và công nghệ gen ứng dụng',
          'Tiến hóa & Sinh thái học: Cân bằng hệ sinh thái và bảo tồn đa dạng sinh học',
        ],
        note: 'Đòi hỏi năng lực tư duy thực nghiệm và giải thích cơ chế sinh học.',
      },
      {
        name: 'Môn Ngữ Văn (Thi Tự Luận)',
        duration: '120 Phút',
        questions: 'Đề thi gồm 2 phần: Đọc hiểu (4.0 điểm) và Viết (6.0 điểm)',
        topics: [
          'Phần Đọc hiểu: Ngữ liệu ngoài SGK (thơ, truyện, văn bản nghị luận hoặc thông tin)',
          'Phần Viết: Viết đoạn văn nghị luận xã hội / văn học và Viết bài văn hoàn chỉnh',
        ],
        note: 'Đánh giá năng lực cảm thụ, tư duy phản biện và diễn đạt tiếng Việt của thí sinh.',
      },
      {
        name: 'Môn Ngoại Ngữ (Tiếng Anh / Tiếng Trung / Tiếng Pháp...)',
        duration: '50 Phút',
        questions: '40 Câu hỏi trắc nghiệm',
        topics: [
          'Ngữ âm, trọng âm, ngữ pháp và từ vựng theo ngữ cảnh',
          'Chức năng giao tiếp, tìm lỗi sai, viết lại câu và đọc hiểu văn bản',
        ],
      },
      {
        name: 'Môn Lịch Sử & Địa Lý',
        duration: '50 Phút/môn',
        questions: '40 Câu hỏi trắc nghiệm/môn',
        topics: [
          'Lịch sử: Lịch sử thế giới hiện đại và Lịch sử Việt Nam trọng tâm',
          'Địa lý: Địa lý tự nhiên, địa lý kinh tế xã hội và các vùng kinh tế trọng điểm',
        ],
      },
      {
        name: 'Môn GD Kinh Tế & Pháp Luật, Tin Học, Công Nghệ',
        duration: '50 Phút/môn',
        questions: '40 Câu hỏi trắc nghiệm theo chương trình GDPT mới',
        topics: [
          'GD KT&PL: Pháp luật đời sống, quyền công dân, kinh tế thị trường',
          'Tin học: Lập trình, cơ sở dữ liệu, an toàn thông tin mạng',
          'Công nghệ: Công nghệ cơ khí, điện - điện tử hoặc nông nghiệp công nghệ cao',
        ],
      },
    ],
    scoringDetails:
      'Điểm thi được chấm theo thang điểm 10 cho từng môn. Điểm xét tốt nghiệp và xét tuyển đại học được tính theo quy chế hiện hành của Bộ Giáo dục và Đào tạo.',
    acceptedUniversities:
      '100% các trường Đại học, Cao đẳng, Học viện quân sự - công an tại Việt Nam chấp nhận kết quả kỳ thi tốt nghiệp THPT.',
    strategies: [
      'Nắm vững bản chất kiến thức SGK theo chương trình giáo dục phổ thông mới.',
      'Rèn luyện kỹ dạng câu hỏi Đúng/Sai và Trả lời ngắn để tránh mất điểm đáng tiếc.',
      'Lưu ý: Hệ thống web hiện tại chỉ hỗ trợ phòng thi thử trực tuyến cho 4 môn Toán, Lý, Hóa, Sinh.',
    ],
  },
};
