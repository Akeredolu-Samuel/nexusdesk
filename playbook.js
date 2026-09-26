const COIN_ALIASES = [
  { code: "BTC", names: ["bitcoin", "btc", "saylor", "microstrategy", "ibit", "spot etf"] },
  { code: "ETH", names: ["ethereum", "ether", "eth", "vitalik"] },
  { code: "SOL", names: ["solana", "sol"] },
  { code: "XRP", names: ["ripple", "xrp"] },
  { code: "BNB", names: ["binance coin", "bnb"] },
  { code: "DOGE", names: ["dogecoin", "doge"] },
  { code: "ADA", names: ["cardano", "ada"] },
  { code: "AVAX", names: ["avalanche", "avax"] },
  { code: "LINK", names: ["chainlink", "link"] },
  { code: "SUI", names: ["sui"] },
  { code: "TON", names: ["toncoin", "ton"] },
  { code: "NEAR", names: ["near protocol", "near"] },
  { code: "DOT", names: ["polkadot", "dot"] },
  { code: "LTC", names: ["litecoin", "ltc"] },
  { code: "ARB", names: ["arbitrum", "arb"] },
  { code: "OP", names: ["optimism"] },
  { code: "PEPE", names: ["pepe"] },
  { code: "WIF", names: ["dogwifhat", "wif"] },
  { code: "AAVE", names: ["aave"] },
  { code: "UNI", names: ["uniswap", "uni"] },
  { code: "TRX", names: ["tron", "trx"] },
  { code: "ATOM", names: ["cosmos", "atom"] },
  { code: "APT", names: ["aptos", "apt"] },
  { code: "HYPE", names: ["hyperliquid", "hype"] },
  { code: "TAO", names: ["bittensor", "tao"] }
];

