// lib/seat-products.ts
export type Cabin = "business" | "first" | "unknown";

export type SeatRule = {
  id: string;
  airline_iata: string;
  airline_name: string;
  cabin: Exclude<Cabin, "unknown">;

  aircraft_in?: string[];
  product_names: string[];
  notes?: string;

  // SeatMaps airline page (stable correct airline redirect)
  seatmaps_airline_url?: string;

  // Put images in /public/seat-images/...
  image_url?: string;

  // Marker hints from Google Flights wording
  require_markers_any?: Array<"lie_flat" | "suite" | "door" | "direct_aisle_access">;

  // Mixed fleets → avoid false confidence unless keyword strong
  requires_seatmap_or_more_info?: boolean;
};

export const SEAT_RULES: SeatRule[] = [
  // 1) Lufthansa — Allegris (J)
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

  // 2) ANA — THE Room (77W Business)
  {
    id: "NH_THE_ROOM_77W_J",
    airline_iata: "NH",
    airline_name: "ANA",
    cabin: "business",
    aircraft_in: ["777-300ER", "B777-300ER", "77W"],
    product_names: ["THE Room", "The Room"],
    notes: "ANA flagship business product on select 777-300ER aircraft.",
    seatmaps_airline_url: "https://seatmaps.com/airlines/nh-ana-all-nippon-airways/",
    image_url: "/seat-images/ana-the-room.jpg",
    require_markers_any: ["lie_flat", "suite"]
  },

  // 3) Qatar — Qsuite (A350-1000)
  {
    id: "QR_QSUITE_A35K_J",
    airline_iata: "QR",
    airline_name: "Qatar Airways",
    cabin: "business",
    aircraft_in: ["A350-1000", "A35K"],
    product_names: ["Qsuite", "Qsuites"],
    notes: "Qsuite is aircraft dependent; seat map confirmation recommended on mixed routes.",
    seatmaps_airline_url: "https://seatmaps.com/airlines/qr-qatar-airways/",
    image_url: "/seat-images/qatar-qsuite.jpg",
    require_markers_any: ["suite"],
    requires_seatmap_or_more_info: true
  },

  // 4) Virgin Atlantic — Upper Class (A330neo)
  {
    id: "VS_A339_UPPER_J",
    airline_iata: "VS",
    airline_name: "Virgin Atlantic",
    cabin: "business",
    aircraft_in: ["A330-900", "A330-900neo", "A330neo", "A339"],
    product_names: ["Upper Class", "Retreat Suite", "Upper Class Suite"],
    notes: "Virgin A330neo Upper Class (Retreat).",
    seatmaps_airline_url: "https://seatmaps.com/airlines/vs-virgin-atlantic/",
    image_url: "/seat-images/virgin-upper-class.jpg",
    require_markers_any: ["lie_flat"]
  },

  // 5) British Airways — Club Suite
  {
    id: "BA_CLUB_SUITE_J",
    airline_iata: "BA",
    airline_name: "British Airways",
    cabin: "business",
    aircraft_in: ["A350-1000", "A35K", "777-300ER", "77W", "787-10"],
    product_names: ["Club Suite"],
    notes: "Retrofit-dependent; verify seat map on the operating aircraft.",
    seatmaps_airline_url: "https://seatmaps.com/airlines/ba-british-airways/",
    image_url: "/seat-images/ba-club-suite.jpg",
    require_markers_any: ["lie_flat"],
    requires_seatmap_or_more_info: true
  },

  // 6) United — Polaris
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

  // 7) Delta — Delta One Suite (select)
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

  // 8) Air France — Business (varies)
  {
    id: "AF_BIZ_J",
    airline_iata: "AF",
    airline_name: "Air France",
    cabin: "business",
    aircraft_in: ["777-300ER", "77W", "A350-900", "A359"],
    product_names: ["Business"],
    notes: "Air France business varies across fleet; confirm aircraft + seat map.",
    seatmaps_airline_url: "https://seatmaps.com/airlines/af-air-france/",
    image_url: "/seat-images/af-business.jpg",
    require_markers_any: ["lie_flat"],
    requires_seatmap_or_more_info: true
  },

  // 9) Singapore — A380 Suites (F)
  {
    id: "SQ_A380_SUITES_F",
    airline_iata: "SQ",
    airline_name: "Singapore Airlines",
    cabin: "first",
    aircraft_in: ["A380"],
    product_names: ["Suites", "A380 Suites"],
    notes: "Suites tied to A380 operations; confirm aircraft on the exact flight.",
    seatmaps_airline_url: "https://seatmaps.com/airlines/sq-singapore-airlines/",
    image_url: "/seat-images/sq-a380-suites.jpg",
    require_markers_any: ["suite"]
  },

  // 10) Emirates — Game Changer (F, select)
  {
    id: "EK_GAMECHANGER_F",
    airline_iata: "EK",
    airline_name: "Emirates",
    cabin: "first",
    aircraft_in: ["777-300ER", "77W"],
    product_names: ["Game Changer", "Gamechanger"],
    notes: "Emirates enclosed First suites on select 777s; confirm configuration.",
    seatmaps_airline_url: "https://seatmaps.com/airlines/ek-emirates/",
    image_url: "/seat-images/ek-game-changer.jpg",
    require_markers_any: ["suite", "door"],
    requires_seatmap_or_more_info: true
  },

  // 11) JAL — A350-1000 Business (flagship)
  {
    id: "JL_A35K_J",
    airline_iata: "JL",
    airline_name: "Japan Airlines",
    cabin: "business",
    aircraft_in: ["A350-1000", "A35K"],
    product_names: ["A350-1000"],
    notes: "JAL flagship cabin on A350-1000 operations.",
    seatmaps_airline_url: "https://seatmaps.com/airlines/jl-japan-airlines/",
    image_url: "/seat-images/jl-a35k-business.jpg",
    require_markers_any: ["lie_flat"]
  },

  // 12) Cathay — Aria (retrofit dependent)
  {
    id: "CX_ARIA_J",
    airline_iata: "CX",
    airline_name: "Cathay Pacific",
    cabin: "business",
    aircraft_in: ["777-300ER", "77W"],
    product_names: ["Aria", "Aria Suite"],
    notes: "Retrofit-dependent; confirm on seat map.",
    seatmaps_airline_url: "https://seatmaps.com/airlines/cx-cathay-pacific/",
    image_url: "/seat-images/cx-aria.jpg",
    require_markers_any: ["lie_flat", "suite"],
    requires_seatmap_or_more_info: true
  },

  // 13) American — Flagship (varies)
  {
    id: "AA_FLAGSHIP_J",
    airline_iata: "AA",
    airline_name: "American Airlines",
    cabin: "business",
    aircraft_in: ["777", "787", "77W", "789"],
    product_names: ["Flagship", "lie-flat", "suite"],
    notes: "Hardware varies; seat map confirmation recommended.",
    seatmaps_airline_url: "https://seatmaps.com/airlines/aa-american-airlines/",
    image_url: "/seat-images/aa-flagship.jpg",
    require_markers_any: ["lie_flat"],
    requires_seatmap_or_more_info: true
  },

  // 14) Qantas — A380 First
  {
    id: "QF_A380_F",
    airline_iata: "QF",
    airline_name: "Qantas",
    cabin: "first",
    aircraft_in: ["A380"],
    product_names: ["First"],
    notes: "Qantas First on A380 operations.",
    seatmaps_airline_url: "https://seatmaps.com/airlines/qf-qantas/",
    image_url: "/seat-images/qf-a380-first.jpg",
    require_markers_any: ["lie_flat"]
  },

  // 15) Turkish — Business (varies)
  {
    id: "TK_BIZ_J",
    airline_iata: "TK",
    airline_name: "Turkish Airlines",
    cabin: "business",
    aircraft_in: ["787", "A350"],
    product_names: ["Business"],
    notes: "Varies by aircraft; confirm on seat map.",
    seatmaps_airline_url: "https://seatmaps.com/airlines/tk-turkish-airlines/",
    image_url: "/seat-images/tk-business.jpg",
    require_markers_any: ["lie_flat"],
    requires_seatmap_or_more_info: true
  }
];