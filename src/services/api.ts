import {
  AdminPermissions,
  ExamScheduleInfo,
  RegistrationExamConfig,
  SheetGlobalConfig,
  StudentInfo,
} from '../types';

export const DEFAULT_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbxv_LnzrD7mTAAoQYYgEZjdcW8cCNcVoEu1rPCEU2V-EGMaiRLtGRU3yv3sV3WPkeUZTA/exec';

const STORAGE_CUSTOM_URL_KEY = 'td_mock_exam_custom_script_url';
const CACHE_KEY = 'td_mock_exam_students_cache';
const CACHE_TIME_KEY = 'td_mock_exam_students_time';
const CACHE_SCHEDULE_KEY = 'td_mock_exam_global_schedule';
const CACHE_NOTICE_KEY = 'td_mock_exam_global_notice';
const LEGACY_SHEET4_ADMINS_KEY = 'td_mock_exam_sheet4_admins';
const CACHE_SHEET4_CONFIG_KEY = 'td_mock_exam_sheet4_config';

const CACHE_VERSION_KEY = 'td_mock_exam_cache_ver';
const CURRENT_CACHE_VERSION = 'v9_secure_role_separation';

// Empty seed — all authentication, lookup & roster queries run through authenticated server APIs
export const DEFAULT_STUDENTS_SEED: StudentInfo[] = [];

// Memory-only Bearer session token (never persisted to localStorage/sessionStorage)
let inMemoryAuthToken: string | null = null;

export function setAuthToken(token: string | null): void {
  inMemoryAuthToken = token && token.trim() ? token.trim() : null;
}

export function getAuthToken(): string | null {
  return inMemoryAuthToken;
}

export function getAuthHeaders(): Record<string, string> {
  return inMemoryAuthToken ? { Authorization: `Bearer ${inMemoryAuthToken}` } : {};
}

export function clearAuthSession(): void {
  inMemoryAuthToken = null;
  inMemoryStudents = [];
  try {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_TIME_KEY);
    localStorage.removeItem(LEGACY_SHEET4_ADMINS_KEY);
  } catch {
    // ignore
  }
}

export function getScriptUrl(): string {
  try {
    const custom = localStorage.getItem(STORAGE_CUSTOM_URL_KEY);
    if (custom && custom.trim().startsWith('https://script.google.com/macros/')) {
      return custom.trim();
    }
  } catch {
    // ignore
  }
  return DEFAULT_SCRIPT_URL;
}

export function setScriptUrl(url: string): void {
  try {
    if (url && url.trim().startsWith('https://script.google.com/macros/')) {
      localStorage.setItem(STORAGE_CUSTOM_URL_KEY, url.trim());
    } else {
      localStorage.removeItem(STORAGE_CUSTOM_URL_KEY);
    }
  } catch {
    // ignore
  }
}

// Purge any stale localStorage caches from older insecure versions on startup
(() => {
  try {
    const ver = localStorage.getItem(CACHE_VERSION_KEY);
    if (ver !== CURRENT_CACHE_VERSION) {
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(CACHE_TIME_KEY);
      localStorage.removeItem(LEGACY_SHEET4_ADMINS_KEY);
      localStorage.setItem(CACHE_VERSION_KEY, CURRENT_CACHE_VERSION);
    }
  } catch {
    // ignore
  }
})();

let inMemoryStudents: StudentInfo[] = [];

let isFetchingPromise: Promise<StudentInfo[]> | null = null;
let autoSyncInitialized = false;

