"use client";

import { useMemo, useState } from "react";

/* =========================================================
   1) DIRECT LINKS (ADD MORE OVER TIME)
   Key format: "AIRLINE|AIRCRAFT" (normalized)
   Aircraft examples: A350-900, A350-1000, 777-300ER, 787-9, A380
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
  // Using AeroLOPA type codes where we’re confident:
  "LH|A350-900": "https://www.aerolopa.com/lh-359",
  "NH|777-300ER": "https://www.aerolopa.com/nh-773",
  "BA|A350-1000": "https://www.aerolopa.com/ba-351",
  "AA|777-300ER": "https://www.aerolopa.com/aa-773",
  "QR|A350-1000": "https://www.aerolopa.com/qr-351",
  // If you find the exact AeroLOPA pages for the rest, add them here.
};

/* =========================================================
   2) TOP 10 AIRLINES
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

type Preset = {
  id: string;
  airline: string; // IATA
  airlineName: string;
  route: string; // AAA-BBB
  aircraft: string;
  cabin: Cabin;
  productName: string;
  isNew: boolean;
  since?: string;
  highlights: string[];
};

/* =========================================================
   3) PRESETS (Top 10 airlines + route + aircraft + new product)
   You can edit routes/aircraft anytime.
   ========================================================= */

const PRESETS: Preset[] = [
  {
    id: "LH-JFK-MUC-359-J",
    airline: "LH",
    airlineName: "Lufthansa",
    route: "JFK-MUC",
    aircraft: "A350-900",
    cabin: "Business",
    productName: "Allegris",
    isNew: true,
    since: "2024+ (aircraft/config dependent)",
    highlights: ["Newest LH long-haul J selling point", "Modern cabin + privacy narrative", "Use seat plan to confirm exact layout"],
  },
  {
    id: "NH-JFK-HND-773-J",
    airline: "NH",
    airlineName: "ANA",
    route: "JFK-HND",
    aircraft: "777-300ER",
    cabin: "Business",
    productName: "The Room",
    isNew: true,
    since: "2019+ (select 77W)",
    highlights: ["Very wide suite-style seat", "Great sleep story", "Flagship product positioning"],
  },
  {
    id: "BA-JFK-LHR-351-J",
    airline: "BA",
    airlineName: "British Airways",
    route: "JFK-LHR",
    aircraft: "A350-1000",
    cabin: "Business",
    productName: "Club Suite",
    isNew: true,
    since: "2019+ (aircraft dependent)",
    highlights: ["Direct aisle access (Club Suite aircraft)", "Better privacy than old Club World", "Confirm by aircraft + seat plan"],
  },
  {
    id: "AA-JFK-LHR-773-J",
    airline: "AA",
    airlineName: "American Airlines",
    route: "JFK-LHR",
    aircraft: "777-300ER",
    cabin: "Business",
    productName: "Flagship Business",
    isNew: false,
    highlights: ["Strong alternative on key transatlantic", "Use seat plan to confirm configuration", "Good comparison anchor vs newest cabins"],
  },
  {
    id: "QR-LHR-DOH-351-J",
    airline: "QR",
    airlineName: "Qatar Airways",
    route: "LHR-DOH",
    aircraft: "A350-1000",
    cabin: "Business",
    productName: "Qsuite",
    isNew: false,
    since: "2017+ (aircraft dependent)",
    highlights: ["Industry-famous business class", "Great privacy/couples narrative", "Confirm Qsuite availability by seat plan"],
  },
  {
    id: "SQ-SIN-LHR-359-J",
    airline: "SQ",
    airlineName: "Singapore Airlines",
    route: "SIN-LHR",
    aircraft: "A350-900",
    cabin: "Business",
    productName: "Singapore Airlines Business",
    isNew: false,
    highlights: ["Consistent premium experience", "Strong soft product story", "Seat plan confirms exact layout"],
  },
  {
    id: "EK-DXB-JFK-A380-F",
    airline: "EK",
    airlineName: "Emirates",
    route: "DXB-JFK",
    aircraft: "A380",
    cabin: "First",
    productName: "Emirates First (A380)",
    isNew: false,
    highlights: ["Iconic premium positioning", "A380 is a major selling point", "Use seat map to confirm aircraft on date"],
  },
  {
    id: "AF-JFK-CDG-773-F",
    airline: "AF",
    airlineName: "Air France",
    route: "JFK-CDG",
    aircraft: "777-300ER",
    cabin: "First",
    productName: "La Première",
    isNew: false,
    highlights: ["Top-tier premium narrative", "Best-available positioning", "Confirm cabin availability by flight/date"],
  },
  {
    id: "UA-EWR-LHR-789-J",
    airline: "UA",
    airlineName: "United Airlines",
    route: "EWR-LHR",
    aircraft: "787-9",
    cabin: "Business",
    productName: "Polaris",
    isNew: false,
    highlights: ["Strong long-haul baseline", "Good comparison vs new flagship cabins", "Confirm configuration via seat plan"],
  },
  {
    id: "DL-JFK-JNB-359-J",
    airline: "DL",
    airlineName: "Delta Air Lines",
    route: "JFK-JNB",
    aircraft: "A350-900",
    cabin: "Business",
    productName: "Delta One",
    isNew: false,
    highlights: ["Solid long-haul experience", "Often competitive availability", "Seat plan confirms layout on aircraft"],
  },
];

