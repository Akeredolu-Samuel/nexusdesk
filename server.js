const fs = require("fs");
const path = require("path");
const express = require("express");
const { Agent } = require("undici");
const { classifyNews, detectCoins, stripHtml } = require("./playbook");

const ipv4Agent = new Agent({
  connections: 10,
  connect: { timeout: 12_000, family: 4 },
  headersTimeout: 45_000,
  bodyTimeout: 120_000
});

const ROOT = __dirname;
loadEnv(path.join(ROOT, ".env"));

const PORT = Number(process.env.PORT) || 3737;
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 NexusDesk/1.0";

const TAPE_COINS = [
  { id: "bitcoin", symbol: "BTC/USDT" },
  { id: "ethereum", symbol: "ETH/USDT" },
  { id: "solana", symbol: "SOL/USDT" },
  { id: "ripple", symbol: "XRP/USDT" },
  { id: "binancecoin", symbol: "BNB/USDT" },
  { id: "dogecoin", symbol: "DOGE/USDT" },
  { id: "cardano", symbol: "ADA/USDT" },
  { id: "avalanche-2", symbol: "AVAX/USDT" },
  { id: "chainlink", symbol: "LINK/USDT" },
  { id: "sui", symbol: "SUI/USDT" },
  { id: "the-open-network", symbol: "TON/USDT" },
  { id: "near", symbol: "NEAR/USDT" },
  { id: "litecoin", symbol: "LTC/USDT" },
  { id: "arbitrum", symbol: "ARB/USDT" },
  { id: "aave", symbol: "AAVE/USDT" },
  { id: "uniswap", symbol: "UNI/USDT" },
  { id: "tron", symbol: "TRX/USDT" },
  { id: "polkadot", symbol: "DOT/USDT" },
  { id: "pepe", symbol: "PEPE/USDT" },
  { id: "dogwifcoin", symbol: "WIF/USDT" }
];

const RSS_WIRES = [
  { source: "Cointelegraph", url: "https://cointelegraph.com/rss" },
  { source: "CoinDesk", url: "https://www.coindesk.com/arc/outboundfeeds/rss/" },
  { source: "Decrypt", url: "https://decrypt.co/feed" },
  { source: "The Block", url: "https://www.theblock.co/rss.xml" }
];

const CRYPTOPANIC_PATHS = [
  (t) => `https://cryptopanic.com/api/growth/v2/posts/?auth_token=${t}&kind=news&public=true`,
  (t) => `https://cryptopanic.com/api/growth_weekly/v2/posts/?auth_token=${t}&kind=news`,
  (t) => `https://cryptopanic.com/api/developer/v2/posts/?auth_token=${t}&kind=news`,
  (t) => `https://cryptopanic.com/api/v1/posts/?auth_token=${t}&public=true&kind=news`,
  (t) => `https://cryptopanic.com/api/enterprise/v2/posts/?auth_token=${t}&kind=news`
];

const cache = {
  news: { at: 0, payload: null },
  tape: { at: 0, payload: null }
};

const app = express();
app.use(express.json({ limit: "200kb" }));
app.use(express.static(path.join(ROOT, "public")));

app.get("/api/boot", (_req, res) => {
  res.json({
    desk: "NEXUS DESK",
    time: new Date().toISOString(),
    cryptopanic: Boolean(process.env.CRYPTOPANIC_TOKEN),
    deepseek: Boolean(process.env.DEEPSEEK_API_KEY),
    port: PORT
  });
});

app.get("/api/news", async (req, res) => {
  try {
    const filter = String(req.query.filter || "all").toLowerCase();
    const force = req.query.refresh === "1";
    const bundle = await getNews(force);
    let items = bundle.items;
    if (filter && filter !== "all") {
      items = items.filter((n) => {
        if (filter === "macro") return n.analog.desk === "MACRO";
        if (filter === "reg") return n.analog.desk === "REG";
        if (filter === "flow") return n.analog.desk === "FLOW";
        if (filter === "credit") return n.analog.desk === "CREDIT";
        if (filter === "hot") return n.analog.confidence >= 64 || n.hot;
        return true;
      });
    }
    res.json({
      ...bundle,
      items,
      filter
    });
  } catch (err) {
    if (cache.news.payload) return res.json({ ...cache.news.payload, stale: true, filter });
    res.status(500).json({ error: friendlyNet(err) });
  }
});