let inMemoryGlobalSchedule: { batdau: string; ketthuc: string } = (() => {
  try {
    const saved = localStorage.getItem(CACHE_SCHEDULE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return { batdau: '', ketthuc: '' };
})();

const DEFAULT_REGISTRATION_CONFIG: RegistrationExamConfig = {
  enableHsa: true,
  enableVact: true,
  enableThptqg: true,
  enableHuongnghiep: true,
};

const DEFAULT_GLOBAL_SHEET_CONFIG: SheetGlobalConfig = {
  loadedFromSheet4: false,
  enableHsa: true,
  enableVact: true,
  enableThptqg: true,
  enableHuongnghiep: true,
  registrationConfig: { ...DEFAULT_REGISTRATION_CONFIG },
  batdau: '',
  ketthuc: '',
  thongbao: '',
  examLinks: {},
};

let inMemoryGlobalSheetConfig: SheetGlobalConfig = (() => {
  try {
    const saved = localStorage.getItem(CACHE_SHEET4_CONFIG_KEY);
    if (saved) return { ...DEFAULT_GLOBAL_SHEET_CONFIG, ...JSON.parse(saved) };
  } catch {
    // ignore
  }
  return { ...DEFAULT_GLOBAL_SHEET_CONFIG };
})();

const globalConfigListeners = new Set<(cfg: SheetGlobalConfig) => void>();

export function getGlobalSheetConfig(): SheetGlobalConfig {
  return inMemoryGlobalSheetConfig;
}

export function getRegistrationConfig(): RegistrationExamConfig {
  if (inMemoryGlobalSheetConfig.registrationConfig) {
    return inMemoryGlobalSheetConfig.registrationConfig;
  }
  return { ...DEFAULT_REGISTRATION_CONFIG };
}

export function subscribeGlobalConfig(listener: (cfg: SheetGlobalConfig) => void): () => void {
  globalConfigListeners.add(listener);
  return () => {
    globalConfigListeners.delete(listener);
  };
}

export function getExamSectionUrl(sectionId: string, fallbackUrl: string): string {
  const custom = inMemoryGlobalSheetConfig.examLinks?.[sectionId];
  if (custom && (custom.startsWith('http://') || custom.startsWith('https://'))) {
    return custom;
  }
  return fallbackUrl;
}

export function getAdminPermissions(student: StudentInfo | null | undefined): AdminPermissions {
  if (student?.adminPermissions) {
    return {
      lichsu: Boolean(student.adminPermissions.lichsu),
      ketquahuongnghiep: Boolean(student.adminPermissions.ketquahuongnghiep),
      danhsachtaikhoan: Boolean(student.adminPermissions.danhsachtaikhoan),
      cauhinh: Boolean(student.adminPermissions.cauhinh),
      hanche: Boolean(student.adminPermissions.hanche),
      danhsachdkytk: String(student.adminPermissions.danhsachdkytk || '').trim(),
    };
  }
  // Default permissions for legacy Sheet 1 admins before Sheet 4 is deployed
  return {
    lichsu: true,
    ketquahuongnghiep: true,
    danhsachtaikhoan: true,
    cauhinh: true,
    hanche: false,
    danhsachdkytk: '',
  };
}

/**
 * Parse a Vietnam date cutoff (e.g., "1/11/2026" -> 00:00:00 GMT+7 on Nov 1, 2026)
 * Strictly interprets D/M/YYYY as Day-First!
 */
export function parseVietnamDateCutoff(val?: string | null): number | null {
  if (!val) return null;
  const s = String(val).trim();
  if (!s) return null;

  // Match D/M/YYYY or DD-MM-YYYY (with optional time ignored -> start of day 00:00:00 GMT+7)
  const dmY = s.match(/(?:^|\s)(\d{1,2})[/-](\d{1,2})[/-](\d{4})(?:\s|$)/);
  if (dmY) {
    const day = Number(dmY[1]);
    const month = Number(dmY[2]);
    const year = Number(dmY[3]);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return Date.UTC(year, month - 1, day, -7, 0, 0, 0);
    }
  }

  // Match YYYY-MM-DD
  const yMd = s.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
  if (yMd) {
    const year = Number(yMd[1]);
    const month = Number(yMd[2]);
    const day = Number(yMd[3]);
    return Date.UTC(year, month - 1, day, -7, 0, 0, 0);
  }

  const parsed = new Date(s);
  if (isNaN(parsed.getTime())) return null;
  // Normalize to start of day in GMT+7
  const vnOffsetMs = 7 * 3600 * 1000;
  const vnDate = new Date(parsed.getTime() + vnOffsetMs);
  return Date.UTC(vnDate.getUTCFullYear(), vnDate.getUTCMonth(), vnDate.getUTCDate(), -7, 0, 0, 0);
}

/**
 * Parse a Vietnam timestamp string ("08:15:22 11/11/2026", "11/11/2026 08:15:22", "11/11/2026", or ISO)
 * into UTC milliseconds for accurate comparison against parseVietnamDateCutoff.
 */
export function parseVietnamTimestampMs(val?: string | null, fallbackIso?: string | null): number | null {
  const s = String(val || '').trim();
  if (s) {
    // Format 1: HH:mm(:ss) DD/MM/YYYY
    let m = s.match(/^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?\s+(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
    if (m) {
      const [, h, min, sec = '0', d, mon, y] = m;
      return Date.UTC(Number(y), Number(mon) - 1, Number(d), Number(h) - 7, Number(min), Number(sec));
    }
    // Format 2: DD/MM/YYYY HH:mm(:ss)
    m = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/);
    if (m) {
      const [, d, mon, y, h, min, sec = '0'] = m;
      return Date.UTC(Number(y), Number(mon) - 1, Number(d), Number(h) - 7, Number(min), Number(sec));
    }
    // Format 3: DD/MM/YYYY
    m = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
    if (m) {
      const [, d, mon, y] = m;
      return Date.UTC(Number(y), Number(mon) - 1, Number(d), -7, 0, 0, 0);
    }
    const parsed = new Date(s);
    if (!isNaN(parsed.getTime())) return parsed.getTime();
  }
  if (fallbackIso) {
    const iso = new Date(fallbackIso);
    if (!isNaN(iso.getTime())) return iso.getTime();
  }
  return null;
}

function setGlobalSheetConfig(cfg: SheetGlobalConfig): void {
  inMemoryGlobalSheetConfig = cfg;
  try {
    localStorage.setItem(CACHE_SHEET4_CONFIG_KEY, JSON.stringify(cfg));
  } catch {
    // ignore
  }
  globalConfigListeners.forEach((cb) => {
    try {
      cb(cfg);
    } catch {
      // ignore
    }
  });
}

export function sanitizeSystemNotice(raw: unknown): string {
  const s = String(raw ?? '').trim();
  if (!s) return '';
  const lower = s.toLowerCase();
  if (
    lower === '0' ||
    lower === 'không' ||
    lower === 'khong' ||
    lower === 'none' ||
    lower === 'null' ||
    lower === 'undefined' ||
    lower === 'false' ||
    lower === '-'
  ) {
    return '';
  }
  // Ignore bare schedule date/time strings accidentally left in row 2 (e.g. "00:00 30/11/2026", "30/11/2026")
  if (
    /^\d{1,2}:\d{2}(?::\d{2})?\s+\d{1,2}[/-]\d{1,2}[/-]\d{4}$/.test(s) ||
    /^\d{1,2}[/-]\d{1,2}[/-]\d{4}(?:\s+\d{1,2}:\d{2}(?::\d{2})?)?$/.test(s) ||
    /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}(?::\d{2})?(?:\.\d+)?Z?)?$/.test(s) ||
    /^(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}\s+\d{4}\b.*GMT[+-]\d{4}/i.test(s)
  ) {
    return '';
  }
  return s;
}

