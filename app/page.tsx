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
          reader.onload = () => {
            setImageDataUrl(String(reader.result));
            setResult(null);
            setError("");
          };
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

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageDataUrl(String(reader.result));
      setResult(null);
      setError("");
    };
    reader.readAsDataURL(file);
  };

  const classify = async () => {
    if (!imageDataUrl) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/classify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ imageDataUrl })
      });

      const contentType = res.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        const text = await res.text();
        throw new Error(`API did not return JSON. Got: ${text.slice(0, 120)}`);
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Request failed");
      }

      setResult(data);
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setImageDataUrl(null);
    setResult(null);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <main className="min-h-screen bg-white px-6 py-12 text-gray-900">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <h1 className="text-4xl font-bold">Ascend Cabin Atlas</h1>
          <p className="mt-2 text-gray-600">
            Paste a Google Flights screenshot and auto-suggest the premium cabin product.
          </p>
        </div>

        <div className="rounded-2xl border bg-gray-50 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
            How to use
          </h2>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-gray-700">
            <li>Open the flight in Google Flights</li>
            <li>Open Flight details</li>
            <li>Include aircraft type and any lie-flat / suite wording</li>
            <li>Paste here with Ctrl+V</li>
          </ol>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onUpload}
            className="block text-sm"
          />

          <button
            onClick={classify}
            disabled={!imageDataUrl || loading}
            className="rounded-xl bg-black px-5 py-2 text-white disabled:opacity-40"
          >
            {loading ? "Analyzing..." : "Auto-suggest cabin"}
          </button>

          <button
            onClick={clearAll}
            className="rounded-xl border px-5 py-2"
          >
            Clear
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {result && (
          <div className="rounded-2xl border p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-semibold">
                {result.seat_product?.name || "Unknown"}
              </div>
              <div className="text-sm text-gray-600">
                {Math.round((result.confidence || 0) * 100)}% confidence
              </div>
            </div>

            {result.next_screenshot_hint && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                {result.next_screenshot_hint}
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
              <div><strong>Airline:</strong> {result.airline_name || "—"} {result.airline_iata ? `(${result.airline_iata})` : ""}</div>
              <div><strong>Flight:</strong> {result.flight_number || "—"}</div>
              <div><strong>Route:</strong> {result.route || "—"}</div>
              <div><strong>Aircraft:</strong> {result.aircraft_type || "—"}</div>
              <div><strong>Cabin:</strong> {result.cabin || "—"}</div>
              <div><strong>Cabin Label:</strong> {result.cabin_text_found || "—"}</div>
            </div>

            {result.seat_product?.seatmaps_airline_url && (
              <a
                href={result.seat_product.seatmaps_airline_url}
                target="_blank"
                rel="noreferrer"
                className="inline-block rounded-xl border px-4 py-2 text-sm"
              >
                SeatMaps Exact
              </a>
            )}

            {result.seat_product?.image_url ? (
              <div className="overflow-hidden rounded-2xl border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={result.seat_product.image_url}
                  alt={result.seat_product.name}
                  className="w-full"
                />
              </div>
            ) : (
              <div className="rounded-xl border bg-gray-50 p-4 text-sm text-gray-600">
                No seat image configured yet.
              </div>
            )}
          </div>
        )}

        {imageDataUrl && (
          <div className="overflow-hidden rounded-2xl border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageDataUrl} alt="Preview" className="w-full" />
          </div>
        )}
      </div>
    </main>
  );
}