const TEMPLATES = [
  {
    id: "cpi-hot",
    label: "HOTTER CPI / INFLATION BEAT",
    desk: "MACRO",
    keywords: ["cpi hotter", "cpi beat", "inflation higher", "inflation rose", "core cpi", "hotter-than-expected", "inflation surprise"],
    historical: [
      {
        when: "2022-06-10",
        analog: "US CPI printed 8.6% vs 8.3% expected",
        moved: [
          { pair: "BTC/USDT", dir: "down", range: "-6% to -12% same session" },
          { pair: "ETH/USDT", dir: "down", range: "-8% to -14%" },
          { pair: "SOL/USDT", dir: "down", range: "-10% to -18%" },
          { pair: "DXY", dir: "up", range: "dollar bid, risk-off" }
        ]
      },
      {
        when: "2023-02-14",
        analog: "January CPI hotter than street",
        moved: [
          { pair: "BTC/USDT", dir: "down", range: "-4% to -7% into print" },
          { pair: "ETH/USDT", dir: "down", range: "high-beta follow" }
        ]
      }
    ],
    likely: [
      { pair: "BTC/USDT", bias: "SELL THE PRINT", why: "Real-rate shock historically dumps BTC first." },
      { pair: "ETH/USDT", bias: "FOLLOW BTC", why: "ETH beta > 1 vs BTC on CPI misses." },
      { pair: "SOL/USDT", bias: "HIGH-BETA DUMP", why: "Alts overshoot BTC on macro surprises." }
    ]
  },
  {
    id: "cpi-cool",
    label: "COOLER CPI / DISINFLATION",
    desk: "MACRO",
    keywords: ["cpi cooler", "cpi miss", "inflation cooled", "inflation slowed", "below forecast", "disinflation", "softer cpi"],
    historical: [
      {
        when: "2023-11-14",
        analog: "October CPI 3.2% vs 3.3% expected — pivot bid",
        moved: [
          { pair: "BTC/USDT", dir: "up", range: "+5% to +9% into close" },
          { pair: "ETH/USDT", dir: "up", range: "+6% to +11%" },
          { pair: "SOL/USDT", dir: "up", range: "+8% to +15%" }
        ]
      }
    ],
    likely: [
      { pair: "BTC/USDT", bias: "RISK-ON BID", why: "Cooler inflation = easier Fed path, BTC catches the dollar fade." },
      { pair: "ETH/USDT", bias: "OUTPERFORM", why: "Duration-sensitive alts lead on disinflation days." },
      { pair: "SOL/USDT", bias: "HIGH-BETA LONG", why: "Same tape as Nov 2023 — SOL stretches more than BTC." }
    ]
  },
  {
    id: "fomc-hawk",
    label: "HAWKISH FOMC / HIGHER FOR LONGER",
    desk: "MACRO",
    keywords: ["hawkish", "higher for longer", "rate hike", "no cut", "restrictive", "dot plot", "fomc", "fed holds", "powell hawkish"],
    historical: [
      {
        when: "2022-06-15",
        analog: "Fed 75bp hike, BTC flushed into mid-20ks later that month",
        moved: [
          { pair: "BTC/USDT", dir: "down", range: "-3% event, -20% into month" },
          { pair: "ETH/USDT", dir: "down", range: "wider than BTC" }
        ]
      },
      {
        when: "2023-03-22",
        analog: "Post-SVB hike still delivered — vol crush then bounce",
        moved: [
          { pair: "BTC/USDT", dir: "chop", range: "whipsaw ±5% around decision" }
        ]
      }
    ],
    likely: [
      { pair: "BTC/USDT", bias: "VOLATILE / FADE RALLY", why: "Hawkish dots usually fade the pre-FOMC squeeze." },
      { pair: "ETH/USDT", bias: "UNDERPERFORM BTC", why: "Funding-sensitive names sell first." }
    ]
  },
  {
    id: "fomc-dove",
    label: "DOVISH FED / CUTS / PIVOT",
    desk: "MACRO",
    keywords: ["dovish", "rate cut", "pivot", "easing", "pause", "powell dovish", "fed cut"],
    historical: [
      {
        when: "2023-12-13",
        analog: "Dot plot showed 2024 cuts — risk ripped",
        moved: [
          { pair: "BTC/USDT", dir: "up", range: "+3% to +7% session" },
          { pair: "ETH/USDT", dir: "up", range: "+4% to +9%" },
          { pair: "SOL/USDT", dir: "up", range: "high-beta melt-up" }
        ]
      },
      {
        when: "2024-09-18",
        analog: "First 50bp cut — crypto bid into the print, mixed after",
        moved: [
          { pair: "BTC/USDT", dir: "up", range: "buy the rumor, sell the news into +2/-3%" }
        ]
      }
    ],
    likely: [
      { pair: "BTC/USDT", bias: "BID LIQUIDITY", why: "Dovish Fed historically is the cleanest BTC tailwind after 2023." },
      { pair: "ETH/USDT", bias: "FOLLOW / STRETCH", why: "ETH catches up if real yields drop." },
      { pair: "SOL/USDT", bias: "HIGH-BETA LONG", why: "Alts outperform on liquidity impulse." }
    ]
  },
  {
    id: "nfp-jobs",
    label: "PAYROLLS / LABOR PRINT",
    desk: "MACRO",
    keywords: ["nonfarm", "nfp", "payrolls", "unemployment", "jobs report", "jobless"],
    historical: [
      {
        when: "recurring",
        analog: "Hot NFP = dollar bid / BTC dip. Weak NFP = cut odds up / BTC bid.",
        moved: [
          { pair: "BTC/USDT", dir: "chop", range: "±2% to ±6% around 12:30 UTC print" },
          { pair: "ETH/USDT", dir: "chop", range: "follows BTC with extra beta" }
        ]
      }
    ],
    likely: [
      { pair: "BTC/USDT", bias: "TRADE THE SURPRISE", why: "Direction is the miss vs consensus, not the headline number." },
      { pair: "ETH/USDT", bias: "AMPLIFY BTC", why: "Labor shocks travel through BTC then ETH." }
    ]
  },
  {
    id: "etf-approve",
    label: "SPOT ETF APPROVAL / FILING WIN",
    desk: "FLOW",
    keywords: ["etf approved", "spot etf", "sec approves", "etf approval", "19b-4", "s-1 approved"],
    historical: [
      {
        when: "2024-01-10",
        analog: "Spot BTC ETFs approved — sell-the-news then multi-month grind to ATH",
        moved: [
          { pair: "BTC/USDT", dir: "down", range: "-10% week of approval, then +50% into March" },
          { pair: "ETH/USDT", dir: "up", range: "lagged then caught a bid on ETH-ETF odds" }
        ]
      },
      {
        when: "2024-05-23",
        analog: "Spot ETH ETFs approved in principle",
        moved: [
          { pair: "ETH/USDT", dir: "up", range: "+20% into decision, faded after" },
          { pair: "BTC/USDT", dir: "up", range: "sympathy bid" }
        ]
      }
    ],
    likely: [
      { pair: "BTC/USDT", bias: "VOL EVENT", why: "Approvals are sold first, accumulated after flow prints." },
      { pair: "ETH/USDT", bias: "IF ETH-SPECIFIC, LEAD", why: "ETH ETFs moved ETH more than BTC on the day." }
    ]
  },
  {
    id: "etf-flow",
    label: "ETF FLOW PRINT (IN / OUT)",
    desk: "FLOW",
    keywords: ["etf inflow", "etf outflow", "ibit", "fbtc", "etf flows", "blackrock bitcoin", "net inflow", "net outflow"],
    historical: [
      {
        when: "2024-11 / 2025 cluster",
        analog: "Multi-day $1B+ IBIT inflows coincided with BTC breakouts",
        moved: [
          { pair: "BTC/USDT", dir: "up", range: "persistent bid, +3% to +8% over flow days" },
          { pair: "ETH/USDT", dir: "up", range: "lags BTC unless ETH ETFs also print" }
        ]
      },
      {
        when: "2024-04",
        analog: "First large outflow cluster after GBTC bleed",
        moved: [
          { pair: "BTC/USDT", dir: "down", range: "-8% to -15% into local low" }
        ]
      }
    ],
    likely: [
      { pair: "BTC/USDT", bias: "FOLLOW THE FLOW", why: "Spot ETF tape is the cleanest 2024-26 BTC driver." },
      { pair: "ETH/USDT", bias: "SECONDARY", why: "Moves if ETH products print, else beta only." }
    ]
  },
  {
    id: "sec-lawsuit",
    label: "SEC / DOJ ENFORCEMENT",
    desk: "REG",
    keywords: ["sec sues", "sec charges", "lawsuit", "unregistered", "wells notice", "enforcement", "doj charges", "securities"],
    historical: [
      {
        when: "2023-06-05",
        analog: "SEC sued Binance + Coinbase in the same week",
        moved: [
          { pair: "BNB/USDT", dir: "down", range: "-8% to -15%" },
          { pair: "BTC/USDT", dir: "down", range: "-4% to -8%" },
          { pair: "SOL/USDT", dir: "down", range: "named-token overshoot" },
          { pair: "XRP/USDT", dir: "chop", range: "Ripple case already priced" }
        ]
      },
      {
        when: "2020-12-22",
        analog: "SEC vs Ripple",
        moved: [
          { pair: "XRP/USDT", dir: "down", range: "-50%+ off listings" }
        ]
      }
    ],
    likely: [
      { pair: "NAMED TOKEN/USDT", bias: "DUMP THE NAME", why: "The sued venue or token always leads the red." },
      { pair: "BTC/USDT", bias: "RISK-OFF DIP", why: "Sector tax, usually recovered unless it's an exchange solvency story." }
    ]
  },
  {
    id: "court-win",
    label: "COURT WIN / REGULATORY CLARITY",
    desk: "REG",
    keywords: ["court rules", "not a security", "dismissed", "legal victory", "judge rules", "partial win"],
    negative: ["failed vote", "fizzles", "rules against"],
    historical: [
      {
        when: "2023-07-13",
        analog: "Ripple partial win vs SEC — XRP not a security on exchanges",
        moved: [
          { pair: "XRP/USDT", dir: "up", range: "+70% to +100% in 24h" },
          { pair: "BTC/USDT", dir: "up", range: "sympathy +3%" },
          { pair: "ADA/USDT", dir: "up", range: "other named alts bid" }
        ]
      }
    ],
    likely: [
      { pair: "NAMED TOKEN/USDT", bias: "VIOLENT SQUEEZE", why: "Legal wins on liquid alts are the biggest one-day movers in the book." },
      { pair: "BTC/USDT", bias: "MILD BID", why: "Sector relief, not the trade." }
    ]
  },
  {
    id: "hack",
    label: "EXCHANGE / PROTOCOL HACK",
    desk: "CREDIT",
    keywords: ["hacked", "exploit", "breach", "drained", "stolen", "bridge hack", "hot wallet", "withdrawals suspended"],
    negative: ["test environment", "ai agent", "study", "research"],
    historical: [
      {
        when: "2022-08-02",
        analog: "Nomad bridge exploit",
        moved: [
          { pair: "NAMED TOKEN/USDT", dir: "down", range: "-20% to -80% if supply hit" }
        ]
      },
      {
        when: "2025-02 Bybit-style desk hacks",
        analog: "Large CEX hot-wallet drain — BTC dipped, recovered as funds traced",
        moved: [
          { pair: "BTC/USDT", dir: "down", range: "-3% to -8% risk-off" },
          { pair: "ETH/USDT", dir: "down", range: "if ETH was the stolen asset, extra pressure" }
        ]
      }
    ],
    likely: [
      { pair: "NAMED TOKEN/USDT", bias: "SELL FIRST", why: "Token of hacked venue/protocol reprices insolvency risk immediately." },
      { pair: "BTC/USDT", bias: "DIP THEN RECOVER", why: "Systemic only if size > $1B or a top-5 CEX." },
      { pair: "ETH/USDT", bias: "IF ETH STOLEN, LEAD DOWN", why: "Stolen inventory hits bids on the stolen asset." }
    ]
  },
  {
    id: "listing",
    label: "MAJOR CEX LISTING",
    desk: "MICRO",
    keywords: ["lists", "listing", "will list", "binance lists", "coinbase adds", "upbit", "listed on"],
    historical: [
      {
        when: "recurring 2021-2025",
        analog: "Binance/Coinbase listing pumps — buy rumor, fade the tweet",
        moved: [
          { pair: "NAMED TOKEN/USDT", dir: "up", range: "+15% to +80% into listing, often give-back 30-50%" }
        ]
      }
    ],
    likely: [
      { pair: "NAMED TOKEN/USDT", bias: "MOMENTUM THEN FADE", why: "Listings are the most reliable one-token spike in the playbook." }
    ]
  },
  {
    id: "outage",
    label: "CHAIN / CEX OUTAGE",
    desk: "MICRO",
    keywords: ["outage", "halted", "stopped producing blocks", "network down", "degraded", "congestion", "offline"],
    historical: [
      {
        when: "2022-2024 Solana outage cluster",
        analog: "SOL down 5-12% into halt, recovered after restart",
        moved: [
          { pair: "SOL/USDT", dir: "down", range: "-5% to -12%" },
          { pair: "BTC/USDT", dir: "flat", range: "usually isolated" }
        ]
      }
    ],
    likely: [
      { pair: "NAMED TOKEN/USDT", bias: "ISOLATED DUMP", why: "Outages reprice reliability, not the whole market — unless it's Ethereum." }
    ]
  },
  {
    id: "whale",
    label: "WHALE / TREASURY MOVE",
    desk: "FLOW",
    keywords: ["whale", "transferred", "moved to binance", "moved to coinbase", "unlock", "treasury sold", "mt. gox", "mt gox", "germany sold"],
    historical: [
      {
        when: "2024-05 Germany / Mt. Gox overhang",
        analog: "Government and estate BTC hitting bids",
        moved: [
          { pair: "BTC/USDT", dir: "down", range: "multi-week -15% to -20% into $56k" }
        ]
      }
    ],
    likely: [
      { pair: "BTC/USDT", bias: "IF BTC ON THE MOVE TO CEX, CAUTION", why: "Exchange deposits historically precede sell pressure. Wallet-to-wallet is noise." },
      { pair: "NAMED TOKEN/USDT", bias: "WATCH UNLOCKS", why: "Cliff unlocks dump the specific name, not BTC." }
    ]
  },
  {
    id: "stablecoin",
    label: "STABLECOIN DEPEG / ISSUER RISK",
    desk: "CREDIT",
    keywords: ["depeg", "usdc", "usdt", "tether", "circle", "terra", "ust", "stablecoin"],
    historical: [
      {
        when: "2022-05-09",
        analog: "UST depeg → LUNA wipe → BTC -$20k in weeks",
        moved: [
          { pair: "LUNA/USDT", dir: "down", range: "-99%" },
          { pair: "BTC/USDT", dir: "down", range: "-30% cascade" },
          { pair: "USDT/USD", dir: "chop", range: "brief premium as flight-to-Tether" }
        ]
      },
      {
        when: "2023-03-11",
        analog: "USDC depeg after SVB",
        moved: [
          { pair: "USDC", dir: "down", range: "to $0.87" },
          { pair: "BTC/USDT", dir: "down", range: "-10% then V-recover after weekend" }
        ]
      }
    ],
    likely: [
      { pair: "BTC/USDT", bias: "RISK-OFF IF DEPEG > 100BPS", why: "Stablecoin breaks are systemic. Tiny Tether FUD is usually a fade." },
      { pair: "ETH/USDT", bias: "DEFI BLEED", why: "DeFi TVL names (AAVE, MKR historically) overshoot." }
    ]
  },
  {
    id: "geopolitics",
    label: "WAR / TARIFF / SANCTIONS SHOCK",
    desk: "MACRO",
    keywords: ["missile", "invasion", "tariff", "sanctions", "iran", "israel", "taiwan", "oil spike", "airstrike", "ceasefire", "war"],
    negative: ["etf", "listing", "hack"],
    historical: [
      {
        when: "2022-02-24",
        analog: "Russia invaded Ukraine — BTC spiked then dumped",
        moved: [
          { pair: "BTC/USDT", dir: "up", range: "knee-jerk +8% then -20% into March" }
        ]
      },
      {
        when: "2025 tariff / Mideast clusters",
        analog: "Risk-off into dollar and gold, crypto traded as high-beta Nasdaq",
        moved: [
          { pair: "BTC/USDT", dir: "down", range: "-3% to -8% risk-off sessions" }
        ]
      }
    ],
    likely: [
      { pair: "BTC/USDT", bias: "KNEE-JERK THEN TREND WITH NASDAQ", why: "BTC is not a consistent war hedge after 2022. Trade it as liquidity." },
      { pair: "ETH/USDT", bias: "MORE FRAGILE", why: "Alts do worse than BTC on geopolitics." }
    ]
  },
  {
    id: "legislation",
    label: "US CRYPTO BILL / CLARITY",
    desk: "REG",
    keywords: ["clarity act", "fit21", "genius act", "market structure", "house vote", "senate vote"],
    historical: [
      {
        when: "2024-05-22",
        analog: "FIT21 passed the House — BTC/ETH bid on US regulatory path",
        moved: [
          { pair: "BTC/USDT", dir: "up", range: "+2% to +5% session" },
          { pair: "ETH/USDT", dir: "up", range: "ETH often leads on US market-structure bills" }
        ]
      }
    ],
    likely: [
      { pair: "BTC/USDT", bias: "POLICY BID / FADE FAIL", why: "Passage is a sector bid. A failed vote is usually a one-day fade, not a regime change." },
      { pair: "ETH/USDT", bias: "IF MARKET-STRUCTURE, LEAD", why: "ETH is the main 'security vs commodity' football in these bills." }
    ]
  },
  {
    id: "etf-reject",
    label: "ETF DELAY / REJECTION",
    desk: "FLOW",
    keywords: ["etf delayed", "etf rejected", "sec delays", "denied etf", "postponed"],
    historical: [
      {
        when: "2023-03 / multiple Grayscale windows",
        analog: "Deadline delays faded BTC 2-5%",
        moved: [
          { pair: "BTC/USDT", dir: "down", range: "-2% to -6%" }
        ]
      }
    ],
    likely: [
      { pair: "BTC/USDT", bias: "FADE THE NAME", why: "Delay is a positioning flush, not a thesis change after 2024 approvals." }
    ]
  },
  {
    id: "halving",
    label: "HALVING / SUPPLY SHOCK",
    desk: "FLOW",
    keywords: ["halving", "halved", "block reward"],
    historical: [
      {
        when: "2024-04-20",
        analog: "Fourth BTC halving — sold into the event, higher 6 months later",
        moved: [
          { pair: "BTC/USDT", dir: "down", range: "sell-the-news week, then grind" },
          { pair: "ETH/USDT", dir: "down", range: "beta dump with BTC" }
        ]
      }
    ],
    likely: [
      { pair: "BTC/USDT", bias: "EVENT FADE, TREND LONG", why: "Halvings are priced into the month, not the hour." }
    ]
  },
  {
    id: "ai-narrative",
    label: "AI / NARRATIVE ROTATION",
    desk: "MICRO",
    keywords: ["ai agent", "artificial intelligence", "nvidia", "openai", "bittensor", "render", "ai token"],
    historical: [
      {
        when: "2024 Q1 AI bid",
        analog: "TAO/RNDR/FET ripped on NVIDIA and AI headlines",
        moved: [
          { pair: "TAO/USDT", dir: "up", range: "+10% to +30% headline days" },
          { pair: "BTC/USDT", dir: "flat", range: "often uncorrelated" }
        ]
      }
    ],
    likely: [
      { pair: "TAO/USDT", bias: "NARRATIVE BETA", why: "AI headlines go to TAO/RENDER first, not BTC." },
      { pair: "NEAR/USDT", bias: "SECONDARY AI", why: "Catches a bid if the tape is broad." }
    ]
  },
  {
    id: "memecoin",
    label: "MEME / VIRAL / CELEBRITY",
    desk: "MICRO",
    keywords: ["meme", "elon", "trump coin", "viral", "tiktok", "celebrity"],
    historical: [
      {
        when: "2024-2025 meme seasons",
        analog: "Celebrity coins pumped 10-100x then bled 80%+",
        moved: [
          { pair: "PEPE/USDT", dir: "up", range: "tape-wide meme beta" },
          { pair: "WIF/USDT", dir: "up", range: "Solana meme beta" },
          { pair: "SOL/USDT", dir: "up", range: "SOL catches meme flow" }
        ]
      }
    ],
    likely: [
      { pair: "SOL/USDT", bias: "IF SOL MEME, BID SOL", why: "Meme volume historically lifts SOL more than BTC." },
      { pair: "NAMED TOKEN/USDT", bias: "ONLY IF YOU CAN EXIT", why: "These are not analog-quality trades past the first hour." }
    ]
  }
];