let inMemoryGlobalNotice: string = (() => {
  try {
    const raw = localStorage.getItem(CACHE_NOTICE_KEY) || '';
    const cleaned = sanitizeSystemNotice(raw);
    if (!cleaned && raw) {
      localStorage.removeItem(CACHE_NOTICE_KEY);
    }
    return cleaned;
  } catch {
    return '';
  }
})();

const noticeListeners = new Set<(notice: string) => void>();

export function getGlobalNotice(): string {
  return inMemoryGlobalNotice;
}

export function subscribeGlobalNotice(listener: (notice: string) => void): () => void {
  noticeListeners.add(listener);
  return () => {
    noticeListeners.delete(listener);
  };
}

function setGlobalNotice(value: string): void {
  const normalized = sanitizeSystemNotice(value);
  if (inMemoryGlobalNotice === normalized) return;
  inMemoryGlobalNotice = normalized;
  try {
    if (normalized) {
      localStorage.setItem(CACHE_NOTICE_KEY, normalized);
    } else {
      localStorage.removeItem(CACHE_NOTICE_KEY);
    }
  } catch {
    // ignore
  }
  noticeListeners.forEach((cb) => {
    try {
      cb(normalized);
    } catch {
      // ignore
    }
  });
}

export function cleanDigits(val: string | number | undefined | null): string {
  return val ? String(val).replace(/\D/g, '') : '';
}

export function isYes(val: string | number | boolean | undefined | null): boolean {
  if (val === true) return true;
  if (!val) return false;
  const v = String(val).toLowerCase().trim();
  return (
    v === 'có' ||
    v === 'co' ||
    v === 'x' ||
    v === '1' ||
    v === 'yes' ||
    v === 'true' ||
    v === 'tick' ||
    v === '✓' ||
    v === '✔' ||
    v === 'đăng ký' ||
    v === 'dang ky'
  );
}

