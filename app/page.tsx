"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CABIN_PRODUCTS, CabinProduct, CabinType } from "../lib/cabin-data";

function normalizeAircraft(input: string) {
  return input.trim().toUpperCase();
}

function matchProduct(
  airlineIata: string,
  aircraft: string,
  cabin: CabinType
): CabinProduct | null {
  const cleanIata = airlineIata.trim().toUpperCase();
  const cleanAircraft = normalizeAircraft(aircraft);

  return (
    CABIN_PRODUCTS.find(
      (item) =>
        item.airlineIata === cleanIata &&
        item.cabin === cabin &&
        item.aircraft.some((a) => a.toUpperCase() === cleanAircraft)
    ) || null
  );
}

export default function Page() {
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [airlineIata, setAirlineIata] = useState("NH");
  const [aircraft, setAircraft] = useState("77W");
  const [cabin, setCabin] = useState<CabinType>("business");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          const blob = item.getAsFile();
          if (!blob) return;

          const reader = new FileReader();
          reader.onload = () => setImageDataUrl(String(reader.result));
          reader.readAsDataURL(blob);
          return;
        }
      }
    };

    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, []);

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => setImageDataUrl(String(reader.result));
    reader.readAsDataURL(file);
  };

  const result = useMemo(() => {
    return matchProduct(airlineIata, aircraft, cabin);
  }, [airlineIata, aircraft, cabin]);

  return (
    <main className="page">
      <div className="container">
        <div className="hero">
          <h1 className="title">Ascend Cabin Atlas</h1>
          <div className="subtitle">
            Paste a Google Flights screenshot, then choose airline, aircraft, and cabin to surface the likely premium seat product.
          </div>
        </div>

        <div className="grid">
          <section className="card">
            <h2 className="sectionTitle">Input</h2>
            <div className="helper">
              Paste a screenshot with <strong>Ctrl+V</strong>, or upload it manually. Then enter the airline code, aircraft, and cabin.
            </div>

            <ol className="instructions">
              <li>Open the flight in Google Flights</li>
              <li>Paste the screenshot here with Ctrl+V, or upload it</li>
              <li>Enter airline code, aircraft, and cabin</li>
              <li>Open SeatMaps, AeroLOPA, or Google Images from the result</li>
            </ol>

            <div className="row" style={{ marginTop: 18 }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onUpload}
              />
              <button
                className="button"
                onClick={() => {
                  setImageDataUrl(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              >
                Clear Image
              </button>
            </div>

            <div className="formGrid">
              <div>
                <label className="label">Airline (IATA)</label>
                <input
                  className="input"
                  value={airlineIata}
                  onChange={(e) => setAirlineIata(e.target.value.toUpperCase())}
                  placeholder="NH"
                />
              </div>

              <div>
                <label className="label">Aircraft</label>
                <input
                  className="input"
                  value={aircraft}
                  onChange={(e) => setAircraft(e.target.value.toUpperCase())}
                  placeholder="77W"
                />
              </div>

              <div>
                <label className="label">Cabin</label>
                <select
                  className="select"
                  value={cabin}
                  onChange={(e) => setCabin(e.target.value as CabinType)}
                >
                  <option value="business">Business</option>
                  <option value="first">First</option>
                </select>
              </div>
            </div>

            <div className="previewBox">
              {imageDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageDataUrl} alt="Screenshot preview" className="previewImage" />
              ) : (
                <div className="previewPlaceholder">
                  Paste or upload a screenshot to preview it here.
                </div>
              )}
            </div>
          </section>

          <section className="card">
            <h2 className="sectionTitle">Suggested cabin product</h2>

            {result ? (
              <>
                <div className="resultHeader">
                  <div>
                    <h3 className="resultName">{result.productName}</h3>
                    <div className="resultNotes">{result.shortNotes}</div>
                  </div>
                  <div className="badge">{result.cabin.toUpperCase()}</div>
                </div>

                <div className="infoGrid">
                  <div><strong>Airline:</strong> {result.airlineName} ({result.airlineIata})</div>
                  <div><strong>Aircraft:</strong> {aircraft}</div>
                  <div><strong>Cabin:</strong> {result.cabin}</div>
                  <div><strong>Match:</strong> {result.productName}</div>
                </div>

                <div className="links">
                  <a className="linkButton" href={result.seatmapsUrl} target="_blank" rel="noreferrer">
                    SeatMaps
                  </a>
                  <a className="linkButton" href={result.aerolopaUrl} target="_blank" rel="noreferrer">
                    AeroLOPA
                  </a>
                  <a className="linkButton" href={result.googleImagesUrl} target="_blank" rel="noreferrer">
                    Google Images
                  </a>
                </div>

                <div className="pitch">
                  <h4 className="pitchTitle">Client-ready pitch</h4>
                  <p className="pitchLead">{result.pitchTitle}</p>
                  <ul className="pitchList">
                    {result.pitchBullets.map((bullet, index) => (
                      <li key={index}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <div className="emptyState">
                No match found yet. Try a supported airline + aircraft combination from the built-in list.
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}