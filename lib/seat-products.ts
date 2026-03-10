export type Cabin = "business" | "first" | "unknown";

export type SeatRule = {
  id: string;
  airline_iata: string;
  airline_name: string;
  cabin: Exclude<Cabin, "unknown">;
  aircraft_in?: string[];
  product_names: string[];
  notes?: string;
  seatmaps_airline_url?: string;
  image_url?: string;
  require_markers_any?: Array<"lie_flat" | "suite" | "door" | "direct_aisle_access">;
  requires_seatmap_or_more_info?: boolean;
};

export const SEAT_RULES: SeatRule[] = [
  {
    id: "LH_ALLEGRIS_J_A359",
    airline_iata: "LH",
    airline_name: "Lufthansa",
    cabin: "business",
    aircraft_in: ["A350-900", "A359"],
    product_names: ["Allegris"],
    notes: "Allegris Business on select Lufthansa A350-900s.",
    seatmaps_airline_url: "https://seatmaps.com/airlines/lh-lufthansa/",
    image_url: "/seat-images/lh-allegris-business.jpg",
    require_markers_any: ["lie_flat"]
  },
  {
    id: "NH_THE_ROOM_77W_J",
    airline_iata: "NH",
    airline_name: "ANA",
    cabin: "business",
    aircraft_in: ["777-300ER", "B777-300ER", "77W"],
    product_names: ["THE Room", "The Room"],
    notes: "ANA flagship business seat on select 777-300ER aircraft.",
    seatmaps_airline_url: "https://seatmaps.com/airlines/nh-ana-all-nippon-airways/",
    image_url: "/seat-images/ana-the-room.jpg",
    require_markers_any: ["lie_flat", "suite"]
  },
  {
    id: "QR_QSUITE_A35K_J",
    airline_iata: "QR",
    airline_name: "Qatar Airways",
    cabin: "business",
    aircraft_in: ["A350-1000", "A35K"],
    product_names: ["Qsuite", "Qsuites"],
    notes: "Qsuite varies by aircraft; confirm with seat map when possible.",
    seatmaps_airline_url: "https://seatmaps.com/airlines/qr-qatar-airways/",
    image_url: "/seat-images/qatar-qsuite.jpg",
    require_markers_any: ["suite"],
    requires_seatmap_or_more_info: true
  },
  {
    id: "VS_A339_UPPER_J",
    airline_iata: "VS",
    airline_name: "Virgin Atlantic",
    cabin: "business",
    aircraft_in: ["A330-900", "A339", "A330neo"],
    product_names: ["Upper Class", "Retreat Suite"],
    notes: "Virgin A330neo Upper Class.",
    seatmaps_airline_url: "https://seatmaps.com/airlines/vs-virgin-atlantic/",
    image_url: "/seat-images/virgin-upper-class.jpg",
    require_markers_any: ["lie_flat"]
  }
];