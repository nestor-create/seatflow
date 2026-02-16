"use client";

import { useMemo, useState } from "react";

/* ===========================
   DIRECT LINKS (EDIT THESE)
   Key format: "AIRLINE|AIRCRAFT"
   AIRCRAFT normalized like:
   A350-900, A350-1000, 777-300ER, 787-9, A380
   =========================== */

const SEATMAPS_URLS: Record<string, string> = {
  "LH|A350-900": "https://seatmaps.com/airlines/lh-lufthansa/airbus-a350-900/",
  "NH|777-300ER": "https://seatmaps.com/airlines/nh-all-nippon-airways/boeing-777-300er/",
  "BA|A350-1000": "https://seatmaps.com/airlines/ba-british-airways/airbus-a350-1000/",
  "QR|A350-1000": "https://seatmaps.com/airlines/qr-qatar-airways/airbus-a350-1000/",
  "AA|777-300ER": "https://seatmaps.com/airlines/aa-american-airlines/boeing-777-300er/",
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
  "QR|A350-1000": "https://www.aerolopa.com/qr-351",
  "AA|777-300ER": "https://www.aerolopa.com/aa-773",
};

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
  aircraft?: string;
  name: string;
  since?: string;
  isNew: boolean;
  notes?: string;
  sellingPoints?: string[];
};

const LATEST_PRODUCTS: Product[] = [
  {
    airline: "LH",
    cabin: "Business",
    aircraft: "A350-900",
    name: "Allegris",
    since: "2024+",
    isNew: true,
    notes: "Aircraft/config dependent",
    sellingPoints: ["Newest Lufthansa long-haul J", "Strong privacy + comfort", "Great ‘new product’ selling point"],
  },
  {
    airline: "NH",
    cabin: "Business",
    aircraft: "777-300ER",
    name: "The Room",
    since: "2019+",
    isNew: true,
    sellingPoints: ["Wide suite-style seats", "Excellent for sleep", "Top-tier flagship product"],
  },
  { airline: "NH", cabin: "First", aircraft: "777-300ER", name: "The Suite", since: "2019+", isNew: true },
  { airline: "BA", cabin: "Business", aircraft: "A350-1000", name: "Club Suite", since: "2019+", isNew: true },
  { airline: "QR", cabin: "Business", aircraft: "A350-1000", name: "Qsuite", since: "2017+", isNew: false },
  { airline: "UA", cabin: "Business", name: "Polaris", since: "2016+", isNew: false },
];

/* Optional: route suggestions (manual) */
const ROUTE_AIRCRAFT: Record<string, Partial<Record<string, string[]>>> = {
  "JFK-LHR": {
    BA: ["A350-1000", "777-300ER", "A380"],
    AA: ["777-300ER", "787-9", "777-200ER"],
    LH: ["A350-900", "747-8"],
  },
  "JFK-HND": {
    NH: ["777-300ER", "787-9"],
    UA: ["787-9", "777-200ER"],
  },
};

/* ===========================
   NORMALIZATION
   =========================== */

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

function buildQuery({ airline, route, aircraft, cabin }: { airline: string; route: string; aircraft: string; cabin: string }) {
  const parts = [airline && `airline ${airline}`, route && `route ${route}`, aircraft && `aircraft ${aircraft}`, cabin && `cabin ${cabin}`]
    .filter(Boolean)
    .join(" ");
  return encodeURIComponent(parts);
}

function findLatestProduct(airline: string, cabin: Cabin, aircraft: string) {
  const a = normalizeAirline(airline);
  const ac = normalizeAircraft(aircraft);

  const exact = LATEST_PRODUCTS.find(
    (p) => p.airline === a && p.cabin === cabin && p.aircraft && normalizeAircraft(p.aircraft) === ac
  );
  if (exact) return exact;

  return LATEST_PRODUCTS.find((p) => p.airline === a && p.cabin === cabin && !p.aircraft) ?? null;
}

function prettyAirline(code: string) {
  const found = TOP_AIRLINES.find((a) => a.code === code);
  return found ? `${found.code} · ${found.name}` : code;
}

/* ===========================
   ICONS (no libs)
   =========================== */

