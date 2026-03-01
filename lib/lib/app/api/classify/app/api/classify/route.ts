// app/api/classify/route.ts
import OpenAI from "openai";
import { NextResponse } from "next/server";
import { resolveSeatProduct } from "@/lib/resolver";
import type { Extracted } from "@/lib/resolver";

export const runtime = "nodejs";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.OPENAI_MODEL || "gpt-5.2";

const extractionSchema = {
  name: "GoogleFlightsExtraction",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      airline_name: { type: "string" },
      airline_iata: { type: "string" },
      flight_number: { type: "string" },
      route: { type: "string" },
      cabin: { type: "string", enum: ["business", "first", "unknown"] },
      aircraft_type: { type: "string" },
      cabin_text_found: { type: "string" },
      raw_text: { type: "string" },

      markers: {
        type: "object",
        additionalProperties: false,
        properties: {
          lie_flat: { type: "boolean" },
          suite: { type: "boolean" },
          door: { type: "boolean" },
          direct_aisle_access: { type: "boolean" }
        },
        required: ["lie_flat", "suite", "door", "direct_aisle_access"]
      },
      markers_text: { type: "string" },

      evidence: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            clue: { type: "string" },
            where: { type: "string" }
          },
          required: ["clue", "where"]
        }
      }
    },
    required: [
      "airline_name",
      "airline_iata",
      "flight_number",
      "route",
      "cabin",
      "aircraft_type",
      "cabin_text_found",
      "raw_text",
      "markers",
      "markers_text",
      "evidence"
    ]
  }
} as const;

export async function POST(req: Request) {
  try {
    const { imageDataUrl } = await req.json();

    if (!imageDataUrl || typeof imageDataUrl !== "string" || !imageDataUrl.startsWith("data:image/")) {
      return NextResponse.json(
        { error: "Missing imageDataUrl (expected data:image/... base64 URL)." },
        { status: 400 }
      );
    }

    const prompt = `
You are reading a Google Flights screenshot.

Extract only what is visible. Do NOT guess.

Return:
- airline_name, airline_iata if visible
- flight_number if visible
- route if visible
- cabin: business / first / unknown
- aircraft_type if visible (A350-900, 777-300ER, etc.)
- cabin_text_found: exact cabin snippet
- raw_text: short transcription of key parts
- evidence: bullets of what you saw and where

Also detect cabin feature wording if visible:
- "lie-flat" / "lie flat"
- "suite"
- "door"
- "direct aisle access" / "direct-aisle access"

Set booleans in "markers" accordingly, and copy the exact snippet you saw into "markers_text".
If not visible, set all booleans false and markers_text as "".

If a field is not visible, return "" (empty string), except cabin can be "unknown".
`.trim();

    const response = await client.responses.create({
      model: MODEL,
      text: { format: { type: "json_schema", json_schema: extractionSchema } },
      input: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "input_image", image_url: imageDataUrl }
          ]
        }
      ]
    });

    const jsonText =
      (response as any).output_text ||
      (response as any).output?.find((o: any) => o.type === "message")?.content?.find((c: any) => c.type === "output_text")
        ?.text;

    if (!jsonText) {
      return NextResponse.json({ error: "Model returned no extraction JSON." }, { status: 500 });
    }

    const extracted = JSON.parse(jsonText) as Extracted;
    const resolved = resolveSeatProduct(extracted);

    return NextResponse.json({ ...extracted, ...resolved });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Classification failed.", detail: err?.message || String(err) },
      { status: 500 }
    );
  }
}