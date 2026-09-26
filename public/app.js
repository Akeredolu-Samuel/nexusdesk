const boot = document.getElementById("boot");
const bootPct = document.getElementById("boot-pct");
const bootFill = document.getElementById("boot-fill");
const bootLog = document.getElementById("boot-log");
const newsList = document.getElementById("news-list");
const analogBody = document.getElementById("analog-body");
const analogConf = document.getElementById("analog-conf");
const ticker = document.getElementById("ticker");
const askLog = document.getElementById("ask-log");
const askForm = document.getElementById("ask-form");
const askInput = document.getElementById("ask-input");
const clockEl = document.getElementById("clock");
const aiPill = document.getElementById("ai-pill");
const newsMeta = document.getElementById("news-meta");
const newsSearch = document.getElementById("news-search");

let selectedId = null;
let items = [];
let asking = false;
let query = "";

function setPct(n) {
  const v = Math.max(0, Math.min(100, Math.round(n)));
  bootPct.textContent = String(v).padStart(2, "0") + "%";
  bootFill.style.width = v + "%";
}

function logBoot(msg, cls) {
  const li = document.createElement("li");
  li.textContent = "> " + msg;
  if (cls) li.className = cls;
  bootLog.appendChild(li);
}

function fmtTime(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "--:--";
  return d.toISOString().slice(11, 16);
}

function dirClass(dir) {
  if (dir === "up") return "dir-up";
  if (dir === "down") return "dir-down";
  return "dir-chop";
}

function tickClock() {
  clockEl.textContent = new Date().toISOString().slice(11, 19);
}

async function bootSequence() {
  setPct(8);
  logBoot("mounting desk");
  const bootInfo = await fetch("/api/boot").then((r) => r.json());
  setPct(28);
  setAi(bootInfo.deepseek);
  logBoot(bootInfo.deepseek ? "ask online" : "ask offline — set key in ⚙", bootInfo.deepseek ? "ok" : "bad");
  setPct(50);
  try { await loadNews(true); } catch (err) { logBoot("wire: " + err.message, "bad"); }
  setPct(78);
  try { await loadTape(); } catch (err) { logBoot("tape: " + err.message, "bad"); }
  setPct(100);
  logBoot("live", "ok");
  await sleep(200);
  boot.classList.add("off");
  askInput.focus();
}

function setAi(on) {
  aiPill.textContent = "ASK";
  aiPill.classList.toggle("off", !on);
  aiPill.title = on ? "DeepSeek on" : "DeepSeek key missing";
}

async function loadNews(force) {
  const data = await fetch("/api/news?filter=all" + (force ? "&refresh=1" : "")).then((r) => r.json());
  items = data.items || [];
  newsMeta.textContent = String(items.length);
  renderNews();
  if (selectedId) {
    const still = items.find((n) => n.id === selectedId);
    if (still) renderAnalog(still);
  } else if (items[0]) {
    selectItem(items[0].id);
  }
}

function visibleItems() {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter((n) =>
    (n.title + " " + n.source + " " + (n.analog?.label || "") + " " + (n.coins || []).join(" "))
      .toLowerCase()
      .includes(q)
  );
}

function renderNews() {
  newsList.innerHTML = "";
  for (const n of visibleItems()) {
    const btn = document.createElement("button");
    btn.className = "news-item" + (n.id === selectedId ? " sel" : "");
    btn.type = "button";
    btn.innerHTML = `
      <div class="t">${fmtTime(n.published_at)}</div>
      <div class="ttl">${esc(n.title)}</div>
      <div class="tag">${esc(n.analog.desk)}</div>`;
    btn.addEventListener("click", () => selectItem(n.id));
    newsList.appendChild(btn);
  }
}

function selectItem(id) {
  selectedId = id;
  const n = items.find((x) => x.id === id);
  renderNews();
  if (n) renderAnalog(n);
}

