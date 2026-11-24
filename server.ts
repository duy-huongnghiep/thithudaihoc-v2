import express from 'express';
import http from 'http';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const PORT = Number(process.env.PORT) || 3000;
const GOOGLE_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbxv_LnzrD7mTAAoQYYgEZjdcW8cCNcVoEu1rPCEU2V-EGMaiRLtGRU3yv3sV3WPkeUZTA/exec';
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

const LOGS_FILE_PATH = path.join(process.cwd(), 'login_logs_store.json');
const CAREER_RESULTS_FILE_PATH = path.join(process.cwd(), 'career_results_store.json');
const REGISTERED_STUDENTS_FILE_PATH = path.join(process.cwd(), 'registered_students_store.json');

// Initialize initial default logs if store doesn't exist yet
const INITIAL_LOG_SEEDS = [
  {
    id: 'log_seed_1',
    timestamp: '08:15:22 11/11/2026',
    isoDate: '2026-11-11T01:15:22.000Z',
    hoten: 'admin Trường Duy',
    sbd: 'ad1',
    username: 'amind',
    namsinh: '',
    email: 'admin',
    monthi: 'Quản trị viên (Toàn quyền)',
    device: 'Windows (Chrome 120)',
    status: 'Đăng nhập thành công',
    synced: true,
  },
  {
    id: 'log_seed_2',
    timestamp: '08:12:05 11/11/2026',
    isoDate: '2026-11-11T01:12:05.000Z',
    hoten: 'Lê Thị Thanh Nhàn',
    sbd: '83510',
    username: '0333139562',
    namsinh: '2009',
    email: 'diephoangchau269@gmail.com',
    monthi: 'HSA, Hướng nghiệp',
    device: 'iOS (Safari Mobile)',
    status: 'Đăng nhập thành công',
    synced: true,
  },
  {
    id: 'log_seed_3',
    timestamp: '08:05:40 11/11/2026',
    isoDate: '2026-11-11T01:05:40.000Z',
    hoten: 'Đặng Bùi Chi Mai',
    sbd: '74629',
    username: '0962020875',
    namsinh: '2009',
    email: 'maidang031009@gmail.com',
    monthi: 'HSA, Hướng nghiệp',
    device: 'Windows (Chrome 120)',
    status: 'Đăng nhập thành công',
    synced: true,
  },
  {
    id: 'log_seed_4',
    timestamp: '07:58:19 11/11/2026',
    isoDate: '2026-11-11T00:58:19.000Z',
    hoten: 'Nguyễn Ngọc Tuệ Minh',
    sbd: '10936',
    username: '0987493998',
    namsinh: '2009',
    email: 'nguyenngoctueminh10072008@gmail.com',
    monthi: 'HSA, Hướng nghiệp',
    device: 'macOS (Safari)',
    status: 'Đăng nhập thành công',
    synced: true,
  },
  {
    id: 'log_seed_5',
    timestamp: '07:45:33 11/11/2026',
    isoDate: '2026-11-11T00:45:33.000Z',
    hoten: 'Phạm Minh Đăng',
    sbd: '91873',
    username: '0963960515',
    namsinh: '2009',
    email: 'mcminedang@gmail.com',
    monthi: 'HSA, Hướng nghiệp',
    device: 'Android (Chrome Mobile)',
    status: 'Đăng nhập thành công',
    synced: true,
  },
  {
    id: 'log_seed_6',
    timestamp: '07:30:10 11/11/2026',
    isoDate: '2026-11-11T00:30:10.000Z',
    hoten: 'Nguyễn Hồng Nhung',
    sbd: '65241',
    username: '0397232988',
    namsinh: '2008',
    email: 'hongnhungnguyen129p@gmai.com',
    monthi: 'HSA, Hướng nghiệp',
    device: 'Windows (Edge)',
    status: 'Đăng nhập thành công',
    synced: true,
  },
];