app.get("/api/tape", async (_req, res) => {
  try {
    res.json(await getTape());
  } catch (err) {
    res.status(500).json({ error: err.message || "tape failed" });
  }
});

app.get("/api/impact/:id", async (req, res) => {
  const bundle = cache.news.payload;
  const item = bundle?.items?.find((n) => n.id === req.params.id);
  if (!item) return res.status(404).json({ error: "headline not on the wire" });
  res.json(item);
});

app.post("/api/ask", async (req, res) => {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) {
    return res.status(400).json({
      error: "DeepSeek key missing. Open SETTINGS and paste DEEPSEEK_API_KEY."
    });
  }
  const question = String(req.body?.question || "").trim();
  if (!question) return res.status(400).json({ error: "empty question" });

  const headlines = (cache.news.payload?.items || []).slice(0, 18).map((n) => ({
    time: n.published_at,
    title: n.title,
    analog: n.analog.label,
    coins: n.coins,
    likely: n.analog.likely
  }));

  const messages = [
    {
      role: "system",
      content:
        "You are the senior desk analyst on NEXUS DESK, a crypto/macro terminal. " +
        "Answer like a terse sell-side note: what historically moved, what might move now, direction, and why. " +
        "Never claim certainty. Use the live wire context when relevant. Short paragraphs, pair tickers like BTC/USDT."
    },
    {
      role: "user",
      content:
        `LIVE WIRE CONTEXT:\n${JSON.stringify(headlines, null, 2)}\n\nDESK QUESTION:\n${question}`
    }
  ];

  const body = JSON.stringify({
    model: "deepseek-flash",
    messages,
    stream: true
  });

  let lastErr = "";
  for (let i = 0; i < 3; i++) {
    try {
      const upstream = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
          Accept: "text/event-stream",
          "User-Agent": UA
        },
        body,
        dispatcher: ipv4Agent
      });

      if (!upstream.ok) {
        const text = await upstream.text();
        lastErr = `DeepSeek ${upstream.status}: ${text.slice(0, 280)}`;
        if (upstream.status >= 500 || upstream.status === 429) continue;
        return res.status(upstream.status).json({ error: lastErr });
      }

      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("X-Accel-Buffering", "no");

      const reader = upstream.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const chunks = buffer.split("\n");
        buffer = chunks.pop() || "";
        for (const line of chunks) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const data = trimmed.slice(5).trim();
          if (data === "[DONE]") {
            res.end();
            return;
          }
          try {
            const json = JSON.parse(data);
            const piece = json.choices?.[0]?.delta?.content || "";
            if (piece) res.write(piece);
          } catch {
            /* keep streaming */
          }
        }
      }
      res.end();
      return;
    } catch (err) {
      lastErr = friendlyNet(err);
      await sleep(600 * (i + 1));
    }
  }

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.send(localDeskAnswer(question, lastErr));
});

app.post("/api/settings", (req, res) => {
  const next = {};
  if (typeof req.body?.deepseekKey === "string") {
    process.env.DEEPSEEK_API_KEY = req.body.deepseekKey.trim();
    next.DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
  }
  if (typeof req.body?.cryptopanicToken === "string") {
    process.env.CRYPTOPANIC_TOKEN = req.body.cryptopanicToken.trim();
    next.CRYPTOPANIC_TOKEN = process.env.CRYPTOPANIC_TOKEN;
  }
  persistEnv(next);
  cache.news.at = 0;
  res.json({
    ok: true,
    cryptopanic: Boolean(process.env.CRYPTOPANIC_TOKEN),
    deepseek: Boolean(process.env.DEEPSEEK_API_KEY)
  });
});

