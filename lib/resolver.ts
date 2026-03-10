import { SEAT_RULES } from "./seat-products";

export type Extracted = {
  airline_name: string;
  airline_iata: string;
  flight_number: string;
  route: string;
  cabin: "business" | "first" | "unknown";
  aircraft_type: string;
  cabin_text_found: string;
  markers: {
    lie_flat: boolean;
    suite: boolean;
    door: boolean;
    direct_aisle_access: boolean;
  };
  markers_text: string;
  raw_text: string;
};

function norm(s: string) {
  return (s || "").toLowerCase().replace(/\s+/g, " ").trim();
}

function contains(hay: string, needle: string) {
  return norm(hay).includes(norm(needle));
}

function airlineMatch(ex: Extracted, iata: string, name: string) {
  return norm(ex.airline_iata) === norm(iata) || contains(ex.airline_name, name);
}

function aircraftMatch(ex: Extracted, aircraftIn?: string[]) {
  if (!aircraftIn?.length) return false;
  return aircraftIn.some((x) => contains(ex.aircraft_type, x));
}

function keywordMatch(ex: Extracted, productNames: string[]) {
  const t = `${ex.raw_text} ${ex.cabin_text_found} ${ex.markers_text}`;
  return productNames.some((p) => contains(t, p));
}

function hasAnyMarker(ex: Extracted, required?: Array<keyof Extracted["markers"]>) {
  if (!required?.length) return true;
  return required.some((k) => !!ex.markers?.[k]);
}

export function resolveSeatProduct(ex: Extracted) {
  const unknown = {
    id: "UNKNOWN",
    name: "Unknown",
    notes: "Not enough evidence in screenshot.",
    image_url: undefined as string | undefined,
    seatmaps_airline_url: undefined as string | undefined
  };

  if (ex.cabin === "unknown") {
    return {
      status: "needs_more_info" as const,
      seat_product: unknown,
      confidence: 0.3,
      candidates: [],
      next_screenshot_hint: "Include aircraft type and any lie-flat / suite wording."
    };
  }

  const candidates: Array<{
    product: {
      id: string;
      name: string;
      notes?: string;
      image_url?: string;
      seatmaps_airline_url?: string;
    };
    score: number;
    reasons: string[];
  }> = [];

  for (const rule of SEAT_RULES) {
    if (rule.cabin !== ex.cabin) continue;
    if (!airlineMatch(ex, rule.airline_iata, rule.airline_name)) continue;
    if (!hasAnyMarker(ex, rule.require_markers_any as any)) continue;

    let score = 0.35;
    const reasons: string[] = ["Airline match"];

    if (aircraftMatch(ex, rule.aircraft_in)) {
      score += 0.25;
      reasons.push("Aircraft match");
    }

    if (keywordMatch(ex, rule.product_names)) {
      score += 0.6;
      reasons.push("Product keyword found");
    }

    if (ex.markers.lie_flat) score += 0.08;
    if (ex.markers.suite) score += 0.08;
    if (ex.markers.door) score += 0.06;
    if (ex.markers.direct_aisle_access) score += 0.04;

    if (rule.requires_seatmap_or_more_info && !keywordMatch(ex, rule.product_names)) {
      score -= 0.2;
      reasons.push("Mixed-fleet caution");
    }

    score = Math.max(0, Math.min(1, score));

    candidates.push({
      product: {
        id: rule.id,
        name: rule.product_names[0],
        notes: rule.notes,
        image_url: rule.image_url,
        seatmaps_airline_url: rule.seatmaps_airline_url
      },
      score,
      reasons
    });
  }

  candidates.sort((a, b) => b.score - a.score);

  if (!candidates.length) {
    return {
      status: "needs_more_info" as const,
      seat_product: unknown,
      confidence: 0.35,
      candidates: [],
      next_screenshot_hint: "Include aircraft type and any lie-flat / suite wording."
    };
  }

  const best = candidates[0];
  const status =
    best.score >= 0.78 ? "confirmed" :
    best.score >= 0.55 ? "likely" :
    "needs_more_info";

  return {
    status,
    seat_product: best.product,
    confidence: best.score,
    candidates: candidates.slice(0, 5),
    next_screenshot_hint: status === "needs_more_info" ? "Include aircraft type and any lie-flat / suite wording." : ""
  };
}