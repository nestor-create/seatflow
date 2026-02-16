"use client";

import { useMemo, useState } from "react";

/* =========================================================
   OPTIONAL DIRECT LINKS (better when mapped)
   Key format: "AIRLINE|AIRCRAFT"
   ========================================================= */

const SEATMAPS_URLS: Record<string, string> = {
  "LH|A350-900": "https://seatmaps.com/airlines/lh-lufthansa/airbus-a350-900/",
  "NH|777-300ER": "https://seatmaps.com/airlines/nh-all-nippon-airways/boeing-777-300er/",
  "BA|A350-1000": "https://seatmaps.com/airlines/ba-british-airways/airbus-a350-1000/",
  "AA|777-300ER": "https://seatmaps.com/airlines/aa-american-airlines/boeing-777-300er/",
  "QR|A350-1000": "https://seatmaps.com/airlines/qr-qatar-airways/airbus-a350-1000/",
  "SQ|A350-900": "https://seatmaps.com/airlines/sq-singapore-airlines/airbus-a350-900/",
  "EK|A380": "https://seatmaps.com/airlines/ek-emirates/airbus-a380/",
  "AF|777-300ER": "https://seatmaps.com/airlines/af-air-france/boeing-777-300er/",
  "UA|787-9": "https://seatmaps.com/airlines/ua-united-airlines/boeing-787-9/",
  "DL|A350-900": "https://seatmaps.com/airlines/dl-delta/airbus-a350-900/",
};

const AEROLOPA_URLS: Record<string, string> = {
  "LH|A350-900": "https://www.aerolopa.com/lh-359",
  "NH|777-300ER": "https://www.aerolopa.com/nh-773",
  "BA|A350-1000": "https://www.aerolopa.com/ba-351",
  "AA|777-300ER": "https://www.aerolopa.com/aa-773",
  "QR|A350-1000": "https://www.aerolopa.com/qr-351",
};

/* =========================================================
   TOP 10 AIRLINES
   ========================================================= */

const TOP_AIRLINES: { code: string; name: string }[] = [
  { code: "AA", name: "American Airlines" },
  { code: "BA", name: "British Airways" },
  { code: "LH", name: "Lufthansa" },
  { code: "NH", name: "ANA" },
  { code: "QR", name: "Qatar Airways" },
  { code: "SQ", name: "Singapore Airlines" },
  { code: "EK", name: "Emirates" },
  { code: "AF", name: "Air France" },
  { code: "UA", name: "United Airlines" },
  { code: "DL", name: "Delta Air Lines" },
];

type Cabin = "Economy" | "Premium Economy" | "Business" | "First";

type Product = {
  airline: string;
  cabin: Cabin;
  name: string;
  isNew?: boolean;
  since?: string;
  positioning: string;
  clientPitch: string;
  proofPoints: string[];
  notes?: string;
  aircraftHints?: string[];
  priority?: number;
};

/* =========================================================
   PRODUCTS — aircraft-aware rules for top 10 airlines
   ========================================================= */

