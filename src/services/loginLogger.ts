import { StudentInfo, LoginLogRecord } from '../types';
import { isYes, getScriptUrl } from './api';

const STORAGE_LOGIN_LOGS_KEY = 'td_mock_exam_login_logs';

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
  try {
    const res = await fetch('/api/sheet2-data', {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
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
 * Ready-to-use Google Apps Script code for the user's "Admin web thi" spreadsheet
 */
export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * ============================================================
 * MÃ GOOGLE APPS SCRIPT CHO FILE "Admin web thi"
 * Tự động ghi nhận & tra cứu thông tin đăng nhập từ "Trang tính 2" ("Trang tính2")
 * ============================================================
 */

function doGet(e) {
  var action = e && e.parameter ? e.parameter.action : "";
  var sheetParam = e && e.parameter ? e.parameter.sheet : "";

  // 1. Nếu có tham số ghi log qua GET
  if (action === "log_login") {
    return handleLogLogin(e.parameter);
  }

  // 2. Trả về lịch sử đăng nhập từ Trang tính 2
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

  // 3. Mặc định: Trả về danh sách thí sinh từ Trang tính 1 cho web
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Trang tính1") || ss.getSheetByName("Trang tính 1") || ss.getSheets()[0];
  var data = sheet.getDataRange().getValues();
  var rows = data.slice(1); // bỏ dòng tiêu đề

  var result = rows.map(function(r, index) {
    var rowNum = index + 2;
    var isAdmin = rowNum >= 2 && rowNum <= 6;
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
  return handleLogLogin(data);
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
