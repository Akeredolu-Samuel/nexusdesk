# NEXUS DESK

**Hackathon track:** Trading Infra  
**Live demo:** https://nexusdesk-dun.vercel.app  
**Repo:** https://github.com/Akeredolu-Samuel/nexusdesk  
**Local:** `http://localhost:3737`

A Bloomberg-style crypto news terminal. It does not place trades. It answers the question every desk actually asks when a headline hits:

> When this kind of news printed before, which pairs moved — and which might move now?

---

## 1. Idea (required)

### Why it exists

Crypto “news” is cheap. **Context is not.**

A trader, an intern, or a trading agent gets 40 headlines an hour: CPI, ETF flows, a CEX hack, a listing, a court ruling. The raw title is not the trade. The trade is:

1. What *kind* of event is this?
2. What did BTC, ETH, SOL, and the named token do the last times this happened?
3. What is the *likely* pair to lead in the next 15–60 minutes?

Existing feeds (CryptoPanic, Twitter, Telegram) stop at (1) at best. They do not attach a **historical analog** to a pair list. Agents then either ignore news or overfit the last tweet.

NEXUS DESK is **trading infrastructure for the news → pair step**. Humans use it as a terminal. Agents can call the same JSON APIs (`/api/news`, `/api/ask`) as a signal layer before they size a position.

### Pain point

| Today | With NEXUS DESK |
| --- | --- |
| Scroll headlines, guess the pair | Click a print → analog + pair table |
| Junior sits on Twitter during CPI | Desk maps “hot CPI” → BTC/USDT lead, ETH/SOL high-beta |
| Agent ingest of raw RSS | Structured event type, confidence, historical ranges, likely movers |
| News APIs die or rate-limit | Fallback wire so the desk never goes dark |

This is **not** a strategy that “always longs BTC.” It is a **workflow tool**: classify the print, retrieve the analog, surface the pairs. The human (or agent) still decides size, venue, and whether to fade.

### Core logic

```
headline
  → keyword / phrase match against analog templates
  → detect named coins (BTC, ETH, SOL, XRP, …)
  → score a playbook row (CPI hot, FOMC hawk, ETF flow, hack, listing, …)
  → attach:
       historical events + pair direction + typical range
       “pairs that might move now” + bias + why
  → optional DeepSeek desk note using the live wire as context
```

**Signals used**

- **Sentiment / news:** CryptoPanic (when the plan path works) plus Cointelegraph, CoinDesk, Decrypt, The Block RSS.
- **Macro / event type:** CPI, NFP, FOMC, ETF approve/flow/delay, SEC/DOJ, court wins, hacks, listings, outages, whales, stablecoin depeg, geopolitics, halvings, AI narrative, memes.
- **Tape:** live USD prices and 24h change (CoinGecko) so the analog sits next to the actual book.
- **LLM:** DeepSeek (`deepseek-flash`) as the ASK desk — not the classifier. Classification is deterministic playbook so a judge can replay it.

**How decisions are presented (not executed)**

Each headline gets:

- `desk`: MACRO / FLOW / REG / CREDIT / MICRO / GENERAL
- `confidence`: 28–92 from keyword score
- `historical[]`: dated analog + pairs that moved
- `likely[]`: pair, bias (`SELL THE PRINT`, `HIGH-BETA LONG`, …), one-line why

**Risk (honest)**

- Analogs are **historical playbook, not a fill**. Same CPI print can be faded if already priced.
- Unclassified names fall back to “watch the named pair + BTC as shock absorber.”
- No order routing, no leverage, no auto size. The product **reduces missed context**, not market risk.
- If DeepSeek is down, ASK falls back to the local playbook so the desk still answers.

### Asset class

Spot crypto pairs vs USDT (BTC, ETH, SOL, majors, high-beta alts). Macro templates also mention DXY / real-rate transmission because that is how crypto actually trades on US prints.

---

## 2. Progress

### What is finished

- Percentage **boot screen** (wire + tape + ASK status)
- **WIRE:** live headlines, search/filter, auto-refresh 45s
- **ANALOG:** click a print → pairs that might move now + what moved before
- **ASK:** full-width command bar, DeepSeek stream, local playbook fallback
- **TAPE:** BTC/ETH/SOL and a compact USD strip, 8s refresh
- Server-side keys (never in the browser bundle)
- CryptoPanic with public-wire fallback
- Vercel serverless export (`api/index.js` + `vercel.json`) so `listen()` does not crash the host

### Challenges and how they were solved