function loadSavedLogs(): any[] {
  try {
    if (fs.existsSync(LOGS_FILE_PATH)) {
      const raw = fs.readFileSync(LOGS_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return [...INITIAL_LOG_SEEDS];
}

function persistLogs(logs: any[]): void {
  try {
    fs.writeFileSync(LOGS_FILE_PATH, JSON.stringify(logs, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error persisting logs to file:', err);
  }
}

function loadSavedCareerResults(): any[] {
  try {
    if (fs.existsSync(CAREER_RESULTS_FILE_PATH)) {
      const raw = fs.readFileSync(CAREER_RESULTS_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return [];
}

function persistCareerResults(results: any[]): void {
  try {
    fs.writeFileSync(CAREER_RESULTS_FILE_PATH, JSON.stringify(results, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error persisting career results to file:', err);
  }
}

function loadSavedRegisteredStudents(): any[] {
  try {
    if (fs.existsSync(REGISTERED_STUDENTS_FILE_PATH)) {
      const raw = fs.readFileSync(REGISTERED_STUDENTS_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return [];
}

function persistRegisteredStudents(students: any[]): void {
  try {
    fs.writeFileSync(REGISTERED_STUDENTS_FILE_PATH, JSON.stringify(students, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error persisting registered students:', err);
  }
}

// In-memory stores synced with files
let inMemoryLogs = loadSavedLogs();
let inMemoryCareerResults = loadSavedCareerResults();
let inMemoryRegisteredStudents = loadSavedRegisteredStudents();

function formatVietnamNow(): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    return formatter.format(new Date()).replace(',', '');
  } catch {
    const d = new Date(Date.now() + 7 * 3600 * 1000);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}/${d.getUTCFullYear()} ${pad(
      d.getUTCHours()
    )}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
  }
}

function parseViTimestampToIso(ts: string): string {
  if (!ts) return new Date().toISOString();
  const str = String(ts).trim();
  // Match HH:mm:ss dd/MM/yyyy or HH:mm dd/MM/yyyy
  let m = str.match(/^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?\s+(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) {
    const [, h, min, s = '0', d, mon, y] = m;
    const utcMs = Date.UTC(Number(y), Number(mon) - 1, Number(d), Number(h) - 7, Number(min), Number(s));
    if (!isNaN(utcMs)) return new Date(utcMs).toISOString();
  }
  // Match dd/MM/yyyy HH:mm:ss or dd/MM/yyyy HH:mm
  m = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/);
  if (m) {
    const [, d, mon, y, h, min, s = '0'] = m;
    const utcMs = Date.UTC(Number(y), Number(mon) - 1, Number(d), Number(h) - 7, Number(min), Number(s));
    if (!isNaN(utcMs)) return new Date(utcMs).toISOString();
  }
  const parsed = new Date(str);
  return isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

function parseCareerFromSheet2Row(item: any, idx: number): any | null {
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
  const primaryTrait = primaryMatch ? primaryMatch[1].trim() : '';
  const majorsMatch = status.match(/Ngành:\s*(.+)$/i);
  const recommendedMajors = majorsMatch ? majorsMatch[1].trim() : '';
  const timestamp = String(item?.time || item?.timestamp || '').trim();

  return {
    id: `sheet2_career_${idx}_${riasecCode}`,
    timestamp,
    isoDate: item?.isoDate || parseViTimestampToIso(timestamp),
    hoten: String(item?.hoten || '').trim(),
    sbd: String(item?.sbd || '').trim(),
    username: String(item?.username || '').trim(),
    email: String(item?.email || '').trim(),
    namsinh: String(item?.namsinh || '').trim(),
    riasecCode,
    primaryTrait,
    secondaryTrait: '',
    scores,
    scoresText,
    recommendedMajors,
    recommendedUniversities: '',
    examFocus: '',
    device: String(item?.device || '').trim(),
    synced: true,
  };
}

function sanitizeAppsScriptUrl(rawUrl: unknown): string {
  const s = String(rawUrl || '').trim();
  if (!s) return GOOGLE_SCRIPT_URL;
  try {
    const parsed = new URL(s);
    if (
      parsed.protocol === 'https:' &&
      parsed.hostname === 'script.google.com' &&
      parsed.pathname.startsWith('/macros/')
    ) {
      return parsed.toString();
    }
  } catch {
    // fallback to default
  }
  return GOOGLE_SCRIPT_URL;
}

function timingSafeEqualStr(a: string, b: string): boolean {
  const hashA = crypto.createHash('sha256').update(a, 'utf8').digest();
  const hashB = crypto.createHash('sha256').update(b, 'utf8').digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

interface SessionPayload {
  sub: string;
  role: 'admin' | 'student';
  sbd: string;
  hoten: string;
  rowNumber?: number;
  adminPermissions?: {
    lichsu: boolean;
    ketquahuongnghiep: boolean;
    danhsachtaikhoan: boolean;
    cauhinh: boolean;
    hanche: boolean;
    danhsachdkytk: string;
  };
  exp: number;
}

function signSessionToken(payload: Omit<SessionPayload, 'exp'>): string {
  const fullPayload: SessionPayload = {
    ...payload,
    exp: Date.now() + SESSION_TTL_MS,
  };
  const body = Buffer.from(JSON.stringify(fullPayload), 'utf8').toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(body).digest('base64url');
  return `${body}.${sig}`;
}

function verifySessionToken(token: string): SessionPayload | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  if (!body || !sig) return null;
  const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(body).digest('base64url');
  if (!timingSafeEqualStr(sig, expectedSig)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as SessionPayload;
    if (!parsed || typeof parsed.exp !== 'number' || parsed.exp <= Date.now()) {
      return null;
    }
    if (parsed.role !== 'admin' && parsed.role !== 'student') {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function getClientIp(req: express.Request): string {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.trim()) {
    return fwd.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || 'unknown';
}

function parseViCutoffMs(val?: string | null): number | null {
  const s = String(val || '').trim();
  if (!s) return null;
  const dmY = s.match(/(?:^|\s)(\d{1,2})[/-](\d{1,2})[/-](\d{4})(?:\s|$)/);
  if (dmY) {
    const day = Number(dmY[1]);
    const month = Number(dmY[2]);
    const year = Number(dmY[3]);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return Date.UTC(year, month - 1, day, -7, 0, 0, 0);
    }
  }
  const yMd = s.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
  if (yMd) {
    return Date.UTC(Number(yMd[1]), Number(yMd[2]) - 1, Number(yMd[3]), -7, 0, 0, 0);
  }
  const parsed = new Date(s);
  if (isNaN(parsed.getTime())) return null;
  const vnDate = new Date(parsed.getTime() + 7 * 3600 * 1000);
  return Date.UTC(vnDate.getUTCFullYear(), vnDate.getUTCMonth(), vnDate.getUTCDate(), -7, 0, 0, 0);
}

function parseViTsMs(val?: string | null, fallbackIso?: string | null): number | null {
  const s = String(val || '').trim();
  if (s) {
    let m = s.match(/^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?\s+(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
    if (m) {
      const [, h, min, sec = '0', d, mon, y] = m;
      return Date.UTC(Number(y), Number(mon) - 1, Number(d), Number(h) - 7, Number(min), Number(sec));
    }
    m = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/);
    if (m) {
      const [, d, mon, y, h, min, sec = '0'] = m;
      return Date.UTC(Number(y), Number(mon) - 1, Number(d), Number(h) - 7, Number(min), Number(sec));
    }
    m = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
    if (m) {
      return Date.UTC(Number(m[3]), Number(m[2]) - 1, Number(m[1]), -7, 0, 0, 0);
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

function maskAccountServer(val?: string | null): string {
  const s = String(val || '').trim();
  if (!s || s === '---') return '---';
  if (s.length >= 7) return `${s.slice(0, 3)}***${s.slice(-3)}`;
  if (s.length >= 3) return `${s.slice(0, 2)}***`;
  return '***';
}

function maskFullNameServer(val?: string | null): string {
  const s = String(val || '').trim();
  if (!s || s === 'Chưa cập nhật') return 'Chưa cập nhật';
  const parts = s.split(/\s+/);
  if (parts.length >= 3) return `${parts[0]} *** ${parts[parts.length - 1]}`;
  if (parts.length === 2) return `${parts[0]} ***`;
  return `${s.slice(0, 2)}***`;
}

function maskSbdServer(val?: string | null): string {
  const s = String(val || '').trim();
  if (!s || s === '---') return '---';
  return s.length >= 3 ? `***${s.slice(-2)}` : '***';
}

function maskEmailServer(val?: string | null): string {
  const s = String(val || '').trim();
  if (!s) return '---';
  return '••• (Hạn chế)';
}

// Server-side rate limiters (login brute-force & search enumeration)
const loginAttemptsByKey = new Map<string, { count: number; resetAt: number }>();
const loginAttemptsByIp = new Map<string, { count: number; resetAt: number }>();
const searchAttemptsByIp = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(
  store: Map<string, { count: number; resetAt: number }>,
  key: string,
  maxAttempts: number,
  _windowMs: number
): boolean {
  const now = Date.now();
  const entry = store.get(key);
  if (!entry || entry.resetAt <= now) {
    return true;
  }
  return entry.count < maxAttempts;
}

function recordFailedAttempt(
  store: Map<string, { count: number; resetAt: number }>,
  key: string,
  windowMs: number
): void {
  const now = Date.now();
  const entry = store.get(key);
  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
  } else {
    entry.count += 1;
    store.set(key, entry);
  }
}

function clearRateLimit(
  store: Map<string, { count: number; resetAt: number }>,
  key: string
): void {
  store.delete(key);
}

function stripLeadingZeros(digits: string): string {
  return digits.replace(/^0+/, '');
}

// Server-only caches of Trang tính 4 & student roster (never sent publicly)
let serverCachedSheet4Admins: any[] = [];
let serverCachedSheet4Data: any | null = null;
let serverCachedStudents: any[] = [];
let lastSheet4FetchAt = 0;
let lastStudentsFetchAt = 0;
const CACHE_TTL_MS = 25 * 1000; // Serve warm cache within 25s, refresh reliably when stale or forced

const inFlightSheet4ByUrl = new Map<string, Promise<any | null>>();
const inFlightStudentsByUrl = new Map<string, Promise<{ students: any[]; remoteOk: boolean }>>();

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '256kb' }));
  app.use(express.urlencoded({ extended: true, limit: '256kb' }));

  // Standard HTTP security headers (iframe-friendly for AI Studio preview)
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
  });

  const getAuthSession = (req: express.Request): SessionPayload | null => {
    const authHeader = String(req.headers.authorization || '');
    if (!authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.slice(7).trim();
    return verifySessionToken(token);
  };

  const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const session = getAuthSession(req);
    if (!session) {
      return res.status(401).json({ success: false, message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.' });
    }
    (req as any).authSession = session;
    return next();
  };

  const requireAdmin = (
    permissionKey?: 'lichsu' | 'ketquahuongnghiep' | 'danhsachtaikhoan' | 'cauhinh',
    disallowRestrictedMutation = false
  ) => {
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const session = getAuthSession(req);
      if (!session) {
        return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập tài khoản Quản trị viên.' });
      }
      if (session.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Tài khoản thí sinh không có quyền truy cập khu vực Quản trị.' });
      }
      if (permissionKey && !session.adminPermissions?.[permissionKey]) {
        return res.status(403).json({ success: false, message: 'Tài khoản Quản trị viên chưa được cấp quyền cho mục này.' });
      }
      if (disallowRestrictedMutation && session.adminPermissions?.hanche) {
        return res.status(403).json({ success: false, message: 'Tài khoản ở chế độ hạn chế không thể thực hiện thao tác này.' });
      }
      (req as any).authSession = session;
      return next();
    };
  };

  const sanitizeNotice = (raw: unknown): string => {
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
    if (
      /^\d{1,2}:\d{2}(?::\d{2})?\s+\d{1,2}[/-]\d{1,2}[/-]\d{4}$/.test(s) ||
      /^\d{1,2}[/-]\d{1,2}[/-]\d{4}(?:\s+\d{1,2}:\d{2}(?::\d{2})?)?$/.test(s) ||
      /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}(?::\d{2})?(?:\.\d+)?Z?)?$/.test(s) ||
      /^(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}\s+\d{4}\b.*GMT[+-]\d{4}/i.test(s)
    ) {
      return '';
    }
    return s;
  };

  // Helper to enrich student objects strictly as STUDENTS (Trang tính 3 & 1 NEVER grant admin access)
  const enrichStudentRow = (item: any, index: number) => {
    const rowNumber = typeof item?.rowNumber === 'number' ? item.rowNumber : index + 2;
    const thongbao = sanitizeNotice(
      item?.thongbao ?? item?.Thongbao ?? item?.thongBao ?? item?.notice ?? ''
    );

    if (Array.isArray(item)) {
      const rawNamsinh = String(item[5] || '').trim();
      const rawHsa = String(item[6] || '').trim();
      const digitsHsa = rawHsa.replace(/\D/g, '');
      const isShiftedYear = !rawNamsinh && digitsHsa.length === 4;
      return {
        registeredAt: '',
        username: String(item[0] || '').trim(),
        password: String(item[1] || '').trim(),
        sbd: String(item[2] || '').trim(),
        hoten: String(item[3] || '').trim(),
        email: String(item[4] || '').trim(),
        namsinh: isShiftedYear ? rawHsa : rawNamsinh,
        hsa: isShiftedYear ? String(item[7] || '').trim() : rawHsa,
        vact: String(item[isShiftedYear ? 8 : 7] || '').trim(),
        thptqg: String(item[isShiftedYear ? 9 : 8] || '').trim(),
        huongnghiep: String(item[isShiftedYear ? 10 : 9] || '').trim(),
        batdau: String(item[isShiftedYear ? 11 : 10] || '').trim(),
        ketthuc: String(item[isShiftedYear ? 12 : 11] || '').trim(),
        thongbao,
        rowNumber,
        isAdmin: false,
        role: 'student' as const,
      };
    }

    return {
      ...item,
      username: String(item?.username || item?.taikhoan || '').trim(),
      password: String(item?.password || item?.pass || item?.matkhau || '').trim(),
      sbd: String(item?.sbd || item?.sobaodanh || '').trim(),
      hoten: String(item?.hoten || '').trim(),
      email: String(item?.email || '').trim(),
      namsinh: String(item?.namsinh || '').trim(),
      thongbao,
      rowNumber,
      isAdmin: false,
      role: 'student' as const,
    };
  };

  const stripStudentPassword = (st: any) => {
    const { password: _p, pass: _pa, matkhau: _m, ...safe } = st || {};
    return {
      ...safe,
      password: '',
      isAdmin: false,
      role: 'student' as const,
    };
  };

  const fetchTextWithRetry = async (
    targetUrl: string,
    attempts = 3,
    timeoutMs = 12000
  ): Promise<string | null> => {
    for (let i = 0; i < attempts; i++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await fetch(targetUrl, {
          method: 'GET',
          headers: {
            Accept: 'application/json, text/plain, */*',
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
          signal: controller.signal,
          redirect: 'follow',
        });
        clearTimeout(timeout);
        if (response.ok) {
          const text = await response.text();
          if (text && !text.trim().startsWith('<!DOCTYPE') && !text.trim().startsWith('<html')) {
            return text;
          }
        }
      } catch {
        clearTimeout(timeout);
      }
      if (i < attempts - 1) {
        await new Promise((r) => setTimeout(r, 350 * (i + 1)));
      }
    }
    return null;
  };

  const parseJsonOrJsonp = (text: string): any | null => {
    try {
      return JSON.parse(text);
    } catch {
      const match = text.match(/^[a-zA-Z0-9_$]+\(([\s\S]*)\);?$/);
      if (match) {
        try {
          return JSON.parse(match[1]);
        } catch {
          return null;
        }
      }
      return null;
    }
  };

  const buildPublicSheet4Payload = (data: any) => {
    if (!data) {
      return {
        deployed: false,
        globalConfig: null,
        registrationConfig: null,
        examLinks: {},
      };
    }
    const regConfig = data.registrationConfig || data.globalConfig?.registrationConfig || null;
    const rawGlobalConfig = data.globalConfig || null;
    const sanitizedGlobalConfig = rawGlobalConfig
      ? {
          ...rawGlobalConfig,
          thongbao: sanitizeNotice(rawGlobalConfig.thongbao),
        }
      : null;

    return {
      deployed: true,
      globalConfig: sanitizedGlobalConfig,
      registrationConfig: regConfig,
      examLinks: data.examLinks || {},
    };
  };

  // Server-only fetch of Trang tính 4 (keeps admin passwords strictly on the server)
  const fetchSheet4Raw = async (cleanUrl: string, forceRefresh = false): Promise<any | null> => {
    if (
      !forceRefresh &&
      serverCachedSheet4Data &&
      Date.now() - lastSheet4FetchAt < CACHE_TTL_MS
    ) {
      return serverCachedSheet4Data;
    }

    const existing = inFlightSheet4ByUrl.get(cleanUrl);
    if (existing) {
      return existing;
    }

    const promise = (async () => {
      const urlsToTry =
        cleanUrl !== GOOGLE_SCRIPT_URL ? [cleanUrl, GOOGLE_SCRIPT_URL] : [cleanUrl];

      for (const baseUrl of urlsToTry) {
        const sep = baseUrl.includes('?') ? '&' : '?';
        const targetUrl = `${baseUrl}${sep}action=get_sheet4&_t=${Date.now()}`;
        const text = await fetchTextWithRetry(targetUrl, 2, 15000);
        if (!text) continue;
        const data = parseJsonOrJsonp(text);
        if (!data || Array.isArray(data) || (!Array.isArray(data.admins) && !data.globalConfig)) {
          continue;
        }
        if (Array.isArray(data.admins) && data.admins.length > 0) {
          serverCachedSheet4Admins = data.admins;
        }
        serverCachedSheet4Data = data;
        lastSheet4FetchAt = Date.now();
        return data;
      }

      return serverCachedSheet4Data;
    })();

    inFlightSheet4ByUrl.set(cleanUrl, promise);
    try {
      return await promise;
    } finally {
      inFlightSheet4ByUrl.delete(cleanUrl);
    }
  };

  const mergeWithLocalStudents = (remoteRows: any[]): any[] => {
    const seenUsernames = new Set(
      remoteRows.map((s) => String(s?.username || '').trim().toLowerCase()).filter(Boolean)
    );
    const merged = [...remoteRows];
    for (const localSt of inMemoryRegisteredStudents) {
      const u = String(localSt?.username || '').trim().toLowerCase();
      if (u && !seenUsernames.has(u)) {
        seenUsernames.add(u);
        merged.unshift({
          ...localSt,
          sourceZone: 'sheet3_web',
          isAdmin: false,
          role: 'student' as const,
        });
      }
    }
    return merged;
  };

  // Server-only fetch of Trang tính 3 + Trang tính 1 students (with passwords kept strictly in server RAM)
  const fetchStudentsWithStatus = async (
    cleanUrl: string,
    forceRefresh = false
  ): Promise<{ students: any[]; remoteOk: boolean }> => {
    if (
      !forceRefresh &&
      serverCachedStudents.length > 0 &&
      Date.now() - lastStudentsFetchAt < CACHE_TTL_MS
    ) {
      return { students: mergeWithLocalStudents(serverCachedStudents), remoteOk: true };
    }

    const existing = inFlightStudentsByUrl.get(cleanUrl);
    if (existing) {
      return existing;
    }

    const promise = (async () => {
      const urlsToTry =
        cleanUrl !== GOOGLE_SCRIPT_URL ? [cleanUrl, GOOGLE_SCRIPT_URL] : [cleanUrl];

      let remoteRows: any[] = [];
      let remoteOk = false;

      for (const baseUrl of urlsToTry) {
        const sep = baseUrl.includes('?') ? '&' : '?';
        const targetUrl = `${baseUrl}${sep}_t=${Date.now()}`;
        const text = await fetchTextWithRetry(targetUrl, 2, 15000);
        if (!text) continue;
        const parsed = parseJsonOrJsonp(text);
        if (Array.isArray(parsed)) {
          remoteRows = parsed.map(enrichStudentRow);
          if (remoteRows.length > 0) {
            serverCachedStudents = remoteRows;
            lastStudentsFetchAt = Date.now();
          }
          remoteOk = true;
          break;
        }
      }

      if (!remoteOk && serverCachedStudents.length > 0) {
        remoteRows = serverCachedStudents;
      }

      return {
        students: mergeWithLocalStudents(remoteRows),
        remoteOk,
      };
    })();

    inFlightStudentsByUrl.set(cleanUrl, promise);
    try {
      return await promise;
    } finally {
      inFlightStudentsByUrl.delete(cleanUrl);
    }
  };

  const fetchStudentsRaw = async (cleanUrl: string, forceRefresh = false): Promise<any[]> => {
    const res = await fetchStudentsWithStatus(cleanUrl, forceRefresh);
    return res.students;
  };

  // Server-side Authentication Endpoint (ONLY Trang tính 4 = Admin, Trang tính 3 & 1 = Student)
  app.post('/api/auth/login', async (req, res) => {
    const clientIp = getClientIp(req);
    const body = req.body || {};
    const rawUser = typeof body.username === 'string' ? body.username.trim() : '';
    const rawPass = typeof body.password === 'string' ? body.password.trim() : '';
    const lowerUser = rawUser.toLowerCase();
    const rateKey = `${clientIp}:${lowerUser || 'empty'}`;

    if (
      !checkRateLimit(loginAttemptsByKey, rateKey, 20, 10 * 60 * 1000) ||
      !checkRateLimit(loginAttemptsByIp, clientIp, 100, 10 * 60 * 1000)
    ) {
      return res.status(429).json({
        success: false,
        message: 'Bạn đã thử đăng nhập quá nhiều lần. Vui lòng đợi vài phút rồi thử lại.',
      });
    }

    try {
      if (!rawUser || !rawPass) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập đầy đủ tài khoản và mật khẩu.',
        });
      }

      const cleanUrl = sanitizeAppsScriptUrl(body.scriptUrl || req.query.url);

      // Fetch Trang tính 4 and Student Roster in parallel on server (using warm cache or retry)
      const [sheet4Data, rosterResult] = await Promise.all([
        fetchSheet4Raw(cleanUrl, false),
        fetchStudentsWithStatus(cleanUrl, false),
      ]);

      let effectiveSheet4Data = sheet4Data;
      let effectiveRoster = rosterResult;

      // If warm cache missed a recently added user/admin, verify quickly or handle upstream outage
      const globalCfg = effectiveSheet4Data?.globalConfig || null;
      const adminsList = Array.isArray(effectiveSheet4Data?.admins)
        ? effectiveSheet4Data.admins
        : serverCachedSheet4Admins;

      const userDigits = rawUser.replace(/\D/g, '');
      const userDigitsNoZero = stripLeadingZeros(userDigits);

      const findMatches = (admins: any[], students: any[]) => {
        const matchedAdmin = admins.find((a: any) => {
          const aUser = String(a?.username || '').trim().toLowerCase();
          const aPass = String(a?.password || '').trim();
          return aUser === lowerUser && aPass !== '' && timingSafeEqualStr(aPass, rawPass);
        });

        const matchedStudent = students.find((s: any) => {
          const sUser = String(s?.username || '').trim().toLowerCase();
          const sPass = String(s?.password || '').trim();
          if (!sUser || !sPass) return false;
          const sDigits = sUser.replace(/\D/g, '');
          const sDigitsNoZero = stripLeadingZeros(sDigits);
          const userMatches =
            sUser === lowerUser ||
            (userDigits.length >= 4 && sDigits === userDigits) ||
            (userDigitsNoZero.length >= 7 &&
              sDigitsNoZero.length >= 7 &&
              sDigitsNoZero === userDigitsNoZero);
          return userMatches && timingSafeEqualStr(sPass, rawPass);
        });

        return { matchedAdmin, matchedStudent };
      };

      let { matchedAdmin, matchedStudent } = findMatches(adminsList, effectiveRoster.students);

      // If not found in warm cache and cache was used (older than 5s), do one forced live refresh before rejecting!
      if (!matchedAdmin && !matchedStudent && (Date.now() - lastStudentsFetchAt > 5000 || Date.now() - lastSheet4FetchAt > 5000)) {
        const [freshSheet4, freshRoster] = await Promise.all([
          fetchSheet4Raw(cleanUrl, true),
          fetchStudentsWithStatus(cleanUrl, true),
        ]);
        effectiveSheet4Data = freshSheet4 || effectiveSheet4Data;
        effectiveRoster = freshRoster.remoteOk || freshRoster.students.length > 0 ? freshRoster : effectiveRoster;
        const freshAdmins = Array.isArray(effectiveSheet4Data?.admins)
          ? effectiveSheet4Data.admins
          : serverCachedSheet4Admins;
        ({ matchedAdmin, matchedStudent } = findMatches(freshAdmins, effectiveRoster.students));
      }

      const finalGlobalCfg = effectiveSheet4Data?.globalConfig || globalCfg;
      const sheet4Public = buildPublicSheet4Payload(effectiveSheet4Data);

      // 1. Check Trang tính 4 Admins FIRST (ONLY source of Admin privileges)
      if (matchedAdmin) {
        clearRateLimit(loginAttemptsByKey, rateKey);
        clearRateLimit(loginAttemptsByIp, clientIp);
        const adminPerms = {
          lichsu: Boolean(matchedAdmin.adminPermissions?.lichsu),
          ketquahuongnghiep: Boolean(matchedAdmin.adminPermissions?.ketquahuongnghiep),
          danhsachtaikhoan: Boolean(matchedAdmin.adminPermissions?.danhsachtaikhoan),
          cauhinh: Boolean(matchedAdmin.adminPermissions?.cauhinh),
          hanche: Boolean(matchedAdmin.adminPermissions?.hanche),
          danhsachdkytk: String(matchedAdmin.adminPermissions?.danhsachdkytk || '').trim(),
        };
        const adminStudent = {
          username: String(matchedAdmin.username || '').trim(),
          password: '',
          sbd: String(matchedAdmin.sbd || `ad${(matchedAdmin.rowNumber || 2) - 1}`).trim(),
          hoten: String(matchedAdmin.hoten || matchedAdmin.username || '').trim(),
          email: String(matchedAdmin.email || '').trim(),
          namsinh: '',
          hsa: '',
          vact: '',
          thptqg: '',
          huongnghiep: '',
          batdau: String(finalGlobalCfg?.batdau || ''),
          ketthuc: String(finalGlobalCfg?.ketthuc || ''),
          thongbao: sanitizeNotice(finalGlobalCfg?.thongbao),
          rowNumber: matchedAdmin.rowNumber,
          isAdmin: true,
          role: 'admin' as const,
          adminPermissions: adminPerms,
        };
        const token = signSessionToken({
          sub: adminStudent.username,
          role: 'admin',
          sbd: adminStudent.sbd,
          hoten: adminStudent.hoten,
          rowNumber: adminStudent.rowNumber,
          adminPermissions: adminPerms,
        });
        return res.json({ success: true, token, student: adminStudent, sheet4Public });
      }

      // 2. Check Trang tính 3 & Trang tính 1 Students (NEVER Admin)
      if (matchedStudent) {
        clearRateLimit(loginAttemptsByKey, rateKey);
        clearRateLimit(loginAttemptsByIp, clientIp);
        const safeStudent = {
          ...stripStudentPassword(matchedStudent),
          batdau: finalGlobalCfg
            ? String(finalGlobalCfg.batdau || '')
            : String(matchedStudent.batdau || ''),
          ketthuc: finalGlobalCfg
            ? String(finalGlobalCfg.ketthuc || '')
            : String(matchedStudent.ketthuc || ''),
          thongbao: finalGlobalCfg
            ? sanitizeNotice(finalGlobalCfg.thongbao)
            : sanitizeNotice(matchedStudent.thongbao),
          isAdmin: false,
          role: 'student' as const,
        };
        const token = signSessionToken({
          sub: safeStudent.username,
          role: 'student',
          sbd: safeStudent.sbd || '',
          hoten: safeStudent.hoten || '',
        });
        return res.json({ success: true, token, student: safeStudent, sheet4Public });
      }

      // If upstream GAS completely failed AND we have no cached data at all, report 500 (not 503, which nginx intercepts)
      if (
        !effectiveRoster.remoteOk &&
        serverCachedStudents.length === 0 &&
        serverCachedSheet4Admins.length === 0
      ) {
        return res.status(500).json({
          success: false,
          message: 'Không thể kết nối tới Google Sheets lúc này. Vui lòng bấm Đồng bộ hoặc thử lại sau vài giây.',
        });
      }

      recordFailedAttempt(loginAttemptsByKey, rateKey, 10 * 60 * 1000);
      recordFailedAttempt(loginAttemptsByIp, clientIp, 10 * 60 * 1000);
      return res.status(401).json({
        success: false,
        message: 'Tài khoản hoặc mật khẩu không chính xác.',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi xác thực hệ thống';
      return res.status(500).json({ success: false, message: msg });
    }
  });

  // Public Student Lookup Endpoint ("Tra cứu SBD") - rate-limited, strips passwords, excludes admins
  app.post('/api/search-student', async (req, res) => {
    const clientIp = getClientIp(req);
    if (!checkRateLimit(searchAttemptsByIp, clientIp, 120, 5 * 60 * 1000)) {
      return res.status(429).json({
        success: false,
        message: 'Bạn tra cứu quá nhanh. Vui lòng đợi một chút rồi thử lại.',
      });
    }
    recordFailedAttempt(searchAttemptsByIp, clientIp, 5 * 60 * 1000);

    try {
      const body = req.body || {};
      const query = typeof body.query === 'string' ? body.query.trim() : '';
      if (!query || query.length < 2) {
        return res.status(400).json({ success: false, message: 'Vui lòng nhập số điện thoại, tài khoản hoặc SBD.' });
      }

      const cleanUrl = sanitizeAppsScriptUrl(body.scriptUrl || req.query.url);
      let rosterResult = await fetchStudentsWithStatus(cleanUrl, false);

      const trimmedLower = query.toLowerCase();
      const queryDigits = query.replace(/\D/g, '');
      const queryDigitsNoZero = stripLeadingZeros(queryDigits);

      const findStudent = (students: any[]) => {
        let found = students.find((s) => {
          return (
            String(s.username || '').trim().toLowerCase() === trimmedLower ||
            String(s.sbd || '').trim().toLowerCase() === trimmedLower ||
            (s.email && String(s.email || '').trim().toLowerCase() === trimmedLower)
          );
        });

        if (!found && queryDigits.length >= 4) {
          found = students.find((s) => {
            const uDigits = String(s.username || '').replace(/\D/g, '');
            const sbdDigits = String(s.sbd || '').replace(/\D/g, '');
            const uNoZero = stripLeadingZeros(uDigits);
            const sbdNoZero = stripLeadingZeros(sbdDigits);
            return (
              (uDigits.length >= 4 &&
                (uDigits === queryDigits ||
                  (queryDigits.length >= 8 && (uDigits.endsWith(queryDigits) || queryDigits.endsWith(uDigits))) ||
                  (queryDigitsNoZero.length >= 7 && uNoZero.length >= 7 && uNoZero === queryDigitsNoZero))) ||
              (sbdDigits.length >= 4 &&
                (sbdDigits === queryDigits ||
                  (queryDigitsNoZero.length >= 4 && sbdNoZero === queryDigitsNoZero)))
            );
          });
        }
        return found;
      };

      let found = findStudent(rosterResult.students);

      // If not found and cached data wasn't freshly fetched within 5s, force refresh once from GAS
      if (!found && Date.now() - lastStudentsFetchAt > 5000) {
        const freshResult = await fetchStudentsWithStatus(cleanUrl, true);
        if (freshResult.remoteOk || freshResult.students.length > 0) {
          rosterResult = freshResult;
          found = findStudent(rosterResult.students);
        }
      }

      if (!found) {
        if (!rosterResult.remoteOk && serverCachedStudents.length === 0) {
          return res.status(500).json({
            found: false,
            student: null,
            message: 'Không thể kết nối tới Google Sheets lúc này. Vui lòng bấm Đồng bộ hoặc thử lại sau vài giây.',
          });
        }
        return res.json({ found: false, student: null });
      }

      // Return public candidate card (NEVER expose plaintext password or admin flag)
      return res.json({
        found: true,
        student: {
          ...stripStudentPassword(found),
          email: found.email ? maskEmailIfNeeded(found.email) : '',
        },
      });
    } catch {
      return res.status(500).json({
        found: false,
        student: null,
        message: 'Lỗi máy chủ khi tra cứu thông tin.',
      });
    }
  });

  // Safe cache refresh endpoint (refreshes Sheet 4 config + server student roster cache without exposing roster)
  app.post('/api/refresh-cache', async (req, res) => {
    try {
      const cleanUrl = sanitizeAppsScriptUrl(req.body?.scriptUrl || req.query.url);
      const [sheet4Data, roster] = await Promise.all([
        fetchSheet4Raw(cleanUrl, true),
        fetchStudentsWithStatus(cleanUrl, true),
      ]);
      const ok = Boolean(sheet4Data) || roster.remoteOk;
      return res.status(ok ? 200 : 500).json({
        success: ok,
        sheet4: buildPublicSheet4Payload(sheet4Data),
        message: ok
          ? 'Đã đồng bộ dữ liệu hệ thống thành công.'
          : 'Không thể kết nối tới Google Sheets. Vui lòng thử lại.',
      });
    } catch {
      return res.status(500).json({ success: false, message: 'Lỗi đồng bộ dữ liệu.' });
    }
  });

  function maskEmailIfNeeded(email: string): string {
    const trimmed = email.trim();
    const atIdx = trimmed.indexOf('@');
    if (atIdx <= 2) return trimmed;
    return `${trimmed.slice(0, 2)}***${trimmed.slice(atIdx)}`;
  }

  // Admin-only endpoint to retrieve student list (Trang tính 3 & 1), enforcing cutoff & hanche masking server-side
  app.get('/api/admin/students', requireAdmin('danhsachtaikhoan'), async (req, res) => {
    try {
      const session = (req as any).authSession as SessionPayload;
      const cleanUrl = sanitizeAppsScriptUrl(req.query.url);
      const students = await fetchStudentsRaw(cleanUrl);

      const cutoffMs = parseViCutoffMs(session.adminPermissions?.danhsachdkytk);
      const restricted = Boolean(session.adminPermissions?.hanche);

      const filtered = students
        .filter((st) => {
          if (cutoffMs === null) return true;
          const ts = parseViTsMs(st.registeredAt);
          return ts !== null && ts >= cutoffMs;
        })
        .map((st) => {
          const base = {
            ...stripStudentPassword(st),
            hasPassword: Boolean(st.password),
          };
          if (!restricted) return base;
          return {
            ...base,
            username: maskAccountServer(base.username),
            hoten: maskFullNameServer(base.hoten),
            sbd: maskSbdServer(base.sbd),
            email: maskEmailServer(base.email),
            namsinh: base.namsinh ? '***' : '',
          };
        });

      return res.json(filtered);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      return res.status(500).json({ error: msg });
    }
  });

  // Protect legacy /api/sheet-data endpoint behind Admin RBAC too (zero unauthenticated roster leak)
  app.get('/api/sheet-data', requireAdmin('danhsachtaikhoan'), async (req, res) => {
    try {
      const cleanUrl = sanitizeAppsScriptUrl(req.query.url);
      const students = await fetchStudentsRaw(cleanUrl);
      return res.json(students.map(stripStudentPassword));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown proxy error';
      return res.status(500).json({ error: msg });
    }
  });

  // Helper: push any pending web-registered students (synced !== true) to Trang tính 3 via latest GAS
  const syncPendingRegistrationsToGas = async (cleanUrl: string) => {
    const pending = inMemoryRegisteredStudents.filter((s) => s.synced !== true);
    if (pending.length === 0) {
      return { syncedCount: 0, remainingCount: 0, needsGasUpdate: false };
    }

    let syncedCount = 0;
    let needsGasUpdate = false;
    const updatedList = [...inMemoryRegisteredStudents];

    for (let i = 0; i < updatedList.length; i++) {
      const st = updatedList[i];
      if (st.synced === true) continue;

      try {
        const gasRes = await fetch(cleanUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'register_account',
            time: st.registeredAt || formatVietnamNow(),
            username: st.username,
            taikhoan: st.username,
            password: st.password,
            pass: st.password,
            sbd: st.sbd,
            sobaodanh: st.sbd,
            hoten: st.hoten,
            email: st.email || '',
            namsinh: st.namsinh || '',
            hsa: st.hsa || 'Không',
            vact: st.vact || 'Không',
            thptqg: st.thptqg || 'Không',
            huongnghiep: st.huongnghiep || 'Không',
          }),
          redirect: 'follow',
        });
        const gasText = await gasRes.text();
        const parsed = JSON.parse(gasText);
        if (
          (parsed?.status === 'success' &&
            (parsed?.targetSheet === 'Trang tính 3' || parsed?.rowNumber !== undefined)) ||
          (parsed?.status === 'duplicate' && parsed?.targetSheet === 'Trang tính 3')
        ) {
          updatedList[i] = {
            ...st,
            sbd: parsed?.sbd ? String(parsed.sbd).trim() : st.sbd,
            registeredAt: parsed?.time ? String(parsed.time).trim() : st.registeredAt,
            synced: true,
          };
          syncedCount++;
        } else if (
          parsed?.status === 'success' &&
          String(parsed?.message || '').includes('Trang tính 2')
        ) {
          needsGasUpdate = true;
          break;
        }
      } catch {
        // leave unsynced for retry
      }
    }

    if (syncedCount > 0) {
      inMemoryRegisteredStudents = updatedList;
      persistRegisteredStudents(inMemoryRegisteredStudents);
    }

    const remainingCount = inMemoryRegisteredStudents.filter((s) => s.synced !== true).length;
    return { syncedCount, remainingCount, needsGasUpdate };
  };

  // Public Sheet 4 config endpoint: NEVER exposes admin accounts or passwords!
  app.get('/api/sheet4-data', async (req, res) => {
    try {
      const cleanUrl = sanitizeAppsScriptUrl(req.query.url);
      const data = await fetchSheet4Raw(cleanUrl);

      if (!data) {
        return res.json({ deployed: false, globalConfig: null, registrationConfig: null, examLinks: {} });
      }

      const regConfig = data.registrationConfig || data.globalConfig?.registrationConfig || null;
      if (regConfig && inMemoryRegisteredStudents.some((s) => s.synced !== true)) {
        syncPendingRegistrationsToGas(cleanUrl).catch(() => {});
      }

      const rawGlobalConfig = data.globalConfig || null;
      const sanitizedGlobalConfig = rawGlobalConfig
        ? {
            ...rawGlobalConfig,
            thongbao: sanitizeNotice(rawGlobalConfig.thongbao),
          }
        : null;

      return res.json({
        deployed: true,
        globalConfig: sanitizedGlobalConfig,
        registrationConfig: regConfig,
        examLinks: data.examLinks || {},
        pendingRegistrationSync: inMemoryRegisteredStudents.filter((s) => s.synced !== true).length,
      });
    } catch {
      return res.json({ deployed: false, globalConfig: null, registrationConfig: null, examLinks: {} });
    }
  });

  // Admin-only endpoint to trigger syncing pending web registrations -> Trang tính 3
  app.post('/api/sync-registrations', requireAdmin('danhsachtaikhoan', true), async (req, res) => {
    try {
      const cleanUrl = sanitizeAppsScriptUrl(req.query.url || req.body?.scriptUrl);
      const result = await syncPendingRegistrationsToGas(cleanUrl);
      return res.json({ success: true, ...result });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi đồng bộ tài khoản';
      return res.status(500).json({ success: false, message: msg });
    }
  });

  // Direct student registration on web -> writes to Trang tính 3 (cols M-X), always role='student'
  app.post('/api/register', async (req, res) => {
    try {
      const body = req.body || {};
      const username = String(body.username || body.taikhoan || '').trim().slice(0, 40);
      const password = String(body.password || body.pass || '').trim().slice(0, 64);
      const hoten = String(body.hoten || '').trim().slice(0, 80);
      const email = String(body.email || '').trim().slice(0, 120);
      const namsinh = String(body.namsinh || '').trim().slice(0, 10);
      const hsa = body.hsa ? 'Có' : 'Không';
      const vact = body.vact ? 'Có' : 'Không';
      const thptqg = body.thptqg ? 'Có' : 'Không';
      const huongnghiep = body.huongnghiep ? 'Có' : 'Không';

      const digitsOnly = username.replace(/\D/g, '');
      if (!username || digitsOnly.length < 9 || digitsOnly.length > 12 || password.length < 4 || hoten.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập Số điện thoại (9–11 số), Mật khẩu (>= 4 ký tự) và Họ tên hợp lệ.',
        });
      }

      const cleanUrl = sanitizeAppsScriptUrl(req.query.url || body.scriptUrl);
      const existingRoster = await fetchStudentsRaw(cleanUrl);

      const duplicate = existingRoster.some((s) => {
        const u = String(s.username || '').trim().toLowerCase();
        const uDigits = u.replace(/\D/g, '');
        const uNoZero = stripLeadingZeros(uDigits);
        const dNoZero = stripLeadingZeros(digitsOnly);
        return (
          u === username.toLowerCase() ||
          (digitsOnly.length >= 8 && uDigits === digitsOnly) ||
          (dNoZero.length >= 8 && uNoZero === dNoZero)
        );
      });
      if (duplicate) {
        return res.status(409).json({
          success: false,
          duplicate: true,
          message: 'Số điện thoại / tài khoản này đã được đăng ký trước đó!',
        });
      }

      const existingSbds = new Set(existingRoster.map((s) => String(s.sbd || '').trim()));
      let generatedSbd = '';
      do {
        generatedSbd = String(Math.floor(10000 + Math.random() * 89999));
      } while (existingSbds.has(generatedSbd));

      const timeStr = formatVietnamNow();

      let gasSynced = false;
      let needsGasUpdate = false;
      let finalSbd = generatedSbd;
      let finalTime = timeStr;

      try {
        const gasRes = await fetch(cleanUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'register_account',
            time: timeStr,
            username,
            taikhoan: username,
            password,
            pass: password,
            sbd: generatedSbd,
            sobaodanh: generatedSbd,
            hoten,
            email,
            namsinh,
            hsa,
            vact,
            thptqg,
            huongnghiep,
          }),
          redirect: 'follow',
        });
        const gasText = await gasRes.text();
        try {
          const parsed = JSON.parse(gasText);
          if (parsed?.status === 'duplicate') {
            return res.status(409).json({
              success: false,
              duplicate: true,
              message: parsed.message || 'Số điện thoại / tài khoản này đã tồn tại trên hệ thống!',
            });
          }
          if (
            parsed?.status === 'success' &&
            (parsed?.targetSheet === 'Trang tính 3' || parsed?.rowNumber !== undefined)
          ) {
            gasSynced = true;
            if (parsed.sbd) finalSbd = String(parsed.sbd).trim();
            if (parsed.time) finalTime = String(parsed.time).trim();
          } else {
            needsGasUpdate = true;
          }
        } catch {
          needsGasUpdate = true;
        }
      } catch {
        needsGasUpdate = true;
      }

      const newStudent = {
        username,
        password,
        sbd: finalSbd,
        hoten,
        email,
        namsinh,
        hsa,
        vact,
        thptqg,
        huongnghiep,
        registeredAt: finalTime,
        sourceZone: 'sheet3_web' as const,
        isAdmin: false,
        role: 'student' as const,
        synced: gasSynced,
      };

      inMemoryRegisteredStudents = [newStudent, ...inMemoryRegisteredStudents.slice(0, 999)];
      persistRegisteredStudents(inMemoryRegisteredStudents);
      lastStudentsFetchAt = 0;

      const safeStudent = stripStudentPassword(newStudent);
      const token = signSessionToken({
        sub: safeStudent.username,
        role: 'student',
        sbd: safeStudent.sbd,
        hoten: safeStudent.hoten,
      });

      return res.json({
        success: true,
        synced: gasSynced,
        needsGasUpdate,
        token,
        student: safeStudent,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi đăng ký tài khoản';
      return res.status(500).json({ success: false, message: msg });
    }
  });

  // Authenticated login logging (requires valid Bearer session)
  app.post('/api/log-login', requireAuth, async (req, res) => {
    try {
      const session = (req as any).authSession as SessionPayload;
      const payload = req.body || {};

      const newRecord = {
        id: payload.id || `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        timestamp: payload.time || payload.timestamp || formatVietnamNow(),
        isoDate: payload.isoDate || new Date().toISOString(),
        hoten: session.hoten || String(payload.hoten || '').slice(0, 100),
        sbd: session.sbd || String(payload.sbd || '').slice(0, 20),
        username: session.sub || String(payload.username || '').slice(0, 60),
        email: String(payload.email || '').slice(0, 120),
        namsinh: String(payload.namsinh || '').slice(0, 10),
        monthi: String(payload.monthi || '').slice(0, 120),
        device: String(payload.device || '').slice(0, 80),
        status: String(payload.status || 'Đăng nhập thành công').slice(0, 120),
        synced: true,
      };

      const isDuplicate = inMemoryLogs.some(
        (l) =>
          l.username === newRecord.username &&
          l.timestamp === newRecord.timestamp
      );
      if (!isDuplicate) {
        inMemoryLogs = [newRecord, ...inMemoryLogs.slice(0, 499)];
        persistLogs(inMemoryLogs);
      }

      const cleanUrl = sanitizeAppsScriptUrl(req.query.url || payload.scriptUrl);

      const response = await fetch(cleanUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          ...payload,
          username: newRecord.username,
          hoten: newRecord.hoten,
          sbd: newRecord.sbd,
        }),
        redirect: 'follow',
      });
      const responseText = await response.text();
      return res.json({ success: true, record: newRecord, response: responseText });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown logging error';
      return res.status(500).json({ error: msg });
    }
  });

  // Admin-only route to get all login records of Trang tính 2 (Sheet 2), enforcing cutoff & hanche server-side
  app.get('/api/sheet2-data', requireAdmin('lichsu'), async (req, res) => {
    try {
      const session = (req as any).authSession as SessionPayload;
      const cleanUrl = sanitizeAppsScriptUrl(req.query.url);

      let sheetLogs: any[] = [];

      try {
        const sep = cleanUrl.includes('?') ? '&' : '?';
        const targetUrl = `${cleanUrl}${sep}action=get_sheet2&sheet=2&_t=${Date.now()}`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 12000);

        const response = await fetch(targetUrl, {
          method: 'GET',
          headers: { Accept: 'application/json, text/plain, */*' },
          signal: controller.signal,
          redirect: 'follow',
        });
        clearTimeout(timeout);

        if (response.ok) {
          const text = await response.text();
          if (text.startsWith('[') && !text.includes('<!DOCTYPE')) {
            const parsed = JSON.parse(text);
            if (Array.isArray(parsed) && parsed.length > 0) {
              sheetLogs = parsed.map((item, idx) => {
                const ts = String(item.time || item.timestamp || '').trim();
                return {
                  id: `gas_log_${idx}`,
                  timestamp: ts,
                  isoDate: item.isoDate || parseViTimestampToIso(ts),
                  hoten: item.hoten || '',
                  sbd: item.sbd || '',
                  username: item.username || '',
                  email: item.email || '',
                  namsinh: item.namsinh || '',
                  monthi: item.monthi || '',
                  device: item.device || '',
                  status: item.status || 'Đăng nhập thành công',
                  synced: true,
                };
              });
            }
          }
        }
      } catch {
        // Fallback to server's persisted logs
      }

      const combined = [...inMemoryLogs, ...sheetLogs];
      const seen = new Set<string>();
      const uniqueLogs: any[] = [];

      for (const item of combined) {
        const normUser = String(item.username || '').replace(/^0+/, '');
        const key = `${item.timestamp}_${normUser}_${item.sbd}_${item.monthi}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueLogs.push(item);
        }
      }

      uniqueLogs.sort((a, b) => {
        const ta = a.isoDate ? new Date(a.isoDate).getTime() : 0;
        const tb = b.isoDate ? new Date(b.isoDate).getTime() : 0;
        return tb - ta;
      });

      const cutoffMs = parseViCutoffMs(session.adminPermissions?.danhsachdkytk);
      const restricted = Boolean(session.adminPermissions?.hanche);

      const finalLogs = uniqueLogs
        .filter((log) => {
          if (cutoffMs === null) return true;
          const ts = parseViTsMs(log.timestamp, log.isoDate);
          return ts !== null && ts >= cutoffMs;
        })
        .map((log) => {
          if (!restricted) return log;
          return {
            ...log,
            hoten: maskFullNameServer(log.hoten),
            sbd: maskSbdServer(log.sbd),
            username: maskAccountServer(log.username),
            email: maskEmailServer(log.email),
            namsinh: log.namsinh ? '***' : '',
          };
        });

      return res.json(finalLogs);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error fetching sheet 2 logs';
      return res.status(500).json({ error: msg });
    }
  });

  // Admin-only endpoint to clear logs (requires 'cauhinh' permission and non-restricted account)
  app.post('/api/clear-logs', requireAdmin('cauhinh', true), (_req, res) => {
    inMemoryLogs = [];
    persistLogs(inMemoryLogs);
    res.json({ success: true, message: 'All logs cleared' });
  });

  // Public/Student RIASEC career test submission (allowed without login because guests take the test on the portal)
  app.post('/api/log-career', async (req, res) => {
    try {
      const payload = req.body || {};
      const timestamp = String(payload.time || payload.timestamp || formatVietnamNow()).slice(0, 40);

      const careerRecord = {
        id: String(payload.id || `career_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`).slice(0, 64),
        timestamp,
        isoDate: String(payload.isoDate || new Date().toISOString()).slice(0, 40),
        hoten: String(payload.hoten || '').trim().slice(0, 100),
        sbd: String(payload.sbd || '').trim().slice(0, 20),
        username: String(payload.username || '').trim().slice(0, 60),
        email: String(payload.email || '').trim().slice(0, 120),
        namsinh: String(payload.namsinh || '').trim().slice(0, 10),
        riasecCode: String(payload.riasecCode || '').trim().slice(0, 10),
        primaryTrait: String(payload.primaryTrait || '').trim().slice(0, 120),
        secondaryTrait: String(payload.secondaryTrait || '').trim().slice(0, 120),
        scores: payload.scores || { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 },
        scoresText: String(payload.scoresText || '').trim().slice(0, 120),
        recommendedMajors: String(payload.recommendedMajors || '').trim().slice(0, 400),
        recommendedUniversities: String(payload.recommendedUniversities || '').trim().slice(0, 400),
        examFocus: String(payload.examFocus || '').trim().slice(0, 250),
        device: String(payload.device || '').trim().slice(0, 80),
        synced: false,
      };

      if (!careerRecord.hoten || !careerRecord.riasecCode) {
        return res.status(400).json({ success: false, message: 'Thiếu thông tin kết quả hướng nghiệp.' });
      }

      inMemoryCareerResults = [careerRecord, ...inMemoryCareerResults.slice(0, 499)];
      persistCareerResults(inMemoryCareerResults);

      const sheet2LogRecord = {
        id: `log_${careerRecord.id}`,
        timestamp,
        isoDate: careerRecord.isoDate,
        hoten: careerRecord.hoten,
        sbd: careerRecord.sbd,
        username: careerRecord.username,
        email: careerRecord.email,
        namsinh: careerRecord.namsinh,
        monthi: `Hướng nghiệp (Mã: ${careerRecord.riasecCode})`,
        device: careerRecord.device,
        status: `KQ: ${careerRecord.riasecCode} (${careerRecord.scoresText}) | ${careerRecord.primaryTrait}`,
        synced: true,
      };
      inMemoryLogs = [sheet2LogRecord, ...inMemoryLogs.slice(0, 499)];
      persistLogs(inMemoryLogs);

      const cleanUrl = sanitizeAppsScriptUrl(req.query.url || payload.scriptUrl);

      let gasResponseText = '';
      let gasSynced = false;

      try {
        const gasPayload = {
          action: 'log_career',
          sheet: 'Trang tính 5',
          sheetName: 'Trang tính 5',
          time: timestamp,
          timestamp,
          isoDate: careerRecord.isoDate,
          hoten: careerRecord.hoten,
          sbd: careerRecord.sbd,
          username: careerRecord.username,
          namsinh: careerRecord.namsinh,
          email: careerRecord.email,
          monthi: `Hướng nghiệp RIASEC (Mã: ${careerRecord.riasecCode})`,
          device: careerRecord.device,
          status: `KQ Hướng nghiệp: ${careerRecord.riasecCode} | ${careerRecord.scoresText} | Nhóm chính: ${careerRecord.primaryTrait} | Ngành: ${careerRecord.recommendedMajors}`,
          riasecCode: careerRecord.riasecCode,
          primaryTrait: careerRecord.primaryTrait,
          secondaryTrait: careerRecord.secondaryTrait,
          scores: careerRecord.scores,
          scoresText: careerRecord.scoresText,
          recommendedMajors: careerRecord.recommendedMajors,
          recommendedUniversities: careerRecord.recommendedUniversities,
          examFocus: careerRecord.examFocus,
        };

        const response = await fetch(cleanUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8',
          },
          body: JSON.stringify(gasPayload),
          redirect: 'follow',
        });
        gasResponseText = await response.text();
        try {
          const parsed = JSON.parse(gasResponseText);
          gasSynced =
            parsed?.status === 'success' &&
            (parsed?.targetSheet === 'Trang tính 5' ||
              !String(parsed?.message || '').includes('Trang tính 2'));
        } catch {
          gasSynced = response.ok;
        }
      } catch {
        // Keep local record even if external GAS call fails
      }

      careerRecord.synced = gasSynced;
      inMemoryCareerResults[0] = careerRecord;
      persistCareerResults(inMemoryCareerResults);

      return res.json({
        success: true,
        synced: gasSynced,
        record: careerRecord,
        response: gasResponseText,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown career logging error';
      return res.status(500).json({ error: msg });
    }
  });

  // Admin-only route to fetch all career test results (enforcing cutoff & hanche server-side)
  app.get('/api/career-results', requireAdmin('ketquahuongnghiep'), async (req, res) => {
    try {
      const session = (req as any).authSession as SessionPayload;
      const cleanUrl = sanitizeAppsScriptUrl(req.query.url);

      let sheetCareerResults: any[] = [];
      let sheet2CareerResults: any[] = [];

      const sep = cleanUrl.includes('?') ? '&' : '?';

      await Promise.all([
        (async () => {
          try {
            const targetUrl = `${cleanUrl}${sep}action=get_career_results&sheet=5&_t=${Date.now()}`;
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 12000);
            const response = await fetch(targetUrl, {
              method: 'GET',
              headers: { Accept: 'application/json, text/plain, */*' },
              signal: controller.signal,
              redirect: 'follow',
            });
            clearTimeout(timeout);
            if (response.ok) {
              const text = await response.text();
              if (text.startsWith('[') && !text.includes('<!DOCTYPE')) {
                const parsed = JSON.parse(text);
                if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].riasecCode !== undefined) {
                  sheetCareerResults = parsed.map((item, idx) => {
                    const ts = String(item.time || item.timestamp || '').trim();
                    return {
                      id: `gas_career_${idx}`,
                      timestamp: ts,
                      isoDate: item.isoDate || parseViTimestampToIso(ts),
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
                    };
                  });
                }
              }
            }
          } catch {
            // Fallback to Sheet 2 + server store
          }
        })(),
        (async () => {
          try {
            const targetUrl = `${cleanUrl}${sep}action=get_sheet2&sheet=2&_t=${Date.now()}`;
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 12000);
            const response = await fetch(targetUrl, {
              method: 'GET',
              headers: { Accept: 'application/json, text/plain, */*' },
              signal: controller.signal,
              redirect: 'follow',
            });
            clearTimeout(timeout);
            if (response.ok) {
              const text = await response.text();
              if (text.startsWith('[') && !text.includes('<!DOCTYPE')) {
                const parsed = JSON.parse(text);
                if (Array.isArray(parsed)) {
                  sheet2CareerResults = parsed
                    .map((row, idx) => parseCareerFromSheet2Row(row, idx))
                    .filter((r): r is NonNullable<typeof r> => Boolean(r));
                }
              }
            }
          } catch {
            // Ignore
          }
        })(),
      ]);

      const memoryLogCareers = inMemoryLogs
        .map((row, idx) => parseCareerFromSheet2Row(row, idx))
        .filter((r): r is NonNullable<typeof r> => Boolean(r));

      const combined = [
        ...inMemoryCareerResults,
        ...sheetCareerResults,
        ...sheet2CareerResults,
        ...memoryLogCareers,
      ];
      const seen = new Set<string>();
      const uniqueResults: any[] = [];

      for (const item of combined) {
        const normUser = String(item.username || '').replace(/^0+/, '');
        const key = `${item.timestamp}_${normUser || item.sbd}_${item.riasecCode}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueResults.push(item);
        }
      }

      uniqueResults.sort((a, b) => {
        const ta = a.isoDate ? new Date(a.isoDate).getTime() : 0;
        const tb = b.isoDate ? new Date(b.isoDate).getTime() : 0;
        return tb - ta;
      });

      const cutoffMs = parseViCutoffMs(session.adminPermissions?.danhsachdkytk);
      const restricted = Boolean(session.adminPermissions?.hanche);

      const finalResults = uniqueResults
        .filter((r) => {
          if (cutoffMs === null) return true;
          const ts = parseViTsMs(r.timestamp, r.isoDate);
          return ts !== null && ts >= cutoffMs;
        })
        .map((r) => {
          if (!restricted) return r;
          return {
            ...r,
            hoten: maskFullNameServer(r.hoten),
            sbd: maskSbdServer(r.sbd),
            username: maskAccountServer(r.username),
            email: maskEmailServer(r.email),
            namsinh: r.namsinh ? '***' : '',
          };
        });

      return res.json(finalResults);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error fetching career results';
      return res.status(500).json({ error: msg });
    }
  });

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
  });

  const warmUpGasCaches = async () => {
    try {
      await Promise.all([
        fetchSheet4Raw(GOOGLE_SCRIPT_URL, true),
        fetchStudentsWithStatus(GOOGLE_SCRIPT_URL, true),
      ]);
      if (serverCachedStudents.length === 0 || !serverCachedSheet4Data) {
        setTimeout(() => {
          fetchSheet4Raw(GOOGLE_SCRIPT_URL, true).catch(() => {});
          fetchStudentsWithStatus(GOOGLE_SCRIPT_URL, true).catch(() => {});
        }, 4000);
      }
    } catch {
      // ignore warmup failure
    }
  };

  // Start warming GAS caches immediately in parallel with Vite setup
  warmUpGasCaches();

  // In production serve pre-built dist/, in development dynamically load Vite middlewares
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const server = http.createServer(app);
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
    setInterval(() => {
      warmUpGasCaches();
    }, 120 * 1000);
  });
}

startServer();
