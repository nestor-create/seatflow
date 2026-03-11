"use client";

import React, { useEffect, useMemo, useState } from "react";

type CabinProduct = {
  rank: number;
  airline: string;
  cabinName: string;
  aliases?: string[];
  aircraft: string[];
  routeKeywords?: string[];
  regions?: string[];
  notes?: string;
  seatType?: string;
  recommendedPitch?: string;
  samplePitch: string;
  samplePitchShort: string;
};

type MatchResult = {
  score: number;
  airlineMatched: boolean;
  aircraftMatched: boolean;
  routeMatched: boolean;
};

const TOP_CABIN_PRODUCTS: CabinProduct[] = [
  {
    rank: 1,
    airline: "Lufthansa",
    cabinName: "Allegris Business Class",
    aliases: ["Allegris"],
    aircraft: ["A350-900", "A350", "359", "787-9", "787", "789"],
    regions: ["Europe", "North America", "Asia"],
    routeKeywords: ["munich", "muc", "shanghai", "pvg", "san francisco", "sfo", "bangalore", "blr", "newark", "ewr", "chicago", "ord"],
    notes: "Newest Lufthansa long-haul product with much better privacy than the older seat.",
    seatType: "Suite-style business class",
    recommendedPitch:
      "This flight may feature Lufthansa Allegris, Lufthansa’s newest long-haul business class with a more private suite-style setup and a noticeably more premium feel than the older cabin.",
    samplePitch:
      "This flight may feature Lufthansa Allegris, Lufthansa’s newest long-haul business class with a more private suite-style setup and a noticeably more premium feel than the older cabin.",
    samplePitchShort:
      "Likely Lufthansa Allegris — newer suite-style business class with better privacy and a more premium feel.",
  },
  {
    rank: 2,
    airline: "Virgin Atlantic",
    cabinName: "Upper Class Suite",
    aliases: ["Upper Class", "Upper Class Suite", "Retreat Suite"],
    aircraft: ["A330-900", "A330neo", "A350-1000", "A350", "339", "351"],
    regions: ["UK", "North America", "Caribbean", "Middle East"],
    routeKeywords: ["london", "lhr", "jfk", "bos", "mia", "lax", "barbados"],
    notes: "Modern, stylish suite with strong privacy on newer aircraft.",
    seatType: "Door-equipped suite",
    recommendedPitch:
      "If this is on Virgin Atlantic’s newer A330neo or A350, it may have the latest Upper Class Suite, which feels sleek, private, and especially strong for transatlantic flying.",
    samplePitch:
      "If this is on Virgin Atlantic’s newer A330neo or A350, it may have the latest Upper Class Suite, which feels sleek, private, and especially strong for transatlantic flying.",
    samplePitchShort:
      "Possible Virgin Atlantic Upper Class Suite — modern, private, and very strong across the Atlantic.",
  },
  {
    rank: 3,
    airline: "Delta",
    cabinName: "Delta One Suite",
    aliases: ["Delta One", "Delta One Suite"],
    aircraft: ["A330-900", "A350-900", "A350", "339", "359", "767-400", "764"],
    regions: ["North America", "Europe", "Asia"],
    routeKeywords: ["jfk", "lax", "bos", "atl", "paris", "london", "tokyo", "seoul"],
    notes: "Delta’s best long-haul premium seat, especially on A350 and A330-900neo.",
    seatType: "Door-equipped suite",
    recommendedPitch:
      "This flight may offer Delta One Suite, Delta’s top long-haul business class with a more enclosed seat, direct aisle access, and a polished feel for overnight travel.",
    samplePitch:
      "This flight may offer Delta One Suite, Delta’s top long-haul business class with a more enclosed seat, direct aisle access, and a polished feel for overnight travel.",
    samplePitchShort:
      "Possible Delta One Suite — enclosed business class seat that works very well on overnight flights.",
  },
  {
    rank: 4,
    airline: "Cathay Pacific",
    cabinName: "Aria Suite",
    aliases: ["Aria Suite"],
    aircraft: ["777-300ER", "77W", "777"],
    regions: ["Asia", "North America", "Europe"],
    routeKeywords: ["hong kong", "hkg", "london", "jfk", "sydney", "vancouver"],
    notes: "Cathay’s newest flagship long-haul business class suite.",
    seatType: "Flagship suite",
    recommendedPitch:
      "If operated by a retrofitted 777-300ER, this route may feature Cathay Pacific’s Aria Suite, one of the most elegant new business class products with excellent privacy and a refined finish.",
    samplePitch:
      "If operated by a retrofitted 777-300ER, this route may feature Cathay Pacific’s Aria Suite, one of the most elegant new business class products with excellent privacy and a refined finish.",
    samplePitchShort:
      "Possible Cathay Aria Suite — elegant new flagship business class with strong privacy.",
  },
  {
    rank: 5,
    airline: "British Airways",
    cabinName: "Club Suite",
    aliases: ["Club Suite"],
    aircraft: ["A350-1000", "A350", "787-10", "A380", "777-300ER", "351", "781", "388", "77W"],
    regions: ["UK", "North America", "Middle East", "Africa"],
    routeKeywords: ["london", "lhr", "jfk", "dubai", "lagos", "washington", "boston"],
    notes: "A major improvement over older Club World thanks to better privacy and doors.",
    seatType: "Door-equipped suite",
    recommendedPitch:
      "This flight may have British Airways Club Suite, BA’s newer business class with a closing door and much better privacy than the older Club World seat.",
    samplePitch:
      "This flight may have British Airways Club Suite, BA’s newer business class with a closing door and much better privacy than the older Club World seat.",
    samplePitchShort:
      "Possible BA Club Suite — a big step up over the older Club World seat.",
  },
  {
    rank: 6,
    airline: "Qatar Airways",
    cabinName: "Qsuite",
    aliases: ["Qsuite"],
    aircraft: ["A350-1000", "A350-900", "777-300ER", "787-9", "351", "359", "77W", "789"],
    regions: ["Middle East", "Europe", "Asia", "North America"],
    routeKeywords: ["doha", "doh", "london", "new york", "washington", "paris", "sydney"],
    notes: "One of the world’s strongest business class products for privacy and flexibility.",
    seatType: "Flagship suite",
    recommendedPitch:
      "If this departure is on a Qsuite-equipped aircraft, you’d be getting one of the best business class products globally, with exceptional privacy and a true suite feel.",
    samplePitch:
      "If this departure is on a Qsuite-equipped aircraft, you’d be getting one of the best business class products globally, with exceptional privacy and a true suite feel.",
    samplePitchShort:
      "Possible Qatar Qsuite — one of the best business class products in the world.",
  },
  {
    rank: 7,
    airline: "Air France",
    cabinName: "Business Suite",
    aliases: ["Air France Business", "Business Suite"],
    aircraft: ["777-300ER", "A350-900", "77W", "359"],
    regions: ["Europe", "North America", "Asia"],
    routeKeywords: ["paris", "cdg", "jfk", "los angeles", "singapore", "tokyo"],
    notes: "Stylish and polished flagship business class on newer retrofits and deliveries.",
    seatType: "Door-equipped suite",
    recommendedPitch:
      "This route may feature Air France’s latest Business Suite, a stylish and comfortable product with direct aisle access and a noticeably more polished feel on the newest aircraft.",
    samplePitch:
      "This route may feature Air France’s latest Business Suite, a stylish and comfortable product with direct aisle access and a noticeably more polished feel on the newest aircraft.",
    samplePitchShort:
      "Possible Air France Business Suite — stylish, private, and among the better European products.",
  },
  {
    rank: 8,
    airline: "ANA",
    cabinName: "The Room",
    aliases: ["The Room"],
    aircraft: ["777-300ER", "77W"],
    regions: ["Asia", "North America", "Europe"],
    routeKeywords: ["tokyo", "hnd", "nrt", "jfk", "lhr", "sfo", "ord"],
    notes: "Exceptionally spacious business class seat on select ANA 777s.",
    seatType: "Extra-wide suite",
    recommendedPitch:
      "If the route is operated by ANA’s reconfigured 777-300ER, you may get The Room, one of the most spacious business class seats in the market and especially strong for sleeping comfort.",
    samplePitch:
      "If the route is operated by ANA’s reconfigured 777-300ER, you may get The Room, one of the most spacious business class seats in the market and especially strong for sleeping comfort.",
    samplePitchShort:
      "Possible ANA The Room — one of the most spacious business class seats available.",
  },
  {
    rank: 9,
    airline: "Japan Airlines",
    cabinName: "Apex Suite / Safran Unity",
    aliases: ["Apex Suite", "Safran Unity"],
    aircraft: ["777-300ER", "A350-1000", "77W", "351"],
    regions: ["Asia", "North America", "Europe"],
    routeKeywords: ["tokyo", "jfk", "london", "paris", "dallas"],
    notes: "JAL’s premium experience is strongest on the A350-1000 and flagship 777 routes.",
    seatType: "Flagship business class",
    recommendedPitch:
      "Depending on aircraft, this route may feature either JAL’s well-regarded Apex Suite or the new-generation A350-1000 business class, both strong premium options for comfort and privacy.",
    samplePitch:
      "Depending on aircraft, this route may feature either JAL’s well-regarded Apex Suite or the new-generation A350-1000 business class, both strong premium options for comfort and privacy.",
    samplePitchShort:
      "Possible JAL flagship business class — either Apex Suite or the newer A350-1000 seat.",
  },
  {
    rank: 10,
    airline: "Singapore Airlines",
    cabinName: "Long Haul Business Class",
    aliases: ["SQ Business", "Singapore Business"],
    aircraft: ["A350-900", "777-300ER", "787-10", "359", "77W", "781"],
    regions: ["Asia", "Europe", "North America"],
    routeKeywords: ["singapore", "sin", "london", "new york", "frankfurt", "sydney"],
    notes: "Very spacious seat with one of the most consistent premium experiences.",
    seatType: "Wide long-haul seat",
    recommendedPitch:
      "This flight may feature Singapore Airlines’ long-haul business class, known for a very spacious seat, strong service, and one of the more consistently premium experiences in the market.",
    samplePitch:
      "This flight may feature Singapore Airlines’ long-haul business class, known for a very spacious seat, strong service, and one of the more consistently premium experiences in the market.",
    samplePitchShort:
      "Possible Singapore Airlines long-haul business class — spacious and consistently premium.",
  },
  {
    rank: 11,
    airline: "Emirates",
    cabinName: "New Generation Business Class",
    aliases: ["Emirates Business", "New 777 Business"],
    aircraft: ["777-300ER", "A380", "77W", "388"],
    regions: ["Middle East", "Europe", "Asia", "North America"],
    routeKeywords: ["dubai", "dxb", "london", "new york", "sydney", "singapore"],
    notes: "Strongest when scheduled on refreshed aircraft, especially newer 777s.",
    seatType: "Updated flagship business class",
    recommendedPitch:
      "If this is one of Emirates’ refreshed aircraft, the business class can be much stronger than the older versions, especially on the updated 777s where privacy and seat design are improved.",
    samplePitch:
      "If this is one of Emirates’ refreshed aircraft, the business class can be much stronger than the older versions, especially on the updated 777s where privacy and seat design are improved.",
    samplePitchShort:
      "Possible refreshed Emirates business class — strongest when operated by updated aircraft.",
  },
  {
    rank: 12,
    airline: "Etihad",
    cabinName: "Business Studio",
    aliases: ["Business Studio"],
    aircraft: ["787-9", "787-10", "A350-1000", "789", "781", "351"],
    regions: ["Middle East", "Europe", "Asia", "North America"],
    routeKeywords: ["abu dhabi", "auh", "london", "new york", "singapore"],
    notes: "Sleek, modern product with a boutique premium feel.",
    seatType: "Modern business studio",
    recommendedPitch:
      "This route may offer Etihad’s Business Studio or A350 business class, a sleek and comfortable product with strong privacy and a more boutique premium feel.",
    samplePitch:
      "This route may offer Etihad’s Business Studio or A350 business class, a sleek and comfortable product with strong privacy and a more boutique premium feel.",
    samplePitchShort:
      "Possible Etihad Business Studio — sleek, modern, and especially strong on the A350.",
  },
  {
    rank: 13,
    airline: "United",
    cabinName: "Polaris",
    aliases: ["Polaris"],
    aircraft: ["787-8", "787-9", "787-10", "777-300ER", "767-300ER", "767-400ER", "788", "789", "781", "77W", "76L", "764"],
    regions: ["North America", "Europe", "Asia"],
    routeKeywords: ["newark", "ewr", "san francisco", "sfo", "london", "tokyo", "frankfurt"],
    notes: "United’s consistent long-haul premium cabin with better bedding and lounges.",
    seatType: "Long-haul business suite",
    recommendedPitch:
      "This flight may feature United Polaris, United’s long-haul premium business class with direct aisle access, better bedding, and a solid overall overnight experience.",
    samplePitch:
      "This flight may feature United Polaris, United’s long-haul premium business class with direct aisle access, better bedding, and a solid overall overnight experience.",
    samplePitchShort:
      "Possible United Polaris — a consistent long-haul premium option with strong sleep comfort.",
  },
  {
    rank: 14,
    airline: "American Airlines",
    cabinName: "Flagship Suite",
    aliases: ["Flagship Suite", "Flagship Business"],
    aircraft: ["787-9", "A321XLR", "789"],
    regions: ["North America", "Europe", "South America"],
    routeKeywords: ["dallas", "dfw", "london", "sao paulo", "madrid"],
    notes: "American’s newer generation premium suite product.",
    seatType: "Next-gen business suite",
    recommendedPitch:
      "If operated by American’s newest configured aircraft, this route may feature the Flagship Suite, a more private next-generation business class seat that feels materially better than older AA widebody products.",
    samplePitch:
      "If operated by American’s newest configured aircraft, this route may feature the Flagship Suite, a more private next-generation business class seat that feels materially better than older AA widebody products.",
    samplePitchShort:
      "Possible American Flagship Suite — more private and more premium than older AA business class.",
  },
  {
    rank: 15,
    airline: "JetBlue",
    cabinName: "Mint Suite",
    aliases: ["Mint", "Mint Suite", "Mint Studio"],
    aircraft: ["A321LR", "A321XLR", "A321neo", "32Q", "321"],
    regions: ["North America", "Europe"],
    routeKeywords: ["jfk", "boston", "london", "paris", "dublin"],
    notes: "One of the strongest narrowbody premium products in the market.",
    seatType: "Narrowbody premium suite",
    recommendedPitch:
      "This flight may feature JetBlue Mint, one of the most compelling premium products across the Atlantic, with a boutique feel, strong privacy, and very competitive overall value.",
    samplePitch:
      "This flight may feature JetBlue Mint, one of the most compelling premium products across the Atlantic, with a boutique feel, strong privacy, and very competitive overall value.",
    samplePitchShort:
      "Possible JetBlue Mint — one of the best-value premium products across the Atlantic.",
  },
  {
    rank: 16,
    airline: "Turkish Airlines",
    cabinName: "New Crystal Business Class",
    aliases: ["Crystal Business Class", "Turkish Business"],
    aircraft: ["A350-900", "787-9", "359", "789"],
    regions: ["Europe", "Asia", "Middle East", "North America"],
    routeKeywords: ["istanbul", "ist", "new york", "london", "tokyo"],
    notes: "Much stronger on newer aircraft than the older long-haul seat.",
    seatType: "Modern flagship business class",
    recommendedPitch:
      "If this route is on Turkish’s newer long-haul aircraft, the experience is much stronger than the older generation, with a more modern seat, better privacy, and excellent catering as a bonus.",
    samplePitch:
      "If this route is on Turkish’s newer long-haul aircraft, the experience is much stronger than the older generation, with a more modern seat, better privacy, and excellent catering as a bonus.",
    samplePitchShort:
      "Possible new Turkish business class — better privacy and excellent catering on newer aircraft.",
  },
  {
    rank: 17,
    airline: "Air India",
    cabinName: "New Business Class Suite",
    aliases: ["Air India Business", "Business Suite"],
    aircraft: ["A350-900", "359"],
    regions: ["Asia", "Europe", "North America"],
    routeKeywords: ["delhi", "del", "mumbai", "bom", "london", "new york"],
    notes: "The newer A350 product is a meaningful improvement versus the older fleet.",
    seatType: "Modern business suite",
    recommendedPitch:
      "If this is one of Air India’s newer A350 flights, the business class is a major step up from the older fleet, with a much more modern seat and a cleaner overall premium experience.",
    samplePitch:
      "If this is one of Air India’s newer A350 flights, the business class is a major step up from the older fleet, with a much more modern seat and a cleaner overall premium experience.",
    samplePitchShort:
      "Possible new Air India business class — a big improvement versus the older fleet.",
  },
  {
    rank: 18,
    airline: "Starlux",
    cabinName: "Business Class Suite",
    aliases: ["Starlux Business"],
    aircraft: ["A350-900", "A330-900", "359", "339"],
    regions: ["Asia", "North America"],
    routeKeywords: ["taipei", "tpe", "los angeles", "lax", "san francisco", "sfo", "seattle"],
    notes: "Beautifully finished premium product with a boutique feel.",
    seatType: "Modern premium suite",
    recommendedPitch:
      "This route may feature Starlux’s long-haul business class, a polished and modern product with excellent cabin aesthetics, strong comfort, and a boutique premium feel.",
    samplePitch:
      "This route may feature Starlux’s long-haul business class, a polished and modern product with excellent cabin aesthetics, strong comfort, and a boutique premium feel.",
    samplePitchShort:
      "Possible Starlux business class — polished, modern, and boutique-feeling.",
  },
  {
    rank: 19,
    airline: "SWISS",
    cabinName: "SWISS Senses / Business Class",
    aliases: ["SWISS Senses", "SWISS Business"],
    aircraft: ["A350-900", "A330-300", "777-300ER", "359", "333", "77W"],
    regions: ["Europe", "North America", "Asia"],
    routeKeywords: ["zurich", "zrh", "new york", "singapore", "hong kong"],
    notes: "Best positioned on flagship long-haul routes and newest refits.",
    seatType: "Flagship long-haul business class",
    recommendedPitch:
      "Depending on aircraft and refit status, this route may feature SWISS’s newer generation premium product or the current flagship business cabin, which is generally strongest on long-haul flagship routes.",
    samplePitch:
      "Depending on aircraft and refit status, this route may feature SWISS’s newer generation premium product or the current flagship business cabin, which is generally strongest on long-haul flagship routes.",
    samplePitchShort:
      "Possible SWISS flagship business class — strongest on long-haul flagship routes and newest refits.",
  },
  {
    rank: 20,
    airline: "Finnair",
    cabinName: "AirLounge",
    aliases: ["AirLounge"],
    aircraft: ["A330-300", "A350-900", "333", "359"],
    regions: ["Europe", "Asia", "North America"],
    routeKeywords: ["helsinki", "hel", "tokyo", "singapore", "new york", "bangkok"],
    notes: "Distinctive non-recline shell-style seat with a lounge-like feel.",
    seatType: "Lounge-style shell seat",
    recommendedPitch:
      "This route may feature Finnair’s AirLounge seat, one of the more distinctive business class products in the market, designed with a modern lounge-style shell that feels spacious and different from a standard recliner-style suite.",
    samplePitch:
      "This route may feature Finnair’s AirLounge seat, one of the more distinctive business class products in the market, designed with a modern lounge-style shell that feels spacious and different from a standard recliner-style suite.",
    samplePitchShort:
      "Possible Finnair AirLounge — distinctive lounge-style business class with a very modern feel.",
  },
];