export function parseDateTimeString(val: string | null | undefined): Date | null {
  if (!val) return null;
  const str = String(val).trim();
  if (!str) return null;

  // Format 1: HH:mm DD/MM/YYYY (e.g., "00:00 23/10/2026", "23:59 24/10/2026")
  const m1 = str.match(/^(\d{1,2}):(\d{1,2})\s+(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m1) {
    const [, h, min, d, m, y] = m1;
    return new Date(Number(y), Number(m) - 1, Number(d), Number(h), Number(min));
  }

  // Format 2: DD/MM/YYYY HH:mm
  const m2 = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{1,2})$/);
  if (m2) {
    const [, d, m, y, h, min] = m2;
    return new Date(Number(y), Number(m) - 1, Number(d), Number(h), Number(min));
  }

  // Format 3: DD/MM/YYYY
  const m3 = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m3) {
    const [, d, m, y] = m3;
    return new Date(Number(y), Number(m) - 1, Number(d), 0, 0);
  }

  // Standard fallback
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

export function isZeroValue(val?: string | null): boolean {
  if (!val) return true;
  const clean = String(val).trim().toLowerCase();
  return (
    clean === '0' ||
    clean === '00' ||
    clean === '0.0' ||
    clean === 'không' ||
    clean === 'khong' ||
    clean === 'none' ||
    clean === 'free' ||
    clean === 'tự do' ||
    clean === 'tu do'
  );
}

export function formatDateTimeNice(d: Date | null, fallback = ''): string {
  if (!d) return fallback;
  const pad = (n: number) => String(n).padStart(2, '0');
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  const day = pad(d.getDate());
  const month = pad(d.getMonth() + 1);
  const year = d.getFullYear();
  return `${hours}:${minutes} ${day}/${month}/${year}`;
}

export function calculateCountdown(targetDate: Date, now: Date = new Date()) {
  const pad = (n: number) => String(n).padStart(2, '0');
  const diffMs = targetDate.getTime() - now.getTime();
  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const formatted =
    days > 0
      ? `${days} ngày ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
      : `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  return { days, hours, minutes, seconds, totalSeconds, formatted };
}

export function getExamSchedule(student?: StudentInfo | null): ExamScheduleInfo {
  const batdau = student?.batdau?.trim() || inMemoryGlobalSchedule.batdau.trim();
  const ketthuc = student?.ketthuc?.trim() || inMemoryGlobalSchedule.ketthuc.trim();

  // If both are 0 or empty, or explicitly set to 0 -> Free Testing Mode (NO banner, NO restriction)
  const isBatdauZero = isZeroValue(batdau);
  const isKetthucZero = isZeroValue(ketthuc);

  if (isBatdauZero && isKetthucZero) {
    return {
      batdau,
      ketthuc,
      startDate: null,
      endDate: null,
      status: 'FREE_TESTING',
      statusMessage: '',
      timeRemainingText: '',
      formattedRange: '',
      isFreeTesting: true,
    };
  }

  const startDate = parseDateTimeString(batdau);
  const endDate = parseDateTimeString(ketthuc);

  // If neither could be parsed as a real date/time
  if (!startDate && !endDate) {
    return {
      batdau,
      ketthuc,
      startDate: null,
      endDate: null,
      status: 'FREE_TESTING',
      statusMessage: '',
      timeRemainingText: '',
      formattedRange: '',
      isFreeTesting: true,
    };
  }

  const now = new Date();
  const formattedRange = `${batdau || '...'} đến ${ketthuc || '...'}`;

  // If before start date (UPCOMING) -> Real-time countdown to opening time
  if (startDate && now.getTime() < startDate.getTime()) {
    const cd = calculateCountdown(startDate, now);

    return {
      batdau,
      ketthuc,
      startDate,
      endDate,
      status: 'UPCOMING',
      statusMessage: `Chưa đến giờ mở đề thi. Hệ thống sẽ tự động mở vào lúc ${formatDateTimeNice(startDate, batdau)}.`,
      timeRemainingText: `Mở sau: ${cd.formatted}`,
      formattedRange,
      countdown: cd,
      isFreeTesting: false,
    };
  }

  // If after end date (CLOSED)
  if (endDate && now.getTime() > endDate.getTime()) {
    return {
      batdau,
      ketthuc,
      startDate,
      endDate,
      status: 'CLOSED',
      statusMessage: `Thời hạn thi thử đã kết thúc vào lúc ${formatDateTimeNice(endDate, ketthuc)}. Hệ thống đã khóa làm bài.`,
      timeRemainingText: 'Đã hết hạn thi',
      formattedRange,
      isFreeTesting: false,
    };
  }

  // Currently OPEN
  let timeRemainingText = 'Đang mở';
  let countdown;
  if (endDate) {
    countdown = calculateCountdown(endDate, now);
    timeRemainingText = `Còn lại: ${countdown.formatted}`;
  }

  return {
    batdau,
    ketthuc,
    startDate,
    endDate,
    status: 'OPEN',
    statusMessage: endDate
      ? `Ca thi đang mở! Hạn chót: ${formatDateTimeNice(endDate, ketthuc)}.`
      : 'Ca thi đang mở.',
    timeRemainingText,
    formattedRange,
    countdown,
    isFreeTesting: false,
  };
}

