import { StudentInfo, LoginLogRecord, CareerResultRecord } from '../types';
import { isYes, getScriptUrl } from './api';

const STORAGE_LOGIN_LOGS_KEY = 'td_mock_exam_login_logs';
const STORAGE_CAREER_RESULTS_KEY = 'td_mock_exam_career_results';

/**
 * Format timestamp in Vietnam timezone (GMT+7)
 */
export function formatVietnamTime(date: Date = new Date()): string {
  try {
    const formatter = new Intl.DateTimeFormat('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    return formatter.format(date).replace(',', '');
  } catch {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(
      date.getHours()
    )}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }
}

/**
 * Parse client device and browser for logging
 */
export function getDeviceInfo(): string {
  if (typeof window === 'undefined' || !navigator) return 'Web Browser';
  const ua = navigator.userAgent || '';
  let os = 'Khác';
  if (/Windows/i.test(ua)) os = 'Windows';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/Macintosh|Mac OS X/i.test(ua)) os = 'macOS';
  else if (/Linux/i.test(ua)) os = 'Linux';

  let browser = 'Browser';
  if (/Edg/i.test(ua)) browser = 'Edge';
  else if (/Chrome|CriOS/i.test(ua)) browser = 'Chrome';
  else if (/Firefox|FxiOS/i.test(ua)) browser = 'Firefox';
  else if (/Safari/i.test(ua)) browser = 'Safari';
  else if (/Zalo/i.test(ua)) browser = 'Zalo App';

  return `${os} (${browser})`;
}

/**
 * Summarize registered exam subjects
 */
export function getStudentExamSummary(student: StudentInfo): string {
  const list: string[] = [];
  if (isYes(student.hsa)) list.push('HSA');
  if (isYes(student.vact)) list.push('V-ACT');
  if (isYes(student.thptqg)) list.push('THPTQG');
  if (isYes(student.huongnghiep)) list.push('Hướng nghiệp');
  return list.length > 0 ? list.join(', ') : 'Chưa đăng ký môn';
}

/**
 * Retrieve all login logs stored locally
 */
export function getLoginLogs(): LoginLogRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_LOGIN_LOGS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as LoginLogRecord[];
  } catch {
    return [];
  }
}

/**
 * Fetch all login records of Trang tính 2 from server / Google Sheets
 */
export async function fetchSheet2Logs(): Promise<LoginLogRecord[]> {
  const scriptUrl = getScriptUrl();
  try {
    const res = await fetch(
      `/api/sheet2-data?url=${encodeURIComponent(scriptUrl)}&_t=${Date.now()}`,
      {
        method: 'GET',
        headers: { Accept: 'application/json' },
      }
    );
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        try {
          localStorage.setItem(STORAGE_LOGIN_LOGS_KEY, JSON.stringify(data));
        } catch {
          // ignore
        }
        return data as LoginLogRecord[];
      }
    }
  } catch {
    // fallback to direct GAS
  }

  // Fallback: Direct GAS fetch (for static / GitHub Pages builds)
  try {
    const sep = scriptUrl.includes('?') ? '&' : '?';
    const gasRes = await fetch(`${scriptUrl}${sep}action=get_sheet2&sheet=2&_t=${Date.now()}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (gasRes.ok) {
      const parsed = await gasRes.json();
      if (Array.isArray(parsed) && parsed.length > 0) {
        const mapped = parsed
          .map((item: any, idx: number): LoginLogRecord => ({
            id: `gas_client_log_${idx}`,
            timestamp: String(item.time || item.timestamp || '').trim(),
            isoDate: item.isoDate || new Date().toISOString(),
            hoten: String(item.hoten || '').trim(),
            sbd: String(item.sbd || '').trim(),
            username: String(item.username || '').trim(),
            email: String(item.email || '').trim(),
            namsinh: String(item.namsinh || '').trim(),
            monthi: String(item.monthi || '').trim(),
            device: String(item.device || '').trim(),
            status: String(item.status || 'Đăng nhập thành công').trim(),
            synced: true,
          }))
          .reverse();
        try {
          localStorage.setItem(STORAGE_LOGIN_LOGS_KEY, JSON.stringify(mapped));
        } catch {
          // ignore
        }
        return mapped;
      }
    }
  } catch {
    // fallback to local
  }

  return getLoginLogs();
}

/**
 * Save new login record to local log list
 */
function saveLogRecord(record: LoginLogRecord): void {
  try {
    const existing = getLoginLogs();
    const updated = [record, ...existing.slice(0, 499)]; // Keep latest 500 records
    localStorage.setItem(STORAGE_LOGIN_LOGS_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage issues
  }
}

/**
 * Clear all login logs
 */
export async function clearLoginLogs(): Promise<void> {
  try {
    localStorage.removeItem(STORAGE_LOGIN_LOGS_KEY);
    await fetch('/api/clear-logs', { method: 'POST' }).catch(() => {});
  } catch {
    // Ignore
  }
}

/**
 * Record a student login into Trang tính 2 (Sheet 2) of Google Sheets
 */
export async function recordLoginToSheet2(student: StudentInfo): Promise<LoginLogRecord> {
  const timestamp = formatVietnamTime();
  const monthi = getStudentExamSummary(student);
  const device = getDeviceInfo();

  const record: LoginLogRecord = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp,
    isoDate: new Date().toISOString(),
    hoten: student.hoten || 'Chưa cập nhật',
    sbd: student.sbd || '---',
    username: student.username || '',
    email: student.email || '',
    namsinh: student.namsinh || '',
    monthi,
    device,
    status: 'Đăng nhập thành công',
    synced: false,
  };

  // 1. Always save to local storage immediately
  saveLogRecord(record);

  // 2. Transmit to server proxy /api/log-login and Google Apps Script
  const payload = {
    id: record.id,
    action: 'log_login',
    sheet: 'Trang tính2',
    sheetName: 'Trang tính 2',
    time: timestamp,
    timestamp,
    isoDate: record.isoDate,
    hoten: record.hoten,
    sbd: record.sbd,
    username: record.username,
    namsinh: record.namsinh,
    email: record.email,
    monthi: record.monthi,
    device: record.device,
    status: record.status,
  };

  try {
    const scriptUrl = getScriptUrl();

    // Strategy A: Local server proxy /api/log-login
    fetch('/api/log-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }).catch(() => {});

    // Strategy B: Direct POST request with text/plain (bypasses CORS preflight)
    fetch(scriptUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    }).catch(() => {});

    record.synced = true;
  } catch {
    // ignore
  }

  return record;
}

/**
 * Copy entire logs table as TSV (Tab-Separated Values)
 * Enables 1-click paste directly into Google Sheets or Microsoft Excel
 */
export function copyLogsTableAsTSV(logs: LoginLogRecord[]): boolean {
  if (!logs || logs.length === 0) return false;
  const headers = [
    'STT',
    'Thời gian đăng nhập',
    'Họ và tên',
    'Số báo danh (SBD)',
    'Tài khoản / SĐT',
    'Năm sinh',
    'Email',
    'Môn thi đã đăng ký',
    'Thiết bị / Trình duyệt',
    'Trạng thái',
  ];
  const rows = logs.map((l, index) => [
    index + 1,
    l.timestamp || '',
    l.hoten || '',
    l.sbd || '',
    l.username || '',
    l.namsinh || '',
    l.email || '',
    l.monthi || '',
    l.device || '',
    l.status || 'Đăng nhập thành công',
  ]);
  const text = [headers.join('\t'), ...rows.map((r) => r.join('\t'))].join('\n');
  navigator.clipboard.writeText(text);
  return true;
}

/**
 * Copy clean list of phone numbers (usernames) separated by commas or line breaks
 */
export function copyPhoneListFromLogs(logs: LoginLogRecord[], delimiter = ', '): string {
  const phones = logs
    .map((l) => l.username?.trim())
    .filter((u): u is string => Boolean(u && u.length >= 8 && /^\d+$/.test(u)));
  const unique = Array.from(new Set(phones));
  const res = unique.join(delimiter);
  if (res) navigator.clipboard.writeText(res);
  return res;
}

/**
 * Copy clean list of student emails separated by commas
 */
export function copyEmailListFromLogs(logs: LoginLogRecord[], delimiter = ', '): string {
  const emails = logs
    .map((l) => l.email?.trim())
    .filter((e): e is string => Boolean(e && e.includes('@')));
  const unique = Array.from(new Set(emails));
  const res = unique.join(delimiter);
  if (res) navigator.clipboard.writeText(res);
  return res;
}

/**
 * Copy list of candidate registration numbers (SBD)
 */
export function copySbdListFromLogs(logs: LoginLogRecord[], delimiter = ', '): string {
  const sbds = logs
    .map((l) => l.sbd?.trim())
    .filter((s): s is string => Boolean(s && s !== '---' && !s.toLowerCase().startsWith('ad')));
  const unique = Array.from(new Set(sbds));
  const res = unique.join(delimiter);
  if (res) navigator.clipboard.writeText(res);
  return res;
}

/**
 * Export logs to CSV file for Excel / Google Sheets
 */
export function exportLogsToCSV(customLogs?: LoginLogRecord[]): void {
  const logs = customLogs && customLogs.length > 0 ? customLogs : getLoginLogs();
  if (logs.length === 0) return;

  const headers = [
    'STT',
    'Thời gian đăng nhập',
    'Họ và tên',
    'Số báo danh (SBD)',
    'Tài khoản / SĐT',
    'Năm sinh',
    'Email',
    'Môn thi đã đăng ký',
    'Thiết bị / Trình duyệt',
    'Trạng thái',
  ];

  const rows = logs.map((l, idx) => [
    idx + 1,
    `"${(l.timestamp || '').replace(/"/g, '""')}"`,
    `"${(l.hoten || '').replace(/"/g, '""')}"`,
    `"${(l.sbd || '').replace(/"/g, '""')}"`,
    `"${(l.username || '').replace(/"/g, '""')}"`,
    `"${(l.namsinh || '').replace(/"/g, '""')}"`,
    `"${(l.email || '').replace(/"/g, '""')}"`,
    `"${(l.monthi || '').replace(/"/g, '""')}"`,
    `"${(l.device || '').replace(/"/g, '""')}"`,
    `"${(l.status || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `lich_su_dang_nhap_trang_tinh_2_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Retrieve local saved career test results
 */