const PRODUCTS: Product[] = [
  // LH
  {
    airline: "LH",
    cabin: "Business",
    name: "Allegris",
    isNew: true,
    since: "New-generation cabin (flight-dependent)",
    positioning: "Lufthansa’s newest long-haul Business Class",
    clientPitch:
      "If you want the most modern Lufthansa Business experience, Allegris is the one to target — it’s the clearest ‘new cabin’ upgrade when the operating aircraft matches.",
    proofPoints: [
      "Strong ‘new product’ story vs older cabins.",
      "More premium feel for long-haul comfort (layout dependent).",
      "We’ll confirm the exact configuration via seat plan + seat map before you commit.",
    ],
    notes: "Not on every route/aircraft — always verify on the exact flight/date.",
    aircraftHints: ["A350-900", "A350-1000", "787-9", "777-9", "A359", "A35K", "789"],
    priority: 100,
  },
  {
    airline: "LH",
    cabin: "Business",
    name: "Lufthansa Business (standard)",
    positioning: "Strong schedule-led option when Allegris isn’t operating",
    clientPitch:
      "This is a strong Lufthansa option for the route — we’ll confirm the exact seat layout on the operating aircraft so expectations match the cabin on the day.",
    proofPoints: [
      "Great when schedule and pricing are the best fit.",
      "Seat map verification reduces surprises.",
      "We can optimize seat selection once aircraft is confirmed.",
    ],
    priority: 10,
  },

  // NH
  {
    airline: "NH",
    cabin: "Business",
    name: "The Room",
    isNew: true,
    since: "Flagship (aircraft-dependent)",
    positioning: "One of the most spacious Business Class seats when operating",
    clientPitch:
      "ANA ‘The Room’ is a standout pick — when it’s on the flight, it’s a flagship-level experience with a spacious, suite-like feel that’s excellent for sleep and comfort.",
    proofPoints: [
      "Premium ‘flagship’ story clients understand instantly.",
      "Excellent comfort + privacy narrative.",
      "We’ll verify the configuration before booking.",
    ],
    notes: "Typically on select 777-300ER configurations; confirm via seat map.",
    aircraftHints: ["777-300ER", "77W", "773"],
    priority: 100,
  },
  {
    airline: "NH",
    cabin: "Business",
    name: "ANA Business (standard)",
    positioning: "Reliable premium choice when The Room isn’t operating",
    clientPitch:
      "A strong ANA option — we’ll confirm the exact seat layout on the operating aircraft so the experience matches what you’re expecting.",
    proofPoints: [
      "Quality premium positioning.",
      "Seat map confirmation for your exact flight.",
      "Strong comparison option on route/price tradeoffs.",
    ],
    priority: 10,
  },

  // BA
  {
    airline: "BA",
    cabin: "Business",
    name: "Club Suite",
    isNew: true,
    since: "Aircraft-dependent",
    positioning: "BA’s modern Business Class with a more premium feel",
    clientPitch:
      "When British Airways is operating Club Suite, it’s the best BA Business option to go for — a noticeably more premium experience versus older BA business layouts.",
    proofPoints: [
      "Clear ‘upgrade’ story vs legacy BA business.",
      "Better privacy and overnight comfort narrative.",
      "We’ll confirm configuration on your exact flight before you commit.",
    ],
    notes: "Aircraft-dependent; verify via seat plan/map.",
    aircraftHints: ["A350-1000", "787-10", "7810", "777-300ER", "777"],
    priority: 100,
  },
  {
    airline: "BA",
    cabin: "Business",
    name: "BA Business (legacy)",
    positioning: "Schedule-led choice when Club Suite isn’t operating",
    clientPitch:
      "A workable premium option when timing is the priority — we’ll confirm the aircraft and seat layout so expectations match the cabin.",
    proofPoints: ["Best for schedule fit.", "Seat map confirmation for the exact product.", "Useful value comparison vs other J options."],
    priority: 10,
  },

  // QR
  {
    airline: "QR",
    cabin: "Business",
    name: "Qsuite",
    isNew: true,
    since: "Aircraft-dependent",
    positioning: "Benchmark Business Class when available",
    clientPitch:
      "Qsuite is a premium recommendation — when it’s on the aircraft, it’s one of the most compelling Business Class products to sell on comfort, privacy and overall experience.",
    proofPoints: [
      "Flagship positioning with strong premium reputation.",
      "Great comfort + privacy narrative.",
      "We’ll confirm Qsuite availability on the exact flight.",
    ],
    notes: "Not on every aircraft; verify using seat map.",
    aircraftHints: ["A350-1000", "777-300ER", "787-9", "77W", "789"],
    priority: 100,
  },
  {
    airline: "QR",
    cabin: "Business",
    name: "Qatar Business (standard)",
    positioning: "Strong premium choice even when Qsuite isn’t operating",
    clientPitch:
      "A strong Qatar option — we’ll verify the exact seat layout on the operating aircraft so the experience matches the expectation before booking.",
    proofPoints: ["Premium brand perception.", "Seat map verification.", "Solid comparison vs other long-haul business options."],
    priority: 10,
  },

  // SQ
  {
    airline: "SQ",
    cabin: "Business",
    name: "Singapore Airlines Business",
    positioning: "A highly reliable premium choice with strong brand pull",
    clientPitch:
      "Singapore Airlines is an easy premium recommendation — a strong, consistent experience that tends to land well with clients who prioritize quality and reliability.",
    proofPoints: ["Strong premium perception.", "Consistency story.", "We’ll confirm exact seat map for your flight."],
    aircraftHints: ["A350-900", "777-300ER", "787-10", "7810", "77W"],
    priority: 50,
  },

  // EK
  {
    airline: "EK",
    cabin: "First",
    name: "Emirates First (A380 when operating)",
    isNew: true,
    since: "Aircraft-dependent",
    positioning: "A statement First Class choice with major wow-factor",
    clientPitch:
      "Emirates First is a standout for clients who want the journey to feel special — it’s memorable, premium, and easy to justify for the right trip.",
    proofPoints: ["Very strong ‘wow’ story.", "Aircraft matters — we confirm before booking.", "Excellent for VIP travel and special occasions."],
    notes: "Best story on A380; confirm aircraft type.",
    aircraftHints: ["A380"],
    priority: 100,
  },
  {
    airline: "EK",
    cabin: "Business",
    name: "Emirates Business",
    positioning: "Premium brand-led choice with strong recognition",
    clientPitch:
      "Emirates Business is a strong option when you want a premium brand experience — we’ll verify the aircraft and seat layout so expectations match the cabin on the day.",
    proofPoints: ["Brand-led premium sell.", "Layout varies — we confirm.", "Good comparison against other business cabins."],
    priority: 20,
  },

  // AF
  {
    airline: "AF",
    cabin: "First",
    name: "La Première",
    isNew: true,
    since: "Route/aircraft dependent",
    positioning: "Best-available positioning for top-tier travel",
    clientPitch:
      "If the goal is ‘best available’, La Première is the top-tier choice — rare, exclusive, and positioned for clients who want the highest-end experience.",
    proofPoints: ["Perfect for VIP travel.", "Strong exclusivity narrative.", "We confirm aircraft/cabin availability before you commit."],
    aircraftHints: ["777-300ER", "77W", "773"],
    priority: 100,
  },
  {
    airline: "AF",
    cabin: "Business",
    name: "Air France Business",
    positioning: "Strong premium choice with a refined feel",
    clientPitch:
      "Air France Business is a strong premium option — we’ll confirm the exact seat layout for your flight so you know precisely what to expect before booking.",
    proofPoints: ["Premium positioning.", "Layout varies — we verify.", "Solid comparison vs other business cabins."],
    priority: 20,
  },

  // UA
  {
    airline: "UA",
    cabin: "Business",
    name: "Polaris",
    positioning: "Consistent long-haul Business baseline",
    clientPitch:
      "United Polaris is a solid long-haul premium option — an easy recommendation when timing, routing, and value make it the best overall choice.",
    proofPoints: ["Reliable premium narrative.", "Great schedule/value-driven recommendation.", "We confirm configuration via seat map."],
    aircraftHints: ["787-9", "777-300ER", "77W", "789"],
    priority: 40,
  },

  // DL
  {
    airline: "DL",
    cabin: "Business",
    name: "Delta One",
    positioning: "Premium long-haul option with strong overall experience",
    clientPitch:
      "Delta One is a strong premium alternative — especially when timing lines up and you want a clean, confident recommendation for the route.",
    proofPoints: ["Strong premium positioning.", "Layout varies — we confirm.", "Great option when itinerary is the priority."],
    aircraftHints: ["A350-900", "A330-900", "339", "359"],
    priority: 40,
  },

  // AA
  {
    airline: "AA",
    cabin: "Business",
    name: "Flagship Business",
    positioning: "Competitive long-haul Business on key routes",
    clientPitch:
      "American Flagship Business can be a great value premium pick — especially when availability and pricing are favorable versus other business options.",
    proofPoints: ["Strong comparison option.", "Good value-led premium story.", "We confirm the aircraft configuration via seat map."],
    aircraftHints: ["777-300ER", "787-9", "77W", "789", "773"],
    priority: 40,
  },

  // Fallbacks (ensure always something exists once route+aircraft are entered)
  ...TOP_AIRLINES.flatMap((a) => ([
    {
      airline: a.code,
      cabin: "Economy" as Cabin,
      name: "Economy",
      positioning: "Best value and schedule fit on the route",
      clientPitch:
        "This is a strong value option — we’ll confirm the operating aircraft and help optimize seat selection so the journey matches the expectation.",
      proofPoints: ["Best for value and timing.", "Seat map confirmation reduces surprises.", "We can optimize seat selection once aircraft is confirmed."],
      priority: 1,
    },
    {
      airline: a.code,
      cabin: "Premium Economy" as Cabin,
      name: "Premium Economy",
      positioning: "Comfort upgrade without full Business pricing",
      clientPitch:
        "Premium Economy is often the sweet spot — noticeably more comfort and space, with a much gentler price point than Business.",
      proofPoints: ["Comfort upgrade story clients understand instantly.", "Great for long flights.", "Seat map confirmation for confidence."],
      priority: 1,
    },
    {
      airline: a.code,
      cabin: "First" as Cabin,
      name: "First Class",
      positioning: "Best-available cabin when operating on the route",
      clientPitch:
        "If First is operating, it’s the ‘best available’ option — we’ll confirm the exact aircraft and layout so the experience matches expectations before booking.",
      proofPoints: ["Top-tier positioning when available.", "Aircraft matters — we verify.", "Ideal for VIP or milestone trips."],
      priority: 1,
    },
  ])),
];

