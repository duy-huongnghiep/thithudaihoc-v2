import { ExamScheduleInfo, StudentInfo } from '../types';

export const DEFAULT_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbxv_LnzrD7mTAAoQYYgEZjdcW8cCNcVoEu1rPCEU2V-EGMaiRLtGRU3yv3sV3WPkeUZTA/exec';

const STORAGE_CUSTOM_URL_KEY = 'td_mock_exam_custom_script_url';
const CACHE_KEY = 'td_mock_exam_students_cache';
const CACHE_TIME_KEY = 'td_mock_exam_students_time';
const CACHE_SCHEDULE_KEY = 'td_mock_exam_global_schedule';
const CACHE_TTL_MS = 5 * 1000; // 5 seconds cache TTL for high freshness

/**
 * Seed dataset extracted directly from the user's "Admin web thi" sheet
 * Ensures instant login & tra cuu even if Google Apps Script is deploying or temporarily unavailable
 */
const CACHE_VERSION_KEY = 'td_mock_exam_cache_ver';
const CURRENT_CACHE_VERSION = 'v4_correct_name_mapping';

export const DEFAULT_STUDENTS_SEED: StudentInfo[] = [
  {
    username: '0367446745',
    password: '0367446745',
    sbd: '74629',
    hoten: 'Nam',
    email: 'avsdxgfnvgn',
    namsinh: '2011',
    hsa: 'Không',
    vact: '',
    thptqg: '',
    huongnghiep: 'Có',
    batdau: '',
    ketthuc: '',
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

export function cleanDigits(val: string | number | undefined | null): string {
  return val ? String(val).replace(/\D/g, '') : '';
}

export function isYes(val: string | number | undefined | null): boolean {
  if (!val) return false;
  const v = String(val).toLowerCase().trim();
  return (
    v === 'có' ||
    v === 'co' ||
    v === 'x' ||
    v === '1' ||
    v === 'yes' ||
    v === 'true' ||
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

export function parseStudentInfo(row: unknown): StudentInfo {
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

  // If array format: [taikhoan, pass, sobaodanh, hoten, email, namsinh, hsa, vact, thptqg, huongnghiep, batdau, ketthuc]
  if (Array.isArray(row)) {
    const rawNamsinh = String(row[5] || '').trim();
    const rawHsa = String(row[6] || '').trim();
    // In some sheet configurations, column F (namsinh) is empty and birth year 2009/2011 is placed in column G (HSA)
    const isShiftedYear = !rawNamsinh && cleanDigits(rawHsa).length === 4;
    const finalNamsinh = isShiftedYear ? rawHsa : rawNamsinh;
    const finalHsa = isShiftedYear ? String(row[7] || '').trim() : rawHsa;

    return {
      username: String(row[0] || '').trim(),
      password: String(row[1] || '').trim(),
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

  return {
    username: parsedUsername,
    password: getFieldValue('password', ['pass', 'matkhau', 'mk']),
    sbd: getFieldValue('sbd', ['sobaodanh', 'sbaodanh']),
    hoten: parsedHoten,
    email: getFieldValue('email', ['mail']),
    namsinh: parsedNamsinh,
    hsa: parsedHsa,
    vact: getFieldValue('vact', ['v_act']),
    thptqg: getFieldValue('thptqg', ['thpt', 'totnghiep']),
    huongnghiep: getFieldValue('huongnghiep', ['career', 'nghiep']),
    batdau: getFieldValue('batdau', ['start', 'open', 'thoigianbatdau', 'tgstart']),
    ketthuc: getFieldValue('ketthuc', ['end', 'close', 'thoigianketthuc', 'han', 'tgend']),
  };
}

export function finalizeStudentList(list: StudentInfo[]): StudentInfo[] {
  // Extract global schedule from any row that has it (applies to all students)
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

  return list.map((s) => ({
    ...s,
    batdau: s.batdau?.trim() || inMemoryGlobalSchedule.batdau,
    ketthuc: s.ketthuc?.trim() || inMemoryGlobalSchedule.ketthuc,
  }));
}

async function fetchFromNetwork(forceRefresh = false): Promise<StudentInfo[]> {
  const currentUrl = getScriptUrl();

  // Strategy 1: Local server proxy /api/sheet-data (No CORS, No Origin 403, 100% reliable)
  try {
    const proxyUrl = `/api/sheet-data?url=${encodeURIComponent(currentUrl)}${forceRefresh ? `&_t=${Date.now()}` : ''}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(proxyUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const rawData = await res.json();
      if (Array.isArray(rawData)) {
        const parsed = rawData.map(parseStudentInfo).filter((s) => s.username || s.hoten || s.sbd);
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

    const res = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });
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
          const parsed = rawData.map(parseStudentInfo).filter((s) => s.username || s.hoten || s.sbd);
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
  const students = await getStudentsData();
  let student = findStudentCredentials(students, user, pass);

  // AUTO-SYNC: If not found, immediately force live revalidation with Google Sheets!
  // Handles instant logins right after submitting the Google registration form
  if (!student) {
    try {
      const freshStudents = await getStudentsData(true);
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

// Prefetch data silently on app initialization & activate auto-sync
export function prefetchData(): void {
  initAutoSync();
  getStudentsData().catch(() => {});
}