function normalizeText(value?: string) {
  return (value || "").toLowerCase().trim();
}

function normalizeAircraft(value?: string) {
  return (value || "")
    .toLowerCase()
    .replace(/airbus/g, "a")
    .replace(/boeing/g, "")
    .replace(/\s+/g, "")
    .replace(/–/g, "-")
    .replace(/—/g, "-")
    .toUpperCase();
}

function safeIncludes(base: string, target: string) {
  if (!base || !target) return false;
  return base.includes(target) || target.includes(base);
}

function scoreCabinMatch(product: CabinProduct, airline?: string, route?: string, aircraft?: string): MatchResult {
  const airlineNorm = normalizeText(airline);
  const routeNorm = normalizeText(route);
  const aircraftNorm = normalizeAircraft(aircraft);

  const airlineMatched =
    normalizeText(product.airline) === airlineNorm ||
    (product.aliases || []).some((alias) => normalizeText(alias) === airlineNorm);

  const aircraftMatched = product.aircraft.some((a) => safeIncludes(aircraftNorm, normalizeAircraft(a)));

  const routeMatched = (product.routeKeywords || []).some((kw) => routeNorm.includes(normalizeText(kw)));

  let score = 0;
  if (airlineMatched) score += 60;
  if (aircraftMatched) score += 30;
  if (routeMatched) score += 15;

  return {
    score,
    airlineMatched,
    aircraftMatched,
    routeMatched,
  };
}