export function isStudentAdmin(student: StudentInfo | null | undefined): boolean {
  return Boolean(student && student.isAdmin === true && student.role === 'admin');
}

/**
 * Normalize a student row from Trang tính 3 / Trang tính 1.
 * Strictly NEVER promotes student rows to Admin — ONLY Trang tính 4 grants Admin access.
 */
export function parseStudentInfo(row: unknown, index?: number): StudentInfo {
  if (!row) {
    return {
      username: '',
      password: '',
      sbd: '',
      hoten: '',
      email: '',
      namsinh: '',
      hsa: '',
      vact: '',
      thptqg: '',
      huongnghiep: '',
      batdau: '',
      ketthuc: '',
      isAdmin: false,
      role: 'student',
    };
  }

  const rowNumber =
    typeof (row as any)?.rowNumber === 'number'
      ? (row as any).rowNumber
      : index !== undefined
      ? index + 2
      : undefined;

  if (Array.isArray(row)) {
    const rawNamsinh = String(row[5] || '').trim();
    const rawHsa = String(row[6] || '').trim();
    const isShiftedYear = !rawNamsinh && cleanDigits(rawHsa).length === 4;
    const finalNamsinh = isShiftedYear ? rawHsa : rawNamsinh;
    const finalHsa = isShiftedYear ? String(row[7] || '').trim() : rawHsa;

    return {
      username: String(row[0] || '').trim(),
      password: '',
      sbd: String(row[2] || '').trim(),
      hoten: String(row[3] || '').trim(),
      email: String(row[4] || '').trim(),
      namsinh: finalNamsinh,
      hsa: finalHsa,
      vact: String(row[isShiftedYear ? 8 : 7] || '').trim(),
      thptqg: String(row[isShiftedYear ? 9 : 8] || '').trim(),
      huongnghiep: String(row[isShiftedYear ? 10 : 9] || '').trim(),
      batdau: String(row[isShiftedYear ? 11 : 10] || '').trim(),
      ketthuc: String(row[isShiftedYear ? 12 : 11] || '').trim(),
      thongbao: String(row[isShiftedYear ? 13 : 12] || row[13] || row[14] || '').trim(),
      rowNumber,
      isAdmin: false,
      role: 'student',
    };
  }

  const record = row as Record<string, unknown>;

  const getFieldValue = (fieldKey: string, aliasKeys: string[]): string => {
    if (record[fieldKey] !== undefined && record[fieldKey] !== null) {
      const val = String(record[fieldKey]).trim();
      if (val) return val;
    }

    const targetKeys = [fieldKey, ...aliasKeys].map((k) =>
      k.toLowerCase().replace(/[^a-z0-9]/g, '')
    );

    for (const target of targetKeys) {
      for (const k of Object.keys(record)) {
        const cleanK = k.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (cleanK === target) {
          const val = String(record[k] ?? '').trim();
          if (val) return val;
        }
      }
    }

    for (const target of targetKeys) {
      if (target.length < 3) continue;
      for (const k of Object.keys(record)) {
        const cleanK = k.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (
          fieldKey === 'hoten' &&
          (cleanK.includes('user') || cleanK.includes('taikhoan') || cleanK.includes('sdt') || cleanK.includes('pass'))
        ) {
          continue;
        }
        if (cleanK.includes(target)) {
          const val = String(record[k] ?? '').trim();
          if (val) return val;
        }
      }
    }
    return '';
  };

  const parsedUsername = getFieldValue('username', ['taikhoan', 'user', 'tk', 'sdt']);
  let parsedHoten = getFieldValue('hoten', ['hovaten', 'fullname', 'ten']);
  let parsedNamsinh = getFieldValue('namsinh', ['namsinh', 'birth', 'ns', 'yearofbirth']);
  const parsedHsa = getFieldValue('hsa', ['dgnl', 'danhgianangluc']);

  if (
    parsedHoten &&
    parsedUsername &&
    parsedHoten === parsedUsername &&
    cleanDigits(parsedUsername).length >= 8
  ) {
    const altName = String(record['hoten'] || record['Họ và tên'] || record['ten'] || '').trim();
    if (altName && altName !== parsedUsername) {
      parsedHoten = altName;
    }
  }

  if (!parsedNamsinh && cleanDigits(parsedHsa).length === 4) {
    parsedNamsinh = parsedHsa;
  }

  const parsedSbd = getFieldValue('sbd', ['sobaodanh', 'sbaodanh']);
  const parsedEmail = getFieldValue('email', ['mail']);

  const rawZone = (record as any)?.sourceZone;
  const sourceZone: StudentInfo['sourceZone'] =
    rawZone === 'sheet3_web' || rawZone === 'sheet3_manual' || rawZone === 'sheet1'
      ? rawZone
      : undefined;

  return {
    username: parsedUsername,
    password: '',
    hasPassword: Boolean((record as any)?.hasPassword),
    sbd: parsedSbd,
    hoten: parsedHoten,
    email: parsedEmail,
    namsinh: parsedNamsinh,
    hsa: parsedHsa,
    vact: getFieldValue('vact', ['v_act']),
    thptqg: getFieldValue('thptqg', ['thpt', 'totnghiep']),
    huongnghiep: getFieldValue('huongnghiep', ['career', 'nghiep']),
    batdau: getFieldValue('batdau', ['start', 'open', 'thoigianbatdau', 'tgstart']),
    ketthuc: getFieldValue('ketthuc', ['end', 'close', 'thoigianketthuc', 'han', 'tgend']),
    thongbao: getFieldValue('thongbao', ['Thongbao', 'thong_bao', 'notice', 'announcement']),
    registeredAt: getFieldValue('registeredAt', ['time', 'thoigian', 'thoigiandangky', 'createdAt']),
    sourceZone,
    rowNumber,
    isAdmin: false,
    role: 'student',
  };
}

