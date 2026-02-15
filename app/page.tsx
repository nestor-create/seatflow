"use client";

import { useMemo, useState } from "react";

/* ===========================
   SEATMAPS DIRECT URL MAPPING
   =========================== */

const SEATMAPS_URLS: Record<string, string> = {
  "AA|777-300ER": "https://seatmaps.com/airlines/aa-american-airlines/boeing-777-300er/",
  "AA|787-9": "https://seatmaps.com/airlines/aa-american-airlines/boeing-787-9/",
  "BA|A350-1000": "https://seatmaps.com/airlines/ba-british-airways/airbus-a350-1000/",
  "BA|777-300ER": "https://seatmaps.com/airlines/ba-british-airways/boeing-777-300er/",
  "LH|A350-900": "https://seatmaps.com/airlines/lh-lufthansa/airbus-a350-900/",
  "NH|777-300ER": "https://seatmaps.com/airlines/nh-all-nippon-airways/boeing-777-300er/",
  "QR|A350-1000": "https://seatmaps.com/airlines/qr-qatar-airways/airbus-a350-1000/",
  "SQ|A350-900": "https://seatmaps.com/airlines/sq-singapore-airlines/airbus-a350-900/",
  "EK|A380": "https://seatmaps.com/airlines/ek-emirates/airbus-a380/",
  "AF|777-300ER": "https://seatmaps.com/airlines/af-air-france/boeing-777-300er/",
  "UA|787-9": "https://seatmaps.com/airlines/ua-united-airlines/boeing-787-9/",
  "DL|A350-900": "https://seatmaps.com/airlines/dl-delta/airbus-a350-900/",
};

/* ===========================
   PRODUCT LIBRARY
   =========================== */

type Product = {
  airline: string;
  cabin: "Business" | "First" | "Premium Economy" | "Economy";
  aircraft?: string;
  name: string;
  since?: string;
  isNew: boolean;
};

const LATEST_PRODUCTS: Product[] = [
  { airline: "LH", cabin: "Business", aircraft: "A350-900", name: "Allegris", since: "2024+", isNew: true },
  { airline: "NH", cabin: "Business", aircraft: "777-300ER", name: "The Room", since: "2019+", isNew: true },
  { airline: "NH", cabin: "First", aircraft: "777-300ER", name: "The Suite", since: "2019+", isNew: true },
  { airline: "BA", cabin: "Business", aircraft: "A350-1000", name: "Club Suite", since: "2019+", isNew: true },
  { airline: "QR", cabin: "Business", aircraft: "A350-1000", name: "Qsuite", since: "2017+", isNew: false },
  { airline: "SQ", cabin: "Business", name: "2017 Business Class", since: "2017+", isNew: false },
  { airline: "EK", cabin: "Business", name: "777/A380 Business", isNew: false },
  { airline: "AF", cabin: "First", name: "La Première", isNew: false },
  { airline: "UA", cabin: "Business", name: "Polaris", isNew: false },
  { airline: "AA", cabin: "Business", name: "Flagship Business", isNew: false },
];

/* ===========================
   HELPERS
   =========================== */

function normalizeAirline(v: string) {
  return (v || "").trim().toUpperCase();
}

function normalizeAircraft(v: string) {
  let x = (v || "").trim().toUpperCase();
  x = x.replace(/^BOEING\s+/i, "");
  x = x.replace(/^AIRBUS\s+/i, "");
  x = x.replace(/^B(\d)/, "$1");
  x = x.replace(/\s+/g, "-");
  return x;
}

function findLatestProduct(airline: string, cabin: string, aircraft: string) {
  const a = normalizeAirline(airline);
  const c = cabin as Product["cabin"];
  const ac = normalizeAircraft(aircraft);

  const exact = LATEST_PRODUCTS.find(
    (p) =>
      p.airline === a &&
      p.cabin === c &&
      p.aircraft &&
      normalizeAircraft(p.aircraft) === ac
  );

  if (exact) return exact;

  return (
    LATEST_PRODUCTS.find((p) => p.airline === a && p.cabin === c && !p.aircraft) ||
    null
  );
}

