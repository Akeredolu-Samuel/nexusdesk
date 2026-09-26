# nexusdesk

NEXUS DESK — Bloomberg-style crypto news terminal.

- Percentage boot screen
- Live news wire (CryptoPanic, with public wires as backup)
- Historical analog: when this kind of headline hit before, which pairs moved, which might move now
- Live USD tape
- Ask the desk via DeepSeek
- Auto-update: wire 45s, tape 8s

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3737

## Keys

Copy `.env.example` to `.env` and add:

```
CRYPTOPANIC_TOKEN=
DEEPSEEK_API_KEY=
```

Or paste keys in **SETTINGS** (⚙). Never commit `.env`.

CryptoPanic’s old free `developer` path is gone. If the token’s plan is Growth / Growth weekly / Enterprise, the desk uses it. Otherwise it falls back to Cointelegraph, CoinDesk, Decrypt, and The Block so the wire still prints.
