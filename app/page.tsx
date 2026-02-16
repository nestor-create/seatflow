"use client";

import { useMemo, useState } from "react";

/* =========================================================
   OPTIONAL DIRECT LINKS (better if mapped)
   Key format: "AIRLINE|AIRCRAFT" (normalized)
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
   TOP 10 AIRLINES (Compare)
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

/* =========================================================
   PRODUCT DATASET (manual)
   - Works for ALL top 10 airlines
   - aircraftHints: optional strings (if aircraft includes any hint, we prefer this product)
   ========================================================= */

type Product = {
  airline: string;
  cabin: Cabin;
  name: string;
  isNew?: boolean;
  since?: string;
  positioning: string; // short headline
  clientPitch: string; // client-facing pitch
  proofPoints: string[]; // bullets to sell
  notes?: string; // internal note
  aircraftHints?: string[]; // e.g., ["777-300ER", "77W"]
};

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
      "Better overall premium feel for long flights (configuration dependent).",
      "We’ll confirm the exact cabin layout using seat plan + seat map before you commit.",
    ],
    notes: "Not on every route/aircraft — always verify via seat plan/seat map.",
  },

  // NH
  {
    airline: "NH",
    cabin: "Business",
    name: "The Room",
    isNew: true,
    since: "Flagship product (aircraft-dependent)",
    positioning: "One of the most spacious Business Class seats when operating",
    clientPitch:
      "ANA ‘The Room’ is a standout pick — when it’s on the flight, it’s a flagship-level experience with a spacious, suite-like feel that’s excellent for sleep and comfort.",
    proofPoints: [
      "Premium ‘flagship’ story that clients immediately understand.",
      "Great for comfort + privacy narrative.",
      "We’ll verify that the operating aircraft is the right configuration before booking.",
    ],
    notes: "Aircraft/config dependent. Use seat map confirmation.",
    aircraftHints: ["777-300ER", "77W", "773"],
  },

  // BA
  {
    airline: "BA",
    cabin: "Business",
    name: "Club Suite",
    isNew: true,
    since: "Newer BA Business (aircraft-dependent)",
    positioning: "BA’s modern Business Class with a more premium feel",
    clientPitch:
      "When British Airways is operating Club Suite, it’s the best BA Business option to go for — a noticeably more premium experience versus older BA business layouts.",
    proofPoints: [
      "Clear ‘upgrade’ story vs legacy BA business.",
      "Strong privacy + overnight comfort positioning.",
      "We’ll confirm the configuration on your exact flight before you commit.",
    ],
    notes: "Aircraft-dependent; verify with seat plan/seat map.",
  },

  // QR
  {
    airline: "QR",
    cabin: "Business",
    name: "Qsuite",
    isNew: true,
    since: "Flagship product (aircraft-dependent)",
    positioning: "Benchmark Business Class when available",
    clientPitch:
      "Qsuite is a strong premium recommendation — when it’s on the aircraft, it’s one of the most compelling Business Class products to sell on comfort, privacy, and overall experience.",
    proofPoints: [
      "Top-tier reputation as a flagship business product.",
      "Excellent premium positioning vs typical business cabins.",
      "We’ll confirm Qsuite availability on the exact flight using the seat map.",
    ],
    notes: "Not on every aircraft; always verify.",
  },

  // SQ
  {
    airline: "SQ",
    cabin: "Business",
    name: "Singapore Airlines Business",
    since: "Long-haul premium baseline",
    positioning: "A highly reliable premium choice with strong brand pull",
    clientPitch:
      "Singapore Airlines is an easy premium recommendation — a strong, consistent experience that tends to land well with clients who prioritize quality and reliability.",
    proofPoints: [
      "Great ‘safe premium’ recommendation for discerning travelers.",
      "Strong brand perception and service story.",
      "We’ll confirm the exact cabin configuration via the seat map for confidence.",
    ],
  },

  // EK
  {
    airline: "EK",
    cabin: "First",
    name: "Emirates First (A380 when operating)",
    since: "Iconic premium product (aircraft-dependent)",
    positioning: "A statement First Class choice with major wow-factor",
    clientPitch:
      "Emirates First is a standout for clients who want the journey to feel special — it’s the kind of premium option that’s memorable and easy to justify for the right trip.",
    proofPoints: [
      "Extremely strong ‘wow’ story for premium clients.",
      "Aircraft type matters — we’ll confirm the operating aircraft before booking.",
      "Great for special occasions, VIP travel, and high-value clients.",
    ],
    notes: "Best story when the operating aircraft supports the intended experience; verify aircraft type.",
    aircraftHints: ["A380"],
  },
  {
    airline: "EK",
    cabin: "Business",
    name: "Emirates Business",
    positioning: "Strong premium brand with recognizable value",
    clientPitch:
      "Emirates Business is a strong option when you want a premium brand experience — we’ll verify the aircraft and seat layout so expectations match the cabin on the day.",
    proofPoints: [
      "Brand-led premium sell.",
      "Aircraft/layout can vary — we confirm before booking.",
      "Good comparison option against other business cabins on the route.",
    ],
  },

  // AF
  {
    airline: "AF",
    cabin: "First",
    name: "La Première",
    positioning: "Ultra-premium, best-available positioning",
    clientPitch:
      "If the goal is ‘best available’, La Première is the top-tier choice — rare, exclusive, and positioned for clients who want the highest-end experience.",
    proofPoints: [
      "Perfect for VIP travel or milestone trips.",
      "Strong exclusivity narrative.",
      "We’ll confirm cabin availability and aircraft before you commit.",
    ],
  },
  {
    airline: "AF",
    cabin: "Business",
    name: "Air France Business",
    positioning: "A strong premium option with an elevated feel",
    clientPitch:
      "Air France Business is a strong premium choice — we’ll confirm the exact seat layout for your flight so you know precisely what to expect before booking.",
    proofPoints: [
      "Premium positioning that works well for client-facing recommendations.",
      "Seat layouts vary by aircraft — we verify for certainty.",
      "Useful comparison against other business cabins on the same route.",
    ],
  },

  // UA
  {
    airline: "UA",
    cabin: "Business",
    name: "Polaris",
    positioning: "A consistent long-haul Business Class baseline",
    clientPitch:
      "United Polaris is a solid long-haul premium option — a straightforward recommendation when schedule, availability, or pricing makes it the best overall value.",
    proofPoints: [
      "Strong ‘reliable premium’ sell.",
      "Great fallback vs routes without a clear flagship new product.",
      "We’ll confirm the configuration via seat map for clarity.",
    ],
  },

  // DL
  {
    airline: "DL",
    cabin: "Business",
    name: "Delta One",
    positioning: "Premium long-haul option with a strong overall experience",
    clientPitch:
      "Delta One is a strong premium alternative — particularly when timing and availability line up, and you want an easy ‘quality’ recommendation for the route.",
    proofPoints: [
      "Good premium positioning against competitors on the route.",
      "Aircraft/layout can vary — we confirm the exact cabin via seat map.",
      "Strong option when the overall itinerary is the priority.",
    ],
  },

  // AA
  {
    airline: "AA",
    cabin: "Business",
    name: "Flagship Business",
    positioning: "Competitive long-haul Business Class on key routes",
    clientPitch:
      "American Flagship Business can be a great value premium pick — especially when availability and pricing are favorable versus other business options.",
    proofPoints: [
      "Strong comparison option on transoceanic routes.",
      "Good value-driven premium story when priced well.",
      "We’ll verify the exact aircraft configuration using the seat map.",
    ],
  },

  // Generic fallbacks (so auto-suggest ALWAYS shows something)
  ...TOP_AIRLINES.flatMap((a) => ([
    {
      airline: a.code,
      cabin: "Economy" as Cabin,
      name: "Economy",
      positioning: "A practical choice with the best value on the route",
      clientPitch:
        "This is a strong value option — we’ll prioritize the most comfortable seat selection available and confirm the aircraft layout so expectations match the journey.",
      proofPoints: [
        "Best for value and schedule fit.",
        "We’ll help optimize seat selection once the aircraft is confirmed.",
        "Seat map confirmation reduces surprises on the day.",
      ],
    },
    {
      airline: a.code,
      cabin: "Premium Economy" as Cabin,
      name: "Premium Economy",
      positioning: "A comfort upgrade without the full Business price",
      clientPitch:
        "Premium Economy is often the sweet spot — noticeably more comfort and space, with a much gentler price point than Business.",
      proofPoints: [
        "Comfort upgrade story that clients understand instantly.",
        "Great for longer flights where Economy feels tight.",
        "We’ll confirm the seating layout via seat map for confidence.",
      ],
    },
    {
      airline: a.code,
      cabin: "First" as Cabin,
      name: "First Class",
      positioning: "Top-tier cabin when available on the route",
      clientPitch:
        "If First is operating on this route, it’s the ‘best available’ option — we’ll confirm the exact aircraft and seat layout so the experience matches the expectation.",
      proofPoints: [
        "Strong premium positioning when available.",
        "Aircraft matters — we verify before committing.",
        "Ideal for VIP or milestone trips.",
      ],
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
  if (x === "380" || x === "A380-800" || x === "A380800") return "A380";

  x = x.replace(/^B(\d)/, "$1");
  if (x.startsWith("A380")) return "A380";
  x = x.replace(/^A350-?900$/, "A350-900");
  x = x.replace(/^A350-?1000$/, "A350-1000");
  if (x === "777-300" || x === "777300") return "777-300ER";
  x = x.replace(/^777-?300ER$/, "777-300ER");
  x = x.replace(/^787-?9$/, "787-9");

  return x;
}

function buildSearchQuery(airline: string, route: string, aircraft: string, cabin: string) {
  const parts = [
    airline && `airline ${airline}`,
    route && `route ${route}`,
    aircraft && `aircraft ${aircraft}`,
    cabin && `cabin ${cabin}`,
    "seat map",
  ]
    .filter(Boolean)
    .join(" ");
  return encodeURIComponent(parts);
}

function prettyAirline(code: string) {
  const found = TOP_AIRLINES.find((a) => a.code === code);
  return found ? `${found.code} · ${found.name}` : code;
}

/** Auto-pick logic:
 * 1) Match airline + cabin + aircraftHints (best)
 * 2) Match airline + cabin (fallback)
 */
function findProductAuto(airline: string, cabin: Cabin, aircraftKey: string) {
  const a = normalizeAirline(airline);
  const candidates = PRODUCTS.filter((p) => p.airline === a && p.cabin === cabin);

  // Prefer aircraft-hinted products when aircraft is present
  if (aircraftKey && candidates.length) {
    const hinted = candidates.find((p) => (p.aircraftHints || []).some((h) => aircraftKey.includes(h)));
    if (hinted) return hinted;
  }

  // Prefer "isNew" product for that airline+cabin if present
  const newest = candidates.find((p) => p.isNew);
  if (newest) return newest;

  // Any candidate
  return candidates[0] ?? null;
}

/* =========================================================
   Icons (SeatMaps + Images)
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

  // Auto suggestion triggers as soon as airline exists
  const hasSuggest = airlineKey.length > 0;
  const suggestedProduct = useMemo(
    () => (hasSuggest ? findProductAuto(airlineKey, cabin, aircraftKey) : null),
    [hasSuggest, airlineKey, cabin, aircraftKey]
  );

  // Links become more useful if route or aircraft exist
  const hasLinks = airlineKey.length > 0 && (routeKey.length > 0 || aircraftKey.length > 0);

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

  const imageUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(`${airlineKey} ${aircraftKey || ""} ${cabin} cabin`)}`;

  const compareCards = useMemo(() => {
    return compare.map((code) => {
      const a = normalizeAirline(code);
      const ck = `${a}|${aircraftKey}`;
      const q = buildSearchQuery(a, routeKey, aircraftKey, cabin);

      const prod = findProductAuto(a, cabin, aircraftKey);

      return {
        airline: a,
        airlineLabel: prettyAirline(a),
        aerolopaUrl: aircraftKey && AEROLOPA_URLS[ck] ? AEROLOPA_URLS[ck] : `https://www.aerolopa.com/search?query=${q}`,
        seatmapsUrl: aircraftKey && SEATMAPS_URLS[ck] ? SEATMAPS_URLS[ck] : `https://seatmaps.com/search/?q=${q}`,
        imageUrl: `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(`${a} ${aircraftKey || ""} ${cabin} cabin`)}`,
        product: prod,
      };
    });
  }, [compare, routeKey, cabin, aircraftKey]);

  function toggleCompare(code: string) {
    setCompare((prev) => (prev.includes(code) ? prev.filter((x) => x !== code) : [...prev, code]));
  }

  function clientPitchText(airlineCode: string, prod: Product | null) {
    const header = `${airlineCode}${routeKey ? ` · ${routeKey}` : ""}${aircraftKey ? ` · ${aircraftKey}` : ""} · ${cabin}`;

    if (!prod) {
      return [
        header,
        "",
        "Client pitch:",
        "This is a strong option for the route — we’ll confirm the exact seat layout on the operating aircraft so you know precisely what to expect before booking.",
      ].join("\n");
    }

    return [
      header,
      "",
      `Recommended product: ${prod.name}${prod.isNew ? " (NEW)" : ""}${prod.since ? ` · ${prod.since}` : ""}`,
      `Positioning: ${prod.positioning}`,
      "",
      "Client pitch:",
      prod.clientPitch,
      "",
      "Why it stands out:",
      ...prod.proofPoints.map((p) => `- ${p}`),
      prod.notes ? `\nInternal note: ${prod.notes}` : "",
    ].filter(Boolean).join("\n");
  }

  async function copyPitch() {
    const text = clientPitchText(airlineKey || "—", suggestedProduct);
    await navigator.clipboard.writeText(text);
    alert("Client pitch copied ✅");
  }

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
              Enter airline + route + aircraft to open seat plan, seat map and images — plus an automatic client-ready product pitch.
            </div>
          </div>
        </div>

        <div style={styles.rightPill}>Auto product suggestion · Client-ready pitch</div>
      </div>

      <div style={styles.layout}>
        {/* SEARCH */}
        <section style={styles.card}>
          <div style={styles.cardTitle}>Search</div>

          <div style={styles.grid}>
            <Field label="Airline (IATA)">
              <input value={airline} onChange={(e) => setAirline(e.target.value)} style={styles.input} placeholder="e.g. LH" />
            </Field>

            <Field label="Route (AAA-BBB)">
              <input value={route} onChange={(e) => setRoute(e.target.value)} style={styles.input} placeholder="e.g. JFK-LHR" />
            </Field>

            <Field label="Aircraft">
              <input value={aircraft} onChange={(e) => setAircraft(e.target.value)} style={styles.input} placeholder="e.g. A350-900 / 359 / 77W" />
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

          {/* Buttons */}
          <div style={styles.actions}>
            {/* AeroLOPA button with NO icon */}
            <a href={aerolopaUrl} target="_blank" rel="noreferrer">
              <button style={{ ...styles.btn, ...styles.btnPrimary }} disabled={!hasLinks}>
                AeroLOPA Seat Plan
              </button>
            </a>

            <a href={seatmapsUrl} target="_blank" rel="noreferrer">
              <button style={{ ...styles.btn, ...styles.btnSecondary }} disabled={!hasLinks}>
                <SeatmapIcon /> SeatMaps
              </button>
            </a>

            <a href={imageUrl} target="_blank" rel="noreferrer">
              <button style={{ ...styles.btn, ...styles.btnGhost }} disabled={!hasLinks}>
                <ImageIcon /> Aircraft Images
              </button>
            </a>

            <button
              style={{ ...styles.btn, ...styles.btnAccent }}
              disabled={!hasSuggest}
              onClick={() => alert(clientPitchText(airlineKey || "—", suggestedProduct))}
            >
              <SparkIcon /> Client pitch
            </button>
          </div>

          {/* AUTO PRODUCT STRIP */}
          <div style={styles.productStrip}>
            <div>
              <div style={styles.kvTitle}>Your selection</div>
              <div style={styles.kvValue}>
                {airlineKey
                  ? `${airlineKey}${routeKey ? ` · ${routeKey}` : ""}${aircraftKey ? ` · ${aircraftKey}` : ""} · ${cabin}`
                  : <span style={{ color: "#777" }}>Enter an airline to begin</span>}
              </div>

              <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button style={{ ...styles.mini, ...styles.miniGhost }} onClick={copyPitch} disabled={!hasSuggest}>
                  Copy client pitch
                </button>
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={styles.kvTitle}>Auto-suggested product</div>
              <div style={styles.kvValue}>
                {suggestedProduct ? (
                  <>
                    {suggestedProduct.name} {suggestedProduct.isNew ? <span style={styles.newTag}>NEW</span> : null}
                  </>
                ) : (
                  <span style={{ color: "#777" }}>—</span>
                )}
              </div>
            </div>
          </div>

          {/* CLIENT PITCH PANEL */}
          {hasSuggest ? (
            <div style={styles.sellBox}>
              <div style={styles.sellTitle}>Client-ready pitch</div>

              {suggestedProduct ? (
                <>
                  <div style={styles.pitchLine}><b>{suggestedProduct.positioning}</b></div>
                  <div style={styles.pitchLine}>{suggestedProduct.clientPitch}</div>

                  <div style={{ marginTop: 10 }}>
                    <div style={styles.pitchLine}><b>Why it stands out:</b></div>
                    <ul style={styles.bullets}>
                      {suggestedProduct.proofPoints.map((s) => <li key={s}>{s}</li>)}
                    </ul>
                  </div>

                  {suggestedProduct.notes ? <div style={styles.note}>Internal note: {suggestedProduct.notes}</div> : null}
                </>
              ) : (
                <div style={styles.pitchLine}>
                  Enter an airline and we’ll suggest the strongest product angle for that cabin.
                </div>
              )}
            </div>
          ) : null}
        </section>

        {/* COMPARE */}
        <section style={styles.card}>
          <div style={styles.cardTitle}>Compare options</div>
          <div style={styles.small}>Pick airlines — each card shows a product angle + quick links using your route/aircraft.</div>

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
                  <b>Product:</b> {c.product ? `${c.product.name}${c.product.since ? ` · ${c.product.since}` : ""}` : "—"}
                </div>

                <div style={styles.comparePitch}>
                  {c.product?.clientPitch ||
                    "A strong option for the route — we’ll confirm the operating aircraft and seat layout so expectations match the cabin."}
                </div>

                <div style={styles.actionsRow}>
                  {/* no icon on AeroLOPA */}
                  <a href={c.aerolopaUrl} target="_blank" rel="noreferrer">
                    <button style={{ ...styles.mini, ...styles.miniPrimary }} disabled={!hasLinks}>
                      Seat plan
                    </button>
                  </a>

                  <a href={c.seatmapsUrl} target="_blank" rel="noreferrer">
                    <button style={{ ...styles.mini, ...styles.miniSecondary }} disabled={!hasLinks}>
                      <SeatmapIcon /> Seat map
                    </button>
                  </a>

                  <a href={c.imageUrl} target="_blank" rel="noreferrer">
                    <button style={{ ...styles.mini, ...styles.miniGhost }} disabled={!hasLinks}>
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
  note: { marginTop: 10, fontSize: 12, color: "#666" },

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
