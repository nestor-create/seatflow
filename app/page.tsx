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
    <main className="min-h-screen bg-white px-6 py-12 text-gray-900">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <h1 className="text-4xl font-bold">Ascend Cabin Atlas</h1>
          <p className="mt-2 text-gray-600">
            Paste a Google Flights screenshot, then choose airline, aircraft, and cabin to show the likely premium seat product.
          </p>
        </div>

        <div className="rounded-2xl border bg-gray-50 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
            How to use
          </h2>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-gray-700">
            <li>Open the flight in Google Flights</li>
            <li>Paste the screenshot here with Ctrl+V, or upload it</li>
            <li>Enter airline code, aircraft, and cabin</li>
            <li>Open SeatMaps, AeroLOPA, or Google Images from the result</li>
          </ol>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border p-6 space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onUpload}
              />

              <button
                onClick={() => {
                  setImageDataUrl(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="rounded-xl border px-4 py-2 text-sm"
              >
                Clear Image
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium">Airline (IATA)</label>
                <input
                  value={airlineIata}
                  onChange={(e) => setAirlineIata(e.target.value.toUpperCase())}
                  className="w-full rounded-xl border px-3 py-2"
                  placeholder="NH"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Aircraft</label>
                <input
                  value={aircraft}
                  onChange={(e) => setAircraft(e.target.value.toUpperCase())}
                  className="w-full rounded-xl border px-3 py-2"
                  placeholder="77W"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Cabin</label>
                <select
                  value={cabin}
                  onChange={(e) => setCabin(e.target.value as CabinType)}
                  className="w-full rounded-xl border px-3 py-2"
                >
                  <option value="business">Business</option>
                  <option value="first">First</option>
                </select>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border bg-gray-50">
              {imageDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageDataUrl} alt="Screenshot preview" className="w-full" />
              ) : (
                <div className="p-8 text-sm text-gray-500">
                  Paste or upload a screenshot to preview it here.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-2xl border p-6 space-y-4">
            <div className="text-xl font-semibold">Suggested cabin product</div>

            {result ? (
              <>
                <div className="rounded-2xl border p-5">
                  <div className="text-2xl font-semibold">{result.productName}</div>
                  <div className="mt-2 text-sm text-gray-600">{result.shortNotes}</div>

                  <div className="mt-4 grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
                    <div><strong>Airline:</strong> {result.airlineName} ({result.airlineIata})</div>
                    <div><strong>Cabin:</strong> {result.cabin}</div>
                    <div><strong>Aircraft match:</strong> {aircraft}</div>
                    <div><strong>Product:</strong> {result.productName}</div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <a
                      href={result.seatmapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl border px-4 py-2 text-sm"
                    >
                      SeatMaps
                    </a>

                    <a
                      href={result.aerolopaUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl border px-4 py-2 text-sm"
                    >
                      AeroLOPA
                    </a>

                    <a
                      href={result.googleImagesUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl border px-4 py-2 text-sm"
                    >
                      Google Images
                    </a>
                  </div>
                </div>

                <div className="rounded-2xl border p-5">
                  <div className="font-semibold">Suggested image source</div>
                  <div className="mt-2 text-sm text-gray-600">
                    Click <strong>Google Images</strong> to open live image results for this cabin product.
                  </div>
                </div>

                <div className="rounded-2xl border p-5">
                  <div className="font-semibold">Client-ready pitch</div>
                  <div className="mt-2 text-sm font-medium">{result.pitchTitle}</div>
                  <ul className="mt-3 list-disc pl-5 text-sm space-y-1 text-gray-700">
                    {result.pitchBullets.map((bullet, index) => (
                      <li key={index}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <div className="rounded-2xl border bg-gray-50 p-5 text-sm text-gray-600">
                No match found yet. Try a supported airline + aircraft combination from the built-in list.
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}