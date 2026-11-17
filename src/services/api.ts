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
const CACHE_SHEET4_ADMINS_KEY = 'td_mock_exam_sheet4_admins';
const CACHE_SHEET4_CONFIG_KEY = 'td_mock_exam_sheet4_config';
const CACHE_TTL_MS = 5 * 1000; // 5 seconds cache TTL for high freshness

/**
 * Seed dataset extracted directly from the user's "Admin web thi" sheet
 * Ensures instant login & tra cuu even if Google Apps Script is deploying or temporarily unavailable
 */
const CACHE_VERSION_KEY = 'td_mock_exam_cache_ver';
const CURRENT_CACHE_VERSION = 'v8_sheet3_register_cutoff';

export const DEFAULT_STUDENTS_SEED: StudentInfo[] = [
  {
    username: 'amind',
    password: 'ad12345@',
    sbd: 'ad1',
    hoten: 'admin Trường Duy',
    email: 'admin',
    namsinh: '',
    hsa: '',
    vact: '',
    thptqg: '',
    huongnghiep: '',
    batdau: '0',
    ketthuc: '0',
    rowNumber: 2,
    isAdmin: true,
  },
  {
    username: '0333139562',
    password: '0333139562',
    sbd: '83510',
    hoten: 'Lê Thị Thanh Nhàn',
    email: 'diephoangchau269@gmail.com',
    namsinh: '2009',
    hsa: 'Có',
    vact: '',
    thptqg: '',
    huongnghiep: 'Có',
    batdau: '',
    ketthuc: '',
    rowNumber: 8,
    isAdmin: false,
  },
  {
    username: '12345',
    password: '12345',
    sbd: '29467',
    hoten: 'sdcvxc',
    email: 'àdsdgdf',
    namsinh: 'TSTD',
    hsa: 'Không',
    vact: '',
    thptqg: '',
    huongnghiep: 'Có',
    batdau: '',
    ketthuc: '',
  },
  {
    username: '0367263849',
    password: '0367263849',
    sbd: '50183',
    hoten: 'Lâm',
    email: 'àvd',
    namsinh: '2009',
    hsa: 'Có',
    vact: '',
    thptqg: '',
    huongnghiep: 'Có',
    batdau: '',
    ketthuc: '',
  },
  {
    username: '0988110409',
    password: '0988110409',
    sbd: '0001',
    hoten: 'nam',
    email: 'nguyentuandung1142009@gmail.com',
    namsinh: '2009',
    hsa: 'Có',
    vact: 'Không',
    thptqg: 'Có',
    huongnghiep: 'Có',
    batdau: '',
    ketthuc: '',
  },
  {
    username: '0366904315',
    password: '0366904315',
    sbd: '0002',
    hoten: 'tèo',
    email: 'hn2102008@gmail.com',
    namsinh: '2008',
    hsa: 'Không',
    vact: 'Có',
    thptqg: 'Có',
    huongnghiep: '',
    batdau: '',
    ketthuc: '',
  },
  {
    username: 'admin',
    password: 'admin',
    sbd: '0003',
    hoten: 'Admin Trường Duy',
    email: 'acsdfg',
    namsinh: 'TSTD',
    hsa: 'Có',
    vact: 'Có',
    thptqg: 'Có',
    huongnghiep: 'Có',
    batdau: '',
    ketthuc: '',
  },
  {
    username: '0362695019',
    password: '0362695019',
    sbd: '0005',
    hoten: 'nhung',
    email: 'tranvan10103@gmail.com',
    namsinh: '2010',
    hsa: 'Có',
    vact: 'Có',
    thptqg: 'Có',
    huongnghiep: '',
    batdau: '',
    ketthuc: '',
  },
  {
    username: '0368775845',
    password: '0368775845',
    sbd: '0006',
    hoten: 'Duy',
    email: 'tranvana10103@gmail.com',
    namsinh: '2009',
    hsa: 'Có',
    vact: 'Không',
    thptqg: 'Không',
    huongnghiep: '',
    batdau: '',
    ketthuc: '',
  },
  {
    username: 'admin1',
    password: 'admin1',
    sbd: '0007',
    hoten: 'Trường Duy Admin',
    email: 'admin@gmail.com',
    namsinh: '2009',
    hsa: 'Có',
    vact: 'Có',
    thptqg: 'Có',
    huongnghiep: '',
    batdau: '',
    ketthuc: '',
  },
  {
    username: '0969531069',
    password: '0969531069',
    sbd: '0008',
    hoten: 'Đào Yến Như',
    email: 'ndao69272@gmail.com',
    namsinh: '2009',
    hsa: 'Có',
    vact: 'Không',
    thptqg: 'Có',
    huongnghiep: '',
    batdau: '',
    ketthuc: '',
  },
  {
    username: '0988734165',
    password: '0988734165',
    sbd: '0009',
    hoten: 'Bảo Anh U lịt',
    email: 'baoanhulis@gmail.com',
    namsinh: '2009',
    hsa: 'Có',
    vact: 'Không',
    thptqg: 'Có',
    huongnghiep: 'Có',
    batdau: '',
    ketthuc: '',
  },
  {
    username: '0931131509',
    password: '0931131509',
    sbd: '0010',
    hoten: 'Nguyễn Vũ Ngọc Châu',
    email: 'ngocchau.nv2411@gmail.com',
    namsinh: '2009',
    hsa: 'Có',
    vact: 'Không',
    thptqg: 'Không',
    huongnghiep: '',
    batdau: '',
    ketthuc: '',
  },
  {
    username: '123',
    password: '123',
    sbd: '0013',
    hoten: 'duy',
    email: 'sdf',
    namsinh: '2009',
    hsa: 'Có',
    vact: 'Không',
    thptqg: 'Không',
    huongnghiep: '',
    batdau: '',
    ketthuc: '',
  },
  {
    username: '',
    password: '',
    sbd: '10936',
    hoten: 'Thí sinh 10936',
    email: '',
    namsinh: '',
    hsa: '',
    vact: '',
    thptqg: '',
    huongnghiep: 'Có',
    batdau: '',
    ketthuc: '',
  },
  {
    username: '',
    password: '',
    sbd: '65241',
    hoten: 'Thí sinh 65241',
    email: '',
    namsinh: '',
    hsa: '',
    vact: '',
    thptqg: '',
    huongnghiep: 'Có',
    batdau: '',
    ketthuc: '',
  },
  {
    username: '',
    password: '',
    sbd: '91873',
    hoten: 'Thí sinh 91873',
    email: '',
    namsinh: '',
    hsa: '',
    vact: '',
    thptqg: '',
    huongnghiep: 'Có',
    batdau: '',
    ketthuc: '',
  },
  {
    username: '',
    password: '',
    sbd: '37054',
    hoten: 'Thí sinh 37054',
    email: '',
    namsinh: '',
    hsa: '',
    vact: '',
    thptqg: '',
    huongnghiep: 'Có',
    batdau: '',
    ketthuc: '',
  },
  {
    username: '',
    password: '',
    sbd: '42698',
    hoten: 'Thí sinh 42698',
    email: '',
    namsinh: '',
    hsa: '',
    vact: '',
    thptqg: '',
    huongnghiep: 'Có',
    batdau: '',
    ketthuc: '',
  },
  {
    username: '',
    password: '',
    sbd: '05317',
    hoten: 'Thí sinh 05317',
    email: '',
    namsinh: '',
    hsa: '',
    vact: '',
    thptqg: '',
    huongnghiep: 'Có',
    batdau: '',
    ketthuc: '',
  },
  {
    username: '',
    password: '',
    sbd: '18462',
    hoten: 'Thí sinh 18462',
    email: '',
    namsinh: '',
    hsa: '',
    vact: '',
    thptqg: '',
    huongnghiep: 'Có',
    batdau: '',
    ketthuc: '',
  },
];

