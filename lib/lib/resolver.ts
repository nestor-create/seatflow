// lib/resolver.ts
import { SEAT_RULES } from "./seat-products";

export type Extracted = {
  airline_name: string;
  airline_iata: string;
  flight_number: string;
  route: string;
  cabin: "business" | "first" | "unknown";
  aircraft_type: string;
  cabin_text_found: string;

  // NEW:
  markers: {
    lie_flat: boolean;
    suite: boolean;
    door: boolean;
    direct_aisle_access: boolean;
  };
  markers_text: string;

  raw_text: string;
};

export type ResolveStatus = "confirmed" | "likely" | "needs_more_info";

function norm(s: string) {
  return (s || "").toLowerCase().replace(/\s+/g, " ").trim();
}
function contains(hay: string, needle: string) {
  return norm(hay).includes(norm(needle));
}
function airlineMatch(ex: Extracted, iata: string, name: string) {
  const iataOk = ex.airline_iata && norm(ex.airline_iata) === norm(iata);
  const nameOk = ex.airline_name && contains(ex.airline_name, name);
  return iataOk || nameOk;
}
function aircraftMatch(ex: Extracted, aircraftIn?: string[]) {
  if (!aircraftIn?.length) return false;
  const a = norm(ex.aircraft_type);
  if (!a) return false;
  return aircraftIn.some((x) => contains(a, x));
}
function keywordMatch(ex: Extracted, productNames: string[]) {
  const t = norm(ex.raw_text + " " + ex.cabin_text_found + " " + ex.markers_text);
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
    seatmaps_airline_url: ex.airline_iata
      ? `https://seatmaps.com/airlines/${norm(ex.airline_iata)}-${norm(ex.airline_name).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}/`
      : undefined,
  };

  const baseHint =
    "Open Flight details in Google Flights and retake the screenshot including the aircraft type line (A350-900 / 777-300ER). If available, include the seat map and any ‘lie-flat / suite / door’ wording.";

  if (ex.cabin === "unknown") {
    return {
      status: "needs_more_info" as const,
      seat_product: unknown,
      confidence: 0.3,
      candidates: [],
      next_screenshot_hint: baseHint,
    };
  }

  const candidates: Array<{
    product: { id: string; name: string; notes?: string; image_url?: string; seatmaps_airline_url?: string };
    score: number;
    reasons: string[];
  }> = [];

  for (const rule of SEAT_RULES) {
    if (rule.cabin !== ex.cabin) continue;
    if (!airlineMatch(ex, rule.airline_iata, rule.airline_name)) continue;

    // If the rule requires “markers”, enforce it (this helps when aircraft is missing)
    if (!hasAnyMarker(ex, rule.require_markers_any as any)) continue;

    let score = 0.35;
    const reasons: string[] = ["Airline match"];

    // Aircraft anchor
    const aOk = aircraftMatch(ex, rule.aircraft_in);
    if (aOk) {
      score += 0.25;
      reasons.push(`Aircraft matches (${ex.aircraft_type})`);
    } else {
      reasons.push(ex.aircraft_type ? "Aircraft not matching" : "Aircraft missing");
    }

    // Keyword anchor
    const kOk = keywordMatch(ex, rule.product_names);
    if (kOk) {
      score += 0.60;
      reasons.push("Product keyword found");
    }

    // Marker anchor (lie-flat/suite/door)
    const m = ex.markers || { lie_flat: false, suite: false, door: false, direct_aisle_access: false };
    const markerBoost =
      (m.lie_flat ? 0.08 : 0) +
      (m.suite ? 0.08 : 0) +
      (m.door ? 0.06 : 0) +
      (m.direct_aisle_access ? 0.04 : 0);

    if (markerBoost > 0) {
      score += markerBoost;
      reasons.push("Cabin features detected (lie-flat/suite/door)");
    }

    // Mixed fleet caution unless keyword is present
    if (rule.requires_seatmap_or_more_info && !kOk) {
      score -= 0.20;
      reasons.push("Mixed-fleet risk: seat map/keyword recommended");
    }

    score = Math.max(0, Math.min(1, score));

    candidates.push({
      product: {
        id: rule.id,
        name: rule.product_names[0] || rule.id,
        notes: rule.notes,
        image_url: rule.image_url,
        seatmaps_airline_url: rule.seatmaps_airline_url,
      },
      score,
      reasons,
    });
  }

  candidates.sort((a, b) => b.score - a.score);

  if (candidates.length === 0) {
    return {
      status: "needs_more_info" as const,
      seat_product: unknown,
      confidence: 0.35,
      candidates: [],
      next_screenshot_hint: baseHint,
    };
  }

  const best = candidates[0];
  const keywordConfirmed = best.reasons.some((r) => r.toLowerCase().includes("keyword"));

  let status: ResolveStatus = "likely";
  if (keywordConfirmed && best.score >= 0.78) status = "confirmed";
  else if (best.score >= 0.70 && !best.reasons.some((r) => r.toLowerCase().includes("mixed-fleet"))) status = "confirmed";
  else if (best.score >= 0.55) status = "likely";
  else status = "needs_more_info";

  // If aircraft is missing AND we didn’t see strong markers/keywords, force needs_more_info
  if (!ex.aircraft_type && !keywordConfirmed && !(ex.markers?.suite || ex.markers?.lie_flat)) {
    status = "needs_more_info";
  }

  return {
    status,
    seat_product: best.product,
    confidence: best.score,
    candidates: candidates.slice(0, 5),
    next_screenshot_hint: status === "needs_more_info" ? baseHint : "",
  };
}