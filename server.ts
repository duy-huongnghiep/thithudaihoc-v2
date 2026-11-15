import express from 'express';
import { createServer as createViteServer } from 'vite';
import http from 'http';

const PORT = 3000;
const GOOGLE_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbxv_LnzrD7mTAAoQYYgEZjdcW8cCNcVoEu1rPCEU2V-EGMaiRLtGRU3yv3sV3WPkeUZTA/exec';

import fs from 'fs';
import path from 'path';

const LOGS_FILE_PATH = path.join(process.cwd(), 'login_logs_store.json');
const CAREER_RESULTS_FILE_PATH = path.join(process.cwd(), 'career_results_store.json');

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

// In-memory stores synced with files
let inMemoryLogs = loadSavedLogs();
let inMemoryCareerResults = loadSavedCareerResults();

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

async function startServer() {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Helper to enrich student objects with row numbers and admin flags
  const enrichStudentRow = (item: any, index: number) => {
    const rowNumber = index + 2; // Row 2 = A2, Row 3 = A3...
    const isRowAdmin = rowNumber >= 2 && rowNumber <= 6;
    const username = String(item?.username || item?.taikhoan || '').toLowerCase().trim();
    const email = String(item?.email || '').toLowerCase().trim();
    const sbd = String(item?.sbd || item?.sobaodanh || '').toLowerCase().trim();

    const isAdmin =
      isRowAdmin ||
      username === 'amind' ||
      username === 'admin' ||
      username.startsWith('admin') ||
      email === 'admin' ||
      sbd.startsWith('ad') ||
      item?.isAdmin === true;

    const thongbao = String(
      item?.thongbao ?? item?.Thongbao ?? item?.thongBao ?? item?.notice ?? ''
    ).trim();

    return {
      ...item,
      thongbao,
      rowNumber,
      isAdmin,
    };
  };

  // API proxy route to fetch student data from Google Apps Script without CORS / Origin 403
  app.get('/api/sheet-data', async (req, res) => {
    try {
      const customUrl = (req.query.url as string) || GOOGLE_SCRIPT_URL;
      const cleanUrl = customUrl.trim().startsWith('https://script.google.com/')
        ? customUrl.trim()
        : GOOGLE_SCRIPT_URL;

      const sep = cleanUrl.includes('?') ? '&' : '?';
      const targetUrl = `${cleanUrl}${sep}_t=${Date.now()}`;

      const response = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/json, text/plain, */*',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        redirect: 'follow',
      });

      if (!response.ok) {
        return res.status(response.status).json({ error: `Google Apps Script returned ${response.status}` });
      }

      const text = await response.text();

      // Check if valid JSON array
      try {
        const data = JSON.parse(text);
        if (Array.isArray(data)) {
          return res.json(data.map(enrichStudentRow));
        }
        return res.json(data);
      } catch {
        // Strip JSONP callback if any e.g. cb(...)
        const match = text.match(/^[a-zA-Z0-9_$]+\(([\s\S]*)\);?$/);
        if (match) {
          const innerData = JSON.parse(match[1]);
          if (Array.isArray(innerData)) {
            return res.json(innerData.map(enrichStudentRow));
          }
          return res.json(innerData);
        }
        return res.status(500).json({ error: 'Invalid response format from Google Apps Script' });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown proxy error';
      return res.status(500).json({ error: msg });
    }
  });

  // API proxy route to log student login to Sheet 2
  app.post('/api/log-login', async (req, res) => {
    try {
      const payload = req.body;

      // 1. Save to persistent server store
      const newRecord = {
        id: payload.id || `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        timestamp: payload.time || payload.timestamp || new Date().toLocaleString('vi-VN'),
        isoDate: payload.isoDate || new Date().toISOString(),
        hoten: payload.hoten || '',
        sbd: payload.sbd || '',
        username: payload.username || '',
        email: payload.email || '',
        namsinh: payload.namsinh || '',
        monthi: payload.monthi || '',
        device: payload.device || '',
        status: payload.status || 'Đăng nhập thành công',
        synced: true,
      };

      // Add to front of in-memory list (prevent exact same record duplicated in short window)
      const isDuplicate = inMemoryLogs.some(
        (l) =>
          l.username === newRecord.username &&
          l.timestamp === newRecord.timestamp
      );
      if (!isDuplicate) {
        inMemoryLogs = [newRecord, ...inMemoryLogs.slice(0, 499)];
        persistLogs(inMemoryLogs);
      }

      // 2. Transmit to Google Apps Script
      const customUrl = (req.query.url as string) || GOOGLE_SCRIPT_URL;
      const cleanUrl = customUrl.trim().startsWith('https://script.google.com/')
        ? customUrl.trim()
        : GOOGLE_SCRIPT_URL;

      const response = await fetch(cleanUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
        redirect: 'follow',
      });
      const responseText = await response.text();
      return res.json({ success: true, record: newRecord, response: responseText });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown logging error';
      return res.status(500).json({ error: msg });
    }
  });

  // API route to get all login records of Trang tính 2 (Sheet 2)
  app.get('/api/sheet2-data', async (req, res) => {
    try {
      const customUrl = (req.query.url as string) || GOOGLE_SCRIPT_URL;
      const cleanUrl = customUrl.trim().startsWith('https://script.google.com/')
        ? customUrl.trim()
        : GOOGLE_SCRIPT_URL;

      let sheetLogs: any[] = [];

      // Try fetching from Google Apps Script if it supports Trang tính 2 retrieval
      try {
        const sep = cleanUrl.includes('?') ? '&' : '?';
        const targetUrl = `${cleanUrl}${sep}action=get_sheet2&sheet=2&_t=${Date.now()}`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3500);

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

      // Merge server-side logs and remote sheet logs, de-duplicating by timestamp + sbd/normalized username
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

      // Sort newest first
      uniqueLogs.sort((a, b) => {
        const ta = a.isoDate ? new Date(a.isoDate).getTime() : 0;
        const tb = b.isoDate ? new Date(b.isoDate).getTime() : 0;
        return tb - ta;
      });

      return res.json(uniqueLogs);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error fetching sheet 2 logs';
      return res.status(500).json({ error: msg, fallback: inMemoryLogs });
    }
  });

  // API endpoint to clear or reset logs (Admin function)
  app.post('/api/clear-logs', (_req, res) => {
    inMemoryLogs = [];
    persistLogs(inMemoryLogs);
    res.json({ success: true, message: 'All logs cleared' });
  });

  // API proxy route to save RIASEC career test results to Google Sheets & persistent server store
  app.post('/api/log-career', async (req, res) => {
    try {
      const payload = req.body;
      const timestamp = payload.time || payload.timestamp || new Date().toLocaleString('vi-VN');

      const careerRecord = {
        id: payload.id || `career_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        timestamp,
        isoDate: payload.isoDate || new Date().toISOString(),
        hoten: payload.hoten || '',
        sbd: payload.sbd || '',
        username: payload.username || '',
        email: payload.email || '',
        namsinh: payload.namsinh || '',
        riasecCode: payload.riasecCode || '',
        primaryTrait: payload.primaryTrait || '',
        secondaryTrait: payload.secondaryTrait || '',
        scores: payload.scores || { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 },
        scoresText: payload.scoresText || '',
        recommendedMajors: payload.recommendedMajors || '',
        recommendedUniversities: payload.recommendedUniversities || '',
        examFocus: payload.examFocus || '',
        device: payload.device || '',
        synced: false,
      };

      // 1. Save to persistent career results store
      inMemoryCareerResults = [careerRecord, ...inMemoryCareerResults.slice(0, 499)];
      persistCareerResults(inMemoryCareerResults);

      // 2. Also add summary log to Trang tính 2 local log list so Admins see it immediately
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

      // 3. Forward to Google Apps Script (supports both custom log_career and fallback handleLogLogin)
      const customUrl = (req.query.url as string) || (payload.scriptUrl as string) || GOOGLE_SCRIPT_URL;
      const cleanUrl = customUrl.trim().startsWith('https://script.google.com/')
        ? customUrl.trim()
        : GOOGLE_SCRIPT_URL;

      let gasResponseText = '';
      let gasSynced = false;

      try {
        const gasPayload = {
          action: 'log_career',
          sheet: 'Kết quả hướng nghiệp',
          sheetName: 'Kết quả hướng nghiệp',
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
        gasSynced = response.ok;
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

  // API route to fetch all career test results (from Google Sheets + Sheet 2 fallback + local server store)
  app.get('/api/career-results', async (req, res) => {
    try {
      const customUrl = (req.query.url as string) || GOOGLE_SCRIPT_URL;
      const cleanUrl = customUrl.trim().startsWith('https://script.google.com/')
        ? customUrl.trim()
        : GOOGLE_SCRIPT_URL;

      let sheetCareerResults: any[] = [];
      let sheet2CareerResults: any[] = [];

      const sep = cleanUrl.includes('?') ? '&' : '?';

      // Fetch both get_career_results and get_sheet2 in parallel so career results logged to Trang tính 2 are never missed
      await Promise.all([
        (async () => {
          try {
            const targetUrl = `${cleanUrl}${sep}action=get_career_results&_t=${Date.now()}`;
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 4500);
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
            const timeout = setTimeout(() => controller.abort(), 4500);
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

      // Also extract any career rows from inMemoryLogs as extra safety
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

      // Sort newest first
      uniqueResults.sort((a, b) => {
        const ta = a.isoDate ? new Date(a.isoDate).getTime() : 0;
        const tb = b.isoDate ? new Date(b.isoDate).getTime() : 0;
        return tb - ta;
      });

      return res.json(uniqueResults);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error fetching career results';
      return res.status(500).json({ error: msg, fallback: inMemoryCareerResults });
    }
  });

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
  });

  // In development, attach Vite middlewares
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const server = http.createServer(app);
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