/* =========================================================
   Helpers
   ========================================================= */

function normalizeAirline(v: string) {
  return (v || "").trim().toUpperCase();
}
function normalizeRoute(v: string) {
  return (v || "").trim().toUpperCase().replace(/\s+/g, "");
}
function normalizeAircraft(input: string) {
  let x = (input || "").trim().toUpperCase();
  x = x.replace(/^AIRBUS\s+/i, "");
  x = x.replace(/^BOEING\s+/i, "");
  x = x.replace(/[_\s]+/g, "-");

  if (x === "359" || x === "A359") return "A350-900";
  if (x === "351" || x === "A351" || x === "35K" || x === "A35K") return "A350-1000";
  if (x === "77W" || x === "B77W" || x === "773" || x === "B773") return "777-300ER";
  if (x === "789" || x === "B789") return "787-9";
  if (x === "7810" || x === "B7810") return "787-10";
  if (x === "339" || x === "A339") return "A330-900";
  if (x === "380" || x === "A380-800" || x === "A380800") return "A380";

  x = x.replace(/^B(\d)/, "$1");
  if (x.startsWith("A380")) return "A380";
  x = x.replace(/^A350-?900$/, "A350-900");
  x = x.replace(/^A350-?1000$/, "A350-1000");
  if (x === "777-300" || x === "777300") return "777-300ER";
  x = x.replace(/^777-?300ER$/, "777-300ER");
  x = x.replace(/^787-?9$/, "787-9");
  x = x.replace(/^787-?10$/, "787-10");
  x = x.replace(/^A330-?900$/, "A330-900");

  return x;
}