function renderAnalog(n) {
  const a = n.analog;
  analogConf.textContent = a.confidence + "%";
  const thenRows = (a.historical || []).flatMap((h) =>
    (h.moved || []).map((m) => `
      <tr>
        <td>${esc(m.pair)}</td>
        <td class="${dirClass(m.dir)}">${esc((m.dir || "").toUpperCase())} ${esc(m.range || "")}</td>
        <td>${esc(h.when)}</td>
      </tr>`)
  ).join("");
  analogBody.innerHTML = `
    <div class="kicker">${esc(n.source)} · ${esc(fmtTime(n.published_at))}</div>
    <h3>${esc(a.label)}</h3>
    <p class="headline">${esc(n.title)}</p>
    <table class="pairs">
      <thead><tr><th>PAIR</th><th>NOW</th><th></th></tr></thead>
      <tbody>
        ${(a.likely || []).map((m) => `
          <tr>
            <td>${esc(m.pair)}</td>
            <td class="dir-chop">${esc(m.bias)}</td>
            <td>${esc(m.why)}</td>
          </tr>`).join("")}
      </tbody>
    </table>
    <p class="hist-note">When this kind of print hit before</p>
    <table class="pairs">
      <thead><tr><th>PAIR</th><th>THEN</th><th>EVENT</th></tr></thead>
      <tbody>${thenRows || "<tr><td colspan='3'>No analog on file</td></tr>"}</tbody>
    </table>
    ${n.url ? `<p><a class="source-link" href="${esc(n.url)}" target="_blank" rel="noopener">source</a></p>` : ""}
  `;
}

async function loadTape() {
  const data = await fetch("/api/tape").then((r) => r.json());
  ticker.innerHTML = (data.rows || []).slice(0, 12).map((row) => {
    const ch = Number(row.change) || 0;
    const up = ch >= 0;
    return `<span class="tick"><span class="sym">${esc(row.symbol.replace("/USDT", ""))}</span>
      <span>${fmtPx(row.last)}</span>
      <span class="${up ? "up" : "dn"}">${up ? "+" : ""}${ch.toFixed(1)}%</span></span>`;
  }).join("");
}

function fmtPx(n) {
  if (n >= 1000) return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
  if (n >= 1) return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
  return n.toPrecision(3);
}

askForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (asking) return;
  const q = askInput.value.trim();
  if (!q) return;
  asking = true;
  askInput.value = "";
  askLog.classList.add("open");
  const wrap = document.createElement("div");
  wrap.innerHTML = `<div class="q">▸ ${esc(q)}</div>`;
  const a = document.createElement("div");
  a.className = "a";
  a.textContent = "…";
  wrap.appendChild(a);
  askLog.appendChild(wrap);
  askLog.scrollTop = askLog.scrollHeight;
  try {
    const res = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: q })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      a.textContent = friendly(err.error || "ask failed");
      return;
    }
    a.textContent = "";
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      a.textContent += decoder.decode(value, { stream: true });
      askLog.scrollTop = askLog.scrollHeight;
    }
    if (!a.textContent) a.textContent = "(empty)";
  } catch (err) {
    a.textContent = friendly(err.message);
  } finally {
    asking = false;
  }
});

newsSearch.addEventListener("input", () => {
  query = newsSearch.value;
  renderNews();
});

const settings = document.getElementById("settings");
document.getElementById("settings-btn").addEventListener("click", () => {
  settings.hidden = false;
});
document.getElementById("settings-cancel").addEventListener("click", () => {
  settings.hidden = true;
});
document.getElementById("settings-save").addEventListener("click", async () => {
  const body = {};
  const ds = document.getElementById("ds-key").value.trim();
  const cp = document.getElementById("cp-key").value.trim();
  if (ds) body.deepseekKey = ds;
  if (cp) body.cryptopanicToken = cp;
  const r = await fetch("/api/settings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  }).then((x) => x.json());
  setAi(r.deepseek);
  settings.hidden = true;
  document.getElementById("ds-key").value = "";
  document.getElementById("cp-key").value = "";
});

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function friendly(msg) {
  const s = String(msg || "");
  if (s === "Failed to fetch" || s === "fetch failed" || s === "NetworkError when attempting to fetch resource.") {
    return "Desk unreachable. Is npm run dev still up?";
  }
  return s;
}

tickClock();
setInterval(tickClock, 1000);
setInterval(() => loadNews(false).catch(() => {}), 45_000);
setInterval(() => loadTape().catch(() => {}), 8_000);
bootSequence().catch((err) => {
  logBoot(err.message, "bad");
  setPct(100);
  setTimeout(() => boot.classList.add("off"), 1000);
});
