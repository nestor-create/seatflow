"use client";

import { useMemo, useState } from "react";

/* =========================================================
   OPTIONAL DIRECT LINKS (improves accuracy when available)
   - If a mapping exists: opens exact airline+aircraft page.
   - If not: opens a filtered search page.
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
   AIRLINES (Compare)
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
  positioning: string; // short headline
  clientPitch: string; // short client-facing pitch
  proofPoints: string[]; // bullets
  notes?: string;
};

const PRODUCTS: Product[] = [
  {
    airline: "LH",
    cabin: "Business",
    name: "Allegris",
    isNew: true,
    since: "2024+ (aircraft/config dependent)",
    positioning: "Lufthansa’s newest long-haul Business Class",
    clientPitch:
      "If you want the most modern Lufthansa Business experience, Allegris is the one to aim for — newer design, a fresher feel, and a stronger comfort story on long flights.",
    proofPoints: [
      "Best ‘new cabin’ talking point on Lufthansa (when operating).",
      "Great for clients who care about modern design + comfort.",
      "We’ll verify the exact seat layout via seat plan/map before you fly.",
    ],
    notes: "Not on every flight — confirm by aircraft and seat map.",
  },
  {
    airline: "NH",
    cabin: "Business",
    name: "The Room",
    isNew: true,
    since: "2019+ (select 77W)",
    positioning: "One of the most spacious Business Class seats",
    clientPitch:
      "ANA ‘The Room’ is a standout pick — it’s known for an exceptionally spacious, suite-like feel that’s fantastic for sleeping and arriving rested.",
    proofPoints: [
      "A true flagship product when it’s the right aircraft.",
      "Excellent personal space and sleep narrative.",
      "We’ll confirm ‘The Room’ on the exact flight using the seat map.",
    ],
    notes: "Only on certain aircraft/configurations.",
  },
  {
    airline: "BA",
    cabin: "Business",
    name: "Club Suite",
    isNew: true,
    since: "2019+ (aircraft dependent)",
    positioning: "BA’s modern Business Class with improved privacy",
    clientPitch:
      "When British Airways is operating Club Suite, it’s a strong upgrade — more privacy and a more contemporary feel compared with older BA business cabins.",
    proofPoints: [
      "A clear step up vs legacy Club World (when Club Suite).",
      "Good privacy-led story for overnight routes.",
      "We’ll validate the exact configuration before you commit.",
    ],
    notes: "Aircraft-dependent; confirm by seat plan/map.",
  },
  {
    airline: "QR",
    cabin: "Business",
    name: "Qsuite",
    since: "2017+ (aircraft dependent)",
    positioning: "A benchmark business class when available",
    clientPitch:
      "Qsuite is a great premium choice — it’s widely regarded as one of the strongest business products, especially if you value privacy and a high-end feel.",
    proofPoints: [
      "Strong ‘best-in-class’ reputation (aircraft dependent).",
      "Excellent privacy narrative; great for couples on the right layout.",
      "We’ll confirm Qsuite availability on your exact flight.",
    ],
    notes: "Not installed on every aircraft.",
  },
  {
    airline: "AF",
    cabin: "First",
    name: "La Première",
    positioning: "Ultra-premium, best-available positioning",
    clientPitch:
      "For the most elevated experience, La Première is the top option — rare, exclusive, and ideal when you want ‘best available’ without compromise.",
    proofPoints: [
      "Perfect for VIP travel and milestone trips.",
      "Strong exclusivity + premium service narrative.",
      "We’ll confirm cabin availability and aircraft before booking.",
    ],
  },
  {
    airline: "EK",
    cabin: "First",
    name: "Emirates First (A380)",
    positioning: "Iconic First Class experience",
    clientPitch:
      "Emirates First on the A380 is a statement choice — iconic, memorable, and a powerful ‘wow factor’ for clients who want the journey to feel special.",
    proofPoints: [
      "A380 itself is a major selling point.",
      "Strong brand recognition and premium perception.",
      "We’ll verify aircraft type on your travel date.",
    ],
  },
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

function findProductAuto(airline: string, cabin: Cabin) {
  const a = normalizeAirline(airline);
  return PRODUCTS.find((p) => p.airline === a && p.cabin === cabin) ?? null;
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

  // "Automatic suggestion" triggers as soon as Airline + Cabin are chosen.
  const hasSuggest = airlineKey.length > 0;
  const suggestedProduct = useMemo(() => (hasSuggest ? findProductAuto(airlineKey, cabin) : null), [hasSuggest, airlineKey, cabin]);

  // Buttons can work with route/aircraft too, but we only require airline for product suggestion.
  const hasLinks = airlineKey.length > 0 && (routeKey.length > 0 || aircraftKey.length > 0);

  const key = `${airlineKey}|${aircraftKey}`;
  const searchQ = useMemo(() => buildSearchQuery(airlineKey, routeKey, aircraftKey, cabin), [airlineKey, routeKey, aircraftKey, cabin]);

  const aerolopaUrl = (airlineKey && aircraftKey && AEROLOPA_URLS[key]) ? AEROLOPA_URLS[key] : `https://www.aerolopa.com/search?query=${searchQ}`;
  const seatmapsUrl = (airlineKey && aircraftKey && SEATMAPS_URLS[key]) ? SEATMAPS_URLS[key] : `https://seatmaps.com/search/?q=${searchQ}`;
  const imageUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(`${airlineKey} ${aircraftKey || ""} ${cabin} cabin`)}`;

  const compareCards = useMemo(() => {
    return compare.map((code) => {
      const a = normalizeAirline(code);
      const ck = `${a}|${aircraftKey}`;
      const q = buildSearchQuery(a, routeKey, aircraftKey, cabin);

      const prod = findProductAuto(a, cabin);

      return {
        airline: a,
        airlineLabel: prettyAirline(a),
        aerolopaUrl: (aircraftKey && AEROLOPA_URLS[ck]) ? AEROLOPA_URLS[ck] : `https://www.aerolopa.com/search?query=${q}`,
        seatmapsUrl: (aircraftKey && SEATMAPS_URLS[ck]) ? SEATMAPS_URLS[ck] : `https://seatmaps.com/search/?q=${q}`,
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
        "Suggested pitch:",
        "A strong premium option — we’ll confirm the seat layout on your exact flight so you know exactly what to expect before you commit.",
      ].join("\n");
    }

    return [
      header,
      "",
      `Recommended product: ${prod.name}${prod.isNew ? " (NEW)" : ""}${prod.since ? ` · ${prod.since}` : ""}`,
      `Positioning: ${prod.positioning}`,
      "",
      "Client-facing pitch:",
      prod.clientPitch,
      "",
      "Why it’s a great pick:",
      ...prod.proofPoints.map((p) => `- ${p}`),
      prod.notes ? `\nNote: ${prod.notes}` : "",
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
              Enter airline + route + aircraft to open seat plan, seat map and images — plus an automatic client-ready pitch.
            </div>
          </div>
        </div>

        <div style={styles.rightPill}>Client-ready pitch · Quick comparison</div>
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
              onClick={() => {
                alert(clientPitchText(airlineKey || "—", suggestedProduct));
              }}
            >
              <SparkIcon /> Client pitch
            </button>
          </div>

          {/* AUTO PRODUCT SUGGESTION STRIP */}
          <div style={styles.productStrip}>
            <div>
              <div style={styles.kvTitle}>Your selection</div>
              <div style={styles.kvValue}>
                {airlineKey ? `${airlineKey}${routeKey ? ` · ${routeKey}` : ""}${aircraftKey ? ` · ${aircraftKey}` : ""} · ${cabin}` : <span style={{ color: "#777" }}>Enter an airline to begin</span>}
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

          {/* CLIENT-FACING PITCH PANEL */}
          {hasSuggest ? (
            <div style={styles.sellBox}>
              <div style={styles.sellTitle}>Client-ready pitch</div>
              <div style={styles.pitch}>
                {suggestedProduct ? (
                  <>
                    <div style={styles.pitchLine}><b>{suggestedProduct.positioning}</b></div>
                    <div style={styles.pitchLine}>{suggestedProduct.clientPitch}</div>
                    <div style={styles.pitchLine} />
                    <div style={styles.pitchLine}><b>Why this option stands out:</b></div>
                    <ul style={styles.bullets}>
                      {suggestedProduct.proofPoints.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                    {suggestedProduct.notes ? <div style={styles.note}>Note: {suggestedProduct.notes}</div> : null}
                  </>
                ) : (
                  <div style={styles.pitchLine}>
                    Enter an airline and we’ll suggest the most compelling product angle for that cabin.
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </section>

        {/* COMPARE */}
        <section style={styles.card}>
          <div style={styles.cardTitle}>Compare options</div>
          <div style={styles.small}>Pick airlines — each card shows a product angle and quick links using your route/aircraft.</div>

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
                  {c.product ? c.product.clientPitch : "A strong premium option — we’ll confirm the seat layout on the exact flight so expectations match the cabin."}
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
    width: 44,
    height: 44,
    borderRadius: 14,
    border: "1px solid #eee",
    background: "#6D5EF3",
    color: "white",
    fontWeight: 900,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
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
    width: "100%",
    padding: "10px 12px",
    borderRadius: 14,
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
  },

  kvTitle: { fontSize: 12, color: "#666", fontWeight: 800 },
  kvValue: { marginTop: 2, fontWeight: 900, color: "#111" },

  newTag: { display: "inline-block", marginLeft: 8, padding: "2px 8px", borderRadius: 999, border: "1px solid #ddd", fontSize: 12, background: "white", fontWeight: 900 },

  sellBox: { marginTop: 12, border: "1px solid #eee", background: "#fff", borderRadius: 16, padding: 12 },
  sellTitle: { fontWeight: 900, marginBottom: 6 },

  pitch: { color: "#222", fontSize: 14, lineHeight: 1.55 },
  pitchLine: { marginBottom: 8 },
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
};
