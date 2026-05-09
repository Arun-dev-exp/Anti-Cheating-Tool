# Sentinel Zero — Anti-Cheating Tool

> AI-powered exam integrity system built with Electron and Next.js.

## DEV1 — Detection Engine

The keystroke entropy analyser and Bayesian risk score engine — the brain of Sentinel Zero.

### Module Structure

```
src/detection/
├── keystroke.js    ← Keystroke listener + entropy calculator
├── bayesian.js     ← Risk score engine (combines all signals)
└── index.js        ← Entry point — exports startDetection()

shared/
├── constants.js    ← Thresholds, weights, event names
└── types.js        ← IPC payload type definitions
```

### How It Works

1. **Keystroke Entropy** — Monitors typing rhythm via `iohook`. Computes variance of inter-keystroke intervals over a 20-key sliding window. Variance < 5ms = suspiciously uniform (auto-typer detected).

2. **Bayesian Risk Score** — Maintains an Integrity Index (0–100, starts at 92). Combines signals from keystroke, gaze, process, and liveness modules. Enforces a **two-signal rule**: a single flagged signal alone never triggers a penalty.

3. **Breach Detection** — When score drops ≤ 35, emits `signal:breach` exactly once. Re-arms if score recovers.

### Setup

```bash
npm install
```

### Testing

```bash
node tests/test_detection.js
```

### Team

| Module | Owner |
|--------|-------|
| Detection (keystroke + bayesian) | DEV1 |
| Gaze tracking | DEV2 |
| Process scanning | DEV3 |
| UI + Electron shell | DEV4 |

## Next.js Frontend Details

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