function Icon({ children }: { children: React.ReactNode }) {
  return <span style={{ display: "inline-flex", width: 18, height: 18, alignItems: "center", justifyContent: "center" }}>{children}</span>;
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

/* ===========================
   PAGE
   =========================== */

export default function Page() {
  const [airline, setAirline] = useState("");
  const [route, setRoute] = useState("");
  const [aircraft, setAircraft] = useState("");
  const [cabin, setCabin] = useState<Cabin>("Business");

  // Paste helper (from Google Flights / notes)
  const [pasteAircraft, setPasteAircraft] = useState("");

  const [compare, setCompare] = useState<string[]>(["AA", "BA"]);
  const [logoOk, setLogoOk] = useState(true);

  const airlineKey = useMemo(() => normalizeAirline(airline), [airline]);
  const routeKey = useMemo(() => normalizeRoute(route), [route]);
  const aircraftKey = useMemo(() => normalizeAircraft(aircraft), [aircraft]);

  const hasRequired = airlineKey.length > 0 && routeKey.length > 0 && aircraftKey.length > 0;
  const directKey = `${airlineKey}|${aircraftKey}`;

  const suggestedAircraft = useMemo(() => {
    if (!routeKey || !airlineKey) return [];
    return ROUTE_AIRCRAFT[routeKey]?.[airlineKey] ?? [];
  }, [routeKey, airlineKey]);

  const query = useMemo(() => buildQuery({ airline: airlineKey, route: routeKey, aircraft: aircraftKey, cabin }), [
    airlineKey,
    routeKey,
    aircraftKey,
    cabin,
  ]);

  const directSeatmaps = SEATMAPS_URLS[directKey];
  const seatmapsUrl = directSeatmaps ?? `https://seatmaps.com/search/?q=${query}`;
  const seatmapsMode = directSeatmaps ? "Direct" : "Search";

  const directAerolopa = AEROLOPA_URLS[directKey];
  const aerolopaUrl = directAerolopa ?? `https://www.aerolopa.com/search?query=${query}`;
  const aerolopaMode = directAerolopa ? "Direct" : "Search";

  const imageUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(`${airlineKey} ${aircraftKey} ${cabin} seat`)}`;

  const product = useMemo(() => (hasRequired ? findLatestProduct(airlineKey, cabin, aircraftKey) : null), [
    hasRequired,
    airlineKey,
    cabin,
    aircraftKey,
  ]);

  const compareCards = useMemo(() => {
    return compare.map((code) => {
      const a = normalizeAirline(code);
      const ck = `${a}|${aircraftKey}`;
      const q = buildQuery({ airline: a, route: routeKey, aircraft: aircraftKey, cabin });

      const smDirect = SEATMAPS_URLS[ck];
      const alDirect = AEROLOPA_URLS[ck];

      const seatmapsUrl2 = smDirect ?? `https://seatmaps.com/search/?q=${q}`;
      const aerolopaUrl2 = alDirect ?? `https://www.aerolopa.com/search?query=${q}`;

      return {
        airline: a,
        seatmapsUrl: seatmapsUrl2,
        seatmapsMode: smDirect ? "Direct" : "Search",
        aerolopaUrl: aerolopaUrl2,
        aerolopaMode: alDirect ? "Direct" : "Search",
        imageUrl: `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(`${a} ${aircraftKey} ${cabin} seat`)}`,
        product: hasRequired ? findLatestProduct(a, cabin, aircraftKey) : null,
      };
    });
  }, [compare, routeKey, cabin, aircraftKey, hasRequired]);

  function toggleCompare(code: string) {
    setCompare((prev) => (prev.includes(code) ? prev.filter((x) => x !== code) : [...prev, code]));
  }

  function applyPastedAircraft() {
    // Example pastes:
    // "LH 359", "Lufthansa A350-900", "ANA 77W"
    const normalized = normalizeAircraft(pasteAircraft);
    if (!normalized) return;
    setAircraft(normalized);
  }

  function copyPitch(p: Product | null, a: string) {
    const header = `${a} · ${cabin} · ${aircraftKey} · ${routeKey}`;
    if (!p) {
      navigator.clipboard.writeText(`${header}\nProduct: —\nSeat map: ${seatmapsUrl}\nAeroLOPA: ${aerolopaUrl}\nImages: ${imageUrl}`);
      return;
    }
    const bullets = p.sellingPoints?.length ? p.sellingPoints.map((s) => `- ${s}`).join("\n") : "";
    const text =
      `${header}\n` +
      `Product: ${p.name}${p.isNew ? " (NEW)" : ""}${p.since ? ` · Since ${p.since}` : ""}\n` +
      (p.notes ? `Notes: ${p.notes}\n` : "") +
      (bullets ? `Selling points:\n${bullets}\n` : "") +
      `AeroLOPA: ${aerolopaUrl}\nSeatMaps: ${seatmapsUrl}\nImages: ${imageUrl}\n`;
    navigator.clipboard.writeText(text);
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
              Manual for now. Later you can plug in a real data source — without scraping Google Flights.
            </div>
          </div>
        </div>
        <div style={styles.rightPill}>No AI · Manual data</div>
      </div>

      <div style={styles.layout}>
        {/* Search */}
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

          {/* Paste helper */}
          <div style={styles.pasteBox}>
            <div style={styles.tipTitle}>Paste aircraft from Google Flights (manual “auto”)</div>
            <div style={styles.pasteRow}>
              <input
                value={pasteAircraft}
                onChange={(e) => setPasteAircraft(e.target.value)}
                style={{ ...styles.input, flex: 1 }}
                placeholder='Paste anything like: "LH 359" or "ANA 77W" or "Airbus A350-900"'
              />
              <button style={{ ...styles.btn, ...styles.btnAccent, width: 160 }} onClick={applyPastedAircraft} disabled={!pasteAircraft.trim()}>
                Apply
              </button>
            </div>
            <div style={styles.tipSub}>This avoids scraping. The app normalizes to keys used by AeroLOPA/SeatMaps.</div>
          </div>

          {suggestedAircraft.length > 0 && (
            <div style={styles.tipBox}>
              <div style={styles.tipTitle}>
                Suggested aircraft for <b>{routeKey}</b> / <b>{airlineKey}</b>
              </div>
              <div style={styles.pills}>
                {suggestedAircraft.map((a) => (
                  <button key={a} style={styles.pill} onClick={() => setAircraft(a)}>
                    {a}
                  </button>
                ))}
              </div>
              <div style={styles.tipSub}>Click to autofill aircraft.</div>
            </div>
          )}

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
                if (!product) {
                  alert(`No product entry for ${airlineKey} / ${cabin} / ${aircraftKey}. Add it in LATEST_PRODUCTS.`);
                  return;
                }
                const points = product.sellingPoints?.length ? `\n\nSelling points:\n- ${product.sellingPoints.join("\n- ")}` : "";
                alert(
                  `${airlineKey} — ${cabin}\nRoute: ${routeKey}\nAircraft: ${aircraftKey}\n\n` +
                    `Product: ${product.name}${product.isNew ? " (NEW)" : ""}\n` +
                    (product.since ? `Since: ${product.since}\n` : "") +
                    (product.notes ? `Notes: ${product.notes}\n` : "") +
                    points
                );
              }}
            >
              <SparkIcon /> New product?
            </button>
          </div>

          <div style={styles.productStrip}>
            <div>
              <div style={styles.kvTitle}>Key used for direct links</div>
              <div style={styles.kvValue}>{hasRequired ? directKey : <span style={{ color: "#777" }}>Fill airline, route, aircraft</span>}</div>
              <div style={styles.debugLine}>
                AeroLOPA: <b>{aerolopaMode}</b> · SeatMaps: <b>{seatmapsMode}</b>
              </div>
              <button
                style={{ ...styles.mini, ...styles.miniGhost, marginTop: 10 }}
                onClick={() => copyPitch(product, airlineKey)}
                disabled={!hasRequired}
              >
                Copy pitch
              </button>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={styles.kvTitle}>Product</div>
              <div style={styles.kvValue}>
                {product ? (
                  <>
                    {product.name} {product.isNew && <span style={styles.newTag}>NEW</span>}
                  </>
                ) : (
                  <span style={{ color: "#777" }}>—</span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Compare */}
        <section style={styles.card}>
          <div style={styles.cardTitle}>Compare options</div>
          <div style={styles.small}>
            Shows product details + direct/search status. (Route “recency” is handled by your paste-from-Google-Flights input above.)
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
                  <div style={styles.compareTitle}>{prettyAirline(c.airline)}</div>
                  {c.product?.isNew && <span style={styles.newTag}>NEW</span>}
                </div>

                <div style={styles.small}>
                  <b>Route:</b> {routeKey || "—"} <br />
                  <b>Aircraft:</b> {hasRequired ? aircraftKey : "—"} · <b>Cabin:</b> {cabin}
                  <br />
                  <b>Product:</b> {c.product ? `${c.product.name}${c.product.since ? ` · ${c.product.since}` : ""}` : "—"}
                </div>

                {c.product?.sellingPoints?.length ? (
                  <ul style={styles.bullets}>
                    {c.product.sellingPoints.slice(0, 3).map((s) => (
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
            If something shows <b>Search</b>, add a direct mapping in <b>AEROLOPA_URLS</b> / <b>SEATMAPS_URLS</b>.
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

/* ===========================
   STYLES
   =========================== */

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

  layout: { display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 14, alignItems: "start" },
  card: { border: "1px solid #eee", borderRadius: 18, padding: 16, background: "white", boxShadow: "0 10px 30px rgba(0,0,0,0.06)" },

  cardTitle: { fontWeight: 900, marginBottom: 10, fontSize: 16 },

  grid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 },

  label: { display: "flex", flexDirection: "column", gap: 6 },
  labelText: { fontSize: 12, color: "#444" },

  input: { padding: 10, borderRadius: 12, border: "1px solid #ddd", fontSize: 14, outline: "none", background: "white" },

  pasteBox: { border: "1px solid #eee", borderRadius: 14, padding: 12, marginTop: 12, background: "#fafafa" },
  pasteRow: { display: "flex", gap: 10, alignItems: "center", marginTop: 8 },

  tipBox: { border: "1px solid #eee", borderRadius: 14, padding: 12, marginTop: 12, background: "#fafafa" },
  tipTitle: { fontWeight: 900, marginBottom: 6 },
  tipSub: { color: "#777", fontSize: 12, marginTop: 8 },

  pills: { display: "flex", gap: 8, flexWrap: "wrap" },
  pill: { padding: "6px 10px", borderRadius: 999, border: "1px solid #ddd", background: "white", cursor: "pointer", fontSize: 12 },

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

  newTag: { display: "inline-block", marginLeft: 8, padding: "2px 8px", borderRadius: 999, border: "1px solid #ddd", fontSize: 12, background: "white", fontWeight: 900 },

  small: { color: "#666", fontSize: 13, lineHeight: 1.45 },

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