function getRecommendedCabins(params: { airline?: string; route?: string; aircraft?: string }) {
  const { airline, route, aircraft } = params;

  return TOP_CABIN_PRODUCTS.map((product) => ({
    ...product,
    match: scoreCabinMatch(product, airline, route, aircraft),
  }))
    .filter((item) => item.match.airlineMatched || item.match.score >= 70)
    .sort((a, b) => b.match.score - a.match.score || a.rank - b.rank);
}

function getAutoCabinRecommendation(params: { airline?: string; route?: string; aircraft?: string }) {
  const matches = getRecommendedCabins(params);
  return matches[0] || null;
}

function buildClientPitch(params: { airline?: string; route?: string; aircraft?: string }) {
  const recommendation = getAutoCabinRecommendation(params);

  if (!recommendation) {
    return "This looks like a strong premium cabin option based on the airline and aircraft, though final seat type can vary by configuration. I’d still be comfortable positioning it as a solid long-haul business class choice.";
  }

  return recommendation.recommendedPitch || recommendation.samplePitch;
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    console.error("Copy failed:", error);
  }
}

export default function Page() {
  const [airline, setAirline] = useState("");
  const [route, setRoute] = useState("");
  const [aircraftType, setAircraftType] = useState("");
  const [selectedCabinName, setSelectedCabinName] = useState("");
  const [copiedLabel, setCopiedLabel] = useState("");

  const autoCabin = useMemo(
    () =>
      getAutoCabinRecommendation({
        airline,
        route,
        aircraft: aircraftType,
      }),
    [airline, route, aircraftType]
  );

  const matchingCabins = useMemo(
    () =>
      getRecommendedCabins({
        airline,
        route,
        aircraft: aircraftType,
      }),
    [airline, route, aircraftType]
  );

  const recommendedPitch = useMemo(
    () =>
      buildClientPitch({
        airline,
        route,
        aircraft: aircraftType,
      }),
    [airline, route, aircraftType]
  );

  useEffect(() => {
    if (autoCabin) {
      setSelectedCabinName(autoCabin.cabinName);
    } else {
      setSelectedCabinName("");
    }
  }, [autoCabin]);

  const handleCopy = async (text: string, label: string) => {
    await copyText(text);
    setCopiedLabel(label);
    window.setTimeout(() => setCopiedLabel(""), 1500);
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.headerCard}>
          <div style={styles.eyebrow}>Premium Cabin Matcher</div>
          <h1 style={styles.h1}>Top 20 airline-specialized cabin names</h1>
          <p style={styles.subhead}>
            Enter airline, route, and aircraft type to auto-surface the most relevant branded premium cabin and generate
            an easy-to-copy client pitch.
          </p>
        </div>

        <div style={styles.card}>
          <div style={styles.sectionTitle}>Flight inputs</div>

          <div style={styles.grid2}>
            <div>
              <div style={styles.kvTitle}>Airline</div>
              <input
                value={airline}
                onChange={(e) => setAirline(e.target.value)}
                placeholder="e.g. Lufthansa"
                style={styles.input}
              />
            </div>

            <div>
              <div style={styles.kvTitle}>Aircraft type</div>
              <input
                value={aircraftType}
                onChange={(e) => setAircraftType(e.target.value)}
                placeholder="e.g. A350-900"
                style={styles.input}
              />
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <div style={styles.kvTitle}>Route</div>
            <input
              value={route}
              onChange={(e) => setRoute(e.target.value)}
              placeholder="e.g. MUC-SFO or Munich to San Francisco"
              style={styles.input}
            />
          </div>

          <div style={styles.actionsRow}>
            <button
              style={{ ...styles.btn, ...styles.btnPrimary }}
              onClick={() => {
                setAirline("");
                setRoute("");
                setAircraftType("");
              }}
            >
              Reset
            </button>
            <button
              style={{ ...styles.btn, ...styles.btnAccent }}
              onClick={() => handleCopy(recommendedPitch, "pitch")}
            >
              Copy current pitch
            </button>
          </div>

          {copiedLabel ? <div style={styles.note}>Copied {copiedLabel}.</div> : null}
        </div>

        <div style={styles.sellBox}>
          <div style={styles.sellTitle}>
            Specialized Cabin Recommendation
            {autoCabin ? <span style={styles.newTag}>Auto-matched</span> : null}
          </div>

          {autoCabin ? (
            <>
              <div style={styles.pitchLine}>
                <strong>
                  #{autoCabin.rank} {autoCabin.airline} — {autoCabin.cabinName}
                </strong>
              </div>

              <div style={styles.pitchLine}>{autoCabin.notes}</div>

              <div style={styles.productStrip}>
                <div>
                  <div style={styles.kvTitle}>Matched airline</div>
                  <div style={styles.kvValue}>{autoCabin.airline}</div>
                </div>
                <div>
                  <div style={styles.kvTitle}>Aircraft fit</div>
                  <div style={styles.kvValue}>{autoCabin.match.aircraftMatched ? "Yes" : "Check config"}</div>
                </div>
                <div>
                  <div style={styles.kvTitle}>Route fit</div>
                  <div style={styles.kvValue}>{autoCabin.match.routeMatched ? "Strong" : "General match"}</div>
                </div>
                <div>
                  <div style={styles.kvTitle}>Seat type</div>
                  <div style={styles.kvValue}>{autoCabin.seatType || "Premium business class"}</div>
                </div>
              </div>

              {selectedCabinName ? <div style={styles.note}>Auto-selected cabin: {selectedCabinName}</div> : null}

              <div style={styles.sellBoxInner}>
                <div style={styles.sellTitle}>Recommended client pitch</div>
                <div style={styles.pitchLine}>{recommendedPitch}</div>

                <div style={styles.actionsRow}>
                  <button
                    style={{ ...styles.mini, ...styles.miniPrimary }}
                    onClick={() => handleCopy(recommendedPitch, "pitch")}
                  >
                    Copy pitch
                  </button>

                  <button
                    style={{ ...styles.mini, ...styles.miniSecondary }}
                    onClick={() =>
                      handleCopy(`${autoCabin.airline} — ${autoCabin.cabinName}\n\n${recommendedPitch}`, "cabin + pitch")
                    }
                  >
                    Copy cabin + pitch
                  </button>

                  <button
                    style={{ ...styles.mini, ...styles.miniGhost }}
                    onClick={() => handleCopy(autoCabin.samplePitchShort, "short pitch")}
                  >
                    Copy short version
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div style={styles.note}>Enter airline, route, and aircraft type to auto-surface the best branded cabin.</div>
          )}
        </div>

        {matchingCabins.length > 0 ? (
          <div style={styles.card}>
            <div style={styles.sectionTitle}>Best matching cabin options</div>
            <div style={{ display: "grid", gap: 10 }}>
              {matchingCabins.slice(0, 5).map((item) => (
                <div key={`${item.airline}-${item.cabinName}`} style={styles.compareCard}>
                  <div style={styles.compareHeader}>
                    <div>
                      <div style={styles.compareTitle}>
                        #{item.rank} {item.airline} — {item.cabinName}
                      </div>
                      <div style={styles.note}>
                        Score: {item.match.score} · Aircraft {item.match.aircraftMatched ? "matched" : "not confirmed"} · Route{" "}
                        {item.match.routeMatched ? "matched" : "general"}
                      </div>
                    </div>

                    <button
                      style={{ ...styles.mini, ...styles.miniSecondary }}
                      onClick={() => handleCopy(item.samplePitch, `${item.airline} pitch`)}
                    >
                      Copy pitch
                    </button>
                  </div>

                  <div style={styles.pitchLine}>{item.notes}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div style={styles.sellBox}>
          <div style={styles.sellTitle}>Top 20 Specialized Airline Cabins</div>

          <div style={{ display: "grid", gap: 10 }}>
            {TOP_CABIN_PRODUCTS.map((item) => {
              const isActive =
                normalizeText(item.airline) === normalizeText(airline) &&
                item.aircraft.some((a) => safeIncludes(normalizeAircraft(aircraftType), normalizeAircraft(a)));

              return (
                <div
                  key={`${item.airline}-${item.cabinName}`}
                  style={{
                    ...styles.cabinCard,
                    border: isActive ? "1px solid #6D5EF3" : "1px solid #eee",
                    background: isActive ? "#f6f3ff" : "#fff",
                  }}
                >
                  <div style={styles.cabinCardTop}>
                    <div>
                      <div style={styles.compareTitle}>
                        #{item.rank} {item.airline} — {item.cabinName}
                        {isActive ? <span style={styles.newTag}>Matched</span> : null}
                      </div>
                      <div style={{ marginTop: 4, fontSize: 13, color: "#555" }}>{item.notes}</div>
                    </div>

                    <button
                      style={{ ...styles.mini, ...styles.miniSecondary, height: 36 }}
                      onClick={() => handleCopy(item.samplePitch, `${item.airline} pitch`)}
                    >
                      Copy pitch
                    </button>
                  </div>

                  <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {(item.aircraft || []).slice(0, 6).map((ac) => (
                      <span key={ac} style={styles.miniTag}>
                        {ac}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f6f7fb",
    padding: 24,
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },

  container: {
    maxWidth: 1100,
    margin: "0 auto",
    display: "grid",
    gap: 16,
  },

  headerCard: {
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: 24,
    padding: 24,
    boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
  },

  eyebrow: {
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: 1.1,
    textTransform: "uppercase",
    color: "#6D5EF3",
    marginBottom: 8,
  },

  h1: {
    margin: 0,
    fontSize: 32,
    lineHeight: 1.1,
    fontWeight: 900,
    color: "#111",
  },

  subhead: {
    margin: "10px 0 0",
    fontSize: 15,
    lineHeight: 1.6,
    color: "#555",
    maxWidth: 820,
  },

  card: {
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: 20,
    padding: 18,
    boxShadow: "0 6px 20px rgba(0,0,0,0.03)",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 900,
    color: "#111",
    marginBottom: 12,
  },

  input: {
    width: "100%",
    marginTop: 6,
    height: 42,
    borderRadius: 12,
    border: "1px solid #ddd",
    padding: "0 12px",
    fontSize: 14,
    outline: "none",
    background: "#fff",
  },

  btn: {
    height: 42,
    padding: "0 14px",
    borderRadius: 12,
    border: "1px solid #ddd",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    fontWeight: 800,
  },

  btnPrimary: { background: "#111", color: "white" },
  btnSecondary: { background: "#f3f4f6", color: "#111" },
  btnGhost: { background: "white", color: "#111" },
  btnAccent: { background: "#6D5EF3", color: "white", border: "1px solid rgba(0,0,0,0.06)" },

  productStrip: {
    marginTop: 14,
    padding: 12,
    borderRadius: 16,
    border: "1px solid #eee",
    background: "#fafafa",
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },

  kvTitle: { fontSize: 12, color: "#666", fontWeight: 800 },
  kvValue: { marginTop: 2, fontWeight: 900, color: "#111" },

  newTag: {
    display: "inline-block",
    marginLeft: 8,
    padding: "2px 8px",
    borderRadius: 999,
    border: "1px solid #ddd",
    fontSize: 12,
    background: "white",
    fontWeight: 900,
  },

  miniTag: {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: 999,
    border: "1px solid #eee",
    fontSize: 12,
    background: "#fafafa",
    fontWeight: 800,
  },

  sellBox: {
    border: "1px solid #eee",
    background: "#fff",
    borderRadius: 20,
    padding: 18,
    boxShadow: "0 6px 20px rgba(0,0,0,0.03)",
  },

  sellBoxInner: {
    marginTop: 12,
    border: "1px solid #eee",
    background: "#fff",
    borderRadius: 16,
    padding: 12,
  },

  sellTitle: { fontWeight: 900, marginBottom: 8, fontSize: 18, color: "#111" },

  pitchLine: { marginBottom: 8, color: "#222", fontSize: 14, lineHeight: 1.55 },

  note: { marginTop: 10, fontSize: 12, color: "#666" },

  warn: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 12,
    border: "1px solid #f2c200",
    background: "#fff7cc",
    color: "#5a4700",
    fontSize: 13,
  },

  bullets: { margin: "8px 0 0", paddingLeft: 18, color: "#333", fontSize: 13 },

  comparePicker: { display: "flex", gap: 10, flexWrap: "wrap", margin: "10px 0 12px" },

  check: {
    display: "flex",
    gap: 6,
    alignItems: "center",
    border: "1px solid #eee",
    borderRadius: 999,
    padding: "6px 10px",
    background: "#fafafa",
  },

  grid2: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 12,
  },

  compareCard: {
    border: "1px solid #eee",
    borderRadius: 16,
    padding: 12,
    background: "#fff",
  },

  compareHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 6,
  },

  compareTitle: { fontWeight: 900, color: "#111" },

  actionsRow: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 },

  mini: {
    padding: "8px 10px",
    borderRadius: 12,
    border: "1px solid #ddd",
    background: "white",
    cursor: "pointer",
    fontSize: 12,
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontWeight: 900,
  },

  miniPrimary: { background: "#111", color: "white" },
  miniSecondary: { background: "#f3f4f6", color: "#111" },
  miniGhost: { background: "white", color: "#111" },

  cabinCard: {
    borderRadius: 16,
    padding: 12,
    transition: "all 0.2s ease",
  },

  cabinCardTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
  },
};