import { leadSentence } from "./impact-metrics";

export type ParsedAction = {
  index: number;
  title: string;
  full: string;
};

export type ParsedAlternative = {
  name: string;
  budget?: string;
  timeline?: string;
  viabilityDelta?: string;
  bullets: string[];
};

export type ParsedRisk = {
  category: string;
  severity: string;
  description: string;
};

const VERDICT_PATTERNS = [
  /—\s*([A-Z][A-Z\s/]+(?:WITH CONDITIONS)?)\s*:/i,
  /\b(PROCEED|REJECT|MODIFY WITH CONDITIONS|NOT RECOMMENDED|CONDITIONAL PROCEED)\b/i,
];

export function extractVerdictPhrase(summary: string): string | null {
  for (const pattern of VERDICT_PATTERNS) {
    const match = summary.match(pattern);
    if (match?.[1]) return match[1].replace(/\s+/g, " ").trim();
  }
  return null;
}

export function firstSentence(text: string): string {
  return leadSentence(text, 500);
}

export function stripFactPrefix(text: string): string {
  return text.replace(/^(FACT|ASSUMPTION|UNCERTAINTY):\s*/i, "").trim();
}

export function parseRecommendation(text: string, index: number): ParsedAction {
  const full = text.replace(/^\d+\.\s*/, "").trim();
  const colonSplit = full.split(/:\s+/);
  const emDashSplit = full.split(/\s+—\s+/);

  let title = leadSentence(full, 120);
  if (colonSplit.length > 1 && colonSplit[0].length < 100) {
    title = colonSplit[0].trim();
  } else if (emDashSplit.length > 1 && emDashSplit[0].length < 100) {
    title = emDashSplit[0].trim();
  }

  return { index, title, full };
}

export function parseAlternative(text: string): ParsedAlternative {
  const cleaned = text.replace(/^ALTERNATIVE\s*[—–-]\s*/i, "").trim();
  const parenMatch = cleaned.match(/^([^(]+)\(([^)]+)\)/);

  let name = cleaned;
  let meta = "";
  if (parenMatch) {
    name = parenMatch[1].trim();
    meta = parenMatch[2];
  } else {
    const dashIdx = cleaned.indexOf(":");
    if (dashIdx > 0 && dashIdx < 80) {
      name = cleaned.slice(0, dashIdx).trim();
      meta = cleaned.slice(dashIdx + 1).trim();
    }
  }

  const budget = meta.match(/Budget:\s*([^,;]+)/i)?.[1]?.trim();
  const timeline = meta.match(/Timeline:\s*([^,;]+)/i)?.[1]?.trim();
  const viabilityDelta =
    meta.match(/Viability Score Delta:\s*([^,;]+)/i)?.[1]?.trim() ??
    meta.match(/viability score:\s*([^,;.]+)/i)?.[1]?.trim();

  const bullets = meta
    .split(/;\s*(?=[a-d]\))/i)
    .flatMap((chunk) => chunk.split(/;\s*(?=\([a-d]\))/i))
    .map((b) => b.replace(/^\([a-d]\)\s*/i, "").trim())
    .filter((b) => b.length > 12)
    .slice(0, 4);

  if (!bullets.length) {
    bullets.push(leadSentence(cleaned, 280));
  }

  return { name, budget, timeline, viabilityDelta, bullets };
}

export function parseRiskMatrix(
  riskMatrix: { category: string; severity: string; description: string }[] | undefined,
  fallbackText: string,
): ParsedRisk[] {
  if (riskMatrix?.length) {
    return riskMatrix.slice(0, 5).map((r) => ({
      category: r.category,
      severity: r.severity,
      description: r.description.trim(),
    }));
  }

  const segments = fallbackText.split(/;\s*(?=[A-Z])/);
  return segments
    .filter((s) => s.length > 20)
    .slice(0, 4)
    .map((segment) => {
      const match = segment.match(/^([^:(]+)\s*\(([^)]+)\):\s*(.+)$/);
      if (match) {
        return {
          category: match[1].trim(),
          severity: match[2].trim(),
          description: match[3].trim(),
        };
      }
      return {
        category: "Risk",
        severity: "medium",
        description: segment.trim(),
      };
    });
}

export function parseConsequenceChain(
  consequences: { source: string; target: string }[] | undefined,
  fallbackText: string,
): string[] {
  if (consequences?.length) {
    return consequences.slice(0, 5).map((c) => c.target.trim());
  }
  const arrowParts = fallbackText.split(/\s*→\s*/);
  if (arrowParts.length > 2) {
    return arrowParts
      .slice(1, 6)
      .map((p) => p.replace(/^Consequence cascade:\s*/i, "").trim());
  }
  return [leadSentence(fallbackText, 280)];
}

export function severityTone(severity: string): "negative" | "warning" | "signal" | "positive" {
  const s = severity.toLowerCase();
  if (s.includes("critical")) return "negative";
  if (s.includes("high")) return "warning";
  if (s.includes("low")) return "positive";
  return "signal";
}
