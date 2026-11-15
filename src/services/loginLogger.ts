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
          sheet: 'Kết quả hướng nghiệp',
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
      fetch(`${scriptUrl}${sep}action=get_career_results&_t=${Date.now()}`).catch(() => null),
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
    'Email',
    'Mã RIASEC',
    'Nhóm tính cách chính',
    'Điểm chi tiết (R-I-A-S-E-C)',
    'Ngành học đề xuất',
    'Khối thi tập trung',
  ];
  const rows = results.map((r, index) => [
    index + 1,
    r.timestamp || '',
    r.hoten || '',
    r.sbd || '',
    r.username || '',
    r.email || '',
    r.riasecCode || '',
    r.primaryTrait || '',
    r.scoresText || '',
    r.recommendedMajors || '',
    r.examFocus || '',
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
    'Email',
    'Mã RIASEC',
    'Nhóm tính cách chính',
    'Điểm chi tiết (R-I-A-S-E-C)',
    'Ngành học đề xuất',
    'Khối thi tập trung',
  ];

  const rows = results.map((r, idx) => [
    idx + 1,
    `"${(r.timestamp || '').replace(/"/g, '""')}"`,
    `"${(r.hoten || '').replace(/"/g, '""')}"`,
    `"${(r.sbd || '').replace(/"/g, '""')}"`,
    `"${(r.username || '').replace(/"/g, '""')}"`,
    `"${(r.email || '').replace(/"/g, '""')}"`,
    `"${(r.riasecCode || '').replace(/"/g, '""')}"`,
    `"${(r.primaryTrait || '').replace(/"/g, '""')}"`,
    `"${(r.scoresText || '').replace(/"/g, '""')}"`,
    `"${(r.recommendedMajors || '').replace(/"/g, '""')}"`,
    `"${(r.examFocus || '').replace(/"/g, '""')}"`,
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
 * Tự động ghi nhận:
 * 1. Lịch sử đăng nhập vào "Trang tính 2" ("Trang tính2")
 * 2. Kết quả test hướng nghiệp RIASEC vào sheet "Kết quả hướng nghiệp"
 * ============================================================
 */

function doGet(e) {
  var action = e && e.parameter ? e.parameter.action : "";
  var sheetParam = e && e.parameter ? e.parameter.sheet : "";

  // 1. Nếu có tham số ghi log qua GET
  if (action === "log_login") {
    return handleLogLogin(e.parameter);
  }

  // 2. Trả về kết quả hướng nghiệp từ sheet "Kết quả hướng nghiệp"
  if (action === "get_career_results") {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetCareer = ss.getSheetByName("Kết quả hướng nghiệp");
    if (!sheetCareer || sheetCareer.getLastRow() <= 1) {
      return ContentService.createTextOutput("[]").setMimeType(ContentService.MimeType.JSON);
    }
    var rowsC = sheetCareer.getDataRange().getValues().slice(1);
    var results = rowsC.map(function(r) {
      return {
        time: String(r[0] || "").trim(),
        hoten: String(r[1] || "").trim(),
        sbd: String(r[2] || "").trim(),
        username: String(r[3] || "").trim(),
        email: String(r[4] || "").trim(),
        riasecCode: String(r[5] || "").trim(),
        primaryTrait: String(r[6] || "").trim(),
        scoresText: String(r[7] || "").trim(),
        recommendedMajors: String(r[8] || "").trim(),
        examFocus: String(r[9] || "").trim(),
        device: String(r[10] || "").trim()
      };
    });
    return ContentService.createTextOutput(JSON.stringify(results)).setMimeType(ContentService.MimeType.JSON);
  }

  // 3. Trả về lịch sử đăng nhập từ Trang tính 2
  if (action === "get_sheet2" || action === "get_logs" || sheetParam === "2" || sheetParam === "Trang tính 2" || sheetParam === "Trang tính2") {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet2 = ss.getSheetByName("Trang tính2") || ss.getSheetByName("Trang tính 2") || ss.getSheets()[1];
    if (!sheet2 || sheet2.getLastRow() <= 1) {
      return ContentService.createTextOutput("[]").setMimeType(ContentService.MimeType.JSON);
    }
    var rows2 = sheet2.getDataRange().getValues().slice(1);
    var logs = rows2.map(function(r) {
      return {
        time: String(r[0] || "").trim(),
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

  // 4. Mặc định: Trả về danh sách thí sinh từ Trang tính 1 cho web
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Trang tính1") || ss.getSheetByName("Trang tính 1") || ss.getSheets()[0];
  var data = sheet.getDataRange().getValues();
  var headers = data.length > 0 ? data[0] : [];
  var thongbaoCol = -1;
  for (var c = 0; c < headers.length; c++) {
    var h = String(headers[c] || "").toLowerCase().replace(/\s+/g, "").trim();
    if (h === "thongbao" || h === "thôngbáo" || h === "notice") {
      thongbaoCol = c;
      break;
    }
  }
  var rows = data.slice(1); // bỏ dòng tiêu đề

  var result = rows.map(function(r, index) {
    var rowNum = index + 2;
    var isAdmin = rowNum >= 2 && rowNum <= 6;
    var tbVal = "";
    if (thongbaoCol >= 0 && r[thongbaoCol]) {
      tbVal = String(r[thongbaoCol]).trim();
    } else {
      tbVal = String(r[12] || r[13] || r[14] || "").trim();
    }
    return {
      username: String(r[0] || "").trim(),
      password: String(r[1] || "").trim(),
      sbd: String(r[2] || "").trim(),
      hoten: String(r[3] || "").trim(),
      email: String(r[4] || "").trim(),
      namsinh: String(r[5] || "").trim(),
      hsa: String(r[6] || "").trim(),
      vact: String(r[7] || "").trim(),
      thptqg: String(r[8] || "").trim(),
      huongnghiep: String(r[9] || "").trim(),
      batdau: String(r[10] || "").trim(),
      ketthuc: String(r[11] || "").trim(),
      thongbao: tbVal,
      rowNumber: rowNum,
      isAdmin: isAdmin
    };
  });

  // Hỗ trợ JSONP nếu có callback
  var callback = e && e.parameter ? e.parameter.callback : null;
  var json = JSON.stringify(result);
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

  if (data && data.action === "log_career") {
    return handleLogCareer(data);
  }
  return handleLogLogin(data);
}

function handleLogCareer(data) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Kết quả hướng nghiệp");
    if (!sheet) {
      sheet = ss.insertSheet("Kết quả hướng nghiệp");
    }

    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Thời gian hoàn thành",
        "Họ và tên",
        "Số báo danh (SBD)",
        "Tài khoản / SĐT",
        "Email",
        "Mã RIASEC",
        "Nhóm tính cách chính",
        "Điểm chi tiết (R-I-A-S-E-C)",
        "Ngành học đề xuất",
        "Khối thi / Kỳ thi nên tập trung",
        "Thiết bị"
      ]);
      var headerRange = sheet.getRange(1, 1, 1, 11);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#fae8ff");
      headerRange.setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    }

    var time = data.time || Utilities.formatDate(new Date(), "GMT+7", "dd/MM/yyyy HH:mm:ss");
    sheet.appendRow([
      time,
      data.hoten || "",
      data.sbd || "",
      data.username || "",
      data.email || "",
      data.riasecCode || "",
      data.primaryTrait || "",
      data.scoresText || "",
      data.recommendedMajors || "",
      data.examFocus || "",
      data.device || ""
    ]);

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Đã lưu kết quả hướng nghiệp vào Google Sheet thành công!"
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function handleLogLogin(data) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    // Tìm hoặc tạo "Trang tính2" (hoặc "Trang tính 2")
    var sheet = ss.getSheetByName("Trang tính2") || ss.getSheetByName("Trang tính 2");
    if (!sheet) {
      sheet = ss.insertSheet("Trang tính2");
    }

    // Nếu trang tính còn trống, tự động tạo dòng Tiêu đề
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
      // Định dạng dòng tiêu đề
      var headerRange = sheet.getRange(1, 1, 1, 9);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#dbeafe"); // Màu xanh nhạt sang trọng
      headerRange.setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    }

    var time = data.time || Utilities.formatDate(new Date(), "GMT+7", "dd/MM/yyyy HH:mm:ss");
    var hoten = data.hoten || "";
    var sbd = data.sbd || "";
    var username = data.username || "";
    var namsinh = data.namsinh || "";
    var email = data.email || "";
    var monthi = data.monthi || "";
    var device = data.device || "";
    var status = data.status || "Đăng nhập thành công";

    sheet.appendRow([
      time,
      hoten,
      sbd,
      username,
      namsinh,
      email,
      monthi,
      device,
      status
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
}`;
