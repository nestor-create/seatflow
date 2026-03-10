import OpenAI from "openai";
import { NextResponse } from "next/server";
import { resolveSeatProduct } from "../../lib/resolver";
import type { Extracted } from "../../lib/resolver";

export const runtime = "nodejs";

const MODEL = process.env.OPENAI_MODEL || "gpt-5.2";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is missing on the server." },
        { status: 500 }
      );
    }

    const client = new OpenAI({ apiKey });

    const body = await req.json();
    const imageDataUrl = body?.imageDataUrl;

    if (
      !imageDataUrl ||
      typeof imageDataUrl !== "string" ||
      !imageDataUrl.startsWith("data:image/")
    ) {
      return NextResponse.json(
        { error: "Missing or invalid imageDataUrl." },
        { status: 400 }
      );
    }

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

    const prompt = `
You are reading a Google Flights screenshot.

Extract only what is visible. Do NOT guess.

Return:
- airline_name
- airline_iata
- flight_number
- route
- cabin (business / first / unknown)
- aircraft_type
- cabin_text_found
- raw_text
- evidence

Also detect cabin wording:
- lie-flat / lie flat
- suite
- door
- direct aisle access

Set markers booleans accordingly and copy the exact snippet into markers_text.
If not visible, set booleans false and markers_text as "".
`.trim();

    const response = await client.responses.create({
      model: MODEL,
      text: {
        format: {
          type: "json_schema",
          name: "GoogleFlightsExtraction",
          schema: extractionSchema.schema,
          strict: true
        }
      },
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: prompt },
            { type: "input_image", image_url: imageDataUrl }
          ]
        }
      ]
    } as any);

    const outputText =
      (response as any).output_text ||
      (response as any).output
        ?.flatMap((item: any) => item.content || [])
        ?.find((c: any) => c.type === "output_text")?.text;

    if (!outputText) {
      return NextResponse.json(
        { error: "No JSON returned from OpenAI." },
        { status: 500 }
      );
    }

    const extracted = JSON.parse(outputText) as Extracted;
    const resolved = resolveSeatProduct(extracted);

    return NextResponse.json({
      ...extracted,
      ...resolved
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Classification failed" },
      { status: 500 }
    );
  }
}