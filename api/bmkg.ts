import type { IncomingMessage, ServerResponse } from 'http';

const BMKG_ENDPOINTS = {
  autogempa: 'https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json',
  gempaterkini: 'https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json',
  gempadirasakan: 'https://data.bmkg.go.id/DataMKG/TEWS/gempadirasakan.json',
  gempaql: 'https://bmkg-content-inatews.storage.googleapis.com/gempaQL.json',
  datagempa: 'https://bmkg-content-inatews.storage.googleapis.com/datagempa.json',
  last30event: 'https://bmkg-content-inatews.storage.googleapis.com/last30event.xml',
} as const;

interface CacheEntry {
  timestamp: number;
  data: unknown;
}

const CACHE_TTL_MS = 15_000;
const memoryCache = new Map<string, CacheEntry>();

function extractXmlTag(block: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
  const match = block.match(regex);
  return match ? match[1].trim() : '';
}

function parseLast30EventXml(xmlText: string) {
  const infoBlocks = xmlText.match(/<info>[\s\S]*?<\/info>/gi) ?? [];
  return infoBlocks.map((block) => {
    const pointBlock = extractXmlTag(block, 'point');
    const coordinates = extractXmlTag(pointBlock, 'coordinates');
    return {
      event: extractXmlTag(block, 'event'),
      date: extractXmlTag(block, 'date'),
      time: extractXmlTag(block, 'time'),
      coordinates,
      latitude: extractXmlTag(block, 'latitude'),
      longitude: extractXmlTag(block, 'longitude'),
      magnitude: extractXmlTag(block, 'magnitude'),
      depth: extractXmlTag(block, 'depth'),
      area: extractXmlTag(block, 'area'),
      eventid: extractXmlTag(block, 'eventid'),
      potential: extractXmlTag(block, 'potential'),
      subject: extractXmlTag(block, 'subject'),
      headline: extractXmlTag(block, 'headline'),
      description: extractXmlTag(block, 'description'),
      instruction: extractXmlTag(block, 'instruction'),
      shakemap: extractXmlTag(block, 'shakemap'),
      felt: extractXmlTag(block, 'felt'),
      timesent: extractXmlTag(block, 'timesent'),
    };
  });
}

async function fetchJsonWithTimeout(url: string, timeoutMs = 10_000): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Geosfera-BMKG-GIS/1.0',
        Accept: 'application/json, text/plain, */*',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} from ${url}`);
    }
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

async function fetchTextWithTimeout(url: string, timeoutMs = 10_000): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Geosfera-BMKG-GIS/1.0',
        Accept: 'application/xml, text/xml, text/plain, */*',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} from ${url}`);
    }
    return await response.text();
  } finally {
    clearTimeout(timer);
  }
}

function sendJson(res: ServerResponse, status: number, payload: unknown, cacheHeader = 's-maxage=15, stale-while-revalidate=30') {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', cacheHeader);
  res.end(JSON.stringify(payload));
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const rawUrl = req.url || '/api/bmkg';
    const parsedUrl = new URL(rawUrl, 'http://localhost');
    const feed = (parsedUrl.searchParams.get('feed') || 'all').toLowerCase();
    const file = parsedUrl.searchParams.get('file') || '';

    if (feed === 'shakemap') {
      if (!/^[a-zA-Z0-9._-]+\.(jpg|jpeg|png)$/i.test(file)) {
        sendJson(res, 400, { error: 'Parameter file shakemap tidak valid.' }, 'no-store');
        return;
      }
      const shakemapUrl = `https://data.bmkg.go.id/DataMKG/TEWS/${file}`;
      const imgResp = await fetch(shakemapUrl, {
        headers: { 'User-Agent': 'Geosfera-BMKG-GIS/1.0' },
      });
      if (!imgResp.ok) {
        sendJson(res, imgResp.status, { error: 'Shakemap tidak ditemukan pada server BMKG.' }, 'no-store');
        return;
      }
      const buffer = Buffer.from(await imgResp.arrayBuffer());
      res.statusCode = 200;
      res.setHeader('Content-Type', imgResp.headers.get('content-type') || 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
      res.end(buffer);
      return;
    }

    const cacheKey = feed;
    const cached = memoryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      res.setHeader('X-BMKG-Cache', 'HIT');
      sendJson(res, 200, cached.data);
      return;
    }

    if (feed === 'all') {
      const [autogempaRes, terkiniRes, dirasakanRes, qlRes, datagempaRes, last30Res] =
        await Promise.allSettled([
          fetchJsonWithTimeout(BMKG_ENDPOINTS.autogempa),
          fetchJsonWithTimeout(BMKG_ENDPOINTS.gempaterkini),
          fetchJsonWithTimeout(BMKG_ENDPOINTS.gempadirasakan),
          fetchJsonWithTimeout(BMKG_ENDPOINTS.gempaql, 14_000),
          fetchJsonWithTimeout(BMKG_ENDPOINTS.datagempa),
          fetchTextWithTimeout(BMKG_ENDPOINTS.last30event),
        ]);

      const payload = {
        fetchedAt: new Date().toISOString(),
        sources: {
          autogempa: BMKG_ENDPOINTS.autogempa,
          gempaterkini: BMKG_ENDPOINTS.gempaterkini,
          gempadirasakan: BMKG_ENDPOINTS.gempadirasakan,
          gempaql: BMKG_ENDPOINTS.gempaql,
          datagempa: BMKG_ENDPOINTS.datagempa,
          last30event: BMKG_ENDPOINTS.last30event,
        },
        autogempa: autogempaRes.status === 'fulfilled' ? autogempaRes.value : null,
        gempaterkini: terkiniRes.status === 'fulfilled' ? terkiniRes.value : null,
        gempadirasakan: dirasakanRes.status === 'fulfilled' ? dirasakanRes.value : null,
        gempaql: qlRes.status === 'fulfilled' ? qlRes.value : null,
        datagempa: datagempaRes.status === 'fulfilled' ? datagempaRes.value : null,
        last30event: last30Res.status === 'fulfilled' ? parseLast30EventXml(last30Res.value) : [],
        errors: {
          autogempa: autogempaRes.status === 'rejected' ? String(autogempaRes.reason) : null,
          gempaterkini: terkiniRes.status === 'rejected' ? String(terkiniRes.reason) : null,
          gempadirasakan: dirasakanRes.status === 'rejected' ? String(dirasakanRes.reason) : null,
          gempaql: qlRes.status === 'rejected' ? String(qlRes.reason) : null,
          datagempa: datagempaRes.status === 'rejected' ? String(datagempaRes.reason) : null,
          last30event: last30Res.status === 'rejected' ? String(last30Res.reason) : null,
        },
      };

      memoryCache.set(cacheKey, { timestamp: Date.now(), data: payload });
      res.setHeader('X-BMKG-Cache', 'MISS');
      sendJson(res, 200, payload);
      return;
    }

    if (feed in BMKG_ENDPOINTS) {
      const targetUrl = BMKG_ENDPOINTS[feed as keyof typeof BMKG_ENDPOINTS];
      const data =
        feed === 'last30event'
          ? parseLast30EventXml(await fetchTextWithTimeout(targetUrl))
          : await fetchJsonWithTimeout(targetUrl);
      memoryCache.set(cacheKey, { timestamp: Date.now(), data });
      res.setHeader('X-BMKG-Cache', 'MISS');
      sendJson(res, 200, data);
      return;
    }

    sendJson(res, 400, { error: `Feed '${feed}' tidak dikenali.` }, 'no-store');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal mengambil data dari server BMKG.';
    sendJson(res, 502, { error: message }, 'no-store');
  }
}