export function finalizeStudentList(list: StudentInfo[]): StudentInfo[] {
  if (!inMemoryGlobalSheetConfig.loadedFromSheet4) {
    const foundBatdau = list.find((s) => s.batdau && s.batdau.trim())?.batdau?.trim() || '';
    const foundKetthuc = list.find((s) => s.ketthuc && s.ketthuc.trim())?.ketthuc?.trim() || '';

    if (foundBatdau || foundKetthuc) {
      inMemoryGlobalSchedule = {
        batdau: foundBatdau,
        ketthuc: foundKetthuc,
      };
      try {
        localStorage.setItem(CACHE_SCHEDULE_KEY, JSON.stringify(inMemoryGlobalSchedule));
      } catch {
        // ignore
      }
    }
  }

  return list.map((s) => ({
    ...s,
    batdau: inMemoryGlobalSheetConfig.loadedFromSheet4
      ? inMemoryGlobalSheetConfig.batdau
      : s.batdau?.trim() || inMemoryGlobalSchedule.batdau,
    ketthuc: inMemoryGlobalSheetConfig.loadedFromSheet4
      ? inMemoryGlobalSheetConfig.ketthuc
      : s.ketthuc?.trim() || inMemoryGlobalSchedule.ketthuc,
  }));
}

function applySheet4Data(sheet4Payload: any): boolean {
  if (!sheet4Payload || !sheet4Payload.deployed) return false;

  if (sheet4Payload.globalConfig) {
    const gc = sheet4Payload.globalConfig;
    const batdau = String(gc.batdau ?? '').trim();
    const ketthuc = String(gc.ketthuc ?? '').trim();
    const thongbao = sanitizeSystemNotice(gc.thongbao);
    const rawReg = sheet4Payload.registrationConfig || gc.registrationConfig;
    const registrationConfig: RegistrationExamConfig = rawReg
      ? {
          enableHsa: Boolean(rawReg.enableHsa),
          enableVact: Boolean(rawReg.enableVact),
          enableThptqg: Boolean(rawReg.enableThptqg),
          enableHuongnghiep: Boolean(rawReg.enableHuongnghiep),
        }
      : { ...DEFAULT_REGISTRATION_CONFIG };

    const nextCfg: SheetGlobalConfig = {
      loadedFromSheet4: true,
      enableHsa: Boolean(gc.enableHsa),
      enableVact: Boolean(gc.enableVact),
      enableThptqg: Boolean(gc.enableThptqg),
      enableHuongnghiep: Boolean(gc.enableHuongnghiep),
      registrationConfig,
      batdau,
      ketthuc,
      thongbao,
      examLinks: sheet4Payload.examLinks || gc.examLinks || {},
    };

    inMemoryGlobalSchedule = { batdau, ketthuc };
    try {
      localStorage.setItem(CACHE_SCHEDULE_KEY, JSON.stringify(inMemoryGlobalSchedule));
    } catch {
      // ignore
    }
    setGlobalNotice(thongbao);
    setGlobalSheetConfig(nextCfg);
  }

  return true;
}

