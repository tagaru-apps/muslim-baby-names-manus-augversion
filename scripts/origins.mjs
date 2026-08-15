/**
 * Deterministic origin classification based only on source wording, Quranic flags,
 * Arabic-script presence, and explicit root references. It does not invent origin data.
 */
const ORIGIN_PATTERNS = [
  ["Persian", [/\b(?:an?|the)\s+Persian(?:[-\s]+[A-Za-z]+){0,2}\s+(?:name|word|variant|form)\b/i, /\bPersian\s+name\b/i]],
  ["Turkish", [/\b(?:an?|the)\s+Turkish(?:[-\s]+[A-Za-z]+){0,2}\s+(?:name|word|variant|form)\b/i, /\bTurkish\s+name\b/i, /\bTurkic\b/i]],
  ["Urdu", [/\b(?:an?|the)\s+Urdu(?:[-\s]+[A-Za-z]+){0,2}\s+(?:name|word|variant|form)\b/i, /\bUrdu\s+variant\b/i]],
  ["Kurdish", [/\b(?:an?|the)\s+Kurdish(?:[-\s]+[A-Za-z]+){0,2}\s+(?:name|word|variant|form)\b/i, /\bKurdish\s+name\b/i]],
  ["Swahili", [/\b(?:an?|the)\s+Swahili(?:[-\s]+[A-Za-z]+){0,2}\s+(?:name|word|variant|form)\b/i, /\bSwahili\s+name\b/i]],
  ["Hindi", [/\borigin\s*:\s*Hindi\b/i, /\bHindi\s+name\b/i]],
  ["Bengali", [/\b(?:an?|the)\s+Bengali(?:[-\s]+[A-Za-z]+){0,2}\s+(?:name|word|variant|form)\b/i, /\bBengali\s+name\b/i]],
  ["Punjabi", [/\b(?:an?|the)\s+Punjabi(?:[-\s]+[A-Za-z]+){0,2}\s+(?:name|word|variant|form)\b/i, /\bPunjabi\s+name\b/i]],
  ["Pashto", [/\b(?:an?|the)\s+Pashto(?:[-\s]+[A-Za-z]+){0,2}\s+(?:name|word|variant|form)\b/i, /\bPashto\s+name\b/i]],
  ["Malay", [/\b(?:an?|the)\s+Malay(?:[-\s]+[A-Za-z]+){0,2}\s+(?:name|word|variant|form)\b/i, /\bMalay\s+name\b/i]],
  ["Indonesian", [/\b(?:an?|the)\s+Indonesian(?:[-\s]+[A-Za-z]+){0,2}\s+(?:name|word|variant|form)\b/i, /\bIndonesian\s+(?:name|form)\b/i]],
  ["Somali", [/\b(?:an?|the)\s+Somali(?:[-\s]+[A-Za-z]+){0,2}\s+(?:name|word|variant|form)\b/i, /\bSomali\b/i]],
  ["African", [/\b(?:an?|the)\s+African(?:[-\s]+[A-Za-z]+){0,2}\s+(?:name|word|variant|form)\b/i, /\bAfrican\s+Muslims?\b/i]],
  ["Indian subcontinent", [/\bIndian\s+subcontinent\b/i]],
  ["Arabic", [/\b(?:an?|the)\s+Arabic(?:[-\s]+[A-Za-z]+){0,2}\s+(?:name|word|variant|form)\b/i, /\bArabic\s+(?:name|for|word)\b/i, /\bArab\s+name\b/i]],
];

const hasArabicScript = (value) => /[\u0600-\u06FF]/.test(String(value || ""));

export function classifyOrigin({ name = "", meaning = "", arabic = "", isQuranic = false }) {
  const text = `${name} ${meaning}`.replace(/\s+/g, " ").trim();
  if (isQuranic) return { origin: "Quranic", originConfidence: "explicit" };
  for (const [origin, patterns] of ORIGIN_PATTERNS) {
    if (patterns.some((pattern) => pattern.test(text))) return { origin, originConfidence: "explicit" };
  }
  if (hasArabicScript(arabic)) return { origin: "Arabic", originConfidence: "inferred" };
  if (/\b(?:derived from|root)\b.*\broot\b/i.test(text)) return { origin: "Arabic", originConfidence: "inferred" };
  return { origin: "Not specified in source", originConfidence: "unspecified" };
}
