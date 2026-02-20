"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* =========================================================
   SeatMaps exact links (best experience)
   Key format: "AIRLINE|AIRCRAFT" (normalized)
   Add more as you discover your most-used combos.
   ========================================================= */

const SEATMAPS_URLS: Record<string, string> = {
  "LH|A350-900": "https://seatmaps.com/airlines/lh-lufthansa/airbus-a350-900/",
  "LH|A350-1000": "https://seatmaps.com/airlines/lh-lufthansa/airbus-a350-1000/",
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

/* AeroLOPA button stays, but with NO icon */
const AEROLOPA_URLS: Record<string, string> = {
  "LH|A350-900": "https://www.aerolopa.com/lh-359",
  "NH|777-300ER": "https://www.aerolopa.com/nh-773",
  "BA|A350-1000": "https://www.aerolopa.com/ba-351",
  "AA|777-300ER": "https://www.aerolopa.com/aa-773",
  "QR|A350-1000": "https://www.aerolopa.com/qr-351",
};

const TOP_AIRLINES = [
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
] as const;

type Cabin = "Economy" | "Premium Economy" | "Business" | "First";

type AISuggestion = {
  productName: string;
  isNew: boolean;
  oneLiner: string;
  sellingPoints: string[];
  confidence: number; // 0..1
  notes: string;
};

const VALID_AIRCRAFT = new Set<string>([
  "A330-200",
  "A330-300",
  "A330-900",
  "A350-900",
  "A350-1000",
  "A380",
  "777-200ER",
  "777-300ER",
  "787-8",
  "787-9",
  "787-10",
]);

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
  if (x === "77W" || x === "773") return "777-300ER";
  if (x === "789") return "787-9";
  if (x === "7810") return "787-10";
  if (x === "339") return "A330-900";
  if (x === "380") return "A380";

  x = x.replace(/^A350-?900$/, "A350-900");
  x = x.replace(/^A350-?1000$/, "A350-1000");
  x = x.replace(/^A330-?900$/, "A330-900");
  x = x.replace(/^A330-?200$/, "A330-200");
  x = x.replace(/^A330-?300$/, "A330-300");
  x = x.replace(/^777-?300ER$/, "777-300ER");
  x = x.replace(/^777-?200ER$/, "777-200ER");
  x = x.replace(/^787-?8$/, "787-8");
  x = x.replace(/^787-?9$/, "787-9");
  x = x.replace(/^787-?10$/, "787-10");
  if (x.startsWith("A380")) return "A380";

  return x;
}
function isValidRoute(routeKey: string) {
  return /^[A-Z]{3}-[A-Z]{3}$/.test(routeKey);
}
function isValidAircraft(aircraftKey: string) {
  return VALID_AIRCRAFT.has(aircraftKey);
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

/* Minimal fallback if AI is unavailable */
function fallbackSuggestion(airline: string, cabin: Cabin, aircraft: string): AISuggestion {
  const a = airline.toUpperCase();
  if (a === "LH" && cabin === "Business") {
    const isAllegris = ["A350-900", "A350-1000", "787-9"].includes(aircraft);
    return {
      productName: isAllegris ? "Allegris" : "Lufthansa Business",
      isNew: isAllegris,
      oneLiner: isAllegris
        ? "Target the newest Lufthansa business product when operating."
        : "Strong schedule-led option; verify seat configuration.",
      sellingPoints: isAllegris
        ? ["New-generation cabin story", "Premium comfort angle for long-haul", "Confirm exact seat via seat map"]
        : ["Good route/time fit", "Seat map verification removes surprises", "Optimize seat selection once aircraft is confirmed"],
      confidence: 0.55,
      notes: "Verify exact configuration via SeatMaps/AeroLOPA for the specific flight/date.",
    };
  }
  return {
    productName: `${prettyAirline(a)} ${cabin}`,
    isNew: false,
    oneLiner: "Strong option — verify the exact seat layout on the operating aircraft.",
    sellingPoints: ["Clear expectations with seat map", "Pick best seats once aircraft is confirmed", "Great comparison versus other options"],
    confidence: 0.35,
    notes: "Verify exact configuration via SeatMaps/AeroLOPA for the specific flight/date.",
  };
}

/* Icons */
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
  const aircraftOk = useMemo(() => isValidAircraft(aircraftKey), [aircraftKey]);

  const unlocked = airlineKey.length > 0 && routeOk && aircraftOk;

  const mappingKey = `${airlineKey}|${aircraftKey}`;
  const seatmapsExact = !!SEATMAPS_URLS[mappingKey];

  const searchQ = useMemo(
    () => buildSearchQuery(airlineKey, routeKey, aircraftKey, cabin),
    [airlineKey, routeKey, aircraftKey, cabin]
  );

  const seatmapsUrl = seatmapsExact
    ? SEATMAPS_URLS[mappingKey]
    : `https://seatmaps.com/search/?q=${searchQ}`;

  const aerolopaUrl =
    airlineKey && aircraftKey && AEROLOPA_URLS[mappingKey]
      ? AEROLOPA_URLS[mappingKey]
      : `https://www.aerolopa.com/search?query=${searchQ}`;

  const imageUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(
    `${airlineKey} ${aircraftKey} ${cabin} cabin`
  )}`;

  // --- OpenAI suggestion state ---
  const [ai, setAi] = useState<AISuggestion | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Debounce so we don’t call API on every keystroke
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    setAi(null);
    setAiError(null);

    if (!unlocked) return;

    if (debounceRef.current) window.clearTimeout(debounceRef.current);

    debounceRef.current = window.setTimeout(async () => {
      setAiLoading(true);
      setAiError(null);

      try {
        const res = await fetch("/api/suggest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            airline: airlineKey,
            route: routeKey,
            aircraft: aircraftKey,
            cabin,
          }),
        });

        const json = await res.json();

        if (!json.ok) {
          // fallback
          setAi(fallbackSuggestion(airlineKey, cabin, aircraftKey));
          setAiError(json.error || "AI unavailable — using fallback.");
        } else {
          setAi(json.data as AISuggestion);
        }
      } catch (e: any) {
        setAi(fallbackSuggestion(airlineKey, cabin, aircraftKey));
        setAiError(e?.message || "AI error — using fallback.");
      } finally {
        setAiLoading(false);
      }
    }, 450);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [unlocked, airlineKey, routeKey, aircraftKey, cabin]);

  async function copyPitch() {
    if (!ai) return;

    const header = `${airlineKey} · ${routeKey} · ${aircraftKey} · ${cabin}`;
    const text = [
      header,
      "",
      `Recommended product: ${ai.productName}${ai.isNew ? " (NEW)" : ""}`,
      ai.oneLiner ? `\n${ai.oneLiner}` : "",
      "",
      "Why it stands out:",
      ...ai.sellingPoints.map((x) => `- ${x}`),
      ai.notes ? `\nNote: ${ai.notes}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    await navigator.clipboard.writeText(text);
    alert("Client pitch copied ✅");
  }

  function toggleCompare(code: string) {
    setCompare((prev) => (prev.includes(code) ? prev.filter((x) => x !== code) : [...prev, code]));
  }

  const compareCards = useMemo(() => {
    return compare.map((code) => {
      const a = code.toUpperCase();
      const k = `${a}|${aircraftKey}`;
      const smExact = !!SEATMAPS_URLS[k];
      const q = buildSearchQuery(a, routeKey, aircraftKey, cabin);

      return {
        airline: a,
        label: prettyAirline(a),
        seatmapsUrl: smExact ? SEATMAPS_URLS[k] : `https://seatmaps.com/search/?q=${q}`,
        seatmapsExact: smExact,
        aerolopaUrl: AEROLOPA_URLS[k] ? AEROLOPA_URLS[k] : `https://www.aerolopa.com/search?query=${q}`,
        imageUrl: `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(`${a} ${aircraftKey} ${cabin} cabin`)}`,
      };
    });
  }, [compare, routeKey, aircraftKey, cabin]);

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
              Auto-suggest unlocks only after Airline + Route (AAA-BBB) + recognized Aircraft.
            </div>
          </div>
        </div>

        <div style={styles.rightPill}>AI product pitch · SeatMaps auto-linked</div>
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
              <div style={{ marginTop: 6, fontSize: 12, color: routeKey.length === 0 ? "#777" : routeOk ? "#0a7" : "#b00" }}>
                {routeKey.length === 0 ? "Example: JFK-LHR" : routeOk ? "Route looks good ✅" : "Route must be AAA-BBB"}
              </div>
            </Field>

            <Field label="Aircraft (validated)">
              <input value={aircraft} onChange={(e) => setAircraft(e.target.value)} style={styles.input} placeholder="e.g. A350-900 / 359 / 77W / 789" />
              <div style={{ marginTop: 6, fontSize: 12, color: aircraftKey.length === 0 ? "#777" : aircraftOk ? "#0a7" : "#b00" }}>
                {aircraftKey.length === 0
                  ? "Examples: A350-900, 777-300ER, 787-9, A330-900, A380"
                  : aircraftOk
                    ? `Aircraft recognized ✅ (${aircraftKey})`
                    : `Not recognized ❌ (${aircraftKey}). Add to VALID_AIRCRAFT in code.`}
              </div>
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

          {/* BUTTONS */}
          <div style={styles.actions}>
            {/* AeroLOPA text-only */}
            <a href={aerolopaUrl} target="_blank" rel="noreferrer">
              <button style={{ ...styles.btn, ...styles.btnPrimary }} disabled={!unlocked}>
                AeroLOPA Seat Plan
              </button>
            </a>

            {/* SeatMaps auto-linked */}
            <a href={seatmapsUrl} target="_blank" rel="noreferrer">
              <button style={{ ...styles.btn, ...styles.btnSecondary }} disabled={!unlocked}>
                <SeatmapIcon /> SeatMaps {unlocked ? (seatmapsExact ? "· Exact ✅" : "· Search ✅") : ""}
              </button>
            </a>

            <a href={imageUrl} target="_blank" rel="noreferrer">
              <button style={{ ...styles.btn, ...styles.btnGhost }} disabled={!unlocked}>
                <ImageIcon /> Aircraft Images
              </button>
            </a>

            <button style={{ ...styles.btn, ...styles.btnAccent }} disabled={!unlocked || !ai} onClick={copyPitch}>
              <SparkIcon /> Copy client pitch
            </button>
          </div>

          {/* STATUS */}
          <div style={styles.productStrip}>
            <div>
              <div style={styles.kvTitle}>Unlock status</div>
              <div style={styles.kvValue}>
                {unlocked ? "Ready ✅" : "Enter Airline + valid Route + recognized Aircraft to unlock"}
              </div>
              <div style={{ marginTop: 6, fontSize: 12, color: "#666" }}>
                SeatMaps sync: {unlocked ? (seatmapsExact ? "Exact page ✅" : "Search fallback ✅") : "Locked"}
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={styles.kvTitle}>Suggested product</div>
              <div style={styles.kvValue}>
                {!unlocked ? (
                  <span style={{ color: "#777" }}>—</span>
                ) : aiLoading ? (
                  <span style={{ color: "#777" }}>Thinking…</span>
                ) : ai ? (
                  <>
                    {ai.productName} {ai.isNew ? <span style={styles.newTag}>NEW</span> : null}
                  </>
                ) : (
                  <span style={{ color: "#777" }}>—</span>
                )}
              </div>
            </div>
          </div>

          {/* PITCH */}
          {unlocked && ai ? (
            <div style={styles.sellBox}>
              <div style={styles.sellTitle}>Client-ready pitch</div>

              {aiError ? <div style={styles.warn}>Heads up: {aiError}</div> : null}

              <div style={styles.pitchLine}><b>{ai.oneLiner}</b></div>

              <div style={{ marginTop: 10 }}>
                <div style={styles.pitchLine}><b>Why it stands out:</b></div>
                <ul style={styles.bullets}>
                  {ai.sellingPoints.map((s) => <li key={s}>{s}</li>)}
                </ul>
              </div>

              <div style={styles.note}>
                Confidence: {Math.round((ai.confidence || 0) * 100)}% · {ai.notes}
              </div>
            </div>
          ) : null}
        </section>

        {/* COMPARE */}
        <section style={styles.card}>
          <div style={styles.cardTitle}>Compare options</div>
          <div style={styles.small}>Compare unlocks once route + aircraft are valid. SeatMaps will auto-sync per airline+aircraft mapping.</div>

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
                  <div style={styles.compareTitle}>{c.label}</div>
                  {unlocked ? <span style={styles.miniTag}>{c.seatmapsExact ? "SeatMaps Exact" : "SeatMaps Search"}</span> : null}
                </div>

                <div style={styles.small}>
                  <b>Route:</b> {routeKey || "—"} <br />
                  <b>Aircraft:</b> {aircraftKey || "—"} · <b>Cabin:</b> {cabin}
                </div>

                <div style={styles.actionsRow}>
                  <a href={c.aerolopaUrl} target="_blank" rel="noreferrer">
                    <button style={{ ...styles.mini, ...styles.miniPrimary }} disabled={!unlocked}>
                      Seat plan
                    </button>
                  </a>

                  <a href={c.seatmapsUrl} target="_blank" rel="noreferrer">
                    <button style={{ ...styles.mini, ...styles.miniSecondary }} disabled={!unlocked}>
                      <SeatmapIcon /> Seat map
                    </button>
                  </a>

                  <a href={c.imageUrl} target="_blank" rel="noreferrer">
                    <button style={{ ...styles.mini, ...styles.miniGhost }} disabled={!unlocked}>
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
  miniTag: { display: "inline-block", padding: "2px 8px", borderRadius: 999, border: "1px solid #eee", fontSize: 12, background: "#fafafa", fontWeight: 800 },

  sellBox: { marginTop: 12, border: "1px solid #eee", background: "#fff", borderRadius: 16, padding: 12 },
  sellTitle: { fontWeight: 900, marginBottom: 6 },

  pitchLine: { marginBottom: 8, color: "#222", fontSize: 14, lineHeight: 1.55 },
  note: { marginTop: 10, fontSize: 12, color: "#666" },
  warn: { marginBottom: 10, padding: 10, borderRadius: 12, border: "1px solid #f2c200", background: "#fff7cc", color: "#5a4700", fontSize: 13 },

  bullets: { margin: "8px 0 0", paddingLeft: 18, color: "#333", fontSize: 13 },

  comparePicker: { display: "flex", gap: 10, flexWrap: "wrap", margin: "10px 0 12px" },
  check: { display: "flex", gap: 6, alignItems: "center", border: "1px solid #eee", borderRadius: 999, padding: "6px 10px", background: "#fafafa" },

  grid2: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 },

  compareCard: { border: "1px solid #eee", borderRadius: 16, padding: 12, background: "#fff" },
  compareHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  compareTitle: { fontWeight: 900 },

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