| Problem | What we did |
| --- | --- |
| CryptoPanic free `developer` path is gone; token maps to a dead plan | Try growth / weekly / enterprise / v1, then **RSS wires** so the desk still prints |
| Node `fetch failed` to DeepSeek (IPv6 / timeout) | IPv4 undici agent locally, retries, **local analog answer** if the API is unreachable |
| Cloudflare 403 on some CP paths | Browser UA, short timeouts, do not block the wire |
| Vercel: “This page is unavailable / a function needed by this page temporarily failed” | Do not `app.listen` on Vercel; export Express; skip long CP retry chains; keep news under the function budget |
| Binance DNS blocked in some regions | Tape via **CoinGecko** |
| Keyword false positives (`hacked` in an AI research title, `ether` inside `tether`) | Word-boundary match, negative keywords, title-first scoring |
| Secrets in git | `.env` gitignored; Vercel env vars for production |

### Still missing / next

- [ ] Bitget **US Stocks Data API** / tokenized stocks tape (NVDA, TSLA, MSTR) next to crypto — dual-lens
- [ ] Paper-trade log: analog → suggested pair → optional simulated fill (would unlock the Trading Agent track)
- [ ] Webhooks / MCP so an external agent can subscribe to `analog.likely`
- [ ] Richer playbook (quant ranges from actual 1m candles, not only desk memory)
- [ ] Auth-free demo already works; production rate-limit on ASK

### Stack

| Layer | Choice |
| --- | --- |
| Runtime | Node.js 18+ |
| Server | Express 5 |
| UI | Vanilla HTML / CSS / JS (terminal layout, no SPA framework) |
| News | CryptoPanic API, Cointelegraph / CoinDesk / Decrypt / The Block RSS |
| Prices | CoinGecko markets API |
| LLM | DeepSeek Chat Completions (`deepseek-flash`), OpenAI-compatible |
| Host | Local `npm run dev` · Vercel serverless |
| Analog engine | `playbook.js` (deterministic templates) |

### Bitget tools

**Not used in this build:** Agent Hub, Bitget Playbook, MCP Server, Skill Hub, US Stocks Data API.

The word “playbook” in this repo is **our analog book** (`playbook.js`), not Bitget Playbook. Natural next integration is Bitget MCP / US Stocks Data API so the same analog panel can sit on tokenized US names.

---

## 3. AI trading thoughts (optional)

News is the noisiest feature in agentic trading. If you give an LLM the raw wire, it hallucinates pair direction. If you give it **a small, inspectable analog table** first, the model writes a desk note instead of a story.

That is the bet: **structure before the model.** DeepSeek is the commentator. The playbook is the risk-visible object a judge (or a compliance officer) can read.

Agentic trading will not be “one prompt, one order.” It will be terminals like this: ingest, classify, analog, human or policy gate, then venue. NEXUS DESK is the first three boxes.

---

## 4. How to run

### Local

```bash
git clone https://github.com/Akeredolu-Samuel/nexusdesk.git
cd nexusdesk
npm install
copy .env.example .env
```

Put keys in `.env`:

```
PORT=3737
CRYPTOPANIC_TOKEN=your_cryptopanic_token
DEEPSEEK_API_KEY=your_deepseek_key
```

```bash
npm run dev
```

Open http://localhost:3737

- **WIRE** — headlines  
- **ANALOG** — click a headline  
- **ASK** — type at the bottom, Enter  

DeepSeek key: https://platform.deepseek.com  
CryptoPanic: https://cryptopanic.com/developers/api/

Without DeepSeek, ASK still answers from the local playbook.

### Vercel

Set `CRYPTOPANIC_TOKEN` and `DEEPSEEK_API_KEY` under **Settings → Environment Variables**, then redeploy. The ⚙ panel cannot persist `.env` on Vercel (read-only disk).

---

## Project layout

```
api/index.js          Vercel entry (exports Express app)
server.js             Wire, tape, ASK, static UI
playbook.js           Analog templates + classifier
public/               Terminal UI
docs/sample-io.md     Sample classifier + API I/O for judges
vercel.json           Serverless routes
.env.example          Keys template (do not commit .env)
```

### API

| Method | Path | Role |
| --- | --- | --- |
| GET | `/api/boot` | Keys present? |
| GET | `/api/news` | Classified wire (`?refresh=1`) |
| GET | `/api/tape` | USD last + 24h % |
| POST | `/api/ask` | DeepSeek stream or local analog |
| POST | `/api/settings` | Local key save only |

---

## Submission links

**Track:** Trading Infra  

| Material | Link |
| --- | --- |
| GitHub | https://github.com/Akeredolu-Samuel/nexusdesk |
| README (this file) | https://github.com/Akeredolu-Samuel/nexusdesk/blob/main/README.md |
| Live demo (no login) | https://nexusdesk-dun.vercel.app |
| Sample I/O / run records | [docs/sample-io.md](docs/sample-io.md) |

This is infrastructure, not a live bot, so there is no exchange fill log. Usage is the live demo plus the sample I/O file.

---

Playbook output is research context, not financial advice.