function stripHtml(s) {
  return String(s || "")
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function detectCoins(text, currencies) {
  const found = new Set();
  (currencies || []).forEach((c) => {
    const code = String(c.code || c).toUpperCase();
    if (code) found.add(code);
  });
  const t = String(text || "");
  for (const coin of COIN_ALIASES) {
    if (found.has(coin.code)) continue;
    if (coin.names.some((n) => hasPhrase(t, n))) found.add(coin.code);
  }
  return [...found];
}

function pairFor(code) {
  if (code === "NAMED TOKEN") return "NAMED TOKEN/USDT";
  return `${code}/USDT`;
}

function resolveNamed(entries, coins) {
  const primary = coins[0];
  return entries.map((e) => {
    const pair = e.pair.includes("NAMED TOKEN") && primary
      ? pairFor(primary)
      : e.pair;
    return { ...e, pair, named: e.pair.includes("NAMED TOKEN") };
  });
}

function hasPhrase(hay, phrase) {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\\ /g, "\\s+");
  return new RegExp(`\\b${escaped}\\b`, "i").test(hay);
}

function scoreTemplate(tpl, hay) {
  let score = 0;
  for (const kw of tpl.keywords) {
    if (hasPhrase(hay, kw)) score += kw.length > 10 ? 3 : 2;
  }
  for (const kw of tpl.negative || []) {
    if (hasPhrase(hay, kw)) score -= 5;
  }
  return score;
}

