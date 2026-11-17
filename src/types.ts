export interface AdminPermissions {
  lichsu: boolean;
  ketquahuongnghiep: boolean;
  danhsachtaikhoan: boolean;
  cauhinh: boolean;
  hanche: boolean;
  danhsachdkytk?: string;
}

export interface RegistrationExamConfig {
  enableHsa: boolean;
  enableVact: boolean;
  enableThptqg: boolean;
  enableHuongnghiep: boolean;
}

export interface SheetGlobalConfig {
  loadedFromSheet4: boolean;
  enableHsa: boolean;
  enableVact: boolean;
  enableThptqg: boolean;
  enableHuongnghiep: boolean;
  registrationConfig?: RegistrationExamConfig;
  batdau: string;
  ketthuc: string;
  thongbao: string;
  examLinks: Record<string, string>;
}

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
  thongbao?: string;
  registeredAt?: string;
  sourceZone?: 'sheet3_manual' | 'sheet3_web' | 'sheet1';
  rowNumber?: number;
  isAdmin?: boolean;
  adminPermissions?: AdminPermissions;
}

export interface LoginLogRecord {
  id: string;
  timestamp: string;
  isoDate: string;
  hoten: string;
  sbd: string;
  username: string;
  email?: string;
  namsinh?: string;
  monthi: string;
  device: string;
  status: string;
  synced: boolean;
}

export interface CareerResultRecord {
  id: string;
  timestamp: string;
  isoDate: string;
  hoten: string;
  sbd: string;
  username: string;
  email?: string;
  namsinh?: string;
  riasecCode: string;
  primaryTrait: string;
  secondaryTrait: string;
  scores: {
    R: number;
    I: number;
    A: number;
    S: number;
    E: number;
    C: number;
  };
  scoresText: string;
  recommendedMajors: string;
  recommendedUniversities: string;
  examFocus: string;
  device: string;
  synced: boolean;
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

export type ActiveTab = 'login' | 'register' | 'search' | 'career' | 'dashboard' | 'guide' | 'admin-logs';

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