export function getLocalCareerResults(): CareerResultRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_CAREER_RESULTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CareerResultRecord[];
  } catch {
    return [];
  }
}

export function getLatestCareerResultForStudent(username: string, sbd?: string): CareerResultRecord | null {
  const list = getLocalCareerResults();
  return (
    list.find(
      (r) =>
        (username && r.username === username) ||
        (sbd && sbd !== '---' && r.sbd === sbd)
    ) || null
  );
}

function saveLocalCareerResult(record: CareerResultRecord): void {
  try {
    const existing = getLocalCareerResults();
    const updated = [record, ...existing.slice(0, 199)];
    localStorage.setItem(STORAGE_CAREER_RESULTS_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

/**
 * Save career test result (RIASEC) directly to Google Sheets + server store
 */
export async function recordCareerResultToSheet(
  student: StudentInfo,
  data: {
    riasecCode: string;
    primaryTrait: string;
    secondaryTrait: string;
    scores: { R: number; I: number; A: number; S: number; E: number; C: number };
    recommendedMajors: string[];
    recommendedUniversities: string[];
    examFocus: string;
  }
): Promise<CareerResultRecord> {
  const timestamp = formatVietnamTime();
  const device = getDeviceInfo();
  const scoresText = `R:${data.scores.R} | I:${data.scores.I} | A:${data.scores.A} | S:${data.scores.S} | E:${data.scores.E} | C:${data.scores.C}`;

  const record: CareerResultRecord = {
    id: `career_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp,
    isoDate: new Date().toISOString(),
    hoten: student.hoten || 'Chưa cập nhật',
    sbd: student.sbd || '---',
    username: student.username || '',
    email: student.email || '',
    namsinh: student.namsinh || '',
    riasecCode: data.riasecCode,
    primaryTrait: data.primaryTrait,
    secondaryTrait: data.secondaryTrait,
    scores: data.scores,
    scoresText,
    recommendedMajors: data.recommendedMajors.join(', '),
    recommendedUniversities: data.recommendedUniversities.join(', '),
    examFocus: data.examFocus,
    device,
    synced: false,
  };

  // Save immediately to localStorage
  saveLocalCareerResult(record);

  const scriptUrl = getScriptUrl();
  const payload = {
    ...record,
    time: timestamp,
    scriptUrl,
  };

  try {
    const res = await fetch('/api/log-career', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const json = await res.json();
      record.synced = Boolean(json?.success);
    }
  } catch {
    // Backup direct client no-cors POST if backend proxy is unavailable
    try {
      fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          action: 'log_career',
          sheet: 'Trang tính 5',
          sheetName: 'Trang tính 5',
          time: timestamp,
          hoten: record.hoten,
          sbd: record.sbd,
          username: record.username,
          namsinh: record.namsinh,
          email: record.email,
          monthi: `Hướng nghiệp RIASEC (Mã: ${record.riasecCode})`,
          device: record.device,
          status: `KQ Hướng nghiệp: ${record.riasecCode} | ${record.scoresText} | ${record.primaryTrait}`,
          riasecCode: record.riasecCode,
          primaryTrait: record.primaryTrait,
          secondaryTrait: record.secondaryTrait,
          scores: record.scores,
          scoresText: record.scoresText,
          recommendedMajors: record.recommendedMajors,
          recommendedUniversities: record.recommendedUniversities,
          examFocus: record.examFocus,
        }),
      }).catch(() => {});
      record.synced = true;
    } catch {
      // ignore
    }
  }

  return record;
}

function parseCareerFromSheet2LogItem(item: any, idx: number): CareerResultRecord | null {
  const monthi = String(item?.monthi || '').trim();
  const status = String(item?.status || '').trim();
  const isCareerRow =
    (monthi.toLowerCase().includes('hướng nghiệp') && monthi.toLowerCase().includes('mã:')) ||
    status.startsWith('KQ Hướng nghiệp:') ||
    status.startsWith('KQ:');

  if (!isCareerRow) return null;

  const codeMatch =
    monthi.match(/Mã:\s*([RIASEC]{1,6})/i) ||
    status.match(/KQ(?:\s+Hướng nghiệp)?:\s*([RIASEC]{1,6})/i);
  const riasecCode = codeMatch ? codeMatch[1].toUpperCase() : '';
  if (!riasecCode) return null;

  const getScore = (letter: string) => {
    const m = status.match(new RegExp(`${letter}\\s*:\\s*(\\d+)`, 'i'));
    return m ? Number(m[1]) : 0;
  };
  const scores = {
    R: getScore('R'),
    I: getScore('I'),
    A: getScore('A'),
    S: getScore('S'),
    E: getScore('E'),
    C: getScore('C'),
  };
  const scoresText = `R:${scores.R} | I:${scores.I} | A:${scores.A} | S:${scores.S} | E:${scores.E} | C:${scores.C}`;
  const primaryMatch = status.match(/Nhóm chính:\s*([^|]+)/i);
  const majorsMatch = status.match(/Ngành:\s*(.+)$/i);

  return {
    id: `sheet2_client_career_${idx}_${riasecCode}`,
    timestamp: String(item?.time || item?.timestamp || '').trim(),
    isoDate: item?.isoDate || new Date().toISOString(),
    hoten: String(item?.hoten || '').trim(),
    sbd: String(item?.sbd || '').trim(),
    username: String(item?.username || '').trim(),
    email: String(item?.email || '').trim(),
    namsinh: String(item?.namsinh || '').trim(),
    riasecCode,
    primaryTrait: primaryMatch ? primaryMatch[1].trim() : '',
    secondaryTrait: '',
    scores,
    scoresText,
    recommendedMajors: majorsMatch ? majorsMatch[1].trim() : '',
    recommendedUniversities: '',
    examFocus: '',
    device: String(item?.device || '').trim(),
    synced: true,
  };
}

/**
 * Fetch all career test results from server & Google Sheets
 */
export async function fetchCareerResults(): Promise<CareerResultRecord[]> {
  const scriptUrl = getScriptUrl();
  try {
    const res = await fetch(
      `/api/career-results?url=${encodeURIComponent(scriptUrl)}&_t=${Date.now()}`,
      {
        method: 'GET',
        headers: { Accept: 'application/json' },
      }
    );
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        try {
          localStorage.setItem(STORAGE_CAREER_RESULTS_KEY, JSON.stringify(data));
        } catch {
          // ignore
        }
        return data as CareerResultRecord[];
      }
    }
  } catch {
    // fallback to direct GAS
  }

  // Fallback: Direct GAS fetch (supports both get_career_results and get_sheet2)
  try {
    const sep = scriptUrl.includes('?') ? '&' : '?';
    const [resCareer, resSheet2] = await Promise.all([
      fetch(`${scriptUrl}${sep}action=get_career_results&sheet=5&_t=${Date.now()}`).catch(() => null),
      fetch(`${scriptUrl}${sep}action=get_sheet2&sheet=2&_t=${Date.now()}`).catch(() => null),
    ]);

    const merged: CareerResultRecord[] = [];
    if (resCareer && resCareer.ok) {
      const parsed = await resCareer.json().catch(() => []);
      if (Array.isArray(parsed)) {
        parsed.forEach((item: any, idx: number) => {
          if (item?.riasecCode) {
            merged.push({
              id: `gas_client_career_${idx}`,
              timestamp: String(item.time || item.timestamp || '').trim(),
              isoDate: item.isoDate || new Date().toISOString(),
              hoten: item.hoten || '',
              sbd: item.sbd || '',
              username: item.username || '',
              email: item.email || '',
              namsinh: item.namsinh || '',
              riasecCode: item.riasecCode || '',
              primaryTrait: item.primaryTrait || '',
              secondaryTrait: item.secondaryTrait || '',
              scores: item.scores || { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 },
              scoresText: item.scoresText || '',
              recommendedMajors: item.recommendedMajors || '',
              recommendedUniversities: item.recommendedUniversities || '',
              examFocus: item.examFocus || '',
              device: item.device || '',
              synced: true,
            });
          }
        });
      }
    }
    if (resSheet2 && resSheet2.ok) {
      const parsed2 = await resSheet2.json().catch(() => []);
      if (Array.isArray(parsed2)) {
        parsed2.forEach((row: any, idx: number) => {
          const c = parseCareerFromSheet2LogItem(row, idx);
          if (c) merged.push(c);
        });
      }
    }
    if (merged.length > 0) {
      const reversed = merged.reverse();
      try {
        localStorage.setItem(STORAGE_CAREER_RESULTS_KEY, JSON.stringify(reversed));
      } catch {
        // ignore
      }
      return reversed;
    }
  } catch {
    // fallback to local
  }

  return getLocalCareerResults();
}

export function copyCareerResultsAsTSV(results: CareerResultRecord[]): boolean {
  if (!results || results.length === 0) return false;
  const headers = [
    'STT',
    'Thời gian làm bài',
    'Họ và tên',
    'Số báo danh (SBD)',
    'Tài khoản / SĐT',
    'Năm sinh',
    'Email',
    'Mã RIASEC',
    'Nhóm tính cách chính',
    'Điểm chi tiết (R-I-A-S-E-C)',
    'Ngành học đề xuất',
    'Khối thi tập trung',
    'Thiết bị',
  ];
  const rows = results.map((r, index) => [
    index + 1,
    r.timestamp || '',
    r.hoten || '',
    r.sbd || '',
    r.username || '',
    r.namsinh || '',
    r.email || '',
    r.riasecCode || '',
    r.primaryTrait || '',
    r.scoresText || '',
    r.recommendedMajors || '',
    r.examFocus || '',
    r.device || '',
  ]);
  const text = [headers.join('\t'), ...rows.map((row) => row.join('\t'))].join('\n');
  navigator.clipboard.writeText(text);
  return true;
}

export function exportCareerResultsToCSV(customResults?: CareerResultRecord[]): void {
  const results = customResults && customResults.length > 0 ? customResults : getLocalCareerResults();
  if (results.length === 0) return;

  const headers = [
    'STT',
    'Thời gian làm bài',
    'Họ và tên',
    'Số báo danh (SBD)',
    'Tài khoản / SĐT',
    'Năm sinh',
    'Email',
    'Mã RIASEC',
    'Nhóm tính cách chính',
    'Điểm chi tiết (R-I-A-S-E-C)',
    'Ngành học đề xuất',
    'Khối thi tập trung',
    'Thiết bị',
  ];

  const rows = results.map((r, idx) => [
    idx + 1,
    `"${(r.timestamp || '').replace(/"/g, '""')}"`,
    `"${(r.hoten || '').replace(/"/g, '""')}"`,
    `"${(r.sbd || '').replace(/"/g, '""')}"`,
    `"${(r.username || '').replace(/"/g, '""')}"`,
    `"${(r.namsinh || '').replace(/"/g, '""')}"`,
    `"${(r.email || '').replace(/"/g, '""')}"`,
    `"${(r.riasecCode || '').replace(/"/g, '""')}"`,
    `"${(r.primaryTrait || '').replace(/"/g, '""')}"`,
    `"${(r.scoresText || '').replace(/"/g, '""')}"`,
    `"${(r.recommendedMajors || '').replace(/"/g, '""')}"`,
    `"${(r.examFocus || '').replace(/"/g, '""')}"`,
    `"${(r.device || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `ket_qua_huong_nghiep_riasec_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Ready-to-use Google Apps Script code for the user's "Admin web thi" spreadsheet
 */
export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * ============================================================
 * MÃ GOOGLE APPS SCRIPT CHO FILE "Admin web thi"
 * Hỗ trợ đầy đủ:
 * 1. Trang tính 3: Vùng A-K (Admin nhập tay) & Vùng M-X (Đăng ký trực tiếp trên Web)
 * 2. Trang tính 1: Danh sách tài khoản cũ (đọc gộp đồng bộ)
 * 3. Trang tính 2: Tự động ghi nhận lịch sử đăng nhập
 * 4. Trang tính 4: Tài khoản QTV, phân quyền tab, hanche, danhsachdkytk, cấu hình A2,
 *    Link bài thi & cụm "Đăng ký" (bật/tắt kỳ thi cho phép đăng ký trên web)
 * 5. Trang tính 5: Lưu thông tin thí sinh & Kết quả hướng nghiệp RIASEC
 * ============================================================
 */

function normalizeViStr(val) {
  if (val === null || val === undefined) return "";
  return String(val)
    .toLowerCase()
    .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, "a")
    .replace(/[èéẹẻẽêềếệểễ]/g, "e")
    .replace(/[ìíịỉĩ]/g, "i")
    .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, "o")
    .replace(/[ùúụủũưừứựửữ]/g, "u")
    .replace(/[ỳýỵỷỹ]/g, "y")
    .replace(/đ/g, "d")
    .trim();
}

function isTruthyCell(val) {
  if (val === true) return true;
  if (val === false || val === null || val === undefined) return false;
  var s = normalizeViStr(val);
  return s === "co" || s === "yes" || s === "true" || s === "x" || s === "1" || s === "tick" || s === "✓" || s === "✔";
}

function formatCellDateTime(val, dateOnly) {
  if (val === null || val === undefined || val === "") return "";
  if (Object.prototype.toString.call(val) === "[object Date]" && !isNaN(val.getTime())) {
    return Utilities.formatDate(val, "GMT+7", dateOnly ? "dd/MM/yyyy" : "dd/MM/yyyy HH:mm:ss");
  }
  return String(val).trim();
}

function detectStudentZoneCols(headers, startCol, endCol, defaults) {
  var map = {
    time: defaults.time,
    taikhoan: defaults.taikhoan,
    pass: defaults.pass,
    sobaodanh: defaults.sobaodanh,
    hoten: defaults.hoten,
    email: defaults.email,
    namsinh: defaults.namsinh,
    hsa: defaults.hsa,
    vact: defaults.vact,
    thptqg: defaults.thptqg,
    huongnghiep: defaults.huongnghiep
  };
  for (var c = startCol; c <= Math.min(endCol, headers.length - 1); c++) {
    var h = normalizeViStr(headers[c]).replace(/[^a-z0-9]/g, "");
    if (!h) continue;
    if (h === "time" || h === "thoigian" || h === "thoigiandangky") map.time = c;
    else if (h === "taikhoan" || h === "username" || h === "sdt") map.taikhoan = c;
    else if (h === "pass" || h === "password" || h === "matkhau") map.pass = c;
    else if (h === "sobaodanh" || h === "sbd") map.sobaodanh = c;
    else if (h === "hoten" || h === "hovaten") map.hoten = c;
    else if (h === "email" || h === "mail") map.email = c;
    else if (h === "namsinh") map.namsinh = c;
    else if (h === "hsa") map.hsa = c;
    else if (h === "vact") map.vact = c;
    else if (h === "thptqg" || h === "tnthptqg") map.thptqg = c;
    else if (h === "huongnghiep") map.huongnghiep = c;
  }
  return map;
}

function getSheet3(ss) {
  return ss.getSheetByName("Trang tính 3") || ss.getSheetByName("Trang tính3") || ss.getSheets()[2] || null;
}

function getSheet5(ss, createIfMissing) {
  var s = ss.getSheetByName("Trang tính 5") || ss.getSheetByName("Trang tính5");
  if (s) return s;
  var sheets = ss.getSheets();
  if (sheets.length >= 5 && sheets[4]) {
    return sheets[4];
  }
  if (createIfMissing) {
    return ss.insertSheet("Trang tính 5");
  }
  return ss.getSheetByName("Kết quả hướng nghiệp") || null;
}

function detectCareerSheetCols(headers) {
  var map = {
    time: 0,
    hoten: 1,
    sbd: 2,
    username: 3,
    namsinh: 4,
    email: 5,
    riasecCode: 6,
    primaryTrait: 7,
    scoresText: 8,
    recommendedMajors: 9,
    examFocus: 10,
    device: 11
  };
  if (!headers || headers.length === 0) return map;

  // Nhận diện bố cục 11 cột cũ (không có cột Năm sinh)
  var joined = normalizeViStr(headers.join(" "));
  var hasNamSinhHeader = joined.indexOf("nam sinh") !== -1 || joined.indexOf("namsinh") !== -1;
  if (!hasNamSinhHeader && headers.length <= 11) {
    map = {
      time: 0,
      hoten: 1,
      sbd: 2,
      username: 3,
      namsinh: -1,
      email: 4,
      riasecCode: 5,
      primaryTrait: 6,
      scoresText: 7,
      recommendedMajors: 8,
      examFocus: 9,
      device: 10
    };
  }

  for (var c = 0; c < headers.length; c++) {
    var h = normalizeViStr(headers[c]).replace(/[^a-z0-9]/g, "");
    if (!h) continue;
    if (h === "time" || h === "thoigian" || h === "thoigianhoanthanh") map.time = c;
    else if (h === "hoten" || h === "hovaten") map.hoten = c;
    else if (h === "sbd" || h === "sobaodanh" || h === "sobaodanhsbd") map.sbd = c;
    else if (h === "taikhoan" || h === "sdt" || h === "sodienthoai" || h === "taikhoansdt" || h === "sodienthoaitaikhoan") map.username = c;
    else if (h === "namsinh") map.namsinh = c;
    else if (h === "email" || h === "mail") map.email = c;
    else if (h === "mariasec" || h === "riasec") map.riasecCode = c;
    else if (h === "nhomtinhcach" || h === "nhomtinhcachchinh" || h === "ketqua") map.primaryTrait = c;
    else if (h.indexOf("diemchitiet") !== -1 || h === "diem") map.scoresText = c;
    else if (h === "nganhhoc" || h === "nganhhocdexuat" || h === "nganh") map.recommendedMajors = c;
    else if (h.indexOf("khoithi") !== -1 || h === "kythi") map.examFocus = c;
    else if (h === "thietbi") map.device = c;
  }
  return map;
}

function readCareerRowsFromSheet(sheetObj) {
  if (!sheetObj || sheetObj.getLastRow() <= 1) return [];
  var values = sheetObj.getDataRange().getValues();
  var cols = detectCareerSheetCols(values[0] || []);
  var rows = values.slice(1);
  var out = [];
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    var code = cols.riasecCode >= 0 ? String(r[cols.riasecCode] || "").trim() : "";
    var name = cols.hoten >= 0 ? String(r[cols.hoten] || "").trim() : "";
    var user = cols.username >= 0 ? String(r[cols.username] || "").trim() : "";
    if (!code && !name && !user) continue;
    out.push({
      time: cols.time >= 0 ? formatCellDateTime(r[cols.time], false) : "",
      hoten: name,
      sbd: cols.sbd >= 0 ? String(r[cols.sbd] || "").trim() : "",
      username: user,
      namsinh: cols.namsinh >= 0 ? String(r[cols.namsinh] || "").trim() : "",
      email: cols.email >= 0 ? String(r[cols.email] || "").trim() : "",
      riasecCode: code,
      primaryTrait: cols.primaryTrait >= 0 ? String(r[cols.primaryTrait] || "").trim() : "",
      scoresText: cols.scoresText >= 0 ? String(r[cols.scoresText] || "").trim() : "",
      recommendedMajors: cols.recommendedMajors >= 0 ? String(r[cols.recommendedMajors] || "").trim() : "",
      examFocus: cols.examFocus >= 0 ? String(r[cols.examFocus] || "").trim() : "",
      device: cols.device >= 0 ? String(r[cols.device] || "").trim() : ""
    });
  }
  return out;
}