async function fetchSheet4FromNetwork(currentUrl: string, forceRefresh = false): Promise<boolean> {
  try {
    const proxyUrl = `/api/sheet4-data?url=${encodeURIComponent(currentUrl)}${forceRefresh ? `&_t=${Date.now()}` : ''}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 14000);
    const res = await fetch(proxyUrl, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const payload = await res.json();
      if (applySheet4Data(payload)) return true;
    }
  } catch {
    // ignore
  }
  return false;
}

export async function refreshSystemCache(): Promise<void> {
  const currentUrl = getScriptUrl();
  const res = await fetch('/api/refresh-cache', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ scriptUrl: currentUrl }),
  });
  const json = await res.json().catch(() => null);
  if (json?.sheet4) {
    applySheet4Data(json.sheet4);
  }
  if (!res.ok || !json?.success) {
    throw new Error(json?.message || 'Không thể đồng bộ dữ liệu từ Google Sheets.');
  }
  if (inMemoryAuthToken) {
    await getStudentsData(true);
  }
}

/**
 * Fetch student roster for authorized Admins ONLY (server verifies Bearer token & permissions).
 * Also refreshes Sheet 4 public config (schedule, exam links, notice).
 */
export async function getStudentsData(forceRefresh = false): Promise<StudentInfo[]> {
  const currentUrl = getScriptUrl();
  await fetchSheet4FromNetwork(currentUrl, forceRefresh);

  if (!inMemoryAuthToken) {
    return inMemoryStudents;
  }

  if (inMemoryStudents.length > 0 && !forceRefresh) {
    return inMemoryStudents;
  }

  if (isFetchingPromise && !forceRefresh) {
    return isFetchingPromise;
  }

  isFetchingPromise = (async () => {
    try {
      const res = await fetch(
        `/api/admin/students?url=${encodeURIComponent(currentUrl)}&_t=${Date.now()}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            ...getAuthHeaders(),
          },
        }
      );
      if (res.ok) {
        const rawData = await res.json();
        if (Array.isArray(rawData)) {
          const parsed = finalizeStudentList(
            rawData.map((item, idx) => parseStudentInfo(item, idx))
          );
          inMemoryStudents = parsed;
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return inMemoryStudents;
  })();

  try {
    return await isFetchingPromise;
  } finally {
    isFetchingPromise = null;
  }
}

export async function searchStudentByPhoneOrUser(query: string): Promise<StudentInfo | null> {
  const trimmed = query.trim();
  if (!trimmed) return null;

  const res = await fetch('/api/search-student', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      query: trimmed,
      scriptUrl: getScriptUrl(),
    }),
  });

  const json = await res.json().catch(() => null);

  if (res.status === 429) {
    throw new Error(json?.message || 'Bạn tra cứu quá nhanh. Vui lòng đợi một chút rồi thử lại.');
  }
  if (!res.ok || !json) {
    throw new Error(json?.message || 'Không thể kết nối máy chủ tra cứu. Vui lòng thử lại.');
  }

  if (!json.found || !json.student) {
    return null;
  }

  return finalizeStudentList([parseStudentInfo(json.student)])[0];
}

