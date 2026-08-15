/**
 * Deterministic Arabic-transliteration-to-English-respelling rules.
 * This intentionally provides an accessible reading aid, not an IPA transcription.
 * Names with ambiguous transliteration are labelled "auto" for later human review.
 */

const multigraphs = ["tch", "sch", "sh", "kh", "gh", "dh", "th", "ch", "ph", "aa", "ee", "ii", "oo", "uu", "ai", "ay", "aw", "au", "ei", "ey", "ou", "oa"];
const vowelTokens = new Set(["a", "e", "i", "o", "u", "aa", "ee", "ii", "oo", "uu", "ai", "ay", "aw", "au", "ei", "ey", "ou", "oa"]);
const consonantSound = { c: "k", q: "k", x: "ks", kh: "kh", gh: "gh", dh: "dh", sh: "sh", th: "th", ch: "ch", ph: "f", j: "j", w: "w", y: "y" };
const vowelSound = { a: "ah", e: "eh", i: "ih", o: "oh", u: "oo", aa: "ah", ee: "ee", ii: "ee", oo: "oo", uu: "oo", ai: "eye", ay: "ay", aw: "ow", au: "ow", ei: "ay", ey: "ay", ou: "oo", oa: "oh" };

function cleanLatinName(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[ʻʼ'`]/g, "")
    .replace(/[^a-zA-Z -]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function tokenise(word) {
  const tokens = [];
  for (let index = 0; index < word.length;) {
    const multi = multigraphs.find((candidate) => word.startsWith(candidate, index));
    const token = multi || word[index];
    tokens.push({ raw: token, vowel: vowelTokens.has(token) });
    index += token.length;
  }
  return tokens;
}

function syllabify(tokens) {
  const syllables = [];
  let current = [];
  for (let index = 0; index < tokens.length; index += 1) {
    current.push(tokens[index]);
    if (!tokens[index].vowel) continue;
    const next = tokens[index + 1];
    const following = tokens[index + 2];
    if (next?.vowel) {
      syllables.push(current);
      current = [];
    } else if (next && following?.vowel) {
      syllables.push(current);
      current = [];
    } else if (next && following && !following.vowel && tokens[index + 3]?.vowel) {
      current.push(next);
      index += 1;
      syllables.push(current);
      current = [];
    }
  }
  if (current.length) syllables.push(current);
  return syllables.filter((syllable) => syllable.some((token) => token.vowel));
}

function renderSyllable(tokens, index, total) {
  const raw = tokens.map((token) => token.raw).join("");
  let rendered = "";
  for (const token of tokens) {
    if (token.vowel) {
      let sound = vowelSound[token.raw] || token.raw;
      const endsWithVowel = tokens[tokens.length - 1] === token;
      if (token.raw === "i" && endsWithVowel) sound = "ee";
      if (token.raw === "a" && index === total - 1 && endsWithVowel) sound = "ah";
      rendered += sound;
    } else {
      rendered += consonantSound[token.raw] || token.raw;
    }
  }
  // Established transliteration endings are predictable across many names.
  return rendered
    .replace(/eeyah$/i, "ee-yah")
    .replace(/iyah$/i, "ee-yah")
    .replace(/iya$/i, "ee-yah")
    .replace(/ullah$/i, "oo-lah")
    .replace(/ahh$/i, "ah");
}

function chooseStress(syllables, word) {
  if (syllables.length <= 1) return 0;
  const hasRecognisableLongVowel = (value) => /(ee|oo|eye|ay|ow)/i.test(value);
  const longIndex = syllables.map((value, index) => hasRecognisableLongVowel(value) ? index : -1).find((index) => index > 0);
  if (longIndex !== undefined && longIndex >= 0) return longIndex;
  if (syllables.length >= 3) return syllables.length - 2;
  if (/^(abd|ibn|bint)/.test(word)) return 1;
  return 0;
}

export function generatePhonetic(name, arabic = "", isQuranic = false) {
  const cleaned = cleanLatinName(name);
  if (!cleaned || !/[aeiouy]/.test(cleaned)) return { phonetic: null, phoneticConfidence: "auto" };

  const words = cleaned.split(/[- ]+/).filter(Boolean);
  const parts = words.map((word) => {
    const syllables = syllabify(tokenise(word)).map((syllable, index, all) => renderSyllable(syllable, index, all));
    if (!syllables.length) return null;
    const stress = chooseStress(syllables, word);
    return syllables.map((syllable, index) => index === stress ? syllable.toUpperCase() : syllable.toLowerCase()).join("-");
  });

  const phonetic = parts.every(Boolean) ? parts.join(" ") : null;
  const hasAmbiguity = /[cqx]|(ai|ay|aw|au|ei|ey|ou|oa)|(?:aa|ee|ii|oo|uu).*(?:aa|ee|ii|oo|uu)|[ʻʼ'`-]/i.test(String(name || ""));
  const hasArabicScript = /[\u0600-\u06FF]/.test(arabic);
  const plausibleLength = words.every((word) => word.length >= 2 && word.length <= 12);
  const predictableSyllableCount = words.every((word) => syllabify(tokenise(word)).length <= 3);
  const phoneticConfidence = phonetic && hasArabicScript && plausibleLength && predictableSyllableCount && !hasAmbiguity && !isQuranic ? "high" : "auto";
  return { phonetic, phoneticConfidence };
}