function doGet(e) {
  var action = e && e.parameter ? e.parameter.action : "";
  var sheetParam = e && e.parameter ? e.parameter.sheet : "";

  if (action === "log_login") {
    return handleLogLogin(e.parameter);
  }

  if (action === "get_sheet4" || action === "get_admin_config" || sheetParam === "4" || sheetParam === "Trang tính 4" || sheetParam === "Trang tính4") {
    return handleGetSheet4(e);
  }

  if (action === "get_career_results" || action === "get_sheet5" || sheetParam === "5" || sheetParam === "Trang tính 5" || sheetParam === "Trang tính5") {
    var ssC = SpreadsheetApp.getActiveSpreadsheet();
    var sheet5 = getSheet5(ssC, false);
    var results = readCareerRowsFromSheet(sheet5);
    var legacyCareerSheet = ssC.getSheetByName("Kết quả hướng nghiệp");
    if (legacyCareerSheet && (!sheet5 || legacyCareerSheet.getSheetId() !== sheet5.getSheetId())) {
      results = results.concat(readCareerRowsFromSheet(legacyCareerSheet));
    }
    return ContentService.createTextOutput(JSON.stringify(results)).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "get_sheet2" || action === "get_logs" || sheetParam === "2" || sheetParam === "Trang tính 2" || sheetParam === "Trang tính2") {
    var ss2 = SpreadsheetApp.getActiveSpreadsheet();
    var sheet2 = ss2.getSheetByName("Trang tính2") || ss2.getSheetByName("Trang tính 2") || ss2.getSheets()[1];
    if (!sheet2 || sheet2.getLastRow() <= 1) {
      return ContentService.createTextOutput("[]").setMimeType(ContentService.MimeType.JSON);
    }
    var rows2 = sheet2.getDataRange().getValues().slice(1);
    var logs = rows2.map(function(r) {
      return {
        time: formatCellDateTime(r[0], false),
        hoten: String(r[1] || "").trim(),
        sbd: String(r[2] || "").trim(),
        username: String(r[3] || "").trim(),
        namsinh: String(r[4] || "").trim(),
        email: String(r[5] || "").trim(),
        monthi: String(r[6] || "").trim(),
        device: String(r[7] || "").trim(),
        status: String(r[8] || "Đăng nhập thành công").trim()
      };
    });
    return ContentService.createTextOutput(JSON.stringify(logs)).setMimeType(ContentService.MimeType.JSON);
  }

  // Mặc định: Đọc gộp Trang tính 3 (cả vùng A-K lẫn M-X) + Trang tính 1
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var combined = [];
  var seenUsers = {};

  var sheet3 = getSheet3(ss);
  if (sheet3 && sheet3.getLastRow() >= 2) {
    var data3 = sheet3.getDataRange().getValues();
    var headers3 = data3[0] || [];
    var leftCols = detectStudentZoneCols(headers3, 0, 10, {
      time: 0, taikhoan: 1, pass: 2, sobaodanh: 3, hoten: 4,
      email: 5, namsinh: 6, hsa: 7, vact: 8, thptqg: 9, huongnghiep: 10
    });
    var rightCols = detectStudentZoneCols(headers3, 12, headers3.length - 1, {
      time: 12, taikhoan: 14, pass: 15, sobaodanh: 16, hoten: 17,
      email: 18, namsinh: 19, hsa: 20, vact: 21, thptqg: 22, huongnghiep: 23
    });

    for (var i = 1; i < data3.length; i++) {
      var r3 = data3[i];
      var rowNum3 = i + 1;

      // Vùng M-X (Đăng ký trực tiếp trên web)
      var webUser = String(r3[rightCols.taikhoan] || "").trim();
      var webName = String(r3[rightCols.hoten] || "").trim();
      var webSbd = String(r3[rightCols.sobaodanh] || "").trim();
      if (webUser || webName || webSbd) {
        var webNorm = webUser.toLowerCase();
        if (webNorm) seenUsers[webNorm] = true;
        combined.push({
          registeredAt: formatCellDateTime(r3[rightCols.time], false),
          username: webUser,
          password: String(r3[rightCols.pass] || "").trim(),
          sbd: webSbd,
          hoten: webName,
          email: String(r3[rightCols.email] || "").trim(),
          namsinh: String(r3[rightCols.namsinh] || "").trim(),
          hsa: String(r3[rightCols.hsa] || "").trim(),
          vact: String(r3[rightCols.vact] || "").trim(),
          thptqg: String(r3[rightCols.thptqg] || "").trim(),
          huongnghiep: String(r3[rightCols.huongnghiep] || "").trim(),
          batdau: "",
          ketthuc: "",
          thongbao: "",
          sourceZone: "sheet3_web",
          rowNumber: rowNum3,
          isAdmin: false
        });
      }

      // Vùng A-K (Admin nhập tay trên Trang tính 3)
      var manUser = String(r3[leftCols.taikhoan] || "").trim();
      var manName = String(r3[leftCols.hoten] || "").trim();
      var manSbd = String(r3[leftCols.sobaodanh] || "").trim();
      if (manUser || manName || manSbd) {
        var manNorm = manUser.toLowerCase();
        if (!manNorm || !seenUsers[manNorm]) {
          if (manNorm) seenUsers[manNorm] = true;
          combined.push({
            registeredAt: formatCellDateTime(r3[leftCols.time], false),
            username: manUser,
            password: String(r3[leftCols.pass] || "").trim(),
            sbd: manSbd,
            hoten: manName,
            email: String(r3[leftCols.email] || "").trim(),
            namsinh: String(r3[leftCols.namsinh] || "").trim(),
            hsa: String(r3[leftCols.hsa] || "").trim(),
            vact: String(r3[leftCols.vact] || "").trim(),
            thptqg: String(r3[leftCols.thptqg] || "").trim(),
            huongnghiep: String(r3[leftCols.huongnghiep] || "").trim(),
            batdau: "",
            ketthuc: "",
            thongbao: "",
            sourceZone: "sheet3_manual",
            rowNumber: rowNum3,
            isAdmin: false
          });
        }
      }
    }
  }

  // Đọc bổ sung từ Trang tính 1 (nếu có dữ liệu cũ)
  var sheet1 = ss.getSheetByName("Trang tính1") || ss.getSheetByName("Trang tính 1") || ss.getSheets()[0];
  if (sheet1 && sheet1.getLastRow() >= 2) {
    var data1 = sheet1.getDataRange().getValues();
    var headers1 = data1[0] || [];
    var thongbaoCol1 = -1;
    for (var c = 0; c < headers1.length; c++) {
      var h1 = normalizeViStr(headers1[c]).replace(/\\s+/g, "");
      if (h1 === "thongbao" || h1 === "notice") {
        thongbaoCol1 = c;
        break;
      }
    }
    for (var j = 1; j < data1.length; j++) {
      var r1 = data1[j];
      var rowNum1 = j + 1;
      var u1 = String(r1[0] || "").trim();
      var n1 = String(r1[3] || "").trim();
      var s1 = String(r1[2] || "").trim();
      if (!u1 && !n1 && !s1) continue;
      var u1Norm = u1.toLowerCase();
      if (u1Norm && seenUsers[u1Norm]) continue;
      if (u1Norm) seenUsers[u1Norm] = true;

      var isAdmin1 = rowNum1 >= 2 && rowNum1 <= 6;
      var tbVal1 = thongbaoCol1 >= 0 && r1[thongbaoCol1] ? String(r1[thongbaoCol1]).trim() : String(r1[12] || r1[13] || r1[14] || "").trim();
      combined.push({
        registeredAt: "",
        username: u1,
        password: String(r1[1] || "").trim(),
        sbd: s1,
        hoten: n1,
        email: String(r1[4] || "").trim(),
        namsinh: String(r1[5] || "").trim(),
        hsa: String(r1[6] || "").trim(),
        vact: String(r1[7] || "").trim(),
        thptqg: String(r1[8] || "").trim(),
        huongnghiep: String(r1[9] || "").trim(),
        batdau: String(r1[10] || "").trim(),
        ketthuc: String(r1[11] || "").trim(),
        thongbao: tbVal1,
        sourceZone: "sheet1",
        rowNumber: rowNum1,
        isAdmin: isAdmin1
      });
    }
  }

  var callback = e && e.parameter ? e.parameter.callback : null;
  var json = JSON.stringify(combined);
  var output = callback ? callback + "(" + json + ");" : json;
  var mime = callback ? ContentService.MimeType.JAVASCRIPT : ContentService.MimeType.JSON;
  return ContentService.createTextOutput(output).setMimeType(mime);
}

