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
 * Save new login record to local log list
 */
function saveLogRecord(record: LoginLogRecord): void {
  try {
    const existing = getLoginLogs();
    const updated = [record, ...existing.slice(0, 199)]; // Keep latest 200 records
    localStorage.setItem(STORAGE_LOGIN_LOGS_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage issues
  }
}

/**
 * Clear all login logs
 */
export function clearLoginLogs(): void {
  try {
    localStorage.removeItem(STORAGE_LOGIN_LOGS_KEY);
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

  // 1. Always save to local storage immediately so no login is lost
  saveLogRecord(record);

  // 2. Transmit to Google Apps Script Web App for "Admin web thi" -> "Trang tính 2"
  const payload = {
    action: 'log_login',
    sheet: 'Trang tính2',
    sheetName: 'Trang tính 2',
    time: timestamp,
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

    // Strategy A: Server proxy /api/log-login (cleanest, backend-to-backend)
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

    // Strategy B: GET query param fallback (for Apps Script doGet handlers)
    const queryParams = new URLSearchParams({
      action: 'log_login',
      sheet: 'Trang tính2',
      time: timestamp,
      hoten: record.hoten,
      sbd: record.sbd,
      username: record.username,
      monthi: record.monthi,
      device: record.device,
    });

    const getUrl = `${scriptUrl}${scriptUrl.includes('?') ? '&' : '?'}${queryParams.toString()}`;
    fetch(getUrl, {
      method: 'GET',
      mode: 'no-cors',
    }).catch(() => {});

    // Mark as dispatched
    record.synced = true;
  } catch {
    // Log dispatch error
  }

  return record;
}

/**
 * Export logs to CSV file for Excel / Google Sheets
 */
export function exportLogsToCSV(): void {
  const logs = getLoginLogs();
  if (logs.length === 0) return;

  const headers = [
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

  const rows = logs.map((l) => [
    `"${l.timestamp}"`,
    `"${l.hoten.replace(/"/g, '""')}"`,
    `"${l.sbd.replace(/"/g, '""')}"`,
    `"${l.username.replace(/"/g, '""')}"`,
    `"${(l.namsinh || '').replace(/"/g, '""')}"`,
    `"${(l.email || '').replace(/"/g, '""')}"`,
    `"${l.monthi.replace(/"/g, '""')}"`,
    `"${l.device.replace(/"/g, '""')}"`,
    `"${l.status.replace(/"/g, '""')}"`,
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
 * Tự động ghi nhận thông tin đăng nhập vào "Trang tính 2" ("Trang tính2")
 * ============================================================
 */

function doGet(e) {
  // Nếu có tham số action="log_login" thì gọi ghi vào Trang tính 2
  if (e && e.parameter && e.parameter.action === "log_login") {
    return handleLogLogin(e.parameter);
  }

  // Mặc định: Trả về danh sách thí sinh từ Trang tính 1 cho web
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Trang tính1") || ss.getSheetByName("Trang tính 1") || ss.getSheets()[0];
  var data = sheet.getDataRange().getValues();
  var rows = data.slice(1); // bỏ dòng tiêu đề

  var result = rows.map(function(r) {
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
      ketthuc: String(r[11] || "").trim()
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
