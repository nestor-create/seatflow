"use client";

import { useEffect, useRef, useState } from "react";

type ApiResponse = {
  airline_name: string;
  airline_iata: string;
  flight_number: string;
  route: string;
  cabin: "business" | "first" | "unknown";
  aircraft_type: string;
  cabin_text_found: string;

  markers: {
    lie_flat: boolean;
    suite: boolean;
    door: boolean;
    direct_aisle_access: boolean;
  };
  markers_text: string;

  evidence: { clue: string; where?: string }[];

  status: "confirmed" | "likely" | "needs_more_info";
  confidence: number;
  next_screenshot_hint?: string;

  seat_product: {
    id: string;
    name: string;
    notes?: string;
    image_url?: string;
    seatmaps_airline_url?: string;
  };
};

function pct(n?: number) {
  if (typeof n !== "number") return null;
  return Math.round(Math.max(0, Math.min(1, n)) * 100);
}

function buildPitch(r: ApiResponse) {
  const product = r.seat_product?.name || "this cabin";

  const intro =
    r.status === "confirmed"
      ? `Great news — this looks like ${product}.`
      : r.status === "likely"
      ? `This is likely ${product}, based on the aircraft + cabin details.`
      : `We need one more detail to confirm the exact seat product.`;

  const bullets =
    r.status === "needs_more_info"
      ? [
          "Open Flight details in Google Flights and include the aircraft type line (A350-900 / 777-300ER).",
          "If available, include any wording like “lie-flat”, “suite”, or “door”.",
          "Once confirmed, we’ll recommend the best seats and set expectations clearly."
        ]
      : [
          "Lie-flat comfort with strong privacy (suite-style when available).",
          "We’ll verify the operating aircraft configuration to avoid last-minute swaps.",
          "We can recommend the best rows for privacy, minimal noise, and easiest aisle access."
        ];

  return { intro, bullets };
}