export function getScriptUrl(): string {
  try {
    const custom = localStorage.getItem(STORAGE_CUSTOM_URL_KEY);
    if (custom && custom.trim().startsWith('https://script.google.com/')) {
      return custom.trim();
    }
  } catch {
    // ignore
  }
  return DEFAULT_SCRIPT_URL;
}

export function setScriptUrl(url: string): void {
  try {
    if (url && url.trim().startsWith('https://script.google.com/')) {
      localStorage.setItem(STORAGE_CUSTOM_URL_KEY, url.trim());
    } else {
      localStorage.removeItem(STORAGE_CUSTOM_URL_KEY);
    }
  } catch {
    // ignore
  }
}

// Initial in-memory student cache
let inMemoryStudents: StudentInfo[] = (() => {
  try {
    const ver = localStorage.getItem(CACHE_VERSION_KEY);
    if (ver !== CURRENT_CACHE_VERSION) {
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(CACHE_TIME_KEY);
      localStorage.setItem(CACHE_VERSION_KEY, CURRENT_CACHE_VERSION);
    } else {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Check if any corrupted hoten === username with phone numbers
          const isCorrupted = parsed.some(
            (p) => p.username === '0367446745' && p.hoten === '0367446745'
          );
          if (!isCorrupted) {
            return parsed;
          }
        }
      }
    }
  } catch {
    // ignore
  }
  return [...DEFAULT_STUDENTS_SEED];
})();

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

