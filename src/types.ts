export interface StudentInfo {
  username: string;
  password: string;
  sbd: string;
  hoten: string;
  email: string;
  namsinh: string;
  hsa: string;
  vact: string;
  thptqg: string;
  huongnghiep?: string;
  batdau?: string;
  ketthuc?: string;
}

export type ExamTimeStatus = 'FREE_TESTING' | 'OPEN' | 'UPCOMING' | 'CLOSED' | 'NO_SCHEDULE';

export interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  formatted: string;
}

export interface ExamScheduleInfo {
  batdau: string;
  ketthuc: string;
  startDate: Date | null;
  endDate: Date | null;
  status: ExamTimeStatus;
  statusMessage: string;
  timeRemainingText: string;
  formattedRange: string;
  countdown?: CountdownTime;
  isFreeTesting: boolean;
}

export interface ExamSection {
  id: string;
  title: string;
  subtitle: string;
  durationMinutes: number;
  questionCount?: number;
  url: string;
  colorScheme: 'blue' | 'emerald' | 'purple' | 'amber';
  description?: string;
  isExternalReady: boolean;
}

export interface ExamGroup {
  id: 'hsa' | 'vact' | 'thptqg';
  name: string;
  fullName: string;
  iconName: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  totalSections: number;
  sections: ExamSection[];
}

export type ActiveTab = 'login' | 'search' | 'dashboard' | 'guide';

export interface ExamDetailInfo {
  id: 'hsa' | 'vact' | 'thptqg';
  shortName: string;
  fullName: string;
  organizer: string;
  scaleScore: string;
  totalTime: string;
  totalQuestions: string;
  format: string;
  targetAudience: string;
  colorScheme: 'blue' | 'emerald' | 'purple';
  description: string;
  subjectsBreakdown: {
    name: string;
    duration: string;
    questions: string;
    topics: string[];
    note?: string;
  }[];
  scoringDetails: string;
  acceptedUniversities: string;
  strategies: string[];
}
