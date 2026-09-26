# Sample I/O (judge run records)

Reproducible classifier and API examples. Classification is deterministic (`playbook.js`). Timestamps below are from local/dev runs.

## Classifier

**Input (headline)**

```
US CPI printed hotter than expected
```

**Output (truncated analog)**

```json
{
  "id": "cpi-hot",
  "label": "HOTTER CPI / INFLATION BEAT",
  "desk": "MACRO",
  "confidence": 72,
  "coins": [],
  "historical": [
    {
      "when": "2022-06-10",
      "analog": "US CPI printed 8.6% vs 8.3% expected",
      "moved": [
        { "pair": "BTC/USDT", "dir": "down", "range": "-6% to -12% same session" },
        { "pair": "ETH/USDT", "dir": "down", "range": "-8% to -14%" },
        { "pair": "SOL/USDT", "dir": "down", "range": "-10% to -18%" }
      ]
    }
  ],
  "likely": [
    { "pair": "BTC/USDT", "bias": "SELL THE PRINT", "why": "Real-rate shock historically dumps BTC first." },
    { "pair": "ETH/USDT", "bias": "FOLLOW BTC", "why": "ETH beta > 1 vs BTC on CPI misses." },
    { "pair": "SOL/USDT", "bias": "HIGH-BETA DUMP", "why": "Alts overshoot BTC on macro surprises." }
  ]
}
```

**Input**

```
Binance lists NEWTOKEN
```

**Output**

```json
{
  "id": "listing",
  "label": "MAJOR CEX LISTING",
  "desk": "MICRO",
  "likely": [
    { "pair": "NAMED TOKEN/USDT", "bias": "MOMENTUM THEN FADE" }
  ]
}
```

**Input**

```
Bitget confirms $352M security breach, suspends withdrawals
```

**Output**

```json
{
  "id": "hack",
  "label": "EXCHANGE / PROTOCOL HACK",
  "desk": "CREDIT",
  "likely": [
    { "pair": "BTC/USDT", "bias": "DIP THEN RECOVER" }
  ]
}
```

## GET /api/boot

```json
{
  "desk": "NEXUS DESK",
  "cryptopanic": true,
  "deepseek": true,
  "port": 3737
}
```

## GET /api/news (shape)

```json
{
  "origin": "WIRE",
  "updated_at": "2026-09-26T00:54:00.000Z",
  "items": [
    {
      "id": "h1047699752",
      "title": "US Prosecutors Want $84.2 Million From a Bank Tied to Tether",
      "source": "Decrypt",
      "published_at": "2026-09-25T21:25:35.000Z",
      "coins": [],
      "analog": {
        "id": "stablecoin",
        "label": "STABLECOIN DEPEG / ISSUER RISK",
        "desk": "CREDIT",
        "confidence": 64
      }
    }
  ]
}
```

## GET /api/tape (shape)

```json
{
  "source": "coingecko",
  "rows": [
    { "symbol": "BTC/USDT", "last": 83836, "change": -0.88 },
    { "symbol": "ETH/USDT", "last": 2682.6, "change": -0.28 },
    { "symbol": "SOL/USDT", "last": 121.37, "change": 3.41 }
  ]
}
```

## POST /api/ask

**Request**

```json
{ "question": "what pair moves on a hotter CPI" }
```

**Response (DeepSeek, excerpt from 2026-09-26 local run)**

```
First print: BTC/USDT. It's the shock absorber — deepest book, fastest
repricing... On a genuine hot print the transmission is 2yr yield up →
DXY up → BTC/USDT down... Highest beta: ETH/USDT at roughly 1.2–1.5x.
```

If DeepSeek times out, the same route returns `LOCAL PLAYBOOK (...)` with the analog tables above.

## How to replay locally

```bash
npm run dev
curl -s http://localhost:3737/api/boot
curl -s "http://localhost:3737/api/news?refresh=1"
curl -s http://localhost:3737/api/tape
curl -s -X POST http://localhost:3737/api/ask -H "Content-Type: application/json" -d "{\"question\":\"what pair leads on a hot CPI\"}"
```