function doPost(e) {
  var data = {};
  try {
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      data = e.parameter;
    }
  } catch (err) {
    data = (e && e.parameter) ? e.parameter : {};
  }

  if (data && data.action === "register_account") {
    return handleRegisterAccount(data);
  }
  if (data && data.action === "log_career") {
    return handleLogCareer(data);
  }
  return handleLogLogin(data);
}

function handleRegisterAccount(data) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet3 = getSheet3(ss);
    if (!sheet3) {
      sheet3 = ss.insertSheet("Trang tính 3");
    }

    var lastCol = Math.max(sheet3.getLastColumn(), 24);
    var headerRow = sheet3.getRange(1, 1, 1, lastCol).getValues()[0];
    var hasRightHeader = false;
    for (var c = 12; c < headerRow.length; c++) {
      if (String(headerRow[c] || "").trim() !== "") {
        hasRightHeader = true;
        break;
      }
    }
    if (!hasRightHeader) {
      sheet3.getRange(1, 13, 1, 12).setValues([[
        "time", "", "taikhoan", "pass", "sobaodanh", "hoten", "email", "namsinh", "HSA", "VACT", "THPTQG", "Huongnghiep"
      ]]);
      headerRow = sheet3.getRange(1, 1, 1, Math.max(sheet3.getLastColumn(), 24)).getValues()[0];
    }

    var leftCols = detectStudentZoneCols(headerRow, 0, 10, {
      time: 0, taikhoan: 1, pass: 2, sobaodanh: 3, hoten: 4,
      email: 5, namsinh: 6, hsa: 7, vact: 8, thptqg: 9, huongnghiep: 10
    });
    var rightCols = detectStudentZoneCols(headerRow, 12, headerRow.length - 1, {
      time: 12, taikhoan: 14, pass: 15, sobaodanh: 16, hoten: 17,
      email: 18, namsinh: 19, hsa: 20, vact: 21, thptqg: 22, huongnghiep: 23
    });

    var newUser = String(data.username || data.taikhoan || "").trim();
    if (!newUser) {
      return ContentService.createTextOutput(JSON.stringify({ status: "error", targetSheet: "Trang tính 3", message: "Thiếu tài khoản / SĐT" })).setMimeType(ContentService.MimeType.JSON);
    }

    var totalRows = Math.max(sheet3.getLastRow(), 1);
    var allValues = sheet3.getRange(1, 1, totalRows, Math.max(lastCol, 24)).getValues();
    var existingSbds = {};
    var targetRow = -1;

    for (var r = 1; r < allValues.length; r++) {
      var rowArr = allValues[r];
      var lu = String(rowArr[leftCols.taikhoan] || "").trim().toLowerCase();
      var ru = String(rowArr[rightCols.taikhoan] || "").trim().toLowerCase();
      if (lu === newUser.toLowerCase() || ru === newUser.toLowerCase()) {
        return ContentService.createTextOutput(JSON.stringify({ status: "duplicate", targetSheet: "Trang tính 3", message: "Tài khoản / SĐT này đã được đăng ký!" })).setMimeType(ContentService.MimeType.JSON);
      }
      var ls = String(rowArr[leftCols.sobaodanh] || "").trim();
      var rs = String(rowArr[rightCols.sobaodanh] || "").trim();
      if (ls) existingSbds[ls] = true;
      if (rs) existingSbds[rs] = true;

      if (targetRow === -1) {
        var rightEmpty = !String(rowArr[rightCols.taikhoan] || "").trim() &&
                         !String(rowArr[rightCols.hoten] || "").trim() &&
                         !String(rowArr[rightCols.time] || "").trim();
        if (rightEmpty) {
          targetRow = r + 1;
        }
      }
    }
    if (targetRow === -1) {
      targetRow = totalRows + 1;
    }

    var sbd = String(data.sbd || data.sobaodanh || "").trim();
    if (!sbd) {
      do {
        sbd = String(Math.floor(10000 + Math.random() * 89999));
      } while (existingSbds[sbd]);
    }

    var timeStr = String(data.time || "").trim() || Utilities.formatDate(new Date(), "GMT+7", "dd/MM/yyyy HH:mm:ss");

    sheet3.getRange(targetRow, rightCols.time + 1).setValue(timeStr);
    sheet3.getRange(targetRow, rightCols.taikhoan + 1).setValue(newUser);
    sheet3.getRange(targetRow, rightCols.pass + 1).setValue(String(data.password || data.pass || "").trim());
    sheet3.getRange(targetRow, rightCols.sobaodanh + 1).setValue(sbd);
    sheet3.getRange(targetRow, rightCols.hoten + 1).setValue(String(data.hoten || "").trim());
    sheet3.getRange(targetRow, rightCols.email + 1).setValue(String(data.email || "").trim());
    sheet3.getRange(targetRow, rightCols.namsinh + 1).setValue(String(data.namsinh || "").trim());
    sheet3.getRange(targetRow, rightCols.hsa + 1).setValue(String(data.hsa || "Không").trim());
    sheet3.getRange(targetRow, rightCols.vact + 1).setValue(String(data.vact || "Không").trim());
    sheet3.getRange(targetRow, rightCols.thptqg + 1).setValue(String(data.thptqg || "Không").trim());
    sheet3.getRange(targetRow, rightCols.huongnghiep + 1).setValue(String(data.huongnghiep || "Không").trim());

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      targetSheet: "Trang tính 3",
      rowNumber: targetRow,
      sbd: sbd,
      time: timeStr
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function handleLogCareer(data) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = getSheet5(ss, true);

    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Thời gian hoàn thành",
        "Họ và tên",
        "Số báo danh (SBD)",
        "Số điện thoại / Tài khoản",
        "Năm sinh",
        "Email",
        "Mã RIASEC",
        "Nhóm tính cách chính",
        "Điểm chi tiết (R-I-A-S-E-C)",
        "Ngành học đề xuất",
        "Khối thi / Kỳ thi nên tập trung",
        "Thiết bị"
      ]);
      var headerRange = sheet.getRange(1, 1, 1, 12);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#fae8ff");
      headerRange.setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    }

    var lastCol = Math.max(sheet.getLastColumn(), 12);
    var headerRow = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    var cols = detectCareerSheetCols(headerRow);
    var time = data.time || Utilities.formatDate(new Date(), "GMT+7", "dd/MM/yyyy HH:mm:ss");
    var targetRow = sheet.getLastRow() + 1;

    if (cols.time >= 0) sheet.getRange(targetRow, cols.time + 1).setValue(time);
    if (cols.hoten >= 0) sheet.getRange(targetRow, cols.hoten + 1).setValue(data.hoten || "");
    if (cols.sbd >= 0) sheet.getRange(targetRow, cols.sbd + 1).setValue(data.sbd || "");
    if (cols.username >= 0) sheet.getRange(targetRow, cols.username + 1).setValue(data.username || "");
    if (cols.namsinh >= 0) sheet.getRange(targetRow, cols.namsinh + 1).setValue(data.namsinh || "");
    if (cols.email >= 0) sheet.getRange(targetRow, cols.email + 1).setValue(data.email || "");
    if (cols.riasecCode >= 0) sheet.getRange(targetRow, cols.riasecCode + 1).setValue(data.riasecCode || "");
    if (cols.primaryTrait >= 0) sheet.getRange(targetRow, cols.primaryTrait + 1).setValue(data.primaryTrait || "");
    if (cols.scoresText >= 0) sheet.getRange(targetRow, cols.scoresText + 1).setValue(data.scoresText || "");
    if (cols.recommendedMajors >= 0) sheet.getRange(targetRow, cols.recommendedMajors + 1).setValue(data.recommendedMajors || "");
    if (cols.examFocus >= 0) sheet.getRange(targetRow, cols.examFocus + 1).setValue(data.examFocus || "");
    if (cols.device >= 0) sheet.getRange(targetRow, cols.device + 1).setValue(data.device || "");

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      targetSheet: "Trang tính 5",
      rowNumber: targetRow,
      message: "Đã lưu thông tin và kết quả hướng nghiệp vào Trang tính 5 thành công!"
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      targetSheet: "Trang tính 5",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function handleLogLogin(data) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Trang tính2") || ss.getSheetByName("Trang tính 2");
    if (!sheet) {
      sheet = ss.insertSheet("Trang tính2");
    }

    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Thời gian đăng nhập",
        "Họ và tên",
        "Số báo danh (SBD)",
        "Tài khoản / SĐT",
        "Năm sinh",
        "Email",
        "Môn thi đã đăng ký",
        "Thiết bị / Trình duyệt",
        "Trạng thái"
      ]);
      var headerRange = sheet.getRange(1, 1, 1, 9);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#dbeafe");
      headerRange.setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    }

    var time = data.time || Utilities.formatDate(new Date(), "GMT+7", "dd/MM/yyyy HH:mm:ss");
    sheet.appendRow([
      time,
      data.hoten || "",
      data.sbd || "",
      data.username || "",
      data.namsinh || "",
      data.email || "",
      data.monthi || "",
      data.device || "",
      data.status || "Đăng nhập thành công"
    ]);

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Đã ghi nhận đăng nhập vào Trang tính 2 thành công!"
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function handleGetSheet4(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet4 = ss.getSheetByName("Trang tính 4") || ss.getSheetByName("Trang tính4") || ss.getSheets()[3];
    if (!sheet4 || sheet4.getLastRow() < 2) {
      return ContentService.createTextOutput(JSON.stringify({
        deployed: false,
        admins: [],
        globalConfig: null,
        examLinks: {}
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var data = sheet4.getDataRange().getValues();
    var headers = data[0] || [];

    var colIdx = {
      taikhoan: 0, pass: 1, hoten: 2, email: 3,
      lichsu: 4, ketquahuongnghiep: 5, danhsachtaikhoan: 6, cauhinh: 7, hanche: 8, danhsachdkytk: 9,
      hsa: 10, vact: 11, thptqg: 12, huongnghiep: 13,
      batdau: 14, ketthuc: 15, thongbao: 16
    };

    for (var c = 0; c < headers.length; c++) {
      var h = normalizeViStr(headers[c]).replace(/[^a-z0-9]/g, "");
      if (h === "taikhoan") colIdx.taikhoan = c;
      else if (h === "pass" || h === "matkhau") colIdx.pass = c;
      else if (h === "hoten" || h === "hovaten") colIdx.hoten = c;
      else if (h === "email") colIdx.email = c;
      else if (h === "lichsu") colIdx.lichsu = c;
      else if (h === "ketquahuongnghiep") colIdx.ketquahuongnghiep = c;
      else if (h === "danhsachtaikhoan") colIdx.danhsachtaikhoan = c;
      else if (h === "cauhinh") colIdx.cauhinh = c;
      else if (h === "hanche") colIdx.hanche = c;
      else if (h === "danhsachdkytk" || h === "danhsachdangkytk" || h === "danhsachdangkytaikhoan") colIdx.danhsachdkytk = c;
      else if (h === "hsa") colIdx.hsa = c;
      else if (h === "vact") colIdx.vact = c;
      else if (h === "thptqg" || h === "tnthptqg") colIdx.thptqg = c;
      else if (h === "huongnghiep") colIdx.huongnghiep = c;
      else if (h === "batdau") colIdx.batdau = c;
      else if (h === "ketthuc") colIdx.ketthuc = c;
      else if (h === "thongbao") colIdx.thongbao = c;
    }

    var admins = [];
    var examLinks = {};
    var regConfigFound = false;
    var registrationConfig = {
      enableHsa: false,
      enableVact: false,
      enableThptqg: false,
      enableHuongnghiep: false
    };
    var inLinksSection = false;

    for (var i = 1; i < data.length; i++) {
      var r = data[i];
      var rowNum = i + 1;
      var colA = String(r[0] || "").trim();
      var colB = String(r[1] || "").trim();
      var normA = normalizeViStr(colA);
      var normB = normalizeViStr(colB);
      var rowJoined = normalizeViStr(r.slice(0, 6).join(" "));

      // Quét cụm cấu hình "Đăng ký" ở bên phải (từ hàng 25, cột K trở đi)
      if (rowNum >= 25) {
        for (var rc = 10; rc < r.length - 1; rc++) {
          var keyCell = normalizeViStr(r[rc]).replace(/[^a-z0-9]/g, "");
          if (keyCell === "hsa") {
            regConfigFound = true;
            registrationConfig.enableHsa = isTruthyCell(r[rc + 1]);
          } else if (keyCell === "vact") {
            regConfigFound = true;
            registrationConfig.enableVact = isTruthyCell(r[rc + 1]);
          } else if (keyCell === "thptqg" || keyCell === "tnthptqg") {
            regConfigFound = true;
            registrationConfig.enableThptqg = isTruthyCell(r[rc + 1]);
          } else if (keyCell === "huongnghiep") {
            regConfigFound = true;
            registrationConfig.enableHuongnghiep = isTruthyCell(r[rc + 1]);
          }
        }
      }

      if (rowJoined.indexOf("link dan den bai thi") !== -1) {
        inLinksSection = true;
        continue;
      }

      if (inLinksSection || rowNum >= 27 || normA === "hsa" || normA === "vact" || normA === "tnthptqg" || normA === "thptqg") {
        var foundUrl = "";
        for (var k = 2; k < Math.min(r.length, 10); k++) {
          var cellVal = String(r[k] || "").trim();
          if (cellVal.indexOf("http://") === 0 || cellVal.indexOf("https://") === 0) {
            foundUrl = cellVal;
            break;
          }
        }
        if (foundUrl) {
          if (normB.indexOf("dinh luong") !== -1) examLinks["hsa-1"] = foundUrl;
          else if (normB.indexOf("dinh tinh") !== -1) examLinks["hsa-2"] = foundUrl;
          else if (normB.indexOf("tieng anh") !== -1) examLinks["hsa-3"] = foundUrl;
          else if (normB.indexOf("su dung ngon ngu") !== -1) examLinks["vact-1"] = foundUrl;
          else if (normB.indexOf("tu duy logic") !== -1 || normB.indexOf("toan hoc") !== -1) examLinks["vact-2"] = foundUrl;
          else if (normB.indexOf("giai quyet van de") !== -1) examLinks["vact-3"] = foundUrl;
          else if (normB === "toan" || normB === "mon toan") examLinks["thptqg-toan"] = foundUrl;
          else if (normB === "li" || normB === "ly" || normB === "vat li" || normB === "vat ly") examLinks["thptqg-ly"] = foundUrl;
          else if (normB === "hoa" || normB === "hoa hoc") examLinks["thptqg-hoa"] = foundUrl;
          else if (normB === "sinh" || normB === "sinh hoc") examLinks["thptqg-sinh"] = foundUrl;
        }
        continue;
      }

      var uname = String(r[colIdx.taikhoan] || "").trim();
      var upass = String(r[colIdx.pass] || "").trim();
      if (uname && upass) {
        admins.push({
          rowNumber: rowNum,
          username: uname,
          password: upass,
          sbd: "ad" + (rowNum - 1),
          hoten: String(r[colIdx.hoten] || uname).trim(),
          email: String(r[colIdx.email] || "").trim(),
          isAdmin: true,
          adminPermissions: {
            lichsu: isTruthyCell(r[colIdx.lichsu]),
            ketquahuongnghiep: isTruthyCell(r[colIdx.ketquahuongnghiep]),
            danhsachtaikhoan: isTruthyCell(r[colIdx.danhsachtaikhoan]),
            cauhinh: isTruthyCell(r[colIdx.cauhinh]),
            hanche: isTruthyCell(r[colIdx.hanche]),
            danhsachdkytk: formatCellDateTime(r[colIdx.danhsachdkytk], true)
          }
        });
      }
    }

    if (!regConfigFound) {
      registrationConfig = {
        enableHsa: true,
        enableVact: true,
        enableThptqg: true,
        enableHuongnghiep: true
      };
    }

    // Cấu hình toàn hệ thống do QTV A2 (hàng 2) điều khiển
    var a2 = data[1] || [];
    var a2Notice = "";
    // Chỉ quét đúng vùng cột Thongbao (tối đa 4 cột gộp Q..T, không quét tràn sang cột U, V...)
    var thongbaoEndCol = colIdx.thongbao;
    while (
      thongbaoEndCol + 1 < headers.length &&
      String(headers[thongbaoEndCol + 1] || "").trim() === "" &&
      thongbaoEndCol - colIdx.thongbao < 3
    ) {
      thongbaoEndCol++;
    }
    for (var nc = colIdx.thongbao; nc <= Math.min(thongbaoEndCol, a2.length - 1); nc++) {
      var rawCell = a2[nc];
      if (Object.prototype.toString.call(rawCell) === "[object Date]") continue;
      var cellTxt = String(rawCell || "").trim();
      if (!cellTxt) continue;
      var lowTxt = cellTxt.toLowerCase();
      if (lowTxt === "0" || lowTxt === "khong" || lowTxt === "không" || lowTxt === "none") continue;
      if (/^\\d{1,2}:\\d{2}(:\\d{2})?\\s+\\d{1,2}[\\/-]\\d{1,2}[\\/-]\\d{4}$/.test(cellTxt)) continue;
      if (/^\\d{1,2}[\\/-]\\d{1,2}[\\/-]\\d{4}(\\s+\\d{1,2}:\\d{2}(:\\d{2})?)?$/.test(cellTxt)) continue;
      a2Notice = cellTxt;
      break;
    }

    var globalConfig = {
      loadedFromSheet4: true,
      enableHsa: isTruthyCell(a2[colIdx.hsa]),
      enableVact: isTruthyCell(a2[colIdx.vact]),
      enableThptqg: isTruthyCell(a2[colIdx.thptqg]),
      enableHuongnghiep: isTruthyCell(a2[colIdx.huongnghiep]),
      registrationConfig: registrationConfig,
      batdau: formatCellDateTime(a2[colIdx.batdau], false),
      ketthuc: formatCellDateTime(a2[colIdx.ketthuc], false),
      thongbao: a2Notice,
      examLinks: examLinks
    };

    var payload = {
      deployed: true,
      admins: admins,
      globalConfig: globalConfig,
      registrationConfig: registrationConfig,
      examLinks: examLinks
    };

    var callback = e && e.parameter ? e.parameter.callback : null;
    var json = JSON.stringify(payload);
    var output = callback ? callback + "(" + json + ");" : json;
    var mime = callback ? ContentService.MimeType.JAVASCRIPT : ContentService.MimeType.JSON;
    return ContentService.createTextOutput(output).setMimeType(mime);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      deployed: false,
      error: error.toString(),
      admins: [],
      globalConfig: null,
      examLinks: {}
    })).setMimeType(ContentService.MimeType.JSON);
  }
}`;