/* =========================================================
   4) NORMALIZATION
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

  // common short codes → canonical
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

/* =========================================================
   5) ICONS (no libs)
   ========================================================= */

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ display: "inline-flex", width: 18, height: 18, alignItems: "center", justifyContent: "center" }}>
      {children}
    </span>
  );
}
function PlaneIcon() {
  return (
    <Icon>
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
        <path d="M2 16l20-6-20-6 4 6h7H6l-4 6z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    </Icon>
  );
}
function MapIcon() {
  return (
    <Icon>
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
        <path d="M9 18l-6 3V6l6-3 6 3 6-3v15l-6 3-6-3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M9 3v15M15 6v15" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    </Icon>
  );
}
function SeatIcon() {
  return (
    <Icon>
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
        <path d="M7 3h6a4 4 0 014 4v6H7V3z" stroke="currentColor" strokeWidth="1.6" />
        <path d="M7 13h13v4a3 3 0 01-3 3H10a3 3 0 01-3-3v-4z" stroke="currentColor" strokeWidth="1.6" />
        <path d="M4 20h16" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    </Icon>
  );
}
function SparkIcon() {
  return (
    <Icon>
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
        <path d="M12 2l1.2 4.4L18 8l-4.8 1.6L12 14l-1.2-4.4L6 8l4.8-1.6L12 2z" stroke="currentColor" strokeWidth="1.6" />
        <path d="M19 13l.7 2.5L22 16l-2.3.5L19 19l-.7-2.5L16 16l2.3-.5L19 13z" stroke="currentColor" strokeWidth="1.6" />
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

  const hasRequired = airlineKey.length > 0 && routeKey.length > 0 && aircraftKey.length > 0;
  const key = `${airlineKey}|${aircraftKey}`;

  const searchQ = useMemo(
    () => buildSearchQuery(airlineKey, routeKey, aircraftKey, cabin),
    [airlineKey, routeKey, aircraftKey, cabin]
  );

  const directSeatmaps = SEATMAPS_URLS[key];
  const seatmapsUrl = directSeatmaps ?? `https://seatmaps.com/search/?q=${searchQ}`;
  const seatmapsMode = directSeatmaps ? "Direct" : "Search";

  const directAerolopa = AEROLOPA_URLS[key];
  const aerolopaUrl = directAerolopa ?? `https://www.aerolopa.com/search?query=${searchQ}`;
  const aerolopaMode = directAerolopa ? "Direct" : "Search";

  const imageUrl = useMemo(() => {
    const q = `${airlineKey} ${aircraftKey} ${cabin} seat`;
    return `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(q)}`;
  }, [airlineKey, aircraftKey, cabin]);

  const selectedPreset = useMemo(() => {
    if (!hasRequired) return null;
    // Try to match a preset by airline+route+aircraft+cabin
    const r = routeKey;
    const a = airlineKey;
    const ac = aircraftKey;
    const c = cabin;
    return PRESETS.find(
      (p) =>
        p.airline === a &&
        normalizeRoute(p.route) === r &&
        normalizeAircraft(p.aircraft) === ac &&
        p.cabin === c
    ) ?? null;
  }, [hasRequired, airlineKey, routeKey, aircraftKey, cabin]);

  const compareCards = useMemo(() => {
    return compare.map((code) => {
      const a = normalizeAirline(code);
      const ck = `${a}|${aircraftKey}`;
      const q = buildSearchQuery(a, routeKey, aircraftKey, cabin);

      const smDirect = SEATMAPS_URLS[ck];
      const alDirect = AEROLOPA_URLS[ck];

      // Product details by airline+cabin (and aircraft if needed) from PRESETS as “recommended”
      const bestPreset = PRESETS.find(
        (p) => p.airline === a && p.cabin === cabin
      );

      return {
        airline: a,
        airlineLabel: prettyAirline(a),
        seatmapsUrl: smDirect ?? `https://seatmaps.com/search/?q=${q}`,
        seatmapsMode: smDirect ? "Direct" : "Search",
        aerolopaUrl: alDirect ?? `https://www.aerolopa.com/search?query=${q}`,
        aerolopaMode: alDirect ? "Direct" : "Search",
        imageUrl: `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(`${a} ${aircraftKey} ${cabin} seat`)}`,
        productName: bestPreset?.productName ?? "—",
        isNew: bestPreset?.isNew ?? false,
        since: bestPreset?.since,
        highlights: bestPreset?.highlights ?? [],
      };
    });
  }, [compare, routeKey, cabin, aircraftKey]);

  function toggleCompare(code: string) {
    setCompare((prev) => (prev.includes(code) ? prev.filter((x) => x !== code) : [...prev, code]));
  }

  function applyPreset(p: Preset) {
    setAirline(p.airline);
    setRoute(p.route);
    setAircraft(p.aircraft);
    setCabin(p.cabin);
  }

  return (
    <main style={styles.page}>
      <div style={styles.header}>
        <div style={styles.brand}>
          {logoOk ? (
            <img
              src="/ascend-logo.png"
              alt="Ascend"
              style={styles.logo}
              onError={() => setLogoOk(false)}
            />
          ) : (
            <div style={styles.logoFallback}>A</div>
          )}

          <div>
            <h1 style={styles.h1}>Ascend Seat Image & Map Project</h1>
            <div style={styles.sub}>
              Enter airline + route + aircraft to open seat plans, maps and images — plus “new product” selling points.
            </div>
          </div>
        </div>

        <div style={styles.rightPill}>AeroLOPA · SeatMaps · Images</div>
      </div>

      <div style={styles.layout}>
        {/* LEFT: Presets + Search */}
        <section style={styles.card}>
          <div style={styles.cardTitle}>Top 10 presets</div>
          <div style={styles.small}>
            One click fills airline / route / aircraft / cabin, with a recommended product angle.
          </div>

          <div style={styles.presetGrid}>
            {PRESETS.map((p) => (
              <button key={p.id} style={styles.presetCard} onClick={() => applyPreset(p)}>
                <div style={styles.presetTop}>
                  <div style={styles.presetTitle}>
                    {p.airline} · {p.route}
                  </div>
                  {p.isNew ? <span style={styles.newTag}>NEW</span> : <span style={styles.oldTag}>STANDARD</span>}
                </div>
                <div style={styles.presetMeta}>
                  <b>{p.aircraft}</b> · {p.cabin}
                </div>
                <div style={styles.presetProduct}>
                  {p.productName}{p.since ? <span style={styles.since}> · {p.since}</span> : null}
                </div>
              </button>
            ))}
          </div>

          <div style={styles.divider} />

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

          <div style={styles.actions}>
            <a href={aerolopaUrl} target="_blank" rel="noreferrer">
              <button style={{ ...styles.btn, ...styles.btnPrimary }} disabled={!hasRequired}>
                <PlaneIcon /> AeroLOPA Seat Plan <span style={styles.muted}>({aerolopaMode})</span>
              </button>
            </a>

            <a href={seatmapsUrl} target="_blank" rel="noreferrer">
              <button style={{ ...styles.btn, ...styles.btnSecondary }} disabled={!hasRequired}>
                <MapIcon /> SeatMaps <span style={styles.muted}>({seatmapsMode})</span>
              </button>
            </a>

            <a href={imageUrl} target="_blank" rel="noreferrer">
              <button style={{ ...styles.btn, ...styles.btnGhost }} disabled={!hasRequired}>
                <SeatIcon /> Aircraft Images
              </button>
            </a>

            <button
              style={{ ...styles.btn, ...styles.btnAccent }}
              disabled={!hasRequired}
              onClick={() => {
                if (!selectedPreset) {
                  alert("No matching preset for this exact combination.\n\nTip: pick a preset first or add one to PRESETS.");
                  return;
                }
                const bullet = selectedPreset.highlights.map((h) => `- ${h}`).join("\n");
                alert(
                  `${selectedPreset.airline} · ${selectedPreset.route} · ${selectedPreset.aircraft} · ${selectedPreset.cabin}\n\n` +
                    `Product: ${selectedPreset.productName}${selectedPreset.isNew ? " (NEW)" : ""}\n` +
                    (selectedPreset.since ? `Since: ${selectedPreset.since}\n\n` : "\n") +
                    `Selling points:\n${bullet}`
                );
              }}
            >
              <SparkIcon /> New product?
            </button>
          </div>

          <div style={styles.productStrip}>
            <div>
              <div style={styles.kvTitle}>Selection</div>
              <div style={styles.kvValue}>
                {hasRequired ? `${airlineKey} · ${routeKey} · ${aircraftKey} · ${cabin}` : <span style={{ color: "#777" }}>Fill airline, route, aircraft</span>}
              </div>
              <div style={styles.debugLine}>
                AeroLOPA: <b>{aerolopaMode}</b> · SeatMaps: <b>{seatmapsMode}</b>
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={styles.kvTitle}>Recommended product</div>
              <div style={styles.kvValue}>
                {selectedPreset ? (
                  <>
                    {selectedPreset.productName} {selectedPreset.isNew && <span style={styles.newTag}>NEW</span>}
                  </>
                ) : (
                  <span style={{ color: "#777" }}>—</span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT: Compare */}
        <section style={styles.card}>
          <div style={styles.cardTitle}>Compare options</div>
          <div style={styles.small}>
            Select airlines — buttons open the seat plan / seat map / images using the same route + aircraft + cabin you entered.
          </div>

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
                  {c.isNew && <span style={styles.newTag}>NEW</span>}
                </div>

                <div style={styles.small}>
                  <b>Route:</b> {routeKey || "—"} <br />
                  <b>Aircraft:</b> {aircraftKey || "—"} · <b>Cabin:</b> {cabin}
                  <br />
                  <b>Product:</b> {c.productName}{c.since ? ` · ${c.since}` : ""}
                </div>

                {c.highlights.length ? (
                  <ul style={styles.bullets}>
                    {c.highlights.slice(0, 3).map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                ) : null}

                <div style={styles.compareMeta}>
                  AeroLOPA: <b>{c.aerolopaMode}</b> · SeatMaps: <b>{c.seatmapsMode}</b>
                </div>

                <div style={styles.actionsRow}>
                  <a href={c.aerolopaUrl} target="_blank" rel="noreferrer">
                    <button style={{ ...styles.mini, ...styles.miniPrimary }} disabled={!hasRequired}>
                      <PlaneIcon /> AeroLOPA
                    </button>
                  </a>
                  <a href={c.seatmapsUrl} target="_blank" rel="noreferrer">
                    <button style={{ ...styles.mini, ...styles.miniSecondary }} disabled={!hasRequired}>
                      <MapIcon /> SeatMaps
                    </button>
                  </a>
                  <a href={c.imageUrl} target="_blank" rel="noreferrer">
                    <button style={{ ...styles.mini, ...styles.miniGhost }} disabled={!hasRequired}>
                      <SeatIcon /> Images
                    </button>
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div style={styles.tipSub}>
            If you want every result to be <b>Direct</b>, add more mappings in <b>AEROLOPA_URLS</b> and <b>SEATMAPS_URLS</b>.
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

  layout: { display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: 14, alignItems: "start" },
  card: { border: "1px solid #eee", borderRadius: 18, padding: 16, background: "white", boxShadow: "0 10px 30px rgba(0,0,0,0.06)" },

  cardTitle: { fontWeight: 900, marginBottom: 10, fontSize: 16 },

  small: { color: "#666", fontSize: 13, lineHeight: 1.45 },

  presetGrid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10, marginTop: 10 },
  presetCard: {
    textAlign: "left",
    border: "1px solid #eee",
    background: "#fafafa",
    borderRadius: 16,
    padding: 12,
    cursor: "pointer",
  },
  presetTop: { display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" },
  presetTitle: { fontWeight: 900 },
  presetMeta: { marginTop: 6, color: "#222", fontSize: 13 },
  presetProduct: { marginTop: 6, color: "#444", fontSize: 13, fontWeight: 800 },
  since: { fontWeight: 700, color: "#666" },

  divider: { height: 1, background: "#eee", margin: "14px 0" },

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

  muted: { fontWeight: 700, fontSize: 12, opacity: 0.85 },

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
  debugLine: { marginTop: 6, fontSize: 12, color: "#666" },

  newTag: {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: 999,
    border: "1px solid rgba(0,0,0,0.08)",
    fontSize: 12,
    background: "white",
    fontWeight: 900,
  },
  oldTag: {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: 999,
    border: "1px solid rgba(0,0,0,0.08)",
    fontSize: 12,
    background: "white",
    fontWeight: 900,
    color: "#666",
  },

  tipSub: { color: "#777", fontSize: 12, marginTop: 10 },

  comparePicker: { display: "flex", gap: 10, flexWrap: "wrap", margin: "10px 0 12px" },
  check: { display: "flex", gap: 6, alignItems: "center", border: "1px solid #eee", borderRadius: 999, padding: "6px 10px", background: "#fafafa" },

  grid2: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 },

  compareCard: { border: "1px solid #eee", borderRadius: 16, padding: 12, background: "#fff" },
  compareHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  compareTitle: { fontWeight: 900 },

  compareMeta: { marginTop: 8, fontSize: 12, color: "#666" },

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
