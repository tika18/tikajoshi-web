const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

// Load .env.local manually if present
const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  const envText = fs.readFileSync(envPath, "utf-8");
  envText.split("\n").forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let value = match[2] || "";
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      process.env[match[1]] = value;
    }
  });
}

// Check Firebase Admin SDK availability
let adminDb = null;
try {
  const { initializeApp, cert } = require("firebase-admin/app");
  const { getDatabase } = require("firebase-admin/database");
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const databaseURL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (clientEmail && privateKey && databaseURL) {
    const formattedKey = privateKey.replace(/\\n/g, "\n");
    const app = initializeApp({
      credential: cert({
        clientEmail,
        privateKey: formattedKey,
        projectId,
      }),
      databaseURL,
    });
    adminDb = getDatabase(app);
    console.log("Firebase Admin SDK initialized successfully.");
  } else {
    console.log("Firebase credentials incomplete, proceeding with local JSON backfill only.");
  }
} catch (e) {
  console.warn("Firebase Admin SDK init failed or module missing:", e.message);
}

const CACHE_DIR = path.join(__dirname, "..", "lib", "cache");
const CACHE_FILE = path.join(CACHE_DIR, "nepse-history.json");

function makeRequest(url, options = {}, bodyData = null) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const lib = parsedUrl.protocol === "https:" ? https : http;

    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === "https:" ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        ...(options.headers || {}),
      },
    };

    const req = lib.request(reqOptions, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        resolve({ status: res.statusCode, headers: res.headers, body: data });
      });
    });

    req.on("error", (err) => reject(err));
    if (bodyData) req.write(bodyData);
    req.end();
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 1. Fetch top symbols from live ShareSansar scrape or predefined major list
async function getTopSymbols() {
  try {
    const res = await makeRequest("https://www.sharesansar.com/today-share-price");
    const html = res.body;
    const matches = html.match(/href="https:\/\/www\.sharesansar\.com\/company\/([a-zA-Z0-9]+)"/g) || [];
    const syms = [];
    for (const m of matches) {
      const sym = m.split("/company/")[1].replace('"', "").trim().toUpperCase();
      if (sym && !syms.includes(sym) && sym.length <= 12 && sym !== "SYMBOL") {
        syms.push(sym);
      }
    }
    if (syms.length > 0) {
      console.log(`Found ${syms.length} symbols from today-share-price.`);
      return syms.slice(0, 100);
    }
  } catch (e) {
    console.warn("Failed to scrape top symbols, using fallback list:", e.message);
  }

  // Fallback top list
  return [
    "NABIL", "NICA", "GBIME", "ADBL", "HBL", "SBI", "NBL", "EBL", "MBL", "SANIMA",
    "PRVU", "SBL", "NIMB", "SCB", "PCBL", "CZBIL", "NMB", "HIDCL", "NTC", "SHIVM",
    "CHCL", "UPPER", "API", "HDL", "NLIC", "ALICL", "KSBBL", "GBBL", "EDBL", "LBBL",
    "JBBL", "MNBBL", "SHINE", "ACLBSL", "CBBL", "DDBL", "FOWAD", "GILB", "GBLBS", "SMATA",
    "SWBBL", "PLIC", "SICL", "LICN", "UNL", "NLO", "BNT", "SHL", "TRH", "OHL"
  ];
}

