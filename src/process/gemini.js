// gemini.js — Gemini API client + categorisation

require('dotenv').config();
const fetch = require('node-fetch');

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

const KNOWN_BAD_PROCESSES = [
  'cluely', 'chatgpt', 'claude', 'copilot', 'screensnap',
  'wispr', 'superhuman', 'raycast', 'alfred', 'keystroke pro'
];

function quickLocalCheck(names) {
  // Fast local check before hitting Gemini (saves API calls + works offline)
  const lower = names.map(n => n.toLowerCase());
  for (const bad of KNOWN_BAD_PROCESSES) {
    const match = lower.find(n => n.includes(bad));
    if (match) {
      return {
        flagged: true,
        processName: match,
        category: 'ai_overlay'
      };
    }
  }
  return null;
}

async function categoriseProcesses(processNames) {
  // 1. Quick local check first (no network call needed)
  const localResult = quickLocalCheck(processNames);
  if (localResult) return localResult;

  // 2. If local check passes, sample up to 80 processes for Gemini
  // (don't send 500+ processes — expensive and slow)
  const sample = processNames.slice(0, 80).join('\n');

  const prompt = `You are a process security analyser. Given a list of running process names from a candidate's computer during a coding interview, identify if any process is an AI assistance tool, overlay app, or cheating aid (e.g. Cluely, ChatGPT desktop, Claude desktop, Copilot overlay, screen OCR tools, invisible AI assistants).

Respond ONLY in valid JSON. No explanation. No markdown.

Format:
{"flagged": true or false, "processName": "name of flagged process or empty string", "category": "ai_overlay | screen_reader | clipboard_ai | unknown"}

Process list:
${sample}`;

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0, maxOutputTokens: 150 }
      }),
      timeout: 8000  // 8 second timeout — don't block the session
    });

    if (!response.ok) {
      console.warn('[DEV3] Gemini API error:', response.status);
      return null; // Silent fail
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) return null;

    // Strip markdown fences if Gemini adds them
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);

  } catch (err) {
    console.warn('[DEV3] Gemini call failed silently:', err.message);
    return null; // Always silent fail — never crash the session
  }
}

module.exports = { categoriseProcesses };