/* ===========================
   MAIN COMPONENT
   =========================== */

export default function Home() {
  const [airline, setAirline] = useState("LH");
  const [route, setRoute] = useState("JFK-LHR");
  const [aircraft, setAircraft] = useState("A350-900");
  const [cabin, setCabin] = useState<Product["cabin"]>("Business");

  const airlineKey = useMemo(() => normalizeAirline(airline), [airline]);
  const aircraftKey = useMemo(() => normalizeAircraft(aircraft), [aircraft]);

  const query = encodeURIComponent(
    [airlineKey && `airline ${airlineKey}`, route && `route ${route}`, aircraftKey && `aircraft ${aircraftKey}`, cabin && `cabin ${cabin}`]
      .filter(Boolean)
      .join(" ")
  );

  const aerolopa = `https://www.aerolopa.com/search?query=${query}`;

  const directSeatmaps = SEATMAPS_URLS[`${airlineKey}|${aircraftKey}`];
  const seatmaps =
    directSeatmaps ?? `https://seatmaps.com/search/?q=${query}`;

  const image = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(
    `${airlineKey} ${aircraftKey} ${cabin} seat`
  )}`;

  const product = useMemo(
    () => findLatestProduct(airlineKey, cabin, aircraftKey),
    [airlineKey, cabin, aircraftKey]
  );

  return (
    <main style={{ maxWidth: 950, margin: "40px auto", fontFamily: "system-ui" }}>
      <h1>SeatFlow — No AI Version</h1>

      <div style={{ display: "grid", gap: 12, marginBottom: 20 }}>
        <input value={airline} onChange={(e) => setAirline(e.target.value)} placeholder="Airline (LH)" style={inputStyle} />
        <input value={route} onChange={(e) => setRoute(e.target.value)} placeholder="Route (JFK-LHR)" style={inputStyle} />
        <input value={aircraft} onChange={(e) => setAircraft(e.target.value)} placeholder="Aircraft (A350-900)" style={inputStyle} />

        <select value={cabin} onChange={(e) => setCabin(e.target.value as Product["cabin"])} style={inputStyle}>
          <option>Economy</option>
          <option>Premium Economy</option>
          <option>Business</option>
          <option>First</option>
        </select>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <a href={aerolopa} target="_blank">
          <button style={btn}>AeroLOPA Seat Plan</button>
        </a>

        <a href={seatmaps} target="_blank">
          <button style={btn}>
            SeatMaps {directSeatmaps ? "(Direct)" : "(Search)"}
          </button>
        </a>

        <a href={image} target="_blank">
          <button style={btn}>Aircraft Image</button>
        </a>

        <button
          style={btn}
          onClick={() => {
            if (!product) {
              alert("No product defined for this airline/cabin/aircraft.");
              return;
            }

            alert(
              `${airlineKey} — ${cabin}\n` +
                `Product: ${product.name}\n` +
                `Since: ${product.since ?? "—"}\n` +
                `Status: ${product.isNew ? "NEW PRODUCT" : "Existing"}`
            );
          }}
        >
          New product?
        </button>
      </div>

      {product && (
        <div style={{ marginTop: 20 }}>
          <strong>
            Latest Product: {product.name}{" "}
            {product.isNew && <span style={badge}>NEW</span>}
          </strong>
        </div>
      )}
    </main>
  );
}

/* ===========================
   STYLES
   =========================== */

const inputStyle: React.CSSProperties = {
  padding: 12,
  borderRadius: 10,
  border: "1px solid #ddd",
};

const btn: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid #ddd",
  cursor: "pointer",
  background: "white",
};

const badge: React.CSSProperties = {
  display: "inline-block",
  marginLeft: 6,
  padding: "2px 8px",
  borderRadius: 999,
  border: "1px solid #ddd",
  fontSize: 12,
};