export default function Page() {
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

          setResult(null);
          setError("");
          return;
        }
      }
      setError("Paste a Google Flights screenshot image (Ctrl+V).");
    };

    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, []);

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (PNG/JPG/WebP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setImageDataUrl(String(reader.result));
    reader.readAsDataURL(file);

    setResult(null);
    setError("");
  };

  const clearAll = () => {
    setImageDataUrl(null);
    setResult(null);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const classify = async () => {
    if (!imageDataUrl) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageDataUrl })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Request failed");

      setResult(data);
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const conf = pct(result?.confidence);

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-violet-600" />
          <div>
            <h1 className="text-3xl font-semibold">Ascend Cabin Atlas</h1>
            <p className="text-sm text-gray-600">
              Ctrl+V a Google Flights screenshot → auto-suggests the cabin product + shows the seat image.
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left */}
          <section className="rounded-3xl border border-gray-200 p-6 shadow-sm">
            <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6">
              <div className="text-sm font-semibold">Paste screenshot</div>
              <div className="mt-1 text-sm text-gray-600">
                Click anywhere and press <span className="font-mono">Ctrl+V</span>.
                <div className="mt-2 text-xs text-gray-500">
                  Best accuracy: open <span className="font-medium">Flight details</span> and include aircraft type + “lie-flat/suite/door” text.
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <input ref={fileInputRef} type="file" accept="image/*" onChange={onUpload} className="block text-sm" />

                <button
                  onClick={classify}
                  disabled={!imageDataUrl || loading}
                  className="rounded-xl bg-gray-900 px-5 py-2 text-sm font-medium text-white disabled:opacity-40"
                >
                  {loading ? "Analyzing…" : "Auto-suggest cabin"}
                </button>

                <button onClick={clearAll} className="rounded-xl border border-gray-200 px-5 py-2 text-sm font-medium">
                  Clear
                </button>
              </div>
            </div>

            {error ? (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>
            ) : null}

            <div className="mt-4 rounded-3xl border border-gray-200 overflow-hidden bg-gray-50">
              {imageDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageDataUrl} alt="Google Flights screenshot" className="w-full" />
              ) : (
                <div className="p-10 text-center text-sm text-gray-500">Paste or upload a screenshot to preview it here.</div>
              )}
            </div>
          </section>

          {/* Right */}
          <section className="rounded-3xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold">Cabin suggestion</div>

              {result?.status ? (
                <div className="flex items-center gap-3">
                  <span className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold">
                    {result.status.toUpperCase()}
                  </span>
                  {conf != null ? <span className="text-xs text-gray-600">{conf}% confidence</span> : null}
                </div>
              ) : (
                <span className="text-xs text-gray-500">—</span>
              )}
            </div>

            {!result ? (
              <div className="mt-6 rounded-2xl bg-gray-50 p-6 text-sm text-gray-600">
                Paste a screenshot and click <span className="font-medium">Auto-suggest cabin</span>.
              </div>
            ) : (
              <>
                {result.next_screenshot_hint ? (
                  <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                    <div className="font-semibold">Need one more detail</div>
                    <div className="mt-1">{result.next_screenshot_hint}</div>
                  </div>
                ) : null}

                <div className="mt-4 rounded-3xl border border-gray-200 p-5">
                  <div className="text-2xl font-semibold">{result.seat_product?.name || "Unknown"}</div>
                  {result.seat_product?.notes ? <div className="mt-2 text-sm text-gray-600">{result.seat_product.notes}</div> : null}

                  <div className="mt-4 grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
                    <div><span className="font-medium">Airline:</span> {result.airline_name || "—"} {result.airline_iata ? `(${result.airline_iata})` : ""}</div>
                    <div><span className="font-medium">Flight:</span> {result.flight_number || "—"}</div>
                    <div><span className="font-medium">Route:</span> {result.route || "—"}</div>
                    <div><span className="font-medium">Aircraft:</span> {result.aircraft_type || "—"}</div>
                    <div><span className="font-medium">Cabin:</span> {result.cabin || "—"}</div>
                    <div><span className="font-medium">Cabin label:</span> {result.cabin_text_found || "—"}</div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs">
                    {result.markers?.lie_flat ? <span className="rounded-full border px-3 py-1">Lie-flat</span> : null}
                    {result.markers?.suite ? <span className="rounded-full border px-3 py-1">Suite</span> : null}
                    {result.markers?.door ? <span className="rounded-full border px-3 py-1">Door</span> : null}
                    {result.markers?.direct_aisle_access ? <span className="rounded-full border px-3 py-1">Direct aisle access</span> : null}
                    {result.markers_text ? <span className="text-gray-500">({result.markers_text})</span> : null}
                  </div>

                  {result.seat_product?.seatmaps_airline_url ? (
                    <div className="mt-4">
                      <a
                        href={result.seat_product.seatmaps_airline_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
                      >
                        SeatMaps Exact
                      </a>
                    </div>
                  ) : null}
                </div>

                <div className="mt-6">
                  <div className="text-sm font-semibold">Seat image</div>
                  <div className="mt-3 rounded-3xl border border-gray-200 overflow-hidden bg-gray-50">
                    {result.seat_product?.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={result.seat_product.image_url} alt={`${result.seat_product.name} seat`} className="w-full" />
                    ) : (
                      <div className="p-6 text-sm text-gray-600">No seat image configured for this product yet.</div>
                    )}
                  </div>
                </div>

                <div className="mt-6 rounded-3xl border border-gray-200 p-5">
                  <div className="text-sm font-semibold">Client-ready pitch</div>
                  {(() => {
                    const p = buildPitch(result);
                    return (
                      <>
                        <div className="mt-2 text-sm text-gray-800">{p.intro}</div>
                        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-700">
                          {p.bullets.map((b, i) => <li key={i}>{b}</li>)}
                        </ul>
                      </>
                    );
                  })()}
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}