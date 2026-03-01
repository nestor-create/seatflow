// lib/seat-products.ts
export type Cabin = "business" | "first" | "unknown";

export type SeatRule = {
  id: string;
  airline_iata: string;         // LH, NH, QR...
  airline_name: string;
  cabin: Exclude<Cabin, "unknown">;

  // matching anchors
  aircraft_in?: string[];       // A359, 77W, A35K, etc.
  product_names: string[];      // keywords if they appear
  notes?: string;

  // NEW: SeatMaps airline page (stable redirect to correct airline)
  seatmaps_airline_url?: string;

  // NEW: seat image (put files in /public/seat-images/)
  image_url?: string;

  // NEW: marker-based hints (from Google Flights text)
  require_markers_any?: Array<"lie_flat" | "suite" | "door" | "direct_aisle_access">;

  // Mixed fleet risk: avoid false positives unless keyword/markers/aircraft align strongly
  requires_seatmap_or_more_info?: boolean;
};

export type SeatProduct = {
  id: string;
  name: string;
  notes?: string;
  image_url?: string;
  seatmaps_airline_url?: string;
};

export const SEAT_RULES: SeatRule[] = [
  // 1) Lufthansa — Allegris (Business)
  {
    id: "LH_ALLEGRIS_J_A359",
    airline_iata: "LH",
    airline_name: "Lufthansa",
    cabin: "business",
    aircraft_in: ["A350-900", "A359"],
    product_names: ["Allegris"],
    notes: "Allegris Business on select Lufthansa A350-900s. Verify operating aircraft when possible.",
    seatmaps_airline_url: "https://seatmaps.com/airlines/lh-lufthansa/",
    image_url: "/seat-images/lh-allegris-business.jpg",
    require_markers_any: ["lie_flat"]
  },

  // 2) Lufthansa — Allegris (First)
  {
    id: "LH_ALLEGRIS_F_A359",
    airline_iata: "LH",
    airline_name: "Lufthansa",
    cabin: "first",
    aircraft_in: ["A350-900", "A359"],
    product_names: ["Allegris First", "Allegris"],
    notes: "Allegris First on the Allegris A350-900 configuration.",
    seatmaps_airline_url: "https://seatmaps.com/airlines/lh-lufthansa/",
    image_url: "/seat-images/lh-allegris-first.jpg",
    require_markers_any: ["suite"]
  },

  // 3) ANA — THE Room (77W Business)
  {
    id: "NH_THE_ROOM_77W_J",
    airline_iata: "NH",
    airline_name: "ANA",
    cabin: "business",
    aircraft_in: ["777-300ER", "B777-300ER", "77W"],
    product_names: ["THE Room", "The Room"],
    notes: "ANA flagship Business seat on select 777-300ER aircraft.",
    seatmaps_airline_url: "https://seatmaps.com/airlines/nh-ana-all-nippon-airways/",
    image_url: "/seat-images/ana-the-room.jpg",
    require_markers_any: ["lie_flat", "suite"]
  },

  // 4) Qatar — Qsuite (A350-1000)
  {
    id: "QR_QSUITE_A35K_J",
    airline_iata: "QR",
    airline_name: "Qatar Airways",
    cabin: "business",
    aircraft_in: ["A350-1000", "A35K"],
    product_names: ["Qsuite", "Qsuites"],
    notes: "Qsuite is route/aircraft dependent. Use seat map when possible.",
    seatmaps_airline_url: "https://seatmaps.com/airlines/qr-qatar-airways/",
    image_url: "/seat-images/qatar-qsuite.jpg",
    require_markers_any: ["suite"],
    requires_seatmap_or_more_info: true
  },

  // 5) Qatar — Qsuite (777 variants)
  {
    id: "QR_QSUITE_77W_J",
    airline_iata: "QR",
    airline_name: "Qatar Airways",
    cabin: "business",
    aircraft_in: ["777-300ER", "77W", "777-200LR"],
    product_names: ["Qsuite", "Qsuites"],
    notes: "Many QR 777s have Qsuite, but not all. Seat map confirmation recommended.",
    seatmaps_airline_url: "https://seatmaps.com/airlines/qr-qatar-airways/",
    image_url: "/seat-images/qatar-qsuite.jpg",
    require_markers_any: ["suite"],
    requires_seatmap_or_more_info: true
  },

  // 6) Virgin Atlantic — Upper Class (A330neo / Retreat)
  {
    id: "VS_A339_RETREAT_J",
    airline_iata: "VS",
    airline_name: "Virgin Atlantic",
    cabin: "business",
    aircraft_in: ["A330-900", "A330-900neo", "A330neo", "A339"],
    product_names: ["Retreat Suite", "Upper Class Suite", "Upper Class"],
    notes: "Retreat Suites are unique to Virgin’s A330-900neo Upper Class.",
    seatmaps_airline_url: "https://seatmaps.com/airlines/vs-virgin-atlantic/",
    image_url: "/seat-images/virgin-retreat-suite.jpg",
    require_markers_any: ["lie_flat"]
  },

  // 7) British Airways — Club Suite
  {
    id: "BA_CLUB_SUITE_J",
    airline_iata: "BA",
    airline_name: "British Airways",
    cabin: "business",
    aircraft_in: ["A350-1000", "A35K", "777-300ER", "77W", "787-10"],
    product_names: ["Club Suite"],
    notes: "Retrofit-dependent; confirm seat map on the operating aircraft.",
    seatmaps_airline_url: "https://seatmaps.com/airlines/ba-british-airways/",
    image_url: "/seat-images/ba-club-suite.jpg",
    require_markers_any: ["lie_flat"],
    requires_seatmap_or_more_info: true
  },

  // 8) United — Polaris
  {
    id: "UA_POLARIS_J",
    airline_iata: "UA",
    airline_name: "United",
    cabin: "business",
    aircraft_in: ["787", "777", "767"],
    product_names: ["Polaris"],
    notes: "Polaris branding spans multiple subtypes; hardware can vary.",
    seatmaps_airline_url: "https://seatmaps.com/airlines/ua-united/",
    image_url: "/seat-images/ua-polaris.jpg",
    require_markers_any: ["lie_flat"],
    requires_seatmap_or_more_info: true
  },

  // 9) Delta — Delta One Suite
  {
    id: "DL_ONE_SUITE_J",
    airline_iata: "DL",
    airline_name: "Delta",
    cabin: "business",
    aircraft_in: ["A350", "A330-900", "A339"],
    product_names: ["Delta One Suite", "Delta One"],
    notes: "Suite availability depends on aircraft; some routes use older seats.",
    seatmaps_airline_url: "https://seatmaps.com/airlines/dl-delta-air-lines/",
    image_url: "/seat-images/dl-one-suite.jpg",
    require_markers_any: ["lie_flat", "suite"],
    requires_seatmap_or_more_info: true
  },

  // 10) Air France — Business Suite (select)
  {
    id: "AF_BIZ_SUITE_J",
    airline_iata: "AF",
    airline_name: "Air France",
    cabin: "business",
    aircraft_in: ["777-300ER", "77W", "A350-900", "A359"],
    product_names: ["Business Suite"],
    notes: "Air France has multiple business products across fleet; confirm aircraft & seat map.",
    seatmaps_airline_url: "https://seatmaps.com/airlines/af-air-france/",
    image_url: "/seat-images/af-business-suite.jpg",
    require_markers_any: ["lie_flat"],
    requires_seatmap_or_more_info: true
  },

  // 11) Singapore — A380 Suites
  {
    id: "SQ_A380_SUITES_F",
    airline_iata: "SQ",
    airline_name: "Singapore Airlines",
    cabin: "first",
    aircraft_in: ["A380"],
    product_names: ["Suites", "A380 Suites"],
    notes: "Suites are tied to A380 operations; confirm aircraft on the exact flight.",
    seatmaps_airline_url: "https://seatmaps.com/airlines/sq-singapore-airlines/",
    image_url: "/seat-images/sq-a380-suites.jpg",
    require_markers_any: ["suite"]
  },

  // 12) Emirates — New 777 Business (mixed)
  {
    id: "EK_NEW_777_J",
    airline_iata: "EK",
    airline_name: "Emirates",
    cabin: "business",
    aircraft_in: ["777-300ER", "77W"],
    product_names: ["new business", "suite", "1-2-1"],
    notes: "Emirates 777 business varies widely (2-3-2 vs 1-2-1). Seat map is key.",
    seatmaps_airline_url: "https://seatmaps.com/airlines/ek-emirates/",
    image_url: "/seat-images/ek-new-777-business.jpg",
    require_markers_any: ["lie_flat"],
    requires_seatmap_or_more_info: true
  },

  // 13) Cathay — Aria Suite (retrofit dependent)
  {
    id: "CX_ARIA_SUITE_J",
    airline_iata: "CX",
    airline_name: "Cathay Pacific",
    cabin: "business",
    aircraft_in: ["777-300ER", "77W"],
    product_names: ["Aria Suite", "Aria"],
    notes: "Retrofit-dependent; confirm operating aircraft & seat map.",
    seatmaps_airline_url: "https://seatmaps.com/airlines/cx-cathay-pacific/",
    image_url: "/seat-images/cx-aria-suite.jpg",
    require_markers_any: ["lie_flat", "suite"],
    requires_seatmap_or_more_info: true
  },

  // 14) Japan Airlines — A350-1000 Business (flagship)
  {
    id: "JL_A35K_FLAGSHIP_J",
    airline_iata: "JL",
    airline_name: "Japan Airlines",
    cabin: "business",
    aircraft_in: ["A350-1000", "A35K"],
    product_names: ["A350-1000"],
    notes: "Flagship cabin on A350-1000 operations; confirm aircraft type.",
    seatmaps_airline_url: "https://seatmaps.com/airlines/jl-japan-airlines/",
    image_url: "/seat-images/jl-a35k-business.jpg",
    require_markers_any: ["lie_flat"]
  },

  // 15) American — Flagship suite-ish bucket (conservative)
  {
    id: "AA_FLAGSHIP_J",
    airline_iata: "AA",
    airline_name: "American Airlines",
    cabin: "business",
    aircraft_in: ["777", "787", "77W", "789"],
    product_names: ["Flagship", "suite", "lie-flat"],
    notes: "Hardware varies across AA fleet; confirm via seat map for the operating aircraft.",
    seatmaps_airline_url: "https://seatmaps.com/airlines/aa-american-airlines/",
    image_url: "/seat-images/aa-flagship-business.jpg",
    require_markers_any: ["lie_flat"],
    requires_seatmap_or_more_info: true
  }
];