function classifyNews(title, body, currencies) {
  const titleText = String(title || "");
  const text = `${titleText} ${body || ""}`;
  const hayTitle = titleText.toLowerCase();
  const coins = detectCoins(text, currencies);

  let best = null;
  let bestScore = 0;
  for (const tpl of TEMPLATES) {
    const score = scoreTemplate(tpl, hayTitle);
    if (score > bestScore) {
      bestScore = score;
      best = tpl;
    }
  }

  if (!best) {
    const fallbackPairs = (coins.length ? coins : ["BTC", "ETH"]).map((c) => ({
      pair: pairFor(c),
      bias: "WATCH BETA",
      why: coins.length
        ? "No exact analog. When this name hits the wire, that pair usually carries the first print. BTC/ETH are the hedge if it goes sector-wide."
        : "Unclassified headline. BTC is the market's shock absorber; ETH follows with extra beta."
    }));
    return {
      id: "unclassified",
      label: coins.length ? `NAME PRINT — ${coins.join(", ")}` : "UNCLASSIFIED WIRE",
      desk: "GENERAL",
      confidence: 28,
      coins,
      historical: [
        {
          when: "pattern",
          analog: "No matching macro analog in the desk book. Use the named asset's own tape.",
          moved: fallbackPairs.map((p) => ({
            pair: p.pair,
            dir: "chop",
            range: "first 15-60 minutes decide the session"
          }))
        }
      ],
      likely: fallbackPairs,
      note: "Treat as a single-name headline until a second print confirms a sector analog."
    };
  }

  const confidence = Math.min(92, 48 + bestScore * 8 + (coins.length ? 6 : 0));
  return {
    id: best.id,
    label: best.label,
    desk: best.desk,
    confidence,
    coins,
    historical: best.historical.map((h) => ({
      ...h,
      moved: resolveNamed(h.moved, coins)
    })),
    likely: resolveNamed(best.likely, coins),
    note: "Analogs are historical playbook, not a guarantee. Size vs live liquidity and the rest of the tape."
  };
}

module.exports = { classifyNews, detectCoins, stripHtml, COIN_ALIASES };
