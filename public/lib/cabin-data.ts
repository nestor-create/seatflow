export type CabinType = "business" | "first";

export type CabinProduct = {
  id: string;
  airlineIata: string;
  airlineName: string;
  aircraft: string[];
  cabin: CabinType;
  productName: string;
  shortNotes: string;
  seatmapsUrl: string;
  aerolopaUrl: string;
  googleImagesUrl: string;
  pitchTitle: string;
  pitchBullets: string[];
};

export const CABIN_PRODUCTS: CabinProduct[] = [
  {
    id: "LH_ALLEGRIS_A359_J",
    airlineIata: "LH",
    airlineName: "Lufthansa",
    aircraft: ["A350-900", "A359"],
    cabin: "business",
    productName: "Allegris Business",
    shortNotes: "Lufthansa’s newest A350 business product.",
    seatmapsUrl: "https://seatmaps.com/airlines/lh-lufthansa/",
    aerolopaUrl: "https://www.aerolopa.com/lh",
    googleImagesUrl: "https://www.google.com/search?tbm=isch&q=Lufthansa+Allegris+Business",
    pitchTitle: "Modern Lufthansa flagship business seat",
    pitchBullets: [
      "Excellent privacy and updated seat design.",
      "Strong option for a more modern Lufthansa experience.",
      "We’d still verify the exact operating aircraft before finalizing seats."
    ]
  },
  {
    id: "NH_THE_ROOM_77W_J",
    airlineIata: "NH",
    airlineName: "ANA",
    aircraft: ["777-300ER", "77W", "B777-300ER"],
    cabin: "business",
    productName: "ANA THE Room",
    shortNotes: "ANA’s flagship long-haul business seat on select 777-300ER aircraft.",
    seatmapsUrl: "https://seatmaps.com/airlines/nh-ana-all-nippon-airways/",
    aerolopaUrl: "https://www.aerolopa.com/nh",
    googleImagesUrl: "https://www.google.com/search?tbm=isch&q=ANA+THE+Room",
    pitchTitle: "One of the best business class seats in the sky",
    pitchBullets: [
      "Very wide seat with excellent privacy.",
      "Ideal for clients prioritizing personal space.",
      "Strong premium option on ANA’s long-haul flagship configuration."
    ]
  },
  {
    id: "QR_QSUITE_A35K_J",
    airlineIata: "QR",
    airlineName: "Qatar Airways",
    aircraft: ["A350-1000", "A35K"],
    cabin: "business",
    productName: "Qsuite",
    shortNotes: "Qatar’s flagship suite-style business class.",
    seatmapsUrl: "https://seatmaps.com/airlines/qr-qatar-airways/",
    aerolopaUrl: "https://www.aerolopa.com/qr",
    googleImagesUrl: "https://www.google.com/search?tbm=isch&q=Qatar+Qsuite",
    pitchTitle: "Suite-style privacy in business class",
    pitchBullets: [
      "Excellent privacy and one of the strongest business products overall.",
      "Great choice for clients who value a premium, private feel.",
      "Worth confirming exact aircraft if the route sees swaps."
    ]
  },
  {
    id: "VS_A339_UPPER_J",
    airlineIata: "VS",
    airlineName: "Virgin Atlantic",
    aircraft: ["A330-900", "A339", "A330neo"],
    cabin: "business",
    productName: "Upper Class Suite",
    shortNotes: "Virgin Atlantic’s newer Upper Class suite family.",
    seatmapsUrl: "https://seatmaps.com/airlines/vs-virgin-atlantic/",
    aerolopaUrl: "https://www.aerolopa.com/vs",
    googleImagesUrl: "https://www.google.com/search?tbm=isch&q=Virgin+Atlantic+Upper+Class+Suite",
    pitchTitle: "Stylish, private Upper Class suite",
    pitchBullets: [
      "Modern Upper Class product with strong privacy.",
      "Good premium option for clients who value design and comfort.",
      "We’d verify exact aircraft to confirm the newest suite layout."
    ]
  },
  {
    id: "BA_CLUB_SUITE_77W_J",
    airlineIata: "BA",
    airlineName: "British Airways",
    aircraft: ["777-300ER", "77W", "A350-1000", "A35K", "787-10"],
    cabin: "business",
    productName: "Club Suite",
    shortNotes: "British Airways’ newer suite-style business seat.",
    seatmapsUrl: "https://seatmaps.com/airlines/ba-british-airways/",
    aerolopaUrl: "https://www.aerolopa.com/ba",
    googleImagesUrl: "https://www.google.com/search?tbm=isch&q=British+Airways+Club+Suite",
    pitchTitle: "A major step up from older BA business seats",
    pitchBullets: [
      "Private suite-style seat with direct aisle access.",
      "A much better BA option than the older Club World layout.",
      "Worth checking aircraft to confirm Club Suite rather than older seats."
    ]
  },
  {
    id: "SQ_A380_SUITES_F",
    airlineIata: "SQ",
    airlineName: "Singapore Airlines",
    aircraft: ["A380"],
    cabin: "first",
    productName: "Singapore Suites",
    shortNotes: "Singapore’s flagship Suites product on the A380.",
    seatmapsUrl: "https://seatmaps.com/airlines/sq-singapore-airlines/",
    aerolopaUrl: "https://www.aerolopa.com/sq",
    googleImagesUrl: "https://www.google.com/search?tbm=isch&q=Singapore+Airlines+Suites+A380",
    pitchTitle: "Top-tier first class suite experience",
    pitchBullets: [
      "Exceptional privacy and exclusivity.",
      "One of the most aspirational first class products available.",
      "Ideal for clients seeking a true flagship experience."
    ]
  },
  {
    id: "EK_GAMECHANGER_77W_F",
    airlineIata: "EK",
    airlineName: "Emirates",
    aircraft: ["777-300ER", "77W"],
    cabin: "first",
    productName: "Game Changer First Suite",
    shortNotes: "Emirates’ enclosed first class suite on select 777s.",
    seatmapsUrl: "https://seatmaps.com/airlines/ek-emirates/",
    aerolopaUrl: "https://www.aerolopa.com/ek",
    googleImagesUrl: "https://www.google.com/search?tbm=isch&q=Emirates+Game+Changer+First+Suite",
    pitchTitle: "Ultra-private enclosed first suite",
    pitchBullets: [
      "Exceptional privacy with floor-to-ceiling suite design.",
      "A standout choice for clients wanting a true first class feel.",
      "Best to verify aircraft because not all Emirates 777s have this suite."
    ]
  },
  {
    id: "JL_A35K_J",
    airlineIata: "JL",
    airlineName: "Japan Airlines",
    aircraft: ["A350-1000", "A35K"],
    cabin: "business",
    productName: "JAL A350-1000 Business",
    shortNotes: "Japan Airlines’ newest flagship long-haul business seat.",
    seatmapsUrl: "https://seatmaps.com/airlines/jl-japan-airlines/",
    aerolopaUrl: "https://www.aerolopa.com/jl",
    googleImagesUrl: "https://www.google.com/search?tbm=isch&q=JAL+A350-1000+Business+Class",
    pitchTitle: "Modern flagship JAL business class",
    pitchBullets: [
      "Strong privacy and updated flagship design.",
      "A compelling premium option on JAL’s newest aircraft.",
      "Best matched when the A350-1000 is confirmed."
    ]
  }
];