app.listen(PORT, () => {
  console.log(`NEXUS DESK  http://localhost:${PORT}`);
});

function loadEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const raw of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i < 0) continue;
    const key = line.slice(0, i).trim();
    let val = line.slice(i + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (key && process.env[key] == null) process.env[key] = val;
  }
}

function persistEnv(updates) {
  const file = path.join(ROOT, ".env");
  const map = {};
  if (fs.existsSync(file)) {
    for (const raw of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
      const i = raw.indexOf("=");
      if (i > 0) map[raw.slice(0, i).trim()] = raw.slice(i + 1);
    }
  }
  for (const [k, v] of Object.entries(updates)) {
    if (v != null) map[k] = v;
  }
  if (!map.PORT) map.PORT = String(PORT);
  const body = Object.entries(map)
    .map(([k, v]) => `${k}=${v}`)
    .join("\n") + "\n";
  fs.writeFileSync(file, body, "utf8");
}

async function getNews(force) {
  const now = Date.now();
  if (!force && cache.news.payload && now - cache.news.at < 45_000) {
    return cache.news.payload;
  }

  const attempts = [];
  let items = [];
  let origin = "WIRE";
  let originDetail = "";

  const token = process.env.CRYPTOPANIC_TOKEN;
  if (token) {
    for (const make of CRYPTOPANIC_PATHS) {
      const url = make(encodeURIComponent(token));
      try {
        const r = await outbound(url, {
          timeoutMs: 8_000,
          headers: { Accept: "application/json" }
        });
        const text = await r.text();
        let json = null;
        try {
          json = JSON.parse(text);
        } catch {
          attempts.push({ url: url.replace(token, "***"), status: r.status, note: "non-json" });
          continue;
        }
        if (Array.isArray(json?.results) && json.results.length) {
          items = json.results.map(fromCryptoPanic);
          origin = "CRYPTOPANIC";
          originDetail = new URL(url).pathname;
          break;
        }
        attempts.push({
          url: new URL(url).pathname,
          status: r.status,
          note: json?.info || json?.status || "empty"
        });
      } catch (err) {
        attempts.push({ note: err.message });
      }
    }
  }

  if (!items.length) {
    const rssItems = await fetchAllRss();
    items = rssItems;
    origin = items.length ? "WIRE" : "EMPTY";
    originDetail = "cryptopanic plan path unavailable; using public news wires";
  }

  items.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
  const seen = new Set();
  items = items.filter((n) => {
    const key = n.title.toLowerCase().slice(0, 80);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 60);

  const payload = {
    origin,
    originDetail,
    attempts,
    updated_at: new Date().toISOString(),
    items
  };
  cache.news = { at: now, payload };
  return payload;
}

function fromCryptoPanic(post) {
  const title = stripHtml(post.title);
  const currencies = (post.currencies || []).map((c) => c.code || c);
  const analog = classifyNews(title, "", post.currencies || []);
  const votes = post.votes || {};
  return {
    id: String(post.id || hash(title)),
    title,
    url: post.url || post.source?.url || "",
    source: post.source?.title || post.source?.domain || "CryptoPanic",
    published_at: post.published_at || post.created_at || new Date().toISOString(),
    kind: post.kind || "news",
    coins: analog.coins.length ? analog.coins : detectCoins(title, currencies),
    hot: Boolean(votes.important > 0 || votes.liked > 3),
    analog
  };
}

async function fetchAllRss() {
  const bags = await Promise.all(
    RSS_WIRES.map(async (wire) => {
      try {
        const r = await outbound(wire.url, {
          timeoutMs: 10_000,
          headers: { Accept: "application/rss+xml, application/xml, text/xml, */*" }
        });
        if (!r.ok) return [];
        const xml = await r.text();
        return parseRss(xml, wire.source);
      } catch {
        return [];
      }
    })
  );
  return bags.flat();
}

function parseRss(xml, source) {
  const chunks = xml.split(/<item[\s>]/i).slice(1);
  return chunks.slice(0, 25).map((chunk, i) => {
    const title = stripHtml(pickTag(chunk, "title"));
    const url = stripHtml(pickTag(chunk, "link")) || stripHtml(pickTag(chunk, "guid"));
    const published = pickTag(chunk, "pubDate") || pickTag(chunk, "dc:date");
    const desc = stripHtml(pickTag(chunk, "description"));
    const analog = classifyNews(title, desc, []);
    return {
      id: hash(`${source}-${title}-${i}`),
      title,
      url,
      source,
      published_at: published ? new Date(published).toISOString() : new Date().toISOString(),
      kind: "news",
      coins: analog.coins,
      hot: analog.confidence >= 70,
      analog
    };
  }).filter((n) => n.title);
}

function pickTag(xml, tag) {
  const re = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m = xml.match(re);
  return (m && (m[1] || m[2]) || "").trim();
}

async function getTape() {
  const now = Date.now();
  if (cache.tape.payload && now - cache.tape.at < 8_000) return cache.tape.payload;

  try {
    const ids = TAPE_COINS.map((c) => c.id).join(",");
    const r = await outbound(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h`,
      { timeoutMs: 12_000, headers: { Accept: "application/json" } }
    );
    if (!r.ok) throw new Error(`tape ${r.status}`);
    const all = await r.json();
    const byId = new Map(all.map((c) => [c.id, c]));
    const rows = TAPE_COINS.map((c) => {
      const row = byId.get(c.id);
      if (!row) return null;
      return {
        symbol: c.symbol,
        last: Number(row.current_price),
        change: Number(row.price_change_percentage_24h),
        volume: Number(row.total_volume)
      };
    }).filter(Boolean);

    const payload = { updated_at: new Date().toISOString(), source: "coingecko", rows };
    cache.tape = { at: now, payload };
    return payload;
  } catch (err) {
    if (cache.tape.payload) return cache.tape.payload;
    throw new Error(friendlyNet(err));
  }
}

async function outbound(url, opts = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), opts.timeoutMs || 12_000);
  try {
    return await fetch(url, {
      method: opts.method || "GET",
      headers: { "User-Agent": UA, ...(opts.headers || {}) },
      body: opts.body,
      signal: ctrl.signal,
      dispatcher: ipv4Agent
    });
  } finally {
    clearTimeout(timer);
  }
}

function friendlyNet(err) {
  const cause = err?.cause;
  const code = cause?.code || err?.code || "";
  if (err?.name === "AbortError" || code === "UND_ERR_CONNECT_TIMEOUT" || code === "ETIMEDOUT") {
    return "connection timed out";
  }
  if (code === "ENOTFOUND" || code === "EAI_AGAIN") return "DNS lookup failed";
  if (code === "ECONNRESET" || code === "ECONNREFUSED") return "connection reset";
  const msg = String(err?.message || "network error");
  if (msg === "fetch failed") return "network failed (DeepSeek/wire unreachable from this PC)";
  return msg;
}

function localDeskAnswer(question, netErr) {
  const analog = classifyNews(question, "", []);
  const hist = (analog.historical || [])
    .map((h) => `- ${h.when}: ${h.analog}\n  ${(h.moved || []).map((m) => `${m.pair} ${m.dir} ${m.range}`).join("; ")}`)
    .join("\n");
  const likely = (analog.likely || [])
    .map((m) => `- ${m.pair} — ${m.bias}. ${m.why}`)
    .join("\n");
  return [
    `LOCAL PLAYBOOK (DeepSeek unreachable: ${netErr || "network error"})`,
    `Match: ${analog.label} (${analog.confidence}%)`,
    "",
    "When this kind of print hit before:",
    hist || "- no analog",
    "",
    "Pairs that might move now:",
    likely || "- BTC/USDT as shock absorber",
    "",
    analog.note
  ].join("\n");
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return `h${Math.abs(h)}`;
}