let inMemorySheet4Admins: StudentInfo[] = (() => {
  try {
    const saved = localStorage.getItem(CACHE_SHEET4_ADMINS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return [];
})();

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

function extractNoticeFromRawItem(item: unknown): string {
  if (!item) return '';
  if (Array.isArray(item)) {
    return sanitizeSystemNotice(item[12] || item[13] || item[14] || '');
  }
  const rec = item as Record<string, unknown>;
  const direct =
    rec['thongbao'] ??
    rec['Thongbao'] ??
    rec['thongBao'] ??
    rec['ThongBao'] ??
    rec['thong_bao'] ??
    rec['Thông báo'] ??
    rec['notice'] ??
    rec['announcement'];
  if (direct !== undefined && direct !== null && String(direct).trim()) {
    return sanitizeSystemNotice(direct);
  }
  for (const k of Object.keys(rec)) {
    const cleanK = k.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (cleanK === 'thongbao' || cleanK === 'notice' || cleanK === 'announcement') {
      const v = sanitizeSystemNotice(rec[k]);
      if (v) return v;
    }
  }
  return '';
}

function syncGlobalNoticeFromRawRows(rawData: unknown[]): void {
  const seen = new Set<string>();
  const notices: string[] = [];
  for (const row of rawData) {
    const msg = extractNoticeFromRawItem(row);
    if (msg && !seen.has(msg)) {
      seen.add(msg);
      notices.push(msg);
    }
  }
  // If no notice exists in Sheet, setGlobalNotice('') clears it immediately!
  setGlobalNotice(notices.join('\n'));
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
  if (!student) return false;
  if (student.isAdmin === true) return true;
  if (student.rowNumber !== undefined && student.rowNumber >= 2 && student.rowNumber <= 6) return true;
  const u = (student.username || '').toLowerCase().trim();
  const e = (student.email || '').toLowerCase().trim();
  const sbd = (student.sbd || '').toLowerCase().trim();
  if (u === 'amind' || u === 'admin' || u.startsWith('admin') || (u.startsWith('ad') && u.length <= 8)) return true;
  if (e === 'admin' || e.includes('admin')) return true;
  if (sbd.startsWith('ad') || sbd === '0003' || sbd === '0007') return true;
  return false;
}

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
    };
  }

  // Pre-calculate rowNumber from index or existing property
  const rowNumber =
    typeof (row as any)?.rowNumber === 'number'
      ? (row as any).rowNumber
      : index !== undefined
      ? index + 2
      : undefined;

  const isRowAdmin = rowNumber !== undefined && rowNumber >= 2 && rowNumber <= 6;

  // If array format: [taikhoan, pass, sobaodanh, hoten, email, namsinh, hsa, vact, thptqg, huongnghiep, batdau, ketthuc]
  if (Array.isArray(row)) {
    const rawNamsinh = String(row[5] || '').trim();
    const rawHsa = String(row[6] || '').trim();
    // In some sheet configurations, column F (namsinh) is empty and birth year 2009/2011 is placed in column G (HSA)
    const isShiftedYear = !rawNamsinh && cleanDigits(rawHsa).length === 4;
    const finalNamsinh = isShiftedYear ? rawHsa : rawNamsinh;
    const finalHsa = isShiftedYear ? String(row[7] || '').trim() : rawHsa;

    const username = String(row[0] || '').trim();
    const email = String(row[4] || '').trim();
    const sbd = String(row[2] || '').trim();

    const isAdmin =
      isRowAdmin ||
      username.toLowerCase() === 'amind' ||
      username.toLowerCase() === 'admin' ||
      username.toLowerCase().startsWith('admin') ||
      email.toLowerCase() === 'admin' ||
      sbd.toLowerCase().startsWith('ad');

    return {
      username,
      password: String(row[1] || '').trim(),
      sbd,
      hoten: String(row[3] || '').trim(),
      email,
      namsinh: finalNamsinh,
      hsa: finalHsa,
      vact: String(row[isShiftedYear ? 8 : 7] || '').trim(),
      thptqg: String(row[isShiftedYear ? 9 : 8] || '').trim(),
      huongnghiep: String(row[isShiftedYear ? 10 : 9] || '').trim(),
      batdau: String(row[isShiftedYear ? 11 : 10] || '').trim(),
      ketthuc: String(row[isShiftedYear ? 12 : 11] || '').trim(),
      thongbao: String(row[isShiftedYear ? 13 : 12] || row[13] || row[14] || '').trim(),
      rowNumber,
      isAdmin,
    };
  }

  // If object format
  const record = row as Record<string, unknown>;

  const getFieldValue = (fieldKey: string, aliasKeys: string[]): string => {
    // 1. Direct property lookup
    if (record[fieldKey] !== undefined && record[fieldKey] !== null) {
      const val = String(record[fieldKey]).trim();
      if (val) return val;
    }

    // 2. Exact match on cleaned key names
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

    // 3. Fallback partial match (strict: never match username/taikhoan for name/hoten)
    for (const target of targetKeys) {
      if (target.length < 3) continue; // skip too short substrings
      for (const k of Object.keys(record)) {
        const cleanK = k.toLowerCase().replace(/[^a-z0-9]/g, '');
        // CRITICAL: NEVER allow username/taikhoan/sdt to match hoten or name!
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

  // Safety fallback: if parsedHoten mistakenly became equal to a phone-number username
  if (
    parsedHoten &&
    parsedUsername &&
    parsedHoten === parsedUsername &&
    cleanDigits(parsedUsername).length >= 8
  ) {
    const altName =
      String(record['hoten'] || record['Họ và tên'] || record['ten'] || '').trim();
    if (altName && altName !== parsedUsername) {
      parsedHoten = altName;
    } else {
      const seedMatch = DEFAULT_STUDENTS_SEED.find(
        (s) => s.username === parsedUsername || (s.sbd && s.sbd === String(record['sbd'] || ''))
      );
      if (seedMatch && seedMatch.hoten && seedMatch.hoten !== parsedUsername) {
        parsedHoten = seedMatch.hoten;
      }
    }
  }

  // Fallback for shifted birth year in HSA column
  if (!parsedNamsinh && cleanDigits(parsedHsa).length === 4) {
    parsedNamsinh = parsedHsa;
  }

  const parsedSbd = getFieldValue('sbd', ['sobaodanh', 'sbaodanh']);
  const parsedEmail = getFieldValue('email', ['mail']);
  const rawAdmin = (record as any)?.isAdmin;
  const isAdmin =
    isRowAdmin ||
    rawAdmin === true ||
    parsedUsername.toLowerCase() === 'amind' ||
    parsedUsername.toLowerCase() === 'admin' ||
    parsedUsername.toLowerCase().startsWith('admin') ||
    parsedEmail.toLowerCase() === 'admin' ||
    parsedSbd.toLowerCase().startsWith('ad');

  const rawZone = (record as any)?.sourceZone;
  const sourceZone: StudentInfo['sourceZone'] =
    rawZone === 'sheet3_web' || rawZone === 'sheet3_manual' || rawZone === 'sheet1'
      ? rawZone
      : undefined;

  return {
    username: parsedUsername,
    password: getFieldValue('password', ['pass', 'matkhau', 'mk']),
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
    isAdmin,
  };
}

export function finalizeStudentList(list: StudentInfo[]): StudentInfo[] {
  // If Sheet 4 QTV A2 config is active, QTV A2 strictly controls Batdau/Ketthuc!
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

  const adminsRaw = Array.isArray(sheet4Payload.admins) ? sheet4Payload.admins : [];
  const mappedAdmins: StudentInfo[] = adminsRaw.map((a: any) => ({
    username: String(a.username || '').trim(),
    password: String(a.password || '').trim(),
    sbd: String(a.sbd || `ad${(a.rowNumber || 2) - 1}`).trim(),
    hoten: String(a.hoten || a.username || '').trim(),
    email: String(a.email || '').trim(),
    namsinh: '',
    hsa: '',
    vact: '',
    thptqg: '',
    huongnghiep: '',
    batdau: sheet4Payload.globalConfig?.batdau || '',
    ketthuc: sheet4Payload.globalConfig?.ketthuc || '',
    thongbao: sheet4Payload.globalConfig?.thongbao || '',
    rowNumber: a.rowNumber,
    isAdmin: true,
    adminPermissions: {
      lichsu: Boolean(a.adminPermissions?.lichsu),
      ketquahuongnghiep: Boolean(a.adminPermissions?.ketquahuongnghiep),
      danhsachtaikhoan: Boolean(a.adminPermissions?.danhsachtaikhoan),
      cauhinh: Boolean(a.adminPermissions?.cauhinh),
      hanche: Boolean(a.adminPermissions?.hanche),
      danhsachdkytk: String(a.adminPermissions?.danhsachdkytk || '').trim(),
    },
  }));

  inMemorySheet4Admins = mappedAdmins;
  try {
    localStorage.setItem(CACHE_SHEET4_ADMINS_KEY, JSON.stringify(mappedAdmins));
  } catch {
    // ignore
  }

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

    // Strictly enforce QTV A2 Batdau/Ketthuc & Thongbao
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
  // Strategy 1: Proxy /api/sheet4-data
  try {
    const proxyUrl = `/api/sheet4-data?url=${encodeURIComponent(currentUrl)}${forceRefresh ? `&_t=${Date.now()}` : ''}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
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
    // continue to direct GAS fallback
  }

  // Strategy 2: Direct GAS fetch (for static / GitHub Pages builds)
  try {
    const sep = currentUrl.includes('?') ? '&' : '?';
    const targetUrl = `${currentUrl}${sep}action=get_sheet4&_t=${Date.now()}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(targetUrl, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const text = await res.text();
      if (!text.trim().startsWith('<')) {
        const parsed = JSON.parse(text);
        if (parsed && !Array.isArray(parsed) && parsed.deployed) {
          return applySheet4Data(parsed);
        }
      }
    }
  } catch {
    // ignore
  }
  return false;
}

async function fetchFromNetwork(forceRefresh = false): Promise<StudentInfo[]> {
  const currentUrl = getScriptUrl();

  // Fetch Sheet 4 first/in parallel so globalConfig (QTV A2) is known before finalizing Sheet 1 rows
  const sheet4Promise = fetchSheet4FromNetwork(currentUrl, forceRefresh);

  // Strategy 1: Local server proxy /api/sheet-data (No CORS, No Origin 403, 100% reliable)
  try {
    const proxyUrl = `/api/sheet-data?url=${encodeURIComponent(currentUrl)}${forceRefresh ? `&_t=${Date.now()}` : ''}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const [res, sheet4Loaded] = await Promise.all([
      fetch(proxyUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        signal: controller.signal,
      }),
      sheet4Promise,
    ]);
    clearTimeout(timeoutId);

    if (res.ok) {
      const rawData = await res.json();
      if (Array.isArray(rawData)) {
        // Only fall back to Sheet 1 Thongbao if Sheet 4 QTV A2 config isn't deployed yet
        if (!sheet4Loaded && !inMemoryGlobalSheetConfig.loadedFromSheet4) {
          syncGlobalNoticeFromRawRows(rawData);
        }
        const parsed = rawData
          .map((item, idx) => parseStudentInfo(item, idx))
          .filter((s) => s.username || s.hoten || s.sbd);
        if (parsed.length > 0) {
          return finalizeStudentList(parsed);
        }
      }
    }
  } catch {
    // Continue to direct fetch fallback
  }

  // Strategy 2: Direct client fetch to Google Apps Script
  try {
    const urlWithCacheBuster = () => {
      const sep = currentUrl.includes('?') ? '&' : '?';
      return `${currentUrl}${sep}_t=${Date.now()}`;
    };
    const targetUrl = forceRefresh ? urlWithCacheBuster() : currentUrl;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const [res, sheet4Loaded] = await Promise.all([
      fetch(targetUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        signal: controller.signal,
      }),
      sheet4Promise,
    ]);
    clearTimeout(timeoutId);

    if (res.ok) {
      const text = await res.text();
      // Check if Google Apps Script returned an HTML error page
      if (
        !text.trim().startsWith('<') &&
        !text.includes('Script function not found') &&
        !text.includes('<!DOCTYPE') &&
        !text.includes('<html')
      ) {
        const rawData = JSON.parse(text);
        if (Array.isArray(rawData)) {
          if (!sheet4Loaded && !inMemoryGlobalSheetConfig.loadedFromSheet4) {
            syncGlobalNoticeFromRawRows(rawData);
          }
          const parsed = rawData
            .map((item, idx) => parseStudentInfo(item, idx))
            .filter((s) => s.username || s.hoten || s.sbd);
          if (parsed.length > 0) {
            return finalizeStudentList(parsed);
          }
        }
      }
    }
  } catch {
    // Direct network fetch failed
  }

  // Return empty list so getStudentsData gracefully uses seed/cache without crashing
  return [];
}

/**
 * Main retrieval function with automatic fallback to seed dataset
 * NEVER throws fatal error that prevents users from logging in or searching
 */
export async function getStudentsData(forceRefresh = false): Promise<StudentInfo[]> {
  // If in-memory is already valid and not forcing refresh
  if (inMemoryStudents && inMemoryStudents.length > 0 && !forceRefresh) {
    return inMemoryStudents;
  }

  // Check localStorage cache if not forced
  if (!forceRefresh) {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
      if (cached && cachedTime) {
        const age = Date.now() - parseInt(cachedTime, 10);
        if (age < CACHE_TTL_MS) {
          const parsed = finalizeStudentList(JSON.parse(cached) as StudentInfo[]);
          if (parsed && parsed.length > 0) {
            inMemoryStudents = parsed;
            return parsed;
          }
        }
      }
    } catch {
      // ignore storage errors
    }
  }

  // Avoid duplicate in-flight requests (unless forcing refresh)
  if (isFetchingPromise && !forceRefresh) {
    return isFetchingPromise;
  }

  isFetchingPromise = (async () => {
    try {
      const data = await fetchFromNetwork(forceRefresh);
      if (data && data.length > 0) {
        inMemoryStudents = data;
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(data));
          localStorage.setItem(CACHE_TIME_KEY, String(Date.now()));
        } catch {
          // ignore storage errors
        }
        return data;
      }
    } catch {
      // Network failed or returned HTML error
    }

    // Fallback 1: LocalStorage stale cache
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as StudentInfo[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          inMemoryStudents = finalizeStudentList(parsed);
          return inMemoryStudents;
        }
      }
    } catch {
      // ignore
    }

    // Fallback 2: Default seed dataset containing real student records
    inMemoryStudents = finalizeStudentList([...DEFAULT_STUDENTS_SEED]);
    return inMemoryStudents;
  })();

  try {
    const result = await isFetchingPromise;
    return result;
  } finally {
    isFetchingPromise = null;
  }
}

function findStudentInList(students: StudentInfo[], query: string): StudentInfo | null {
  const trimmedQuery = query.trim();
  const queryDigits = cleanDigits(trimmedQuery);

  // Exact matching on username, SBD, or email
  const exactMatch = students.find((s) => {
    return (
      s.username.toLowerCase() === trimmedQuery.toLowerCase() ||
      s.sbd.toLowerCase() === trimmedQuery.toLowerCase() ||
      (s.email && s.email.toLowerCase() === trimmedQuery.toLowerCase())
    );
  });
  if (exactMatch) return exactMatch;

  // Search by phone digits
  if (queryDigits.length >= 4) {
    const digitMatch = students.find((s) => {
      const userDigits = cleanDigits(s.username);
      const sbdDigits = cleanDigits(s.sbd);
      return (
        (userDigits.length >= 4 && (userDigits.endsWith(queryDigits) || queryDigits.endsWith(userDigits))) ||
        (sbdDigits.length >= 4 && (sbdDigits.endsWith(queryDigits) || queryDigits.endsWith(sbdDigits)))
      );
    });
    if (digitMatch) return digitMatch;
  }

  return null;
}

export async function searchStudentByPhoneOrUser(query: string): Promise<StudentInfo | null> {
  const students = await getStudentsData();
  let result = findStudentInList(students, query);

  // AUTO-SYNC: If not found in current roster, force a live fetch from Google Sheets!
  if (!result) {
    try {
      const freshStudents = await getStudentsData(true);
      result = findStudentInList(freshStudents, query);
    } catch {
      // ignore
    }
  }

  return result;
}

function findStudentCredentials(students: StudentInfo[], user: string, pass: string): StudentInfo | null {
  const trimmedUser = user.trim().toLowerCase();
  const trimmedPass = pass.trim();
  const userDigits = cleanDigits(trimmedUser);

  return (
    students.find((s) => {
      const matchUsername =
        s.username.toLowerCase() === trimmedUser ||
        (userDigits.length >= 4 && cleanDigits(s.username) === userDigits);
      return matchUsername && s.password === trimmedPass;
    }) || null
  );
}

export async function authenticateStudent(user: string, pass: string): Promise<StudentInfo | null> {
  // 1. Check Trang tính 4 admin accounts FIRST (exact username + password match)
  let adminMatch = findStudentCredentials(inMemorySheet4Admins, user, pass);
  if (adminMatch) return adminMatch;

  const students = await getStudentsData();
  adminMatch = findStudentCredentials(inMemorySheet4Admins, user, pass);
  if (adminMatch) return adminMatch;

  let student = findStudentCredentials(students, user, pass);

  // AUTO-SYNC: If not found, immediately force live revalidation with Google Sheets!
  // Handles instant logins right after submitting the Google registration form or adding an Admin on Sheet 4
  if (!student) {
    try {
      const freshStudents = await getStudentsData(true);
      adminMatch = findStudentCredentials(inMemorySheet4Admins, user, pass);
      if (adminMatch) return adminMatch;
      student = findStudentCredentials(freshStudents, user, pass);
    } catch {
      // ignore
    }
  }

  return student;
}

// Automatic background sync whenever the user returns to tab or periodically
export function initAutoSync(): void {
  if (autoSyncInitialized || typeof window === 'undefined') return;
  autoSyncInitialized = true;

  // 1. Sync on window focus (e.g. user submitted Google Form in another tab and returned)
  window.addEventListener('focus', () => {
    getStudentsData(true).catch(() => {});
  });

  // 2. Sync on visibility change
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      getStudentsData(true).catch(() => {});
    }
  });

  // 3. Periodic background poll every 5 seconds (only when tab is active)
  setInterval(() => {
    if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
      getStudentsData(true).catch(() => {});
    }
  }, 5000);
}

// Register a new student account directly on the web -> saves to Trang tính 3 (columns M-X)
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
      headers: { 'Content-Type': 'application/json' },
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
  const cleanDigitsUser = cleanDigits(cleanUser);

  // Refresh current student roster first to catch duplicates cleanly
  const existing = await getStudentsData(true).catch(() => inMemoryStudents);
  const duplicate = existing.find((s) => {
    const u = (s.username || '').trim().toLowerCase();
    return (
      u === cleanUser.toLowerCase() ||
      (cleanDigitsUser.length >= 8 && cleanDigits(u) === cleanDigitsUser)
    );
  });

  if (duplicate) {
    return {
      success: false,
      message: `Số điện thoại / tài khoản "${cleanUser}" đã được đăng ký trước đó (SBD: ${duplicate.sbd || 'đã cấp'}). Vui lòng đăng nhập hoặc tra cứu!`,
    };
  }

  const existingSbds = new Set(existing.map((s) => (s.sbd || '').trim()));
  let generatedSbd = '';
  do {
    generatedSbd = String(Math.floor(10000 + Math.random() * 89999));
  } while (existingSbds.has(generatedSbd));

  const formatNowVn = () => {
    try {
      return new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Ho_Chi_Minh',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
        .format(new Date())
        .replace(',', '');
    } catch {
      const d = new Date();
      const p = (n: number) => String(n).padStart(2, '0');
      return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(
        d.getHours()
      )}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
    }
  };

  const nowStr = formatNowVn();
  const scriptUrl = getScriptUrl();

  let newStudent: StudentInfo = {
    username: cleanUser,
    password: payload.password.trim(),
    sbd: generatedSbd,
    hoten: payload.hoten.trim(),
    email: payload.email.trim(),
    namsinh: payload.namsinh.trim(),
    hsa: payload.hsa ? 'Có' : 'Không',
    vact: payload.vact ? 'Có' : 'Không',
    thptqg: payload.thptqg ? 'Có' : 'Không',
    huongnghiep: payload.huongnghiep ? 'Có' : 'Không',
    batdau: inMemoryGlobalSheetConfig.loadedFromSheet4
      ? inMemoryGlobalSheetConfig.batdau
      : inMemoryGlobalSchedule.batdau,
    ketthuc: inMemoryGlobalSheetConfig.loadedFromSheet4
      ? inMemoryGlobalSheetConfig.ketthuc
      : inMemoryGlobalSchedule.ketthuc,
    registeredAt: nowStr,
    sourceZone: 'sheet3_web',
    isAdmin: false,
  };

  // Strategy 1: Local Express server proxy /api/register
  let handledByServer = false;
  let gasSynced = false;
  let needsGasUpdate = false;
  try {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        username: cleanUser,
        sbd: generatedSbd,
        time: nowStr,
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
    if (res.ok && json?.success && json?.student) {
      handledByServer = true;
      gasSynced = Boolean(json.synced);
      needsGasUpdate = Boolean(json.needsGasUpdate);
      newStudent = finalizeStudentList([parseStudentInfo(json.student)])[0];
    }
  } catch {
    // fallback to direct GAS POST
  }

  // Strategy 2: Direct GAS POST fallback (for static builds without backend proxy)
  if (!handledByServer) {
    try {
      await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'register_account',
          time: nowStr,
          username: cleanUser,
          taikhoan: cleanUser,
          password: payload.password.trim(),
          pass: payload.password.trim(),
          sbd: generatedSbd,
          sobaodanh: generatedSbd,
          hoten: payload.hoten.trim(),
          email: payload.email.trim(),
          namsinh: payload.namsinh.trim(),
          hsa: newStudent.hsa,
          vact: newStudent.vact,
          thptqg: newStudent.thptqg,
          huongnghiep: newStudent.huongnghiep,
        }),
      });
    } catch {
      // keep local registration state
    }
  }

  // Immediately update in-memory and localStorage cache for instant login & search
  inMemoryStudents = [newStudent, ...inMemoryStudents.filter((s) => s.username !== newStudent.username)];
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(inMemoryStudents));
    localStorage.setItem(CACHE_TIME_KEY, String(Date.now()));
  } catch {
    // ignore
  }

  return {
    success: true,
    synced: gasSynced,
    needsGasUpdate,
    student: newStudent,
  };
}

// Prefetch data silently on app initialization & activate auto-sync
export function prefetchData(): void {
  initAutoSync();
  getStudentsData(true).catch(() => {});
}