function buildSearchQuery(airline: string, route: string, aircraft: string, cabin: string) {
  const parts = [
    airline && `airline ${airline}`,
    route && `route ${route}`,
    aircraft && `aircraft ${aircraft}`,
    cabin && `cabin ${cabin}`,
    "seat map",
  ].filter(Boolean).join(" ");
  return encodeURIComponent(parts);
}

function prettyAirline(code: string) {
  const found = TOP_AIRLINES.find((a) => a.code === code);
  return found ? `${found.code} · ${found.name}` : code;
}

function isValidRoute(routeKey: string) {
  return /^[A-Z]{3}-[A-Z]{3}$/.test(routeKey);
}

function findProductAuto(airline: string, cabin: Cabin, aircraftKey: string) {
  const a = normalizeAirline(airline);
  const candidates = PRODUCTS.filter((p) => p.airline === a && p.cabin === cabin);
  if (!candidates.length) return null;

  const scored = candidates.map((p) => {
    const pr = p.priority ?? 0;
    const hinted =
      aircraftKey && p.aircraftHints && p.aircraftHints.some((h) => aircraftKey.includes(h)) ? 1000 : 0;
    const newest = p.isNew ? 50 : 0;
    return { p, score: pr + hinted + newest };
  });

  scored.sort((x, y) => y.score - x.score);
  return scored[0].p;
}

