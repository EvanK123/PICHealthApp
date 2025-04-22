const cache = {};

function decodeHTMLEntities(text) {
  return text
    .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(num))
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&");
}

export async function translateText(text, targetLang = "es") {
  const key = `${text}@@${targetLang}`;
  if (cache[key]) return cache[key];

  const API_KEY = "AIzaSyBjtCrAaBpC1Sq_ngk7eBYfVxcGaWzzpz4";
  const url = `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: text, target: targetLang }),
  });

  if (!response.ok) {
    throw new Error(`Translate API error: ${response.status}`);
  }

  const json = await response.json();
  const translated = json.data.translations[0].translatedText;
  const decoded = decodeHTMLEntities(translated);
  cache[key] = decoded;
  return decoded;
}