export async function authenticateStudent(user: string, pass: string): Promise<StudentInfo | null> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      username: user.trim(),
      password: pass.trim(),
      scriptUrl: getScriptUrl(),
    }),
  });

  const json = await res.json().catch(() => null);

  if (!json) {
    throw new Error('Không nhận được phản hồi hợp lệ từ máy chủ xác thực. Vui lòng thử lại.');
  }

  if (res.status === 429 || res.status >= 500) {
    throw new Error(json.message || 'Không thể kết nối máy chủ dữ liệu.');
  }

  if (!res.ok || !json.success || !json.student) {
    return null;
  }

  setAuthToken(json.token || null);

  // Apply Sheet 4 global schedule/notice/links directly from login response (fallback to async sync)
  if (json.sheet4Public) {
    applySheet4Data(json.sheet4Public);
  } else {
    fetchSheet4FromNetwork(getScriptUrl(), true).catch(() => {});
  }

  const raw = json.student;
  if (raw.isAdmin === true && raw.role === 'admin') {
    const adminStudent: StudentInfo = {
      username: String(raw.username || '').trim(),
      password: '',
      sbd: String(raw.sbd || '').trim(),
      hoten: String(raw.hoten || '').trim(),
      email: String(raw.email || '').trim(),
      namsinh: '',
      hsa: '',
      vact: '',
      thptqg: '',
      huongnghiep: '',
      batdau: inMemoryGlobalSheetConfig.loadedFromSheet4
        ? inMemoryGlobalSheetConfig.batdau
        : String(raw.batdau || ''),
      ketthuc: inMemoryGlobalSheetConfig.loadedFromSheet4
        ? inMemoryGlobalSheetConfig.ketthuc
        : String(raw.ketthuc || ''),
      thongbao: sanitizeSystemNotice(raw.thongbao),
      rowNumber: raw.rowNumber,
      isAdmin: true,
      role: 'admin',
      adminPermissions: raw.adminPermissions
        ? {
            lichsu: Boolean(raw.adminPermissions.lichsu),
            ketquahuongnghiep: Boolean(raw.adminPermissions.ketquahuongnghiep),
            danhsachtaikhoan: Boolean(raw.adminPermissions.danhsachtaikhoan),
            cauhinh: Boolean(raw.adminPermissions.cauhinh),
            hanche: Boolean(raw.adminPermissions.hanche),
            danhsachdkytk: String(raw.adminPermissions.danhsachdkytk || '').trim(),
          }
        : undefined,
    };
    return adminStudent;
  }

  return finalizeStudentList([parseStudentInfo(raw)])[0];
}

// Automatic background sync for Sheet 4 notice, schedule & exam links
export function initAutoSync(): void {
  if (autoSyncInitialized || typeof window === 'undefined') return;
  autoSyncInitialized = true;

  const refreshPublicConfig = () => {
    fetchSheet4FromNetwork(getScriptUrl(), true).catch(() => {});
  };

  window.addEventListener('focus', refreshPublicConfig);

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      refreshPublicConfig();
    }
  });

  setInterval(() => {
    if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
      refreshPublicConfig();
    }
  }, 15000);
}

export interface RegisterAccountPayload {
  username: string;
  password: string;
  hoten: string;
  email: string;
  namsinh: string;
  hsa: boolean;
  vact: boolean;
  thptqg: boolean;
  huongnghiep: boolean;
}

export async function syncPendingRegistrations(): Promise<{
  success: boolean;
  syncedCount: number;
  remainingCount: number;
  needsGasUpdate: boolean;
}> {
  const scriptUrl = getScriptUrl();
  try {
    const res = await fetch('/api/sync-registrations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ scriptUrl }),
    });
    const json = await res.json().catch(() => null);
    if (res.ok && json?.success) {
      return {
        success: true,
        syncedCount: Number(json.syncedCount || 0),
        remainingCount: Number(json.remainingCount || 0),
        needsGasUpdate: Boolean(json.needsGasUpdate),
      };
    }
  } catch {
    // ignore
  }
  return { success: false, syncedCount: 0, remainingCount: 0, needsGasUpdate: true };
}

export async function registerStudentAccount(
  payload: RegisterAccountPayload
): Promise<{
  success: boolean;
  synced?: boolean;
  needsGasUpdate?: boolean;
  student?: StudentInfo;
  message?: string;
}> {
  const cleanUser = payload.username.trim();
  const scriptUrl = getScriptUrl();

  try {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        username: cleanUser,
        scriptUrl,
      }),
    });
    const json = await res.json().catch(() => null);
    if (res.status === 409 || json?.duplicate) {
      return {
        success: false,
        message: json?.message || 'Số điện thoại / tài khoản này đã được đăng ký trước đó!',
      };
    }
    if (!res.ok || !json?.success || !json?.student) {
      return {
        success: false,
        message: json?.message || 'Không thể đăng ký tài khoản lúc này.',
      };
    }

    if (json.token) {
      setAuthToken(json.token);
    }

    const createdStudent = finalizeStudentList([parseStudentInfo(json.student)])[0];
    return {
      success: true,
      synced: Boolean(json.synced),
      needsGasUpdate: Boolean(json.needsGasUpdate),
      student: createdStudent,
    };
  } catch {
    return {
      success: false,
      message: 'Lỗi kết nối máy chủ. Vui lòng thử lại.',
    };
  }
}

export function prefetchData(): void {
  initAutoSync();
  fetchSheet4FromNetwork(getScriptUrl(), true).catch(() => {});
}