/* =========================================================
   Icons
   ========================================================= */

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ display: "inline-flex", width: 18, height: 18, alignItems: "center", justifyContent: "center" }}>
      {children}
    </span>
  );
}

function SeatmapIcon() {
  return (
    <Icon>
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
        <path d="M4 5h16v14H4V5z" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M7 8h2M11 8h2M15 8h2M7 12h2M11 12h2M15 12h2M7 16h2M11 16h2M15 16h2"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    </Icon>
  );
}

function ImageIcon() {
  return (
    <Icon>
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
        <path d="M4 6h16v12H4V6z" stroke="currentColor" strokeWidth="1.6" />
        <path d="M8.5 10a1.2 1.2 0 100-2.4 1.2 1.2 0 000 2.4z" fill="currentColor" />
        <path d="M4 16l5-5 4 4 3-3 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    </Icon>
  );
}

function SparkIcon() {
  return (
    <Icon>
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
        <path d="M12 2l1.2 4.4L18 8l-4.8 1.6L12 14l-1.2-4.4L6 8l4.8-1.6L12 2z" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    </Icon>
  );
}

/* =========================================================
   PAGE
   ========================================================= */

export default function Page() {
  const [airline, setAirline] = useState("");
  const [route, setRoute] = useState("");
  const [aircraft, setAircraft] = useState("");
  const [cabin, setCabin] = useState<Cabin>("Business");
  const [compare, setCompare] = useState<string[]>(["LH", "NH", "BA"]);
  const [logoOk, setLogoOk] = useState(true);

  const airlineKey = useMemo(() => normalizeAirline(airline), [airline]);
  const routeKey = useMemo(() => normalizeRoute(route), [route]);
  const aircraftKey = useMemo(() => normalizeAircraft(aircraft), [aircraft]);

  const routeOk = useMemo(() => isValidRoute(routeKey), [routeKey]);

  // ✅ Only suggest when airline + valid route + aircraft present
  const hasSuggest = airlineKey.length > 0 && routeOk && aircraftKey.length > 0;

  const suggestedProduct = useMemo(
    () => (hasSuggest ? findProductAuto(airlineKey, cabin, aircraftKey) : null),
    [hasSuggest, airlineKey, cabin, aircraftKey]
  );

  const key = `${airlineKey}|${aircraftKey}`;
  const searchQ = useMemo(() => buildSearchQuery(airlineKey, routeKey, aircraftKey, cabin), [airlineKey, routeKey, aircraftKey, cabin]);

  const aerolopaUrl =
    airlineKey && aircraftKey && AEROLOPA_URLS[key]
      ? AEROLOPA_URLS[key]
      : `https://www.aerolopa.com/search?query=${searchQ}`;

  const seatmapsUrl =
    airlineKey && aircraftKey && SEATMAPS_URLS[key]
      ? SEATMAPS_URLS[key]
      : `https://seatmaps.com/search/?q=${searchQ}`;

  const imageUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(`${airlineKey} ${aircraftKey} ${cabin} cabin`)}`;

  function toggleCompare(code: string) {
    setCompare((prev) => (prev.includes(code) ? prev.filter((x) => x !== code) : [...prev, code]));
  }

  async function copyPitch() {
    const header = `${airlineKey} · ${routeKey} · ${aircraftKey} · ${cabin}`;
    const p = suggestedProduct;

    const text = p
      ? [
          header,
          "",
          `Recommended product: ${p.name}${p.isNew ? " (NEW)" : ""}${p.since ? ` · ${p.since}` : ""}`,
          `Positioning: ${p.positioning}`,
          "",
          "Client pitch:",
          p.clientPitch,
          "",
          "Why it stands out:",
          ...p.proofPoints.map((x) => `- ${x}`),
        ].join("\n")
      : [
          header,
          "",
          "Client pitch:",
          "This is a strong option — we’ll confirm the operating aircraft and seat layout so expectations match the cabin before booking.",
        ].join("\n");

    await navigator.clipboard.writeText(text);
    alert("Client pitch copied ✅");
  }

  const compareCards = useMemo(() => {
    return compare.map((code) => {
      const a = normalizeAirline(code);
      const ck = `${a}|${aircraftKey}`;
      const q = buildSearchQuery(a, routeKey, aircraftKey, cabin);
      const prod = hasSuggest ? findProductAuto(a, cabin, aircraftKey) : null;

      return {
        airline: a,
        airlineLabel: prettyAirline(a),
        aerolopaUrl: aircraftKey && AEROLOPA_URLS[ck] ? AEROLOPA_URLS[ck] : `https://www.aerolopa.com/search?query=${q}`,
        seatmapsUrl: aircraftKey && SEATMAPS_URLS[ck] ? SEATMAPS_URLS[ck] : `https://seatmaps.com/search/?q=${q}`,
        imageUrl: `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(`${a} ${aircraftKey} ${cabin} cabin`)}`,
        product: prod,
      };
    });
  }, [compare, routeKey, cabin, aircraftKey, hasSuggest]);

  return (
    <main style={styles.page}>
      <div style={styles.header}>
        <div style={styles.brand}>
          {logoOk ? (
            <img src="/ascend-logo.png" alt="Ascend" style={styles.logo} onError={() => setLogoOk(false)} />
          ) : (
            <div style={styles.logoFallback}>A</div>
          )}

          <div>
            <h1 style={styles.h1}>Ascend Seat Image & Map Project</h1>
            <div style={styles.sub}>
              Auto-suggest appears only after you enter a valid route (AAA-BBB) and aircraft.
            </div>
          </div>
        </div>

        <div style={styles.rightPill}>Route + aircraft gated · Client-ready pitch</div>
      </div>

      <div style={styles.layout}>
        <section style={styles.card}>
          <div style={styles.cardTitle}>Search</div>

          <div style={styles.grid}>
            <Field label="Airline (IATA)">
              <input value={airline} onChange={(e) => setAirline(e.target.value)} style={styles.input} placeholder="e.g. LH" />
            </Field>

            <Field label="Route (AAA-BBB)">
              <input value={route} onChange={(e) => setRoute(e.target.value)} style={styles.input} placeholder="e.g. JFK-LHR" />
              <div style={{ marginTop: 6, fontSize: 12, color: routeKey.length === 0 ? "#777" : (routeOk ? "#0a7" : "#b00") }}>
                {routeKey.length === 0 ? "Example format: JFK-LHR" : routeOk ? "Route looks good ✅" : "Route format should be AAA-BBB"}
              </div>
            </Field>

            <Field label="Aircraft">
              <input value={aircraft} onChange={(e) => setAircraft(e.target.value)} style={styles.input} placeholder="e.g. A350-900 / 359 / 77W / 789" />
            </Field>

            <Field label="Cabin">
              <select value={cabin} onChange={(e) => setCabin(e.target.value as Cabin)} style={styles.input}>
                <option>Economy</option>
                <option>Premium Economy</option>
                <option>Business</option>
                <option>First</option>
              </select>
            </Field>
          </div>

          <div style={styles.actions}>
            <a href={`https://www.aerolopa.com/search?query=${searchQ}`} target="_blank" rel="noreferrer">
              <button style={{ ...styles.btn, ...styles.btnPrimary }} disabled={!hasSuggest}>
                AeroLOPA Seat Plan
              </button>
            </a>

            <a href={`https://seatmaps.com/search/?q=${searchQ}`} target="_blank" rel="noreferrer">
              <button style={{ ...styles.btn, ...styles.btnSecondary }} disabled={!hasSuggest}>
                <SeatmapIcon /> SeatMaps
              </button>
            </a>

            <a href={imageUrl} target="_blank" rel="noreferrer">
              <button style={{ ...styles.btn, ...styles.btnGhost }} disabled={!hasSuggest}>
                <ImageIcon /> Aircraft Images
              </button>
            </a>

            <button style={{ ...styles.btn, ...styles.btnAccent }} disabled={!hasSuggest} onClick={copyPitch}>
              <SparkIcon /> Copy client pitch
            </button>
          </div>

          <div style={styles.productStrip}>
            <div>
              <div style={styles.kvTitle}>Auto-suggest status</div>
              <div style={styles.kvValue}>
                {hasSuggest ? "Ready ✅" : "Enter Airline + valid Route + Aircraft to unlock suggestions"}
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={styles.kvTitle}>Suggested product</div>
              <div style={styles.kvValue}>
                {hasSuggest && suggestedProduct ? (
                  <>
                    {suggestedProduct.name} {suggestedProduct.isNew ? <span style={styles.newTag}>NEW</span> : null}
                  </>
                ) : (
                  <span style={{ color: "#777" }}>—</span>
                )}
              </div>
            </div>
          </div>

          {hasSuggest && suggestedProduct ? (
            <div style={styles.sellBox}>
              <div style={styles.sellTitle}>Client-ready pitch</div>
              <div style={styles.pitchLine}><b>{suggestedProduct.positioning}</b></div>
              <div style={styles.pitchLine}>{suggestedProduct.clientPitch}</div>
              <div style={{ marginTop: 10 }}>
                <div style={styles.pitchLine}><b>Why it stands out:</b></div>
                <ul style={styles.bullets}>
                  {suggestedProduct.proofPoints.map((s) => <li key={s}>{s}</li>)}
                </ul>
              </div>
            </div>
          ) : null}
        </section>

        <section style={styles.card}>
          <div style={styles.cardTitle}>Compare options</div>
          <div style={styles.small}>Compare unlocks once your route + aircraft are filled.</div>

          <div style={styles.comparePicker}>
            {TOP_AIRLINES.map((a) => (
              <label key={a.code} style={styles.check}>
                <input type="checkbox" checked={compare.includes(a.code)} onChange={() => toggleCompare(a.code)} />
                <span>{a.code}</span>
              </label>
            ))}
          </div>

          <div style={styles.grid2}>
            {compareCards.map((c) => (
              <div key={c.airline} style={styles.compareCard}>
                <div style={styles.compareHeader}>
                  <div style={styles.compareTitle}>{c.airlineLabel}</div>
                  {c.product?.isNew ? <span style={styles.newTag}>NEW</span> : null}
                </div>

                <div style={styles.small}>
                  <b>Route:</b> {routeKey || "—"} <br />
                  <b>Aircraft:</b> {aircraftKey || "—"} · <b>Cabin:</b> {cabin}
                  <br />
                  <b>Product:</b> {c.product ? c.product.name : "—"}
                </div>

                <div style={styles.comparePitch}>
                  {c.product?.clientPitch || (hasSuggest ? "A strong option — we’ll confirm the aircraft and seat layout so expectations match the cabin." : "Fill route + aircraft to show pitch.")}
                </div>

                <div style={styles.actionsRow}>
                  <a href={c.aerolopaUrl} target="_blank" rel="noreferrer">
                    <button style={{ ...styles.mini, ...styles.miniPrimary }} disabled={!hasSuggest}>
                      Seat plan
                    </button>
                  </a>
                  <a href={c.seatmapsUrl} target="_blank" rel="noreferrer">
                    <button style={{ ...styles.mini, ...styles.miniSecondary }} disabled={!hasSuggest}>
                      <SeatmapIcon /> Seat map
                    </button>
                  </a>
                  <a href={c.imageUrl} target="_blank" rel="noreferrer">
                    <button style={{ ...styles.mini, ...styles.miniGhost }} disabled={!hasSuggest}>
                      <ImageIcon /> Images
                    </button>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={styles.label}>
      <span style={styles.labelText}>{label}</span>
      {children}
    </label>
  );
}

/* =========================================================
   STYLES
   ========================================================= */

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: 1180, margin: "28px auto", padding: "0 16px 32px", fontFamily: "system-ui" },

  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, marginBottom: 16 },
  brand: { display: "flex", alignItems: "center", gap: 14 },

  logo: { width: 44, height: 44, borderRadius: 14, border: "1px solid #eee", background: "white", objectFit: "cover" },
  logoFallback: {
    width: 44, height: 44, borderRadius: 14, border: "1px solid #eee",
    background: "#6D5EF3", color: "white", fontWeight: 900,
    display: "flex", alignItems: "center", justifyContent: "center",
  },

  h1: { margin: 0, fontSize: 34, letterSpacing: -0.6 },
  sub: { color: "#555", marginTop: 6, maxWidth: 720 },

  rightPill: { border: "1px solid #eee", borderRadius: 999, padding: "8px 12px", background: "white", color: "#444", fontSize: 13 },

  layout: { display: "grid", gridTemplateColumns: "1.05fr 1fr", gap: 14, alignItems: "start" },
  card: { border: "1px solid #eee", borderRadius: 18, padding: 16, background: "white", boxShadow: "0 10px 30px rgba(0,0,0,0.06)" },

  cardTitle: { fontWeight: 900, marginBottom: 10, fontSize: 16 },
  small: { color: "#666", fontSize: 13, lineHeight: 1.45 },

  grid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12, marginTop: 8 },

  label: { display: "flex", flexDirection: "column", gap: 6 },
  labelText: { fontSize: 12, color: "#444" },

  input: { padding: 10, borderRadius: 12, border: "1px solid #ddd", fontSize: 14, outline: "none", background: "white" },

  actions: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 },

  btn: {
    width: "100%", padding: "10px 12px", borderRadius: 14,
    border: "1px solid #ddd", cursor: "pointer",
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    gap: 8, fontWeight: 800,
  },

  btnPrimary: { background: "#111", color: "white" },
  btnSecondary: { background: "#f3f4f6", color: "#111" },
  btnGhost: { background: "white", color: "#111" },
  btnAccent: { background: "#6D5EF3", color: "white", border: "1px solid rgba(0,0,0,0.06)" },

  productStrip: {
    marginTop: 14, padding: 12, borderRadius: 16, border: "1px solid #eee",
    background: "#fafafa", display: "flex", justifyContent: "space-between", gap: 12,
  },

  kvTitle: { fontSize: 12, color: "#666", fontWeight: 800 },
  kvValue: { marginTop: 2, fontWeight: 900, color: "#111" },

  newTag: { display: "inline-block", marginLeft: 8, padding: "2px 8px", borderRadius: 999, border: "1px solid #ddd", fontSize: 12, background: "white", fontWeight: 900 },

  sellBox: { marginTop: 12, border: "1px solid #eee", background: "#fff", borderRadius: 16, padding: 12 },
  sellTitle: { fontWeight: 900, marginBottom: 6 },

  pitchLine: { marginBottom: 8, color: "#222", fontSize: 14, lineHeight: 1.55 },

  comparePicker: { display: "flex", gap: 10, flexWrap: "wrap", margin: "10px 0 12px" },
  check: { display: "flex", gap: 6, alignItems: "center", border: "1px solid #eee", borderRadius: 999, padding: "6px 10px", background: "#fafafa" },

  grid2: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 },

  compareCard: { border: "1px solid #eee", borderRadius: 16, padding: 12, background: "#fff" },
  compareHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  compareTitle: { fontWeight: 900 },

  comparePitch: { marginTop: 10, padding: 10, borderRadius: 12, background: "#fafafa", border: "1px solid #eee", fontSize: 13, color: "#222", lineHeight: 1.5 },

  bullets: { margin: "8px 0 0", paddingLeft: 18, color: "#333", fontSize: 13 },

  actionsRow: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 },

  mini: {
    padding: "8px 10px", borderRadius: 12, border: "1px solid #ddd",
    background: "white", cursor: "pointer", fontSize: 12,
    display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 900,
  },

  miniPrimary: { background: "#111", color: "white" },
  miniSecondary: { background: "#f3f4f6", color: "#111" },
  miniGhost: { background: "white", color: "#111" },
};
