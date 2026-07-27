/**
 * Conservative extraction of details a visitor volunteers (first name, country)
 * so the assistant's light lead-qualification can be captured on the session.
 *
 * Deliberately high-precision, low-recall: it only captures clear, explicit
 * mentions, because storing a wrong name/country is worse than storing nothing
 * (and PDPA-minimal means we keep only what the visitor actually offers). This
 * is a heuristic, not NLP — it will miss phrasings, and that's the safe failure.
 */

export type VolunteeredDetails = {
  name?: string;
  country?: string;
};

// Common origin countries relevant to Singapore immigration work. Whole-word,
// case-insensitive matches only — avoids the "from work / from Monday" trap that
// a bare "from X" capture would hit.
const COUNTRIES = [
  "Singapore", "Malaysia", "Indonesia", "Thailand", "Vietnam", "Philippines",
  "Myanmar", "Cambodia", "Laos", "Brunei", "India", "China", "Hong Kong",
  "Taiwan", "Japan", "South Korea", "Korea", "Bangladesh", "Pakistan",
  "Sri Lanka", "Nepal", "United Kingdom", "UK", "Ireland", "France", "Germany",
  "Netherlands", "Spain", "Italy", "Switzerland", "Sweden", "United States",
  "USA", "America", "Canada", "Australia", "New Zealand", "South Africa",
  "Nigeria", "Egypt", "United Arab Emirates", "UAE", "Saudi Arabia", "Russia",
  "Brazil", "Mexico"
];

// A few nationality adjectives that clearly imply a country.
const NATIONALITY_TO_COUNTRY: Record<string, string> = {
  singaporean: "Singapore",
  malaysian: "Malaysia",
  indonesian: "Indonesia",
  indian: "India",
  chinese: "China",
  japanese: "Japan",
  korean: "South Korea",
  filipino: "Philippines",
  vietnamese: "Vietnam",
  british: "United Kingdom",
  american: "United States",
  australian: "Australia"
};

const NAME_STOPWORDS = new Set([
  "not", "sorry", "just", "here", "from", "looking", "trying", "interested",
  "hoping", "planning", "the", "a", "an", "still", "really", "actually",
  "moving", "based", "currently", "originally", "also", "very", "so", "now"
]);

function extractName(message: string): string | undefined {
  // Scan every "I'm X / my name is X / call me X" hit and take the first that
  // isn't a stopword — so "I'm from India, my name is Ravi" skips "from" and
  // captures "Ravi".
  const pattern = /\b(?:my name is|i am|i'm|call me)\s+([A-Za-z][A-Za-z'-]{1,30})/gi;
  for (const match of message.matchAll(pattern)) {
    const candidate = match[1];
    if (NAME_STOPWORDS.has(candidate.toLowerCase())) continue;
    return candidate.charAt(0).toUpperCase() + candidate.slice(1).toLowerCase();
  }
  return undefined;
}

function extractCountry(message: string): string | undefined {
  for (const country of COUNTRIES) {
    const escaped = country.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (new RegExp(`\\b${escaped}\\b`, "i").test(message)) {
      // Normalize a couple of aliases to a canonical label.
      if (/\b(uk|united kingdom)\b/i.test(country)) return "United Kingdom";
      if (/\b(usa|america|united states)\b/i.test(country)) return "United States";
      if (/\b(uae|united arab emirates)\b/i.test(country)) return "United Arab Emirates";
      return country;
    }
  }
  for (const [adjective, country] of Object.entries(NATIONALITY_TO_COUNTRY)) {
    if (new RegExp(`\\b${adjective}\\b`, "i").test(message)) return country;
  }
  return undefined;
}

export function extractVolunteeredDetails(message: string): VolunteeredDetails {
  const details: VolunteeredDetails = {};
  const name = extractName(message);
  const country = extractCountry(message);
  if (name) details.name = name;
  if (country) details.country = country;
  return details;
}