// 2. Fetch 200 days for one symbol
async function fetchSymbolHistory(symbol) {
  const compUrl = `https://www.sharesansar.com/company/${encodeURIComponent(symbol)}`;
  const compRes = await makeRequest(compUrl);
  if (compRes.status !== 200) {
    throw new Error(`Company page returned status ${compRes.status}`);
  }

  const html = compRes.body;
  const tokenMatch = html.match(/name=["']_token["']\s+content=["'](.*?)["']/);
  const token = tokenMatch ? tokenMatch[1] : null;

  const idMatch = html.match(/id=["']companyid["'][^>]*>(.*?)</);
  const cid = idMatch ? idMatch[1].trim() : null;

  if (!token || !cid) {
    throw new Error(`Failed to extract CSRF token or companyid for ${symbol}`);
  }

  // Extract cookies from compRes header
  const setCookieHeader = compRes.headers["set-cookie"] || [];
  const cookieStr = Array.isArray(setCookieHeader)
    ? setCookieHeader.map((c) => c.split(";")[0]).join("; ")
    : setCookieHeader.split(";")[0];

  const allRows = [];
  // Paginate 4 times (0, 50, 100, 150) = 200 days
  for (const start of [0, 50, 100, 150]) {
    const postParams = new URLSearchParams({
      company: cid,
      draw: "1",
      start: String(start),
      length: "50",
    }).toString();

    const postRes = await makeRequest(
      "https://www.sharesansar.com/company-price-history",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "X-Requested-With": "XMLHttpRequest",
          "X-CSRF-Token": token,
          Cookie: cookieStr,
        },
      },
      postParams
    );

    if (postRes.status === 200) {
      try {
        const json = JSON.parse(postRes.body);
        if (Array.isArray(json.data) && json.data.length > 0) {
          allRows.push(...json.data);
        }
      } catch (e) {
        console.warn(`JSON parse error on start ${start} for ${symbol}`);
      }
    }
    await sleep(200); // 200ms between page iterations for same symbol
  }

  if (allRows.length === 0) {
    throw new Error(`No historical price rows returned for ${symbol}`);
  }

  // Convert to OHLCEntry sorted ascending by date (oldest to newest)
  const history = allRows
    .map((r) => ({
      date: r.published_date,
      open: parseFloat(String(r.open).replace(/,/g, "")) || 0,
      high: parseFloat(String(r.high).replace(/,/g, "")) || 0,
      low: parseFloat(String(r.low).replace(/,/g, "")) || 0,
      close: parseFloat(String(r.close).replace(/,/g, "")) || 0,
      volume: parseFloat(String(r.traded_quantity).replace(/,/g, "")) || 0,
    }))
    .filter((e) => e.date && !isNaN(e.close) && e.close > 0)
    .sort((a, b) => a.date.localeCompare(b.date));

  return history;
}

// 3. Main runner
async function main() {
  console.log("=== Starting NEPSE Historical Backfill ===");
  const symbols = await getTopSymbols();
  console.log(`Processing ${symbols.length} symbols with 1.5s delay between requests...`);

  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }

  let db = {};
  if (fs.existsSync(CACHE_FILE)) {
    try {
      db = JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));
    } catch (e) {}
  }

  let successCount = 0;
  let failCount = 0;
  const failedSymbols = [];

  for (let i = 0; i < symbols.length; i++) {
    const sym = symbols[i];
    process.stdout.write(`[${i + 1}/${symbols.length}] Fetching ${sym}... `);

    try {
      const history = await fetchSymbolHistory(sym);
      db[sym] = history;
      successCount++;
      console.log(`✅ Success (${history.length} days, latest: ${history[history.length - 1].date})`);

      // Push to Firebase RTDB if connected
      if (adminDb) {
        try {
          await adminDb.ref(`marketHistory/${sym}`).set(history);
        } catch (fbErr) {
          console.warn(`Firebase set error for ${sym}:`, fbErr.message);
        }
      }
    } catch (err) {
      failCount++;
      failedSymbols.push(sym);
      console.log(`❌ Failed: ${err.message}`);
    }

    // Save local JSON after each symbol so progress isn't lost
    fs.writeFileSync(CACHE_FILE, JSON.stringify(db, null, 2), "utf-8");

    // 1.5s delay pacing
    if (i < symbols.length - 1) {
      await sleep(1500);
    }
  }

  console.log("\n=== Backfill Summary ===");
  console.log(`Total Symbols Processed: ${symbols.length}`);
  console.log(`✅ Succeeded: ${successCount}`);
  console.log(`❌ Failed: ${failCount} ${failedSymbols.length > 0 ? "(" + failedSymbols.join(", ") + ")" : ""}`);
  console.log(`Local Cache File: ${CACHE_FILE} (${(fs.statSync(CACHE_FILE).size / 1024 / 1024).toFixed(2)} MB)`);
  if (adminDb) console.log("Firebase RTDB: Updated /marketHistory node successfully.");
}

main().catch(console